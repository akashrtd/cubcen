"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_VERSIONS = exports.CURRENT_VERSION = exports.API_VERSIONS = void 0;
exports.validateApiVersion = validateApiVersion;
exports.handleVersionTransforms = handleVersionTransforms;
exports.getApiVersionInfo = getApiVersionInfo;
exports.isVersionSupported = isVersionSupported;
exports.isVersionDeprecated = isVersionDeprecated;
exports.getDeprecationWarning = getDeprecationWarning;
exports.addVersionInfoToSpec = addVersionInfoToSpec;
const logger_1 = require("@/lib/logger");
exports.API_VERSIONS = {
    'v1': {
        version: '1.0.0',
        description: 'Initial API version with core functionality'
    }
};
exports.CURRENT_VERSION = 'v1';
exports.SUPPORTED_VERSIONS = Object.keys(exports.API_VERSIONS);
function validateApiVersion(req, res, next) {
    const versionMatch = req.path.match(/\/api\/cubcen\/(v\d+)\//);
    if (!versionMatch) {
        res.status(400).json({
            error: {
                code: 'MISSING_API_VERSION',
                message: 'API version is required in the URL path',
                supportedVersions: exports.SUPPORTED_VERSIONS,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
        return;
    }
    const requestedVersion = versionMatch[1];
    if (!exports.SUPPORTED_VERSIONS.includes(requestedVersion)) {
        res.status(400).json({
            error: {
                code: 'UNSUPPORTED_API_VERSION',
                message: `API version ${requestedVersion} is not supported`,
                supportedVersions: exports.SUPPORTED_VERSIONS,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id']
            }
        });
        return;
    }
    const versionInfo = exports.API_VERSIONS[requestedVersion];
    req.apiVersion = {
        version: requestedVersion,
        info: versionInfo
    };
    res.setHeader('API-Version', versionInfo.version);
    res.setHeader('API-Supported-Versions', exports.SUPPORTED_VERSIONS.join(', '));
    if (versionInfo.deprecated) {
        res.setHeader('API-Deprecated', 'true');
        if (versionInfo.deprecationDate) {
            res.setHeader('API-Deprecation-Date', versionInfo.deprecationDate.toISOString());
        }
        if (versionInfo.sunsetDate) {
            res.setHeader('API-Sunset-Date', versionInfo.sunsetDate.toISOString());
        }
        logger_1.logger.warn('Deprecated API version used', {
            version: requestedVersion,
            path: req.path,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            deprecationDate: versionInfo.deprecationDate,
            sunsetDate: versionInfo.sunsetDate
        });
    }
    next();
}
function handleVersionTransforms(req, res, next) {
    const version = req.apiVersion?.version;
    if (!version) {
        next();
        return;
    }
    const originalJson = res.json;
    res.json = function (data) {
        const transformedData = applyVersionTransforms(data, version);
        return originalJson.call(this, transformedData);
    };
    next();
}
function applyVersionTransforms(data, version) {
    switch (version) {
        case 'v1':
            return transformForV1(data);
        default:
            return data;
    }
}
function transformForV1(data) {
    return data;
}
function getApiVersionInfo(version) {
    if (!version) {
        return exports.API_VERSIONS[exports.CURRENT_VERSION];
    }
    return exports.API_VERSIONS[version] || null;
}
function isVersionSupported(version) {
    return exports.SUPPORTED_VERSIONS.includes(version);
}
function isVersionDeprecated(version) {
    const versionInfo = exports.API_VERSIONS[version];
    return versionInfo?.deprecated === true;
}
function getDeprecationWarning(version) {
    const versionInfo = exports.API_VERSIONS[version];
    if (!versionInfo?.deprecated) {
        return null;
    }
    let warning = `API version ${version} is deprecated.`;
    if (versionInfo.deprecationDate) {
        warning += ` Deprecated since ${versionInfo.deprecationDate.toISOString().split('T')[0]}.`;
    }
    if (versionInfo.sunsetDate) {
        warning += ` Will be removed on ${versionInfo.sunsetDate.toISOString().split('T')[0]}.`;
    }
    warning += ` Please migrate to version ${exports.CURRENT_VERSION}.`;
    return warning;
}
function addVersionInfoToSpec(spec) {
    spec.info.version = exports.API_VERSIONS[exports.CURRENT_VERSION].version;
    spec.info['x-api-versions'] = Object.entries(exports.API_VERSIONS).map(([key, value]) => ({
        version: key,
        info: value
    }));
    spec.servers = spec.servers.map((server) => ({
        ...server,
        url: server.url.replace('/api/cubcen/', `/api/cubcen/${exports.CURRENT_VERSION}/`)
    }));
    return spec;
}
//# sourceMappingURL=api-versioning.js.map