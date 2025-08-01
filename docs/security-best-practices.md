# Cubcen Security Best Practices Guide

## Overview

This document outlines the comprehensive security measures implemented in Cubcen and provides best practices for maintaining a secure AI agent management platform.

## Security Architecture

### Defense in Depth

Cubcen implements multiple layers of security controls:

1. **Network Security**: HTTPS enforcement, IP whitelisting, geolocation filtering
2. **Application Security**: Input validation, output encoding, secure headers
3. **Authentication & Authorization**: JWT tokens, RBAC, session management
4. **Data Security**: Encryption at rest and in transit, secure backups
5. **Monitoring & Logging**: Comprehensive audit trails, security event detection
6. **Infrastructure Security**: Container security, environment isolation

## Authentication & Session Management

### JWT Token Security

```typescript
// Secure JWT configuration
const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '15m', // Short-lived access tokens
  issuer: 'cubcen-platform',
  audience: 'cubcen-users',
}

// Refresh token configuration
const refreshTokenConfig = {
  expiresIn: '7d', // Longer-lived refresh tokens
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
}
```

**Best Practices:**

- Use short-lived access tokens (15 minutes)
- Implement secure refresh token rotation
- Store refresh tokens in httpOnly cookies
- Validate token claims on every request
- Implement token blacklisting for logout

### Session Management

```typescript
// Secure session configuration
const sessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSessionsPerUser: 5, // Limit concurrent sessions
  secureOnly: true, // HTTPS only
  sameSite: 'strict',
  httpOnly: true,
}
```

**Security Features:**

- Device fingerprinting for session validation
- IP address consistency checks
- Automatic session cleanup
- Progressive session limits per user
- Comprehensive session audit logging

## Input Validation & Sanitization

### XSS Prevention

```typescript
// Comprehensive XSS protection
const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<(iframe|object|embed|form)\b[^>]*>/gi,
]
```

**Implementation:**

- Server-side input sanitization
- Content Security Policy (CSP) headers
- Output encoding for dynamic content
- DOM-based XSS prevention in frontend

### SQL Injection Prevention

```typescript
// Parameterized queries with Prisma
const user = await prisma.user.findFirst({
  where: {
    email: userEmail, // Automatically parameterized
    active: true,
  },
})
```

**Best Practices:**

- Always use parameterized queries
- Validate input types and formats
- Implement query result limits
- Use least privilege database accounts

### CSRF Protection

```typescript
// CSRF token generation and validation
const csrfToken = crypto.randomBytes(32).toString('hex')

// Validation middleware
export function csrfProtection(req, res, next) {
  const token = req.headers['x-csrf-token'] || req.body._csrf
  const sessionToken = req.session?.csrfToken

  if (!token || token !== sessionToken) {
    return res.status(403).json({ error: 'CSRF token invalid' })
  }

  next()
}
```

## Security Headers

### Comprehensive Header Configuration

```typescript
// Security headers implementation
export function securityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss:",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // HSTS for HTTPS
  if (req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  next()
}
```

## Rate Limiting & DDoS Protection

### Advanced Rate Limiting

```typescript
// Progressive rate limiting implementation
class AdvancedRateLimiter {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 5
    this.windowMs = options.windowMs || 15 * 60 * 1000
    this.blockDurationMs = options.blockDurationMs || 60 * 1000
    this.progressiveMultiplier = options.progressiveMultiplier || 2
  }

  // Progressive blocking with exponential backoff
  calculateBlockDuration(attemptCount) {
    const multiplier = Math.pow(
      this.progressiveMultiplier,
      Math.floor(attemptCount / this.maxAttempts)
    )
    return this.blockDurationMs * multiplier
  }
}
```

**Rate Limiting Strategy:**

- General API: 100 requests per 15 minutes per IP
- Authentication: 5 attempts per 15 minutes per IP
- Password reset: 3 attempts per hour per email
- File upload: 10 uploads per hour per user

## Audit Logging & Monitoring

### Comprehensive Audit Trail

```typescript
// Audit event types
enum AuditEventType {
  // Authentication events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',

  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CSRF_ATTACK_BLOCKED = 'CSRF_ATTACK_BLOCKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Data events
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_MODIFIED = 'DATA_MODIFIED',
  DATA_DELETED = 'DATA_DELETED',
}
```

**Audit Log Requirements:**

- Immutable log entries with cryptographic integrity
- Comprehensive context capture (IP, user agent, request ID)
- Automated log analysis and alerting
- Secure log storage with access controls
- Regular log backup and archival

### Security Monitoring

```typescript
// Security event detection
const securityPatterns = {
  sqlInjection:
    /(\b(union|select|insert|update|delete|drop)\b.*\b(from|where|into)\b)/i,
  xssAttempt: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  pathTraversal: /\.\.[\/\\]/,
  commandInjection: /[;&|`$(){}[\]]/,
}

// Real-time alerting
function detectSuspiciousActivity(request) {
  const requestString = JSON.stringify(request)

  for (const [type, pattern] of Object.entries(securityPatterns)) {
    if (pattern.test(requestString)) {
      auditLogger.logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        `${type} detected in request`,
        request
      )

      // Immediate alerting for critical events
      if (type === 'sqlInjection') {
        alertingService.sendCriticalAlert({
          type: 'SQL_INJECTION_ATTEMPT',
          source: request.ip,
          details: requestString,
        })
      }
    }
  }
}
```

## Data Protection

### Encryption Standards

**Data at Rest:**

- AES-256 encryption for sensitive data
- Encrypted database backups
- Secure key management with rotation

**Data in Transit:**

- TLS 1.3 for all communications
- Certificate pinning for API clients
- Encrypted WebSocket connections

### Sensitive Data Handling

```typescript
// Password hashing
import bcrypt from 'bcrypt'

const saltRounds = 12
const hashedPassword = await bcrypt.hash(password, saltRounds)

// API key encryption
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  cipher.setAAD(Buffer.from('api-key', 'utf8'))

  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  }
}
```

## File Upload Security

### Secure File Handling

```typescript
// File upload security configuration
const fileUploadConfig = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/json',
    'application/pdf',
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  dangerousExtensions: ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'],
  scanForMalware: true,
  quarantineDirectory: '/tmp/quarantine',
}
```

**Security Measures:**

- MIME type validation
- File extension filtering
- Virus scanning integration
- Sandboxed file processing
- Secure file storage with access controls

## API Security

### Authentication & Authorization

```typescript
// API endpoint protection
app.use('/api/cubcen/v1/admin', [
  authenticate,
  requireRole(UserRole.ADMIN),
  auditMiddleware,
])

app.use('/api/cubcen/v1/agents', [
  authenticate,
  requirePermission(Permission.AGENT_READ),
  rateLimitMiddleware,
])
```

### API Versioning & Deprecation

```typescript
// Secure API versioning
const apiVersions = {
  v1: {
    supported: true,
    deprecated: false,
    sunsetDate: null,
  },
  v2: {
    supported: true,
    deprecated: false,
    sunsetDate: null,
  },
}

// Version validation middleware
function validateApiVersion(req, res, next) {
  const version = req.params.version
  const versionInfo = apiVersions[version]

  if (!versionInfo || !versionInfo.supported) {
    return res.status(400).json({
      error: 'Unsupported API version',
      supportedVersions: Object.keys(apiVersions).filter(
        v => apiVersions[v].supported
      ),
    })
  }

  if (versionInfo.deprecated) {
    res.setHeader('Sunset', versionInfo.sunsetDate)
    res.setHeader('Deprecation', 'true')
  }

  next()
}
```

## Environment Security

### Configuration Management

```typescript
// Secure environment configuration
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'SESSION_SECRET',
]

// Validate required environment variables
function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Validate key strengths
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }
}
```

### Docker Security

```dockerfile
# Secure Dockerfile practices
FROM node:18-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cubcen -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=cubcen:nodejs . .

# Switch to non-root user
USER cubcen

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

## Incident Response

### Security Incident Handling

1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Severity classification and impact analysis
3. **Containment**: Immediate threat mitigation
4. **Investigation**: Forensic analysis and root cause identification
5. **Recovery**: System restoration and security improvements
6. **Lessons Learned**: Post-incident review and documentation

### Emergency Procedures

```typescript
// Emergency security procedures
class SecurityIncidentHandler {
  async handleCriticalIncident(incident) {
    // Immediate containment
    await this.enableEmergencyMode()

    // Alert security team
    await this.sendCriticalAlert(incident)

    // Log incident details
    await auditLogger.logEvent({
      eventType: AuditEventType.SECURITY_BREACH_DETECTED,
      severity: AuditSeverity.CRITICAL,
      description: incident.description,
      metadata: incident.details,
    })

    // Initiate response procedures
    await this.initiateIncidentResponse(incident)
  }

  async enableEmergencyMode() {
    // Disable non-essential services
    // Increase logging verbosity
    // Enable additional security controls
    // Notify administrators
  }
}
```

## Compliance & Governance

### Data Privacy

- **GDPR Compliance**: Data minimization, consent management, right to deletion
- **Data Retention**: Automated data lifecycle management
- **Cross-border Data Transfer**: Appropriate safeguards and legal basis

### Security Standards

- **OWASP Top 10**: Regular assessment and mitigation
- **ISO 27001**: Information security management system
- **SOC 2 Type II**: Security, availability, and confidentiality controls

## Security Testing

### Automated Security Testing

```typescript
// Security test automation
describe('Security Tests', () => {
  test('XSS Prevention', async () => {
    const maliciousPayload = '<script>alert("xss")</script>'
    const response = await request(app)
      .post('/api/test')
      .send({ input: maliciousPayload })

    expect(response.body.input).not.toContain('<script>')
  })

  test('SQL Injection Prevention', async () => {
    const maliciousQuery = "'; DROP TABLE users; --"
    const response = await request(app).get(
      `/api/users?search=${maliciousQuery}`
    )

    expect(response.status).not.toBe(500)
    // Verify database integrity
  })
})
```

### Penetration Testing

- **Regular Security Assessments**: Quarterly penetration testing
- **Vulnerability Scanning**: Automated daily scans
- **Code Security Review**: Static and dynamic analysis
- **Third-party Security Audits**: Annual comprehensive reviews

## Security Maintenance

### Regular Security Tasks

**Daily:**

- Monitor security alerts and logs
- Review failed authentication attempts
- Check system health and performance

**Weekly:**

- Update security signatures and rules
- Review access logs and user activities
- Validate backup integrity

**Monthly:**

- Security patch management
- Access control review
- Incident response drill

**Quarterly:**

- Security architecture review
- Penetration testing
- Security training updates

### Security Metrics

```typescript
// Security KPIs and metrics
const securityMetrics = {
  // Authentication metrics
  failedLoginRate: 'Failed logins / Total login attempts',
  averageSessionDuration: 'Total session time / Number of sessions',

  // Security event metrics
  securityIncidentCount: 'Number of security incidents per month',
  meanTimeToDetection: 'Average time to detect security incidents',
  meanTimeToResponse: 'Average time to respond to incidents',

  // Vulnerability metrics
  criticalVulnerabilityCount: 'Number of critical vulnerabilities',
  averageTimeToRemediation: 'Time from discovery to fix',

  // Compliance metrics
  auditLogCompleteness: 'Percentage of events properly logged',
  accessControlCompliance: 'Percentage of users with appropriate access',
}
```

## Conclusion

This security guide provides a comprehensive framework for maintaining the security of the Cubcen platform. Regular review and updates of these practices are essential to address evolving threats and maintain a strong security posture.

For questions or security concerns, contact the security team at security@cubcen.com or create a confidential security issue in the project repository.
