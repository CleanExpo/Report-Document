# Rollback Plan

## Overview
This document outlines procedures for rolling back deployments in case of critical issues.

## Rollback Triggers

### Automatic Rollback
System automatically initiates rollback when:
- Error rate > 10% for 5 minutes
- Response time > 5s (p95) for 5 minutes
- Health check failures > 3 consecutive
- Memory usage > 95%
- Database connection pool exhausted

### Manual Rollback
Team initiates rollback when:
- Critical business functionality broken
- Data integrity issues detected
- Security vulnerability discovered
- Major UX regression identified
- Payment processing failures

## Rollback Procedures

### Level 1: Feature Flag Rollback (< 1 minute)
```bash
# Disable problematic feature
featureFlags.disable('problematic_feature')

# Verify feature is disabled
npm run feature:status -- --flag=problematic_feature

# Clear cache if needed
npm run cache:clear
```

### Level 2: Configuration Rollback (< 5 minutes)
```bash
# Revert configuration changes
git checkout HEAD~1 -- config/

# Restart application
npm run restart

# Verify configuration
npm run config:validate
```

### Level 3: Code Rollback (< 15 minutes)
```bash
# Identify last stable version
git tag -l | grep stable

# Checkout stable version
git checkout v1.2.3-stable

# Build and deploy
npm run build
npm run deploy:production

# Verify deployment
npm run health:check
```

### Level 4: Database Rollback (< 30 minutes)
```bash
# Stop application
npm run stop

# Rollback database migrations
npm run db:rollback -- --to=20240101120000

# Restore from backup if needed
npm run db:restore -- --backup=prod-2024-01-15

# Restart application
npm run start

# Verify data integrity
npm run db:validate
```

### Level 5: Full System Rollback (< 1 hour)
```bash
# Initiate disaster recovery
./scripts/disaster-recovery.sh

# Restore from full backup
- Application code
- Database
- Configuration
- User uploads

# Verify system integrity
npm run system:validate
```

## Rollback Decision Matrix

| Severity | Impact | Time to Fix | Rollback Level |
|----------|--------|-------------|----------------|
| Critical | All users | > 1 hour | Level 3-5 |
| High | > 50% users | > 30 min | Level 2-3 |
| Medium | < 50% users | > 15 min | Level 1-2 |
| Low | < 10% users | < 15 min | Fix forward |

## Communication During Rollback

### Internal Communication
```markdown
ROLLBACK INITIATED

Time: [Timestamp]
Reason: [Brief description]
Impact: [User impact]
Level: [1-5]
ETA: [Estimated completion]
Lead: [Person managing rollback]
```

### Customer Communication
```markdown
We are currently experiencing technical difficulties with our service. 
Our team is working on resolving the issue. 
We expect normal service to resume within [timeframe].
We apologize for any inconvenience.
```

## Post-Rollback Actions

### Immediate (< 1 hour)
1. Verify system stability
2. Document rollback reason
3. Notify stakeholders
4. Monitor metrics closely
5. Gather initial data

### Short-term (< 24 hours)
1. Root cause analysis
2. Create incident report
3. Update rollback procedures
4. Plan fix implementation
5. Schedule retrospective

### Long-term (< 1 week)
1. Implement permanent fix
2. Add regression tests
3. Update monitoring
4. Improve deployment process
5. Document lessons learned

## Rollback Testing

### Monthly Drills
- Test feature flag rollback
- Test configuration rollback
- Verify backup restoration
- Practice communication flow

### Quarterly Exercises
- Full rollback simulation
- Disaster recovery test
- Cross-team coordination
- External communication

## Rollback Metrics

Track for each rollback:
- Time to detection: _____ minutes
- Time to decision: _____ minutes
- Time to rollback: _____ minutes
- Total downtime: _____ minutes
- Users affected: _____ 
- Revenue impact: $_____

## Tools & Scripts

### Quick Commands
```bash
# Emergency rollback
npm run rollback:emergency

# Status check
npm run rollback:status

# Validate rollback
npm run rollback:validate

# Generate report
npm run rollback:report
```

### Monitoring URLs
- Health Check: https://api.example.com/health
- Metrics Dashboard: https://metrics.example.com
- Error Tracking: https://errors.example.com
- Status Page: https://status.example.com

## Rollback Checklist

### Pre-Rollback
- [ ] Identify issue severity
- [ ] Determine rollback level
- [ ] Notify team members
- [ ] Prepare rollback commands
- [ ] Document current state

### During Rollback
- [ ] Execute rollback procedure
- [ ] Monitor progress
- [ ] Communicate status
- [ ] Verify each step
- [ ] Document actions taken

### Post-Rollback
- [ ] Confirm system stable
- [ ] Verify functionality restored
- [ ] Update status page
- [ ] Send notifications
- [ ] Begin incident review

## Emergency Contacts

| Role | Primary | Backup | Phone |
|------|---------|--------|-------|
| Incident Commander | | | |
| DevOps Lead | | | |
| Database Admin | | | |
| Security Officer | | | |
| Communications | | | |

## Lessons Learned Repository

Document each rollback:
```markdown
## Incident: [Date] - [Title]

### Summary
What happened and why rollback was needed

### Timeline
- Detection: 
- Decision:
- Started:
- Completed:

### Impact
- Users affected:
- Duration:
- Data loss:
- Revenue impact:

### Root Cause
Technical explanation

### Prevention
How to prevent recurrence

### Improvements
Process improvements identified
```

## Recovery Time Objectives

| Service | RTO | RPO | Priority |
|---------|-----|-----|----------|
| Core API | 5 min | 1 min | Critical |
| User Auth | 5 min | 1 min | Critical |
| Database | 15 min | 5 min | Critical |
| File Storage | 30 min | 15 min | High |
| Analytics | 2 hours | 1 hour | Medium |