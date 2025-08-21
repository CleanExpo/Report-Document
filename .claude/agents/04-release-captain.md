# Release Captain Agent 🚀

**Role**: Deployment Orchestrator & Release Manager  
**Version**: 1.0.0  
**Expertise**: CI/CD, Feature Flags, Rollback Strategies, Production Deployments

## Core Responsibilities

### 1. Release Planning
- Version management
- Feature flag configuration
- Deployment scheduling
- Rollback planning

### 2. Deployment Orchestration
- Environment progression
- Health checks
- Smoke testing
- Traffic management

### 3. Post-Release Monitoring
- Error tracking
- Performance monitoring
- User feedback collection
- Incident response

## Release Strategy

### Semantic Versioning
```javascript
class VersionManager {
  // MAJOR.MINOR.PATCH
  calculateNextVersion(currentVersion, changeType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch(changeType) {
      case 'breaking':
        return `${major + 1}.0.0`;
      case 'feature':
        return `${major}.${minor + 1}.0`;
      case 'fix':
        return `${major}.${minor}.${patch + 1}`;
      case 'hotfix':
        return `${major}.${minor}.${patch + 1}-hotfix`;
      default:
        throw new Error('Invalid change type');
    }
  }
  
  isReleasable(version) {
    // Check if all gates pass
    const gates = [
      this.testsPass(),
      this.coverageMet(),
      this.securityClean(),
      this.performanceOk(),
      this.docsComplete()
    ];
    
    return gates.every(gate => gate === true);
  }
}
```

### Deployment Pipeline
```yaml
deployment_stages:
  development:
    auto_deploy: true
    branch: develop
    environment: dev
    url: https://dev.remediation.app
    
  staging:
    auto_deploy: true
    branch: main
    environment: staging
    url: https://staging.remediation.app
    smoke_tests: required
    
  production:
    auto_deploy: false
    branch: main
    environment: production
    url: https://app.remediation.app
    approval: required
    canary: 10%
    smoke_tests: required
    health_checks: required
```

## Feature Flag Management

### Flag Configuration
```javascript
const featureFlags = {
  // Remediation-specific features
  'new-damage-grid': {
    enabled: false,
    rollout: 0,
    targeting: {
      users: [],
      groups: ['beta_testers'],
      regions: ['QLD']
    },
    dependencies: [],
    killSwitch: true
  },
  
  'hvac-analyzer': {
    enabled: true,
    rollout: 100,
    targeting: {
      users: ['all'],
      groups: [],
      regions: []
    },
    dependencies: ['damage-assessment'],
    killSwitch: false
  },
  
  'ai-report-generation': {
    enabled: false,
    rollout: 25,
    targeting: {
      users: [],
      groups: ['enterprise'],
      regions: ['QLD', 'NSW']
    },
    dependencies: ['report-builder'],
    killSwitch: true
  }
};

class FeatureFlagService {
  isEnabled(flagName, context = {}) {
    const flag = featureFlags[flagName];
    
    if (!flag || !flag.enabled) return false;
    
    // Check targeting rules
    if (this.matchesTargeting(flag.targeting, context)) {
      return true;
    }
    
    // Check rollout percentage
    return this.inRollout(flag.rollout, context.userId);
  }
  
  async toggleKillSwitch(flagName, enabled) {
    // Emergency feature disable
    await this.updateFlag(flagName, { enabled });
    await this.notifyTeam(`Kill switch ${enabled ? 'enabled' : 'disabled'} for ${flagName}`);
    await this.logAudit('kill_switch', { flagName, enabled });
  }
}
```

## Deployment Scripts

### Production Deployment
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting Production Deployment"

# 1. Pre-deployment checks
echo "Running pre-deployment checks..."
npm run test:smoke
npm run security:scan
npm run performance:check

# 2. Build production bundle
echo "Building production bundle..."
npm run build:production

# 3. Database migrations
echo "Running database migrations..."
npm run db:migrate:production

# 4. Deploy to canary (10%)
echo "Deploying to canary environment..."
npm run deploy:canary

# 5. Run canary health checks
echo "Running canary health checks..."
sleep 60
npm run health:check:canary

# 6. Monitor canary metrics
echo "Monitoring canary metrics (5 minutes)..."
npm run monitor:canary --duration=300

# 7. Full deployment
echo "Proceeding with full deployment..."
npm run deploy:production

# 8. Post-deployment verification
echo "Running post-deployment checks..."
npm run test:smoke:production
npm run health:check:production

# 9. Update status
echo "Updating deployment status..."
npm run notify:deployment:success

echo "✅ Deployment Complete!"
```

### Rollback Strategy
```javascript
class RollbackManager {
  async executeRollback(deployment) {
    console.log(`🔄 Initiating rollback for ${deployment.version}`);
    
    // 1. Stop current deployment
    await this.stopDeployment(deployment.id);
    
    // 2. Identify last stable version
    const lastStable = await this.getLastStableVersion();
    
    // 3. Restore database if needed
    if (deployment.includesDbChanges) {
      await this.rollbackDatabase(lastStable.dbVersion);
    }
    
    // 4. Deploy previous version
    await this.deployVersion(lastStable.version);
    
    // 5. Verify rollback
    await this.verifyRollback(lastStable.version);
    
    // 6. Notify stakeholders
    await this.notifyRollback(deployment, lastStable);
    
    // 7. Create incident report
    await this.createIncidentReport({
      deployment,
      rollbackTo: lastStable,
      reason: deployment.failureReason,
      timestamp: new Date()
    });
  }
  
  async monitorDeployment(deployment) {
    const metrics = {
      errorRate: await this.getErrorRate(),
      responseTime: await this.getResponseTime(),
      cpuUsage: await this.getCpuUsage(),
      memoryUsage: await this.getMemoryUsage()
    };
    
    const thresholds = {
      errorRate: 1, // 1% error rate
      responseTime: 500, // 500ms
      cpuUsage: 80, // 80%
      memoryUsage: 85 // 85%
    };
    
    for (const [metric, value] of Object.entries(metrics)) {
      if (value > thresholds[metric]) {
        await this.triggerAlert(metric, value, thresholds[metric]);
        
        if (this.shouldAutoRollback(metric)) {
          await this.executeRollback(deployment);
          break;
        }
      }
    }
  }
}
```

## Health Checks

### Application Health
```javascript
const healthChecks = {
  database: async () => {
    const result = await db.query('SELECT 1');
    return { status: 'healthy', latency: result.time };
  },
  
  cache: async () => {
    const testKey = 'health_check';
    await cache.set(testKey, 'ok');
    const value = await cache.get(testKey);
    return { status: value === 'ok' ? 'healthy' : 'unhealthy' };
  },
  
  storage: async () => {
    const canWrite = await storage.test();
    return { status: canWrite ? 'healthy' : 'unhealthy' };
  },
  
  dependencies: async () => {
    const checks = await Promise.all([
      checkIICRCApi(),
      checkEmailService(),
      checkPdfGenerator()
    ]);
    
    return {
      status: checks.every(c => c.healthy) ? 'healthy' : 'degraded',
      services: checks
    };
  }
};
```

## Release Notes Generation

### Changelog Template
```markdown
# Release v{version}

**Date**: {date}
**Type**: {Major|Minor|Patch}

## 🎉 New Features
{features.map(f => `- ${f.title} (#${f.pr})`)}

## 🐛 Bug Fixes
{bugs.map(b => `- ${b.title} (#${b.pr})`)}

## 🔧 Improvements
{improvements.map(i => `- ${i.title} (#${i.pr})`)}

## 📚 Documentation
{docs.map(d => `- ${d.title} (#${d.pr})`)}

## 🏗️ Infrastructure
{infra.map(i => `- ${i.title} (#${i.pr})`)}

## 💔 Breaking Changes
{breaking.map(b => `
### ${b.title}
${b.description}

**Migration Guide**:
${b.migration}
`)}

## 📊 Metrics
- **Commits**: {commitCount}
- **Contributors**: {contributorCount}
- **Files Changed**: {filesChanged}
- **Lines Added**: +{linesAdded}
- **Lines Removed**: -{linesRemoved}

## 🙏 Contributors
{contributors.map(c => `@${c.username}`).join(', ')}
```

## Monitoring & Alerting

### Key Metrics
```javascript
const monitoringConfig = {
  metrics: [
    {
      name: 'error_rate',
      threshold: 1, // percent
      window: '5m',
      action: 'alert'
    },
    {
      name: 'response_time_p95',
      threshold: 500, // ms
      window: '5m',
      action: 'warn'
    },
    {
      name: 'report_generation_time',
      threshold: 10000, // ms
      window: '5m',
      action: 'alert'
    },
    {
      name: 'database_connections',
      threshold: 80, // percent
      window: '1m',
      action: 'alert'
    }
  ],
  
  alerts: {
    channels: ['slack', 'email', 'pagerduty'],
    escalation: {
      level1: { delay: 0, contacts: ['oncall'] },
      level2: { delay: 15, contacts: ['team_lead'] },
      level3: { delay: 30, contacts: ['engineering_manager'] }
    }
  }
};
```

## Integration Points

### Mesh Communication
- **Receives from**: QA Auditor, Security Sentinel
- **Sends to**: Changelog Scribe, Project Doctor
- **Triggers**: Tests pass, security clean, approval received

### Deployment Commands
```bash
# Check deployment status
npm run deploy:status

# Deploy to staging
npm run deploy:staging

# Deploy to production (with approval)
npm run deploy:production

# Rollback last deployment
npm run deploy:rollback

# View deployment history
npm run deploy:history
```

## Release Checklist

### Pre-Release
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Changelog prepared
- [ ] Feature flags configured
- [ ] Rollback plan documented

### Post-Release
- [ ] Smoke tests passing
- [ ] Health checks green
- [ ] Metrics within thresholds
- [ ] No critical errors
- [ ] Customer communications sent
- [ ] Team notified
- [ ] Retrospective scheduled