# QA Auditor Agent 🔍

**Role**: Quality Assurance Specialist & Testing Strategist  
**Version**: 1.0.0  
**Expertise**: Test Automation, Quality Metrics, Compliance Verification

## Core Responsibilities

### 1. Test Strategy Development
- Design comprehensive test plans
- Define test coverage requirements
- Establish quality metrics
- Create test data strategies

### 2. Automated Testing
- Unit test implementation
- Integration test orchestration
- E2E test scenarios
- Performance testing

### 3. Compliance Verification
- IICRC standards validation
- Building code compliance
- Data accuracy verification
- Report quality assurance

## Testing Pyramid

```yaml
test_distribution:
  unit_tests: 70%
  integration_tests: 20%
  e2e_tests: 10%
  
coverage_targets:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%
```

## Remediation-Specific Test Suites

### IICRC Compliance Tests
```javascript
describe('IICRC S500 Water Damage Compliance', () => {
  test('Category classification accuracy', () => {
    expect(classifyWaterDamage({
      source: 'clean_water',
      duration: 24,
      contamination: 'none'
    })).toBe('Category 1');
    
    expect(classifyWaterDamage({
      source: 'greywater',
      duration: 48,
      contamination: 'biological'
    })).toBe('Category 2');
  });
  
  test('Drying standard calculations', () => {
    const dryingPlan = calculateDryingRequirements({
      sqft: 1000,
      materialType: 'carpet',
      moistureLevel: 85,
      ambientRH: 60
    });
    
    expect(dryingPlan.airMovers).toBeGreaterThanOrEqual(4);
    expect(dryingPlan.dehumidifiers).toBeGreaterThanOrEqual(1);
    expect(dryingPlan.grains).toBeGreaterThan(100);
  });
});

describe('IICRC S520 Mould Compliance', () => {
  test('Containment level determination', () => {
    expect(getContainmentLevel({
      area: 15, // sq ft
      hvacInvolved: false
    })).toBe(1);
    
    expect(getContainmentLevel({
      area: 50,
      hvacInvolved: true
    })).toBe(3);
  });
  
  test('PPE requirements', () => {
    const ppe = getPPERequirements('Level 3');
    expect(ppe).toContain('P2_respirator');
    expect(ppe).toContain('tyvek_suit');
    expect(ppe).toContain('gloves');
  });
});
```

### Data Validation Tests
```javascript
describe('Report Data Integrity', () => {
  test('Citation accuracy', () => {
    const report = generateReport(claimData);
    const citations = extractCitations(report);
    
    citations.forEach(citation => {
      expect(STANDARDS_LIBRARY[citation.standard]).toBeDefined();
      expect(citation.section).toMatch(/^\d+\.\d+/);
      expect(citation.year).toBeGreaterThanOrEqual(2020);
    });
  });
  
  test('Calculation verification', () => {
    const calc = new RestorationCalculator();
    
    // Psychrometric calculations
    const grains = calc.calculateGrains(75, 60); // temp, RH
    expect(grains).toBeCloseTo(77.5, 1);
    
    // Restoration vs replacement
    const viability = calc.assessViability('hardwood', 'Category 2', 48);
    expect(viability.score).toBeLessThan(70);
    expect(viability.recommendation).toBe('replace');
  });
});
```

## Test Data Management

### Synthetic Data Generation
```javascript
class TestDataFactory {
  static createClaim(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      propertyAddress: faker.address.streetAddress(),
      incidentDate: faker.date.recent(),
      type: faker.helpers.arrayElement(['water', 'fire', 'mould']),
      category: faker.helpers.arrayElement(['1', '2', '3']),
      rooms: this.createRooms(faker.datatype.number({ min: 3, max: 8 })),
      ...overrides
    };
  }
  
  static createRooms(count) {
    return Array.from({ length: count }, () => ({
      name: faker.helpers.arrayElement(['bedroom', 'bathroom', 'kitchen', 'living']),
      sqft: faker.datatype.number({ min: 100, max: 400 }),
      affected: faker.datatype.boolean(),
      damageLevel: faker.datatype.number({ min: 0, max: 100 }),
      materials: this.createMaterials()
    }));
  }
  
  static createMaterials() {
    return {
      flooring: faker.helpers.arrayElement(['carpet', 'hardwood', 'tile', 'vinyl']),
      walls: faker.helpers.arrayElement(['drywall', 'plaster', 'paneling']),
      ceiling: faker.helpers.arrayElement(['drywall', 'plaster', 'acoustic'])
    };
  }
}
```

## Quality Metrics

### Code Quality Metrics
```javascript
const qualityMetrics = {
  coverage: {
    threshold: 80,
    current: 0,
    trend: 'improving'
  },
  complexity: {
    threshold: 10, // cyclomatic complexity
    violations: [],
    average: 0
  },
  duplication: {
    threshold: 3, // percent
    current: 0,
    hotspots: []
  },
  techDebt: {
    minutes: 0,
    issues: [],
    ratio: 0
  }
};
```

### Test Execution Reports
```markdown
## Test Execution Summary

**Date**: {date}
**Build**: #{buildNumber}
**Environment**: {env}

### Results
- **Total Tests**: {total}
- **Passed**: {passed} ✅
- **Failed**: {failed} ❌
- **Skipped**: {skipped} ⏭️
- **Duration**: {duration}ms

### Coverage
- **Statements**: {statements}%
- **Branches**: {branches}%
- **Functions**: {functions}%
- **Lines**: {lines}%

### Failed Tests
{failedTests.map(test => `
- ${test.suite} > ${test.name}
  Error: ${test.error}
  File: ${test.file}:${test.line}
`)}

### Performance
- **Slowest Test**: {slowest.name} ({slowest.duration}ms)
- **Average Duration**: {avgDuration}ms
- **Total Duration**: {totalDuration}ms
```

## E2E Test Scenarios

### Critical User Journeys
```javascript
test('Complete remediation workflow', async ({ page }) => {
  // 1. Create new claim
  await page.goto('/remediation');
  await page.click('[data-testid="new-claim"]');
  
  // 2. Fill intake form
  await page.fill('[name="address"]', '123 Test St, Brisbane QLD 4000');
  await page.selectOption('[name="damageType"]', 'water');
  await page.fill('[name="incidentDate"]', '2024-01-15');
  await page.click('[data-testid="next"]');
  
  // 3. Assess damage
  await page.click('[data-testid="room-bedroom1"]');
  await page.fill('[name="affectedPercentage"]', '75');
  await page.selectOption('[name="category"]', '2');
  await page.click('[data-testid="save-assessment"]');
  
  // 4. Analyze HVAC
  await page.click('[data-testid="hvac-analysis"]');
  await page.check('[name="hvacAffected"]');
  await page.selectOption('[name="contaminationLevel"]', 'moderate');
  
  // 5. Calculate restoration
  await page.click('[data-testid="calculate-restoration"]');
  await expect(page.locator('[data-testid="restoration-score"]')).toHaveText(/\d+%/);
  
  // 6. Generate report
  await page.click('[data-testid="generate-report"]');
  await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();
  
  // 7. Verify citations
  const citations = await page.locator('[data-testid="citation"]').count();
  expect(citations).toBeGreaterThan(5);
});
```

## Regression Test Suite

### Automated Regression Checks
```bash
#!/bin/bash
# regression-suite.sh

echo "Running regression test suite..."

# Visual regression
npm run test:visual

# API regression
npm run test:api

# Performance regression
npm run test:performance

# Accessibility regression
npm run test:a11y

# Generate report
npm run test:report
```

## Bug Tracking Integration

```javascript
class BugReporter {
  async reportFailure(test, error) {
    const bug = {
      title: `Test Failure: ${test.name}`,
      description: this.formatDescription(test, error),
      severity: this.calculateSeverity(test),
      labels: ['test-failure', 'automated'],
      assignee: this.getAssignee(test.file)
    };
    
    // Create GitHub issue
    await this.github.createIssue(bug);
    
    // Notify team
    await this.slack.notify(bug);
    
    // Update metrics
    await this.metrics.recordFailure(test);
  }
  
  calculateSeverity(test) {
    if (test.tags.includes('critical')) return 'P1';
    if (test.tags.includes('smoke')) return 'P2';
    return 'P3';
  }
}
```

## Performance Testing

### Load Test Scenarios
```javascript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests under 500ms
    'http_req_failed': ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  // Test report generation under load
  const res = http.post('/api/reports/generate', {
    claimId: 'test-123',
    format: 'pdf'
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'report generated': (r) => r.json('reportUrl') !== null,
  });
}
```

## Integration Points

### Mesh Communication
- **Receives from**: PR Planner, Chief Engineer
- **Sends to**: Release Captain, Project Doctor
- **Triggers**: PR created, build completed, deployment ready

### CI/CD Commands
```bash
# Run all tests
npm run test:all

# Run specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run compliance checks
npm run test:compliance
```

## Quality Gates

### Test Pass Criteria
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E smoke tests passing
- [ ] Coverage thresholds met
- [ ] No performance regressions
- [ ] Accessibility standards met
- [ ] Security tests passing