# Release Checklist

> **Quick Start**: See [Lean Release Checklist](./release-checklist-lean.md) for the streamlined version.

## Pre-Release (T-2 days)

### Code Readiness
- [ ] All features complete and tested
- [ ] Code review completed
- [ ] No outstanding merge conflicts
- [ ] Feature branches merged to main
- [ ] Version number updated in package.json

### Testing
- [ ] Unit tests passing (coverage > 80%)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests completed
- [ ] Security scan completed
- [ ] Accessibility audit passed

### Documentation
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Changelog updated
- [ ] Migration guide prepared (if needed)
- [ ] Release notes drafted

## Release Day (T-0)

### Morning Checks (9:00 AM)
- [ ] Final test suite run
- [ ] No critical bugs in tracker
- [ ] Team availability confirmed
- [ ] Rollback plan reviewed
- [ ] Communication channels open

### Pre-Deployment (10:00 AM)
- [ ] Create release branch
- [ ] Tag release version
- [ ] Build production artifacts
- [ ] Verify build success
- [ ] Backup current production

### Staging Deployment (11:00 AM)
- [ ] Deploy to staging environment
- [ ] Smoke tests on staging
- [ ] Performance validation
- [ ] Security headers check
- [ ] SSL certificate valid

### Production Deployment (2:00 PM)

#### Phase 1: Initial Rollout (10% traffic)
- [ ] Enable feature flags
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify logging working

#### Phase 2: Expanded Rollout (50% traffic)
- [ ] Increase traffic allocation
- [ ] Continue monitoring
- [ ] Check user feedback
- [ ] Verify database performance
- [ ] API response times normal

#### Phase 3: Full Rollout (100% traffic)
- [ ] Complete traffic migration
- [ ] All health checks passing
- [ ] No anomalies detected
- [ ] Cache invalidation complete
- [ ] CDN propagation confirmed

## Post-Release (T+1 hour)

### Immediate Verification
- [ ] Application accessible
- [ ] Core features working
- [ ] Payment processing functional
- [ ] Email notifications sending
- [ ] Third-party integrations active

### Monitoring (First 24 hours)
- [ ] Error rate < 0.1%
- [ ] Response time < 500ms (p95)
- [ ] CPU usage < 70%
- [ ] Memory usage stable
- [ ] No security alerts

### Communication
- [ ] Release notes published
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Social media announcement
- [ ] Customer email sent (if applicable)

## Rollback Criteria

Initiate rollback if:
- [ ] Error rate > 5%
- [ ] Response time > 2s (p95)
- [ ] Critical functionality broken
- [ ] Data corruption detected
- [ ] Security breach identified

## Team Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Release Manager | | | |
| Tech Lead | | | |
| DevOps Engineer | | | |
| QA Lead | | | |
| Product Owner | | | |
| Support Lead | | | |

## Communication Templates

### Success Announcement
```
Subject: [Release] Version X.Y.Z Successfully Deployed

Team,

Version X.Y.Z has been successfully deployed to production.

Key Features:
- Feature 1
- Feature 2
- Bug fixes

All systems are operating normally.

Thank you for your support!
```

### Issue Notification
```
Subject: [URGENT] Production Issue - Version X.Y.Z

Team,

We are experiencing issues with the latest release:

Issue: [Description]
Impact: [User impact]
Action: [Current mitigation]

Please stand by for updates.
```

## Tools & Commands

### Deployment Commands
```bash
# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback
npm run deploy:rollback
```

### Monitoring Commands
```bash
# Check application health
curl https://api.example.com/health

# View error logs
npm run logs:errors

# Monitor metrics
npm run monitor:dashboard
```

### Feature Flag Commands
```bash
# Enable feature
npm run feature:enable -- --flag=new_feature

# Disable feature
npm run feature:disable -- --flag=new_feature

# Check status
npm run feature:status
```

## Lessons Learned Template

After each release, document:

### What Went Well
- 

### What Could Be Improved
- 

### Action Items
- 

### Metrics
- Deployment duration:
- Downtime (if any):
- Issues encountered:
- Rollback required: Yes/No

## Sign-offs

- [ ] Release Manager: _________________ Date: _______
- [ ] Tech Lead: ______________________ Date: _______
- [ ] QA Lead: _______________________ Date: _______
- [ ] Product Owner: __________________ Date: _______