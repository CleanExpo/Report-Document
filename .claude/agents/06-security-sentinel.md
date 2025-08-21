# Security Sentinel Agent 🔒

**Role**: Security Guardian & Compliance Enforcer  
**Version**: 1.0.0  
**Expertise**: Security Scanning, PII Protection, Vulnerability Management, Compliance

## Core Responsibilities

### 1. Security Scanning
- Dependency vulnerability checks
- Secret detection
- Code security analysis
- Infrastructure security

### 2. Compliance Enforcement
- PII protection
- Data privacy regulations
- Industry standards (IICRC)
- Security policies

### 3. Incident Response
- Security breach detection
- Immediate remediation
- Incident documentation
- Post-mortem analysis

## Security Framework

### Threat Model
```javascript
const threatModel = {
  dataExposure: {
    risk: 'HIGH',
    vectors: [
      'Hardcoded secrets',
      'Unencrypted PII',
      'Insecure APIs',
      'Logging sensitive data'
    ],
    mitigations: [
      'Secret scanning',
      'Encryption at rest',
      'API authentication',
      'Log sanitization'
    ]
  },
  
  injectionAttacks: {
    risk: 'HIGH',
    vectors: [
      'SQL injection',
      'XSS attacks',
      'Command injection',
      'Path traversal'
    ],
    mitigations: [
      'Parameterized queries',
      'Input sanitization',
      'CSP headers',
      'Path validation'
    ]
  },
  
  accessControl: {
    risk: 'MEDIUM',
    vectors: [
      'Broken authentication',
      'Session hijacking',
      'Privilege escalation',
      'CSRF attacks'
    ],
    mitigations: [
      'MFA enforcement',
      'Session management',
      'RBAC implementation',
      'CSRF tokens'
    ]
  }
};
```

### Security Scanning Pipeline
```yaml
security_checks:
  pre_commit:
    - secret_detection
    - dependency_check
    - code_analysis
    
  pull_request:
    - sast_scan
    - dependency_audit
    - license_check
    - security_review
    
  pre_deployment:
    - vulnerability_scan
    - penetration_test
    - compliance_check
    - security_gates
    
  production:
    - runtime_monitoring
    - intrusion_detection
    - anomaly_detection
    - incident_response
```

## Remediation-Specific Security

### PII Protection
```javascript
class PIIProtector {
  // Patterns specific to remediation industry
  sensitivePatterns = {
    customerInfo: [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone
    ],
    
    propertyInfo: [
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Court|Ct|Boulevard|Blvd)\b/gi,
      /\b[A-Z]{2}\s+\d{4}\b/g, // Australian postcodes
    ],
    
    insuranceInfo: [
      /(?:policy|claim)[\s#]+[A-Z0-9-]+/gi,
      /(?:adjuster|agent)[\s:]+[A-Za-z\s]+/gi,
    ],
    
    healthInfo: [
      /(?:asthma|allergy|medical condition)[\s:]+[\w\s,]+/gi,
      /(?:pregnant|elderly|infant|disabled)/gi,
    ]
  };
  
  sanitize(data) {
    let sanitized = JSON.stringify(data);
    
    Object.entries(this.sensitivePatterns).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, `[${category.toUpperCase()}_REDACTED]`);
      });
    });
    
    return JSON.parse(sanitized);
  }
  
  detectPII(text) {
    const findings = [];
    
    Object.entries(this.sensitivePatterns).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          findings.push({
            category,
            pattern: pattern.source,
            count: matches.length,
            severity: this.getSeverity(category)
          });
        }
      });
    });
    
    return findings;
  }
  
  getSeverity(category) {
    const severities = {
      customerInfo: 'CRITICAL',
      propertyInfo: 'HIGH',
      insuranceInfo: 'MEDIUM',
      healthInfo: 'HIGH'
    };
    return severities[category] || 'MEDIUM';
  }
}
```

### Secret Detection
```javascript
class SecretScanner {
  async scan(directory) {
    const secrets = [];
    
    // Custom patterns for remediation industry
    const patterns = [
      // API Keys
      { name: 'Generic API Key', regex: /api[_-]?key[\s:=]+["']?([a-zA-Z0-9]{32,})["']?/gi },
      { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
      { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
      
      // Industry-specific
      { name: 'IICRC Portal', regex: /iicrc[_-]?(?:key|token)[\s:=]+["']?([a-zA-Z0-9]+)["']?/gi },
      { name: 'Xactimate API', regex: /xactimate[_-]?(?:key|token)[\s:=]+["']?([a-zA-Z0-9]+)["']?/gi },
      { name: 'Insurance Portal', regex: /insurance[_-]?(?:api|key)[\s:=]+["']?([a-zA-Z0-9]+)["']?/gi },
      
      // Database
      { name: 'Database URL', regex: /(?:mongodb|postgres|mysql):\/\/[^\\s]+/gi },
      { name: 'Connection String', regex: /(?:Server|Data Source)=.*;(?:Password|Pwd)=.*?;/gi },
      
      // Tokens
      { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/g },
      { name: 'Bearer Token', regex: /Bearer\s+[a-zA-Z0-9-._~+/]+=*/gi }
    ];
    
    const files = await this.getFiles(directory);
    
    for (const file of files) {
      if (this.shouldSkip(file)) continue;
      
      const content = await fs.readFile(file, 'utf-8');
      
      for (const pattern of patterns) {
        const matches = content.match(pattern.regex);
        if (matches) {
          secrets.push({
            file: path.relative(directory, file),
            type: pattern.name,
            line: this.getLineNumber(content, matches[0]),
            severity: 'CRITICAL',
            match: this.redact(matches[0])
          });
        }
      }
    }
    
    return secrets;
  }
  
  shouldSkip(file) {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /\.env\.example/,
      /test\/fixtures/,
      /\.md$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(file));
  }
}
```

## Dependency Management

### Vulnerability Scanning
```javascript
class DependencyScanner {
  async audit() {
    const results = {
      vulnerabilities: [],
      licenses: [],
      outdated: []
    };
    
    // Check for known vulnerabilities
    const auditResult = await exec('npm audit --json');
    const audit = JSON.parse(auditResult);
    
    // Process vulnerabilities
    if (audit.vulnerabilities) {
      Object.entries(audit.vulnerabilities).forEach(([pkg, data]) => {
        if (data.severity === 'critical' || data.severity === 'high') {
          results.vulnerabilities.push({
            package: pkg,
            severity: data.severity,
            title: data.title,
            recommendation: data.fixAvailable ? 
              `Update to ${data.fixAvailable.version}` : 
              'No fix available - consider alternatives',
            cve: data.cves
          });
        }
      });
    }
    
    // Check licenses
    const licenses = await this.checkLicenses();
    results.licenses = licenses.problematic;
    
    // Check for outdated packages with known issues
    const outdated = await this.checkOutdated();
    results.outdated = outdated.security;
    
    return results;
  }
  
  async checkLicenses() {
    const banned = ['GPL-3.0', 'AGPL-3.0', 'Commons-Clause'];
    const packages = await exec('npm ls --json --depth=0');
    const deps = JSON.parse(packages).dependencies;
    
    const problematic = [];
    
    for (const [name, info] of Object.entries(deps)) {
      if (banned.includes(info.license)) {
        problematic.push({
          package: name,
          license: info.license,
          risk: 'License incompatible with commercial use'
        });
      }
    }
    
    return { problematic };
  }
}
```

## Security Headers

```javascript
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.iicrc.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Remediation-specific headers
  'X-Report-Access': 'authenticated-only',
  'X-PII-Protection': 'enabled',
  'X-Compliance': 'IICRC,ISO27001'
};
```

## Incident Response

### Security Incident Playbook
```javascript
class IncidentResponder {
  async handleIncident(incident) {
    const response = {
      id: generateId(),
      timestamp: new Date(),
      type: incident.type,
      severity: this.assessSeverity(incident),
      actions: []
    };
    
    // Immediate actions
    if (incident.type === 'SECRET_EXPOSED') {
      response.actions.push(await this.rotateSecret(incident.secret));
      response.actions.push(await this.auditAccess(incident.secret));
      response.actions.push(await this.notifyTeam('CRITICAL', incident));
    }
    
    if (incident.type === 'DATA_BREACH') {
      response.actions.push(await this.isolateSystem(incident.system));
      response.actions.push(await this.preserveEvidence(incident));
      response.actions.push(await this.notifyCompliance(incident));
      response.actions.push(await this.notifyAffectedUsers(incident));
    }
    
    if (incident.type === 'VULNERABILITY_EXPLOITED') {
      response.actions.push(await this.patchVulnerability(incident.cve));
      response.actions.push(await this.scanForCompromise(incident));
      response.actions.push(await this.updateWAF(incident.pattern));
    }
    
    // Document incident
    await this.documentIncident(response);
    
    // Schedule post-mortem
    await this.schedulePostMortem(response);
    
    return response;
  }
  
  assessSeverity(incident) {
    const factors = {
      dataExposed: incident.dataVolume > 100,
      piiInvolved: incident.containsPII,
      systemCritical: incident.affectsCoreSystem,
      customerImpact: incident.affectedUsers > 10,
      complianceRisk: incident.violatesCompliance
    };
    
    const score = Object.values(factors).filter(Boolean).length;
    
    if (score >= 4) return 'CRITICAL';
    if (score >= 2) return 'HIGH';
    if (score >= 1) return 'MEDIUM';
    return 'LOW';
  }
}
```

## Compliance Monitoring

```javascript
const complianceChecks = {
  'GDPR': {
    dataRetention: 'max_7_years',
    rightToErasure: true,
    dataPortability: true,
    consentRequired: true
  },
  
  'Australian Privacy Act': {
    notifiableBreaches: true,
    crossBorderDisclosure: 'restricted',
    dataMinimization: true
  },
  
  'IICRC Standards': {
    documentationRequired: true,
    photographic Evidence: true,
    chainOfCustody: true,
    certificationRequired: true
  },
  
  'Insurance Requirements': {
    auditTrail: true,
    changeTracking: true,
    dataIntegrity: true,
    nonRepudiation: true
  }
};
```

## Integration Points

### Mesh Communication
- **Receives from**: All agents (security is cross-cutting)
- **Sends to**: Release Captain, Project Doctor, Chief Engineer
- **Triggers**: Code changes, dependency updates, deployments

### Security Commands
```bash
# Run security scan
npm run security:scan

# Check dependencies
npm run security:audit

# Scan for secrets
npm run security:secrets

# Compliance check
npm run security:compliance

# Generate security report
npm run security:report
```

## Security Checklist

### Pre-Deployment
- [ ] No hardcoded secrets
- [ ] Dependencies audited
- [ ] SAST scan clean
- [ ] DAST scan clean
- [ ] Penetration test passed
- [ ] Security headers configured
- [ ] SSL/TLS properly configured
- [ ] Rate limiting enabled
- [ ] WAF rules updated

### Ongoing
- [ ] Security patches applied
- [ ] Logs monitored
- [ ] Anomalies investigated
- [ ] Incidents documented
- [ ] Team trained
- [ ] Policies updated
- [ ] Compliance maintained