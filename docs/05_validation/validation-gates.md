# Validation Gates

> **Quick Start**: See [Lean Validation Gates](./validation-gates-lean.md) for the streamlined checklist.

## Overview
This document defines the validation gates that must pass before any code can be promoted or released. All gates must be GREEN before proceeding.

## Gate Categories

### 1. Code Quality Gates ✅

#### 1.1 Linting
- **Tool**: ESLint / Prettier / Ruff (language-specific)
- **Command**: `npm run lint` or equivalent
- **Pass Criteria**: Zero errors, warnings reviewed
- **Auto-fix**: `npm run lint:fix`

#### 1.2 Type Checking
- **Tool**: TypeScript / Flow / mypy
- **Command**: `npm run typecheck`
- **Pass Criteria**: No type errors
- **Configuration**: `tsconfig.json` or equivalent

#### 1.3 Code Coverage
- **Tool**: Jest / pytest-cov / coverage tool
- **Command**: `npm run test:coverage`
- **Pass Criteria**: 
  - Overall coverage > 80%
  - New code coverage > 90%
  - No uncovered critical paths

### 2. Testing Gates 🧪

#### 2.1 Unit Tests
- **Command**: `npm test`
- **Pass Criteria**: 
  - All tests passing
  - No skipped tests without justification
  - Test execution time < 5 minutes

#### 2.2 Integration Tests
- **Command**: `npm run test:integration`
- **Pass Criteria**:
  - All integration points verified
  - External service mocks validated
  - Database transactions tested

#### 2.3 End-to-End Tests
- **Command**: `npm run test:e2e`
- **Pass Criteria**:
  - Critical user journeys passing
  - Cross-browser compatibility verified
  - Mobile responsiveness tested

### 3. Security Gates 🔒

#### 3.1 Dependency Scanning
- **Tool**: npm audit / safety / snyk
- **Command**: `npm audit`
- **Pass Criteria**:
  - No critical vulnerabilities
  - No high vulnerabilities
  - Medium vulnerabilities documented

#### 3.2 Secret Scanning
- **Tool**: git-secrets / truffleHog
- **Command**: `npm run scan:secrets`
- **Pass Criteria**:
  - No secrets in code
  - No API keys committed
  - No passwords in config files

#### 3.3 SAST (Static Application Security Testing)
- **Tool**: SonarQube / Semgrep
- **Command**: `npm run security:scan`
- **Pass Criteria**:
  - No critical security issues
  - OWASP Top 10 compliance

### 4. Performance Gates ⚡

#### 4.1 Build Performance
- **Metric**: Build time
- **Pass Criteria**: < 5 minutes
- **Command**: `time npm run build`

#### 4.2 Bundle Size
- **Tool**: webpack-bundle-analyzer
- **Pass Criteria**:
  - Main bundle < 500KB
  - Total size < 2MB
  - No unexpected size increases > 10%

#### 4.3 Runtime Performance
- **Tool**: Lighthouse / Performance profiler
- **Pass Criteria**:
  - Response time < 200ms (p95)
  - Memory usage < 100MB
  - CPU usage < 50% (average)

### 5. Documentation Gates 📚

#### 5.1 Code Documentation
- **Tool**: JSDoc / Sphinx / documentation tool
- **Pass Criteria**:
  - All public APIs documented
  - Complex functions have comments
  - README updated

#### 5.2 API Documentation
- **Tool**: Swagger / OpenAPI
- **Pass Criteria**:
  - All endpoints documented
  - Request/response examples provided
  - Error codes documented

### 6. Compliance Gates 📋

#### 6.1 License Compliance
- **Tool**: license-checker
- **Command**: `npm run check:licenses`
- **Pass Criteria**:
  - No GPL dependencies (if proprietary)
  - All licenses compatible
  - License file present

#### 6.2 Accessibility
- **Tool**: axe / pa11y
- **Command**: `npm run test:a11y`
- **Pass Criteria**:
  - WCAG 2.1 AA compliance
  - No critical accessibility issues

## Validation Script

```bash
#!/bin/bash
# validate.sh - Run all validation gates

echo "🚀 Starting Validation Gates..."

FAILED_GATES=()

# Code Quality
echo "📝 Running Code Quality Gates..."
npm run lint || FAILED_GATES+=("Linting")
npm run typecheck || FAILED_GATES+=("Type Checking")
npm run test:coverage || FAILED_GATES+=("Code Coverage")

# Testing
echo "🧪 Running Testing Gates..."
npm test || FAILED_GATES+=("Unit Tests")
npm run test:integration || FAILED_GATES+=("Integration Tests")
npm run test:e2e || FAILED_GATES+=("E2E Tests")

# Security
echo "🔒 Running Security Gates..."
npm audit || FAILED_GATES+=("Dependency Scanning")
npm run scan:secrets || FAILED_GATES+=("Secret Scanning")
npm run security:scan || FAILED_GATES+=("SAST")

# Performance
echo "⚡ Running Performance Gates..."
npm run build || FAILED_GATES+=("Build")
npm run analyze:bundle || FAILED_GATES+=("Bundle Size")

# Documentation
echo "📚 Checking Documentation..."
npm run docs:check || FAILED_GATES+=("Documentation")

# Compliance
echo "📋 Running Compliance Gates..."
npm run check:licenses || FAILED_GATES+=("License Compliance")
npm run test:a11y || FAILED_GATES+=("Accessibility")

# Results
if [ ${#FAILED_GATES[@]} -eq 0 ]; then
    echo "✅ All validation gates PASSED!"
    exit 0
else
    echo "❌ Failed gates: ${FAILED_GATES[@]}"
    exit 1
fi
```

## Gate Status Dashboard

| Gate | Status | Last Run | Notes |
|------|--------|----------|-------|
| Linting | 🟢 Pass | - | - |
| Type Checking | 🟢 Pass | - | - |
| Code Coverage | 🟢 Pass | - | 85% |
| Unit Tests | 🟢 Pass | - | 150 tests |
| Integration Tests | 🟢 Pass | - | 25 tests |
| E2E Tests | 🟢 Pass | - | 10 scenarios |
| Security Scan | 🟢 Pass | - | No issues |
| Performance | 🟢 Pass | - | < 200ms |
| Documentation | 🟢 Pass | - | Complete |
| Compliance | 🟢 Pass | - | WCAG AA |

## Override Procedures

### Emergency Override
In critical situations, gates can be overridden with:
1. Approval from Technical Lead AND Product Owner
2. Documented justification
3. Time-bound remediation plan
4. Risk assessment completed

### Override Template
```markdown
## Gate Override Request
- **Gate**: [Name of gate]
- **Reason**: [Justification]
- **Risk**: [Associated risks]
- **Mitigation**: [How risks will be managed]
- **Remediation Date**: [When gate will be fixed]
- **Approvers**: [Names and roles]
```

## Continuous Improvement

### Gate Metrics
Track and review monthly:
- Gate failure rates
- Average fix time
- False positive rate
- Override frequency

### Gate Updates
- Review thresholds quarterly
- Update tools as needed
- Add new gates for emerging risks
- Remove obsolete gates

## Gate Configuration

### Environment Variables
```env
SKIP_LINTING=false
SKIP_TESTS=false
COVERAGE_THRESHOLD=80
SECURITY_SCAN_LEVEL=high
```

### CI/CD Integration
```yaml
# Example GitHub Actions
validation:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - run: npm ci
    - run: ./scripts/validate.sh
    - uses: actions/upload-artifact@v2
      if: failure()
      with:
        name: validation-report
        path: validation-results.json
```

## Support & Troubleshooting

### Common Issues
1. **Gate timeouts**: Increase timeout in CI config
2. **Flaky tests**: Add retry logic or fix root cause
3. **False positives**: Update tool configuration
4. **Performance degradation**: Profile and optimize

### Contacts
- DevOps Team: For CI/CD issues
- Security Team: For security gate questions
- QA Team: For testing gate support