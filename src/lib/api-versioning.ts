/**
 * API Versioning Support
 * Handles API versioning and backward compatibility
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '@/lib/logger'

export interface ApiVersion {
  version: string
  deprecated?: boolean
  deprecationDate?: Date
  sunsetDate?: Date
  description?: string
}

export const API_VERSIONS: Record<string, ApiVersion> = {
  v1: {
    version: '1.0.0',
    description: 'Initial API version with core functionality',
  },
  // Future versions can be added here
  // 'v2': {
  //   version: '2.0.0',
  //   description: 'Enhanced API with additional features'
  // }
}

export const CURRENT_VERSION = 'v1'
export const SUPPORTED_VERSIONS = Object.keys(API_VERSIONS)

/**
 * Middleware to validate API version
 */
export function validateApiVersion(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const versionMatch = req.path.match(/\/api\/cubcen\/(v\d+)\//)

  if (!versionMatch) {
    res.status(400).json({
      error: {
        code: 'MISSING_API_VERSION',
        message: 'API version is required in the URL path',
        supportedVersions: SUPPORTED_VERSIONS,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      },
    })
    return
  }

  const requestedVersion = versionMatch[1]

  if (!SUPPORTED_VERSIONS.includes(requestedVersion)) {
    res.status(400).json({
      error: {
        code: 'UNSUPPORTED_API_VERSION',
        message: `API version ${requestedVersion} is not supported`,
        supportedVersions: SUPPORTED_VERSIONS,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      },
    })
    return
  }

  const versionInfo = API_VERSIONS[requestedVersion]

  // Add version info to request
  req.apiVersion = {
    version: requestedVersion,
    info: versionInfo,
  }

  // Add version headers to response
  res.setHeader('API-Version', versionInfo.version)
  res.setHeader('API-Supported-Versions', SUPPORTED_VERSIONS.join(', '))

  // Check for deprecated version
  if (versionInfo.deprecated) {
    res.setHeader('API-Deprecated', 'true')

    if (versionInfo.deprecationDate) {
      res.setHeader(
        'API-Deprecation-Date',
        versionInfo.deprecationDate.toISOString()
      )
    }

    if (versionInfo.sunsetDate) {
      res.setHeader('API-Sunset-Date', versionInfo.sunsetDate.toISOString())
    }

    logger.warn('Deprecated API version used', {
      version: requestedVersion,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      deprecationDate: versionInfo.deprecationDate,
      sunsetDate: versionInfo.sunsetDate,
    })
  }

  next()
}

/**
 * Middleware to handle version-specific transformations
 */
export function handleVersionTransforms(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const version = req.apiVersion?.version

  if (!version) {
    next()
    return
  }

  // Store original json method
  const originalJson = res.json

  // Override json method to apply version-specific transformations
  res.json = function (data: unknown) {
    const transformedData = applyVersionTransforms(data, version)
    return originalJson.call(this, transformedData)
  }

  next()
}

/**
 * Apply version-specific data transformations
 */
function applyVersionTransforms(data: unknown, version: string): unknown {
  switch (version) {
    case 'v1':
      return transformForV1(data)
    // Future versions can add their transformations here
    // case 'v2':
    //   return transformForV2(data)
    default:
      return data
  }
}

/**
 * Transform data for API v1
 */
function transformForV1(data: unknown): unknown {
  // V1 transformations (if any)
  // For now, return data as-is since v1 is the base version
  return data
}

/**
 * Get API version information
 */
export function getApiVersionInfo(version?: string): ApiVersion | null {
  if (!version) {
    return API_VERSIONS[CURRENT_VERSION]
  }

  return API_VERSIONS[version] || null
}

/**
 * Check if API version is supported
 */
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version)
}

/**
 * Check if API version is deprecated
 */
export function isVersionDeprecated(version: string): boolean {
  const versionInfo = API_VERSIONS[version]
  return versionInfo?.deprecated === true
}

/**
 * Get deprecation warning message
 */
export function getDeprecationWarning(version: string): string | null {
  const versionInfo = API_VERSIONS[version]

  if (!versionInfo?.deprecated) {
    return null
  }

  let warning = `API version ${version} is deprecated.`

  if (versionInfo.deprecationDate) {
    warning += ` Deprecated since ${versionInfo.deprecationDate.toISOString().split('T')[0]}.`
  }

  if (versionInfo.sunsetDate) {
    warning += ` Will be removed on ${versionInfo.sunsetDate.toISOString().split('T')[0]}.`
  }

  warning += ` Please migrate to version ${CURRENT_VERSION}.`

  return warning
}

/**
 * Middleware to add API version info to OpenAPI spec
 */
export function addVersionInfoToSpec(
  spec: Record<string, unknown>
): Record<string, unknown> {
  // Add version information to OpenAPI spec
  spec.info.version = API_VERSIONS[CURRENT_VERSION].version

  // Add supported versions to info
  (specs.info as Record<string, unknown>)['x-api-versions'] = Object.entries(API_VERSIONS).map(
    ([key, value]) => ({
      version: key,
      info: value,
    })
  );

  // Add version-specific servers
  (spec.servers as Array<Record<string, unknown>>) = (spec.servers as Array<Record<string, unknown>>).map(
    server => ({
      ...server,
      url: (server.url as string).replace(
        '/api/cubcen/',
        `/api/cubcen/${CURRENT_VERSION}/`
      ),
    })
  ); as unknown;

  return spec
}

// Extend Express Request interface
declare module 'express-serve-static-core' {
  interface Request {
    apiVersion?: {
      version: string
      info: ApiVersion
    }
  }
}
