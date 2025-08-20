# Release Checklist

## Pre-Release Requirements
- [ ] CI green on PR (all gates)
- [ ] Feature flag default OFF, enable post-merge
- [ ] Changelog entry created
- [ ] Rollback plan verified

---

## Quick Release Process

### 1. Verify PR Status
```bash
# Check CI status
gh pr checks

# Verify all gates
npm run validate:full
```

### 2. Feature Flag Check
```typescript
// Verify in config/flags.ts
featureFlags.register({
  name: 'new_feature',
  enabled: false,  // MUST be false
})
```

### 3. Update Changelog
```markdown
# CHANGELOG.md

## [Unreleased]
### Added
- Feature X (behind flag: new_feature)
### Fixed
- Bug Y resolved
```

### 4. Verify Rollback Plan
```bash
# Quick rollback options:
1. Feature flag disable: 
   featureFlags.disable('new_feature')

2. Git revert:
   git revert HEAD
   git push

3. Deploy previous:
   npm run deploy:rollback
```

## Release Command
```bash
# When all checks complete
npm run release

# Or manually
git tag -a v$(node -p "require('./package.json').version") -m "Release"
git push origin main --tags
```

## Post-Release Actions
- [ ] Monitor error rates (first 30 min)
- [ ] Enable feature flag gradually (10% → 50% → 100%)
- [ ] Update status page
- [ ] Notify team

## Emergency Contacts
- On-call: Check #ops-oncall
- Release Captain: @release-captain
- Escalation: See runbook

## Rollback Triggers
Immediate rollback if:
- Error rate > 5%
- Response time > 2s
- Memory > 90%
- Critical feature broken

---

## One-Line Status Check
```bash
# Run before release
./scripts/release-ready.sh

# Output:
✅ CI: Passing
✅ Flag: OFF
✅ Changelog: Updated
✅ Rollback: Ready
READY TO RELEASE
```