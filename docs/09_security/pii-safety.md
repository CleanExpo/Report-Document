# PII Safety & Data Protection Guide

**Version**: 1.0.0  
**Classification**: MANDATORY READING  
**Last Updated**: 2025-01-20

## ⚠️ Critical Warning

**NEVER** paste, share, or expose:
- Passwords, API keys, or tokens
- Social Security Numbers (SSN)
- Credit card information
- Personal health information (PHI)
- Private keys or certificates
- Database credentials
- Customer data

## 🛡️ Safe Practices

### 1. Environment Variables

#### ❌ NEVER DO THIS:
```javascript
// WRONG - Hardcoded secret
const apiKey = "sk-abc123xyz789...";

// WRONG - Logging secrets
console.log(`API Key: ${process.env.API_KEY}`);

// WRONG - Exposing in error messages
throw new Error(`Failed with key: ${apiKey}`);
```

#### ✅ DO THIS INSTEAD:
```javascript
// RIGHT - Use environment variables
const apiKey = process.env.API_KEY;

// RIGHT - Confirm presence without exposure
if (!process.env.API_KEY) {
  console.log("API_KEY not configured");
}

// RIGHT - Safe error messages
throw new Error("Authentication failed - check API configuration");
```

### 2. Configuration Files

#### ❌ NEVER:
- Commit `.env` files to git
- Store secrets in `config.json`
- Include credentials in code comments
- Use real data in examples

#### ✅ ALWAYS:
- Add `.env` to `.gitignore`
- Use `.env.example` with dummy values
- Store secrets in secure vaults
- Use placeholder data in documentation

### 3. Logging & Debugging

#### Safe Logging Practices:
```javascript
// Create a safe logger
class SafeLogger {
  log(message, data = {}) {
    const sanitized = this.sanitize(data);
    console.log(message, sanitized);
  }
  
  sanitize(data) {
    const sensitive = ['password', 'token', 'key', 'secret', 'ssn', 'credit'];
    const cleaned = { ...data };
    
    for (const key in cleaned) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        cleaned[key] = '***REDACTED***';
      }
    }
    
    return cleaned;
  }
}

const logger = new SafeLogger();
logger.log('User data:', { 
  name: 'John', 
  password: 'secret123' // Will be redacted
});
```

## 🔍 Detection Patterns

### Common PII Patterns to Avoid:

```regex
# Social Security Numbers
\b\d{3}-\d{2}-\d{4}\b
\b\d{9}\b

# Credit Card Numbers
\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b

# Email Addresses (be careful with customer emails)
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b

# Phone Numbers
\b\d{3}[-.]?\d{3}[-.]?\d{4}\b

# API Keys (common patterns)
sk-[a-zA-Z0-9]{32,}
api[_-]?key[_-]?[a-zA-Z0-9]{20,}
```

## 🚨 Incident Response

### If You Accidentally Expose Secrets:

1. **Immediately rotate the exposed credential**
2. **Remove from git history:**
   ```bash
   # Remove file from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (coordinate with team)
   git push --force --all
   ```

3. **Notify security team**
4. **Document the incident**
5. **Review logs for unauthorized access**

## 📋 Agent Guidelines

### Agents MUST:

1. **Refuse to echo environment variables**
   ```bash
   # Agent response to "echo $API_KEY"
   "I cannot display environment variables as they may contain secrets."
   ```

2. **Sanitize all output**
   ```javascript
   // Before returning any output
   output = sanitizeForSecrets(output);
   ```

3. **Warn about unsafe operations**
   ```
   User: "cat .env"
   Agent: "⚠️ Warning: .env files contain secrets. 
           Use 'npm run config:check' to verify configuration instead."
   ```

4. **Provide safe alternatives**
   ```
   User: "Show me the database password"
   Agent: "I cannot display passwords. To verify database connection:
           - Check if DB_PASSWORD is set: echo ${DB_PASSWORD:+SET}
           - Test connection: npm run db:test"
   ```

## 🔒 Data Classification

### Public
- Open source code
- Documentation
- Public API endpoints
- Marketing content

### Internal
- Architecture diagrams
- Internal wikis
- Team communications
- Development plans

### Confidential
- Customer data
- Employee information
- Financial records
- Business strategies

### Secret
- Passwords
- API keys
- Certificates
- Encryption keys

## ✅ Security Checklist

Before sharing any code or configuration:

- [ ] No hardcoded secrets
- [ ] No real customer data
- [ ] No personal information
- [ ] No internal URLs
- [ ] No database schemas with real table names
- [ ] No production server names
- [ ] No internal IP addresses
- [ ] No employee names or emails

## 🛠️ Tools & Commands

### Check for secrets:
```bash
# Scan for secrets
npm run security:scan

# Check git history
git grep -i "password\|api[_-]key\|secret"

# Verify .gitignore
cat .gitignore | grep -E "\.env|\.pem|\.key"
```

### Safe configuration check:
```bash
# Check if secrets are configured (without showing them)
npm run config:verify

# List required environment variables
npm run config:list
```

## 📚 Best Practices

### 1. Use Secret Management Services
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- GitHub Secrets

### 2. Implement Access Controls
- Principle of least privilege
- Role-based access
- Audit trails
- Regular rotation

### 3. Encrypt Sensitive Data
- At rest: AES-256
- In transit: TLS 1.3
- Key management: HSM

### 4. Regular Audits
- Weekly secret scans
- Monthly access reviews
- Quarterly security assessments
- Annual penetration testing

## 🎯 Quick Reference

### Safe Commands:
```bash
# Check if variable exists
[ -n "$VAR" ] && echo "VAR is set" || echo "VAR not set"

# Count characters without showing
echo ${#PASSWORD}

# Hash for verification
echo -n "$SECRET" | sha256sum

# Test without exposure
curl -H "Authorization: Bearer ${TOKEN:?Token required}" \
     -w "%{http_code}" -o /dev/null -s https://api.example.com/test
```

### Unsafe Commands (BLOCKED):
```bash
echo $PASSWORD           # Blocked
printenv                # Blocked
env | grep KEY          # Blocked
cat .env                # Blocked
docker login            # Blocked
npm publish             # Blocked
```

## 🚦 Remember

- **When in doubt, DON'T share it**
- **Secrets are called secrets for a reason**
- **One exposure can compromise everything**
- **Security is everyone's responsibility**

---

**If you see something, say something.**  
Report security concerns immediately.