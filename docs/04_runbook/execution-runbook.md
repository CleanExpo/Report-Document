# Execution Runbook

## Quick Start
For Claude/AI execution, see [Claude Execution Runbook](./execution-runbook-claude.md) - streamlined 6-step process.

## Local Development Quick Commands

### Start Development
```bash
npm run dev:all     # Run both web and AI service
npm run dev         # Run just Next.js web app
npm run dev:ai      # Run just AI orchestrator
```

### Testing
```bash
npm run test:unit   # Run unit tests
npm run typecheck   # TypeScript validation
npm run lint        # Code quality checks
```

## Overview
This runbook provides step-by-step instructions for implementing features according to the project operating rules.

## Pre-Implementation Checklist
- [ ] Review `initial.md` for requirements
- [ ] PRP document updated and approved
- [ ] Development environment setup
- [ ] Feature flag configured
- [ ] Backup strategy in place

## Implementation Workflow

### Step 1: Plan Mode
**Always start in plan mode before making changes**

1. Analyze requirements from PRP
2. Propose implementation approach
3. Create diffs showing expected changes
4. Get approval before proceeding

Example plan structure:
```
## Proposed Changes
1. File: src/feature.js
   - Add new function for X
   - Modify existing function Y
   
2. File: tests/feature.test.js
   - Add unit tests for new functionality
   
3. File: docs/api.md
   - Update API documentation
```

### Step 2: Vertical Slice Implementation

#### 2.1 Identify Minimal Slice
- Choose smallest functional unit
- Must provide end-to-end value
- Should be independently testable

#### 2.2 Implementation Order
1. **Core Logic** (`/src`)
   ```bash
   # Create backup before changes
   cp src/module.js src/module.js.bak
   ```
2. **Unit Tests** (`/tests`)
3. **Integration Points**
4. **Documentation Updates**

#### 2.3 Code Structure
```
src/
├── features/
│   └── new-feature/
│       ├── index.js
│       ├── handlers.js
│       └── validators.js
tests/
├── unit/
│   └── new-feature.test.js
└── integration/
    └── new-feature.integration.test.js
```

### Step 3: Feature Flag Integration

```javascript
// Example feature flag usage
if (featureFlags.isEnabled('new_feature')) {
    // New implementation
    return newFeatureHandler(request);
} else {
    // Existing implementation
    return legacyHandler(request);
}
```

### Step 4: Testing Protocol

#### 4.1 Local Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run linting
npm run lint

# Type checking
npm run typecheck
```

#### 4.2 Test Coverage
- Ensure > 80% code coverage
- Cover happy paths
- Test edge cases
- Verify error handling

### Step 5: Validation Gates
Run all validation gates before proceeding:
```bash
# Execute validation script
./scripts/validate.sh

# Check results
cat validation-results.json
```

### Step 6: Documentation Updates
- Update inline code documentation
- Update API documentation
- Update README if needed
- Add migration guide if breaking changes

### Step 7: Code Review Preparation
1. Create clear commit messages
2. Prepare PR description with:
   - Summary of changes
   - Testing performed
   - Screenshots/demos if applicable
   - Breaking changes noted

### Step 8: Deployment Readiness

#### 8.1 Pre-deployment Checks
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Feature flag configured
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

#### 8.2 Deployment Steps
1. Deploy with feature flag OFF
2. Verify deployment successful
3. Enable for internal testing
4. Gradual rollout (10% → 50% → 100%)
5. Monitor metrics and errors

## Rollback Procedures

### Immediate Rollback
```bash
# Disable feature flag
featureFlags.disable('new_feature')

# If critical, revert deployment
git revert <commit-hash>
git push origin main
```

### Data Rollback
- Document any data migrations
- Provide rollback scripts
- Test rollback procedure

## Monitoring & Alerts

### Key Metrics to Track
- Error rates
- Response times
- Resource utilization
- Feature adoption

### Alert Thresholds
- Error rate > 1% - Warning
- Error rate > 5% - Critical
- Response time > 2s - Warning
- CPU > 80% - Warning

## Common Issues & Solutions

### Issue: Tests Failing
1. Check test environment setup
2. Verify mock data is correct
3. Review recent changes
4. Run tests in isolation

### Issue: Performance Degradation
1. Check for N+1 queries
2. Review caching strategy
3. Profile code execution
4. Check resource limits

### Issue: Feature Flag Not Working
1. Verify flag configuration
2. Check flag evaluation logic
3. Clear cache if needed
4. Review flag dependencies

## Emergency Contacts
- Technical Lead: [Contact]
- DevOps Team: [Contact]
- Product Owner: [Contact]

## Appendix

### Useful Commands
```bash
# Check system status
npm run status

# Run diagnostics
npm run diagnostics

# Generate reports
npm run report:generate

# Clean build artifacts
npm run clean
```

### Environment Variables
```env
NODE_ENV=development|staging|production
FEATURE_FLAGS_ENABLED=true
LOG_LEVEL=debug|info|warn|error
```

### References
- [PRP Document](../02_prp/prp.md)
- [Validation Gates](../05_validation/validation-gates.md)
- [Initial Requirements](../01_initial/initial.md)