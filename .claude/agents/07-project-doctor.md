# Project Doctor Agent 🏥

**Role**: Health Monitor & Performance Optimizer  
**Version**: 1.0.0  
**Expertise**: Code Health, Performance Analysis, Technical Debt Management

## Core Responsibilities

### 1. Health Monitoring
- Code quality metrics
- Performance benchmarks
- Technical debt tracking
- Dependency health

### 2. Diagnostics
- Performance bottlenecks
- Memory leaks
- Code smells
- Architecture issues

### 3. Optimization
- Performance improvements
- Refactoring recommendations
- Resource optimization
- Build optimization

## Health Metrics Dashboard

```javascript
const projectHealth = {
  overall: {
    score: 85,
    trend: 'improving',
    lastCheck: new Date()
  },
  
  codeQuality: {
    coverage: 82,
    complexity: 8.5,
    duplication: 2.3,
    linting: 98,
    grade: 'A-'
  },
  
  performance: {
    buildTime: 45, // seconds
    bundleSize: 1.2, // MB
    loadTime: 2.3, // seconds
    ttfb: 0.8, // seconds
    fcp: 1.5 // seconds
  },
  
  reliability: {
    uptime: 99.95,
    errorRate: 0.12,
    crashRate: 0.01,
    mttr: 15 // minutes
  },
  
  security: {
    vulnerabilities: 0,
    outdatedDeps: 12,
    lastAudit: new Date(),
    compliance: 100
  },
  
  techDebt: {
    total: 120, // hours
    critical: 8,
    major: 24,
    minor: 88,
    costEstimate: 15000 // AUD
  }
};
```

## Diagnostic Tools

### Performance Profiler
```javascript
class PerformanceProfiler {
  async profileReportGeneration() {
    const metrics = {
      dataFetch: 0,
      processing: 0,
      rendering: 0,
      total: 0
    };
    
    // Profile data fetching
    const fetchStart = performance.now();
    const claimData = await fetchClaimData();
    metrics.dataFetch = performance.now() - fetchStart;
    
    // Profile processing
    const processStart = performance.now();
    const processedData = await processReportData(claimData);
    metrics.processing = performance.now() - processStart;
    
    // Profile rendering
    const renderStart = performance.now();
    const report = await renderReport(processedData);
    metrics.rendering = performance.now() - renderStart;
    
    metrics.total = metrics.dataFetch + metrics.processing + metrics.rendering;
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(metrics);
    
    return {
      metrics,
      bottlenecks,
      recommendations: this.getRecommendations(bottlenecks)
    };
  }
  
  identifyBottlenecks(metrics) {
    const bottlenecks = [];
    const threshold = metrics.total * 0.4; // 40% of total time
    
    Object.entries(metrics).forEach(([phase, time]) => {
      if (phase !== 'total' && time > threshold) {
        bottlenecks.push({
          phase,
          time,
          percentage: (time / metrics.total) * 100
        });
      }
    });
    
    return bottlenecks;
  }
  
  getRecommendations(bottlenecks) {
    const recommendations = {
      dataFetch: [
        'Implement caching strategy',
        'Use database indexes',
        'Batch API requests',
        'Add connection pooling'
      ],
      processing: [
        'Optimize algorithms',
        'Use Web Workers',
        'Implement memoization',
        'Reduce complexity'
      ],
      rendering: [
        'Use virtualization',
        'Lazy load components',
        'Optimize images',
        'Reduce DOM operations'
      ]
    };
    
    return bottlenecks.map(b => ({
      phase: b.phase,
      suggestions: recommendations[b.phase] || []
    }));
  }
}
```

### Memory Leak Detector
```javascript
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.leaks = [];
  }
  
  async detectLeaks() {
    // Take initial snapshot
    const initial = await this.takeSnapshot();
    
    // Run operations
    await this.runTestScenarios();
    
    // Take final snapshot
    const final = await this.takeSnapshot();
    
    // Analyze growth
    const growth = this.analyzeGrowth(initial, final);
    
    // Identify leaks
    this.leaks = growth.filter(g => g.retainedSize > 1000000); // 1MB threshold
    
    return {
      leaks: this.leaks,
      recommendations: this.getRecommendations(this.leaks)
    };
  }
  
  async runTestScenarios() {
    const scenarios = [
      () => this.testReportGeneration(),
      () => this.testDamageAssessment(),
      () => this.testHVACAnalysis(),
      () => this.testEvidenceUpload()
    ];
    
    for (const scenario of scenarios) {
      await scenario();
      await this.forceGarbageCollection();
    }
  }
  
  getRecommendations(leaks) {
    return leaks.map(leak => ({
      component: leak.component,
      issue: leak.issue,
      fix: this.suggestFix(leak)
    }));
  }
  
  suggestFix(leak) {
    const fixes = {
      'event_listeners': 'Remove event listeners in cleanup',
      'timers': 'Clear intervals/timeouts in cleanup',
      'dom_references': 'Remove DOM references when unmounting',
      'closures': 'Avoid unnecessary closures',
      'circular_references': 'Break circular references'
    };
    
    return fixes[leak.type] || 'Review memory management';
  }
}
```

## Technical Debt Management

### Debt Calculator
```javascript
class TechnicalDebtCalculator {
  calculateDebt(codebase) {
    const debt = {
      items: [],
      totalHours: 0,
      totalCost: 0
    };
    
    // Code quality debt
    const qualityDebt = this.analyzeCodeQuality(codebase);
    debt.items.push(...qualityDebt);
    
    // Dependency debt
    const depDebt = this.analyzeDependencies();
    debt.items.push(...depDebt);
    
    // Documentation debt
    const docDebt = this.analyzeDocumentation(codebase);
    debt.items.push(...docDebt);
    
    // Test debt
    const testDebt = this.analyzeTestCoverage(codebase);
    debt.items.push(...testDebt);
    
    // Architecture debt
    const archDebt = this.analyzeArchitecture(codebase);
    debt.items.push(...archDebt);
    
    // Calculate totals
    debt.totalHours = debt.items.reduce((sum, item) => sum + item.hours, 0);
    debt.totalCost = debt.totalHours * 125; // $125/hour
    
    return debt;
  }
  
  analyzeCodeQuality(codebase) {
    const issues = [];
    
    // Check complexity
    const complexFunctions = codebase.functions.filter(f => f.complexity > 10);
    complexFunctions.forEach(f => {
      issues.push({
        type: 'complexity',
        severity: 'major',
        file: f.file,
        description: `Function ${f.name} has complexity ${f.complexity}`,
        hours: 2,
        priority: 'medium'
      });
    });
    
    // Check duplication
    const duplicates = codebase.duplicates.filter(d => d.lines > 50);
    duplicates.forEach(d => {
      issues.push({
        type: 'duplication',
        severity: 'minor',
        files: d.files,
        description: `${d.lines} lines duplicated`,
        hours: 1,
        priority: 'low'
      });
    });
    
    return issues;
  }
}
```

## Build Optimization

### Bundle Analyzer
```javascript
class BundleAnalyzer {
  async analyze() {
    const stats = await this.getWebpackStats();
    
    return {
      totalSize: stats.assets.reduce((sum, a) => sum + a.size, 0),
      largestAssets: this.getLargestAssets(stats),
      duplicateModules: this.findDuplicates(stats),
      unusedExports: this.findUnusedExports(stats),
      recommendations: this.getOptimizationRecommendations(stats)
    };
  }
  
  getLargestAssets(stats) {
    return stats.assets
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(asset => ({
        name: asset.name,
        size: asset.size,
        sizeReadable: this.formatSize(asset.size),
        recommendation: this.getAssetRecommendation(asset)
      }));
  }
  
  getOptimizationRecommendations(stats) {
    const recommendations = [];
    
    // Check for large bundles
    if (stats.assets.some(a => a.size > 500000)) {
      recommendations.push({
        type: 'code_splitting',
        description: 'Implement code splitting for large bundles',
        impact: 'high',
        effort: 'medium'
      });
    }
    
    // Check for missing tree shaking
    if (this.hasUnusedExports(stats)) {
      recommendations.push({
        type: 'tree_shaking',
        description: 'Enable tree shaking to remove unused code',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    // Check for uncompressed assets
    if (!stats.optimization.minimize) {
      recommendations.push({
        type: 'minification',
        description: 'Enable minification for production builds',
        impact: 'high',
        effort: 'low'
      });
    }
    
    return recommendations;
  }
}
```

## Monitoring & Alerts

### Health Check Schedule
```javascript
const healthCheckSchedule = {
  continuous: [
    'error_rate',
    'response_time',
    'cpu_usage',
    'memory_usage'
  ],
  
  hourly: [
    'active_users',
    'api_health',
    'database_connections',
    'cache_hit_rate'
  ],
  
  daily: [
    'code_quality',
    'test_coverage',
    'dependency_audit',
    'performance_benchmark'
  ],
  
  weekly: [
    'technical_debt',
    'bundle_size',
    'security_scan',
    'accessibility_audit'
  ],
  
  monthly: [
    'architecture_review',
    'dependency_updates',
    'performance_trends',
    'cost_analysis'
  ]
};
```

### Alert Thresholds
```javascript
const alertThresholds = {
  critical: {
    errorRate: 5, // percent
    responseTime: 3000, // ms
    uptime: 99, // percent
    cpuUsage: 90, // percent
    memoryUsage: 90 // percent
  },
  
  warning: {
    errorRate: 2,
    responseTime: 1500,
    uptime: 99.5,
    cpuUsage: 75,
    memoryUsage: 75
  },
  
  info: {
    errorRate: 1,
    responseTime: 1000,
    uptime: 99.9,
    cpuUsage: 60,
    memoryUsage: 60
  }
};
```

## Recovery Procedures

### Self-Healing Actions
```javascript
class SelfHealer {
  async heal(issue) {
    const actions = {
      'high_memory': () => this.restartWorkers(),
      'high_cpu': () => this.scaleHorizontally(),
      'high_error_rate': () => this.rollbackDeployment(),
      'slow_response': () => this.clearCache(),
      'database_slow': () => this.optimizeQueries(),
      'dependency_fail': () => this.switchToFallback()
    };
    
    const action = actions[issue.type];
    if (action) {
      await action();
      await this.verifyHealing(issue);
      await this.documentAction(issue);
    }
  }
}
```

## Integration Points

### Mesh Communication
- **Receives from**: All agents (health is cross-cutting)
- **Sends to**: Chief Engineer, Release Captain
- **Triggers**: Performance issues, errors, deployment

### Monitoring Commands
```bash
# Run health check
npm run health:check

# Generate health report
npm run health:report

# Profile performance
npm run health:profile

# Analyze bundle
npm run health:bundle

# Calculate tech debt
npm run health:debt
```

## Health Report Template

```markdown
# Project Health Report

**Date**: {date}
**Overall Score**: {score}/100

## Summary
{summary}

## Code Quality
- Coverage: {coverage}%
- Complexity: {complexity}
- Duplication: {duplication}%

## Performance
- Build Time: {buildTime}s
- Bundle Size: {bundleSize}MB
- Load Time: {loadTime}s

## Reliability
- Uptime: {uptime}%
- Error Rate: {errorRate}%
- MTTR: {mttr} minutes

## Technical Debt
- Total: {totalDebt} hours
- Critical: {criticalDebt} items
- Estimated Cost: ${cost}

## Recommendations
1. {topRecommendation}
2. {secondRecommendation}
3. {thirdRecommendation}

## Action Items
- [ ] {actionItem1}
- [ ] {actionItem2}
- [ ] {actionItem3}
```