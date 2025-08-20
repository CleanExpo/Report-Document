# Security & Compliance Guardrails

**Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Classification**: REQUIRED READING

## 🔒 Overview

This document defines mandatory security guardrails that protect against accidental exposure of secrets, unauthorized operations, and compliance violations. These rules are enforced automatically by all agents.

## ⛔ Command Denylist

### Absolutely Forbidden Commands

These commands will be rejected immediately with no override option:

```yaml
forbidden_commands:
  # Authentication & Secrets
  - pattern: "docker login*"
    reason: "Prevents credential exposure"
    
  - pattern: "npm publish*"
    reason: "Prevents accidental package publication"
    
  - pattern: "npm login*"
    reason: "Prevents credential storage"
    
  - pattern: "echo $*"
    reason: "Prevents secret exposure via environment variables"
    
  - pattern: "printenv*"
    reason: "Prevents environment variable disclosure"
    
  - pattern: "set | grep*"
    reason: "Prevents filtered environment disclosure"
    
  # Outbound Connections
  - pattern: "curl -d*"
    reason: "Prevents data exfiltration"
    
  - pattern: "wget --post*"
    reason: "Prevents data exfiltration"
    
  - pattern: "nc * * <*"
    reason: "Prevents reverse shells"
    
  # System Modifications
  - pattern: "rm -rf /*"
    reason: "Prevents system destruction"
    
  - pattern: "chmod 777*"
    reason: "Prevents permission weakening"
    
  - pattern: "sudo *"
    reason: "Prevents privilege escalation"
```

### Restricted Commands (Require Approval)

These commands require explicit user confirmation:

```yaml
restricted_commands:
  - pattern: "git push*"
    prompt: "This will push code to remote. Continue?"
    
  - pattern: "npm install -g*"
    prompt: "This will install globally. Continue?"
    
  - pattern: "curl http*"
    prompt: "This will make an external request. Continue?"
    
  - pattern: "ssh *"
    prompt: "This will establish SSH connection. Continue?"
```

## 🛡️ PII & Secret Protection

### Never Log or Display

Agents MUST NEVER output, log, or echo:

1. **Environment Variables**
   - Any value from `process.env.*`
   - Any value from `$ENV_VAR`
   - API keys, tokens, passwords

2. **File Contents**
   - `.env` files
   - `.env.*` files
   - `*secrets*` files
   - `*credentials*` files
   - Private keys (`*.pem`, `*.key`)

3. **Sensitive Patterns**
   ```regex
   # API Keys
   /[a-zA-Z0-9]{32,}/
   
   # JWT Tokens
   /eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/
   
   # Basic Auth
   /Basic [a-zA-Z0-9+/]+=*/
   
   # AWS Keys
   /AKIA[0-9A-Z]{16}/
   ```

### Safe Alternatives

Instead of exposing secrets, use:

```bash
# Bad - Exposes secret
echo $API_KEY

# Good - Confirms presence without exposure
if [ -n "$API_KEY" ]; then echo "API_KEY is set"; fi

# Bad - Logs password
echo "Password: $DB_PASSWORD"

# Good - Masked output
echo "Password: ****"

# Bad - Shows all env vars
printenv

# Good - Shows only safe vars
env | grep -E '^(PATH|HOME|USER)='
```

## 📊 Dependency Hygiene

### Automated Scanning

Every build must run:

```bash
# Check production dependencies
npm audit --production

# Check all dependencies (non-blocking)
npm audit --omit=dev || true

# Generate report
npm audit --json > security-audit.json

# Check for outdated packages
npm outdated --json > outdated-packages.json
```

### Vulnerability Thresholds

```yaml
blocking_thresholds:
  critical: 0  # No critical vulnerabilities allowed
  high: 0      # No high vulnerabilities allowed
  
warning_thresholds:
  moderate: 5  # Warn if > 5 moderate
  low: 20      # Warn if > 20 low
```

### License Compliance

Check for problematic licenses:

```javascript
const bannedLicenses = [
  'GPL-3.0',
  'AGPL-3.0',
  'Commons Clause'
];

const allowedLicenses = [
  'MIT',
  'Apache-2.0',
  'BSD-3-Clause',
  'ISC'
];
```

## 🚨 Security Incident Response

### If Secret Exposed

1. **Immediate Actions**
   ```bash
   # Rotate the exposed secret immediately
   # Add to .gitignore
   echo "path/to/secret" >> .gitignore
   
   # Remove from git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Notification**
   - Alert user immediately
   - Log incident (without secret value)
   - Recommend rotation

### If Vulnerability Found

1. **Assessment**
   ```bash
   # Get details
   npm audit
   
   # Try automatic fix
   npm audit fix
   
   # Force fix if needed (careful!)
   npm audit fix --force
   ```

2. **Documentation**
   - Record in `docs/security/vulnerabilities.md`
   - Note mitigation strategy
   - Set remediation timeline

## 🔍 Compliance Checks

### Pre-Commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for secrets
git secrets --pre_commit_hook -- "$@"

# Check for large files
find . -size +100M | grep -v node_modules
if [ $? -eq 0 ]; then
  echo "Large files detected. Use Git LFS."
  exit 1
fi

# Check for PII patterns
grep -r -E "(SSN|social.?security|credit.?card)" --include="*.{js,ts,jsx,tsx}" .
if [ $? -eq 0 ]; then
  echo "Potential PII detected. Review before commit."
  exit 1
fi
```

### CI/CD Security Gates

```yaml
security_pipeline:
  - step: dependency_scan
    command: npm audit --production
    blocking: true
    
  - step: secret_scan
    command: trufflehog filesystem .
    blocking: true
    
  - step: sast_scan
    command: semgrep --config=auto
    blocking: false
    
  - step: license_check
    command: license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-3-Clause;ISC"
    blocking: true
```

## 📋 Security Checklist

### For Developers

- [ ] Never commit `.env` files
- [ ] Use environment variables for secrets
- [ ] Run `npm audit` before commits
- [ ] Review dependencies before adding
- [ ] Use least privilege principle
- [ ] Validate all user inputs
- [ ] Sanitize all outputs
- [ ] Use HTTPS everywhere
- [ ] Enable CSP headers
- [ ] Implement rate limiting

### For Agents

- [ ] Never echo environment variables
- [ ] Block forbidden commands
- [ ] Warn on restricted commands
- [ ] Scan for secrets before operations
- [ ] Validate file permissions
- [ ] Check for PII patterns
- [ ] Report security issues
- [ ] Maintain audit logs
- [ ] Enforce secure defaults
- [ ] Require explicit confirmation for risky operations

## 🎯 Enforcement Levels

### Level 1: Block (No Override)
- Docker login/push
- NPM publish
- Environment variable exposure
- System destruction commands

### Level 2: Warn & Confirm
- External network calls
- Git push operations
- Global installations
- Permission changes

### Level 3: Log & Monitor
- Dependency installations
- File modifications
- API calls
- Database queries

## 📊 Metrics & Monitoring

Track security health:

```javascript
const securityMetrics = {
  vulnerabilities: {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0
  },
  compliance: {
    secretsScanned: true,
    dependenciesAudited: true,
    licensesChecked: true
  },
  incidents: {
    secretExposures: 0,
    vulnerabilitiesFound: 0,
    complianceViolations: 0
  }
};
```

## 🚀 Quick Commands

### Security Check
```bash
npm run security:check
```

### Dependency Audit
```bash
npm run security:audit
```

### Secret Scan
```bash
npm run security:scan
```

### Full Compliance Check
```bash
npm run security:compliance
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Remember**: Security is everyone's responsibility. When in doubt, err on the side of caution.