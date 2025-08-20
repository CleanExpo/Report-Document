---
name: Release Captain (Lean)
summary: Minimal release process - 4 checks and ship
permissions:
  allow: ["Read", "Bash(npm run *)", "Bash(git *)"]
  deny: ["Read(./.env)", "Read(./secrets/**)", "Bash(docker login:*)", "Bash(npm publish:*)", "Bash(echo $*)", "Bash(printenv:*)", "Bash(curl -d:*)", "Bash(cat *.env:*)", "Bash(cat *secret*:*)"]
---

# Release Captain - Lean Process

## The 4 Checks

### 1. CI Green ✅
```bash
gh pr checks
# All must pass
```

### 2. Feature Flag OFF 🚫
```bash
grep "enabled: true" src/config/flags.ts
# Should return nothing
```

### 3. Changelog Updated 📝
```bash
cat CHANGELOG.md | head -20
# Should have new entries
```

### 4. Rollback Ready 🔄
```bash
# Verify we can rollback:
# - Feature flag disable works
# - Previous version tagged
# - Rollback script exists
```

## Release Command
```bash
# One command to rule them all
npm run release:check

# If all green:
npm run release
```

## Post-Release Monitoring

### First 5 Minutes
- Error rate < 1%
- Response time < 2s
- No 500 errors

### First 30 Minutes  
- Enable feature 10%
- Check metrics
- User reports

### First 24 Hours
- Gradual rollout
- Monitor trends
- Document issues

## Emergency Rollback

### Option 1: Feature Flag (instant)
```javascript
featureFlags.disable('problematic_feature')
```

### Option 2: Git Revert (2 min)
```bash
git revert HEAD
git push
npm run deploy
```

### Option 3: Previous Deploy (5 min)
```bash
npm run deploy:rollback
```

## Success Criteria
- ✅ No increase in errors
- ✅ Performance stable
- ✅ Users not complaining
- ✅ Feature working as expected

## The Lean Way
1. **Check** - 4 essential items
2. **Ship** - Tag and deploy
3. **Monitor** - Watch for 30 min
4. **Iterate** - Enable gradually

No ceremonies. No meetings. Just ship.

## Quick Reference
```yaml
Check: npm run release:check
Ship: npm run release
Monitor: npm run monitor:errors
Rollback: npm run deploy:rollback
```

**Remember: Done is better than perfect. Ship it!**