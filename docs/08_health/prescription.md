# Treatment Plan & Prescriptions

**Generated**: 2025-01-20T16:30:00Z  
**Current Health**: 87/100 🟡  
**Target Health**: 95/100 🟢  

---

## 🚨 Priority 1: Reliability - Add Error Boundaries

### The Problem
Your React application doesn't have error boundaries, meaning any component error will crash the entire app.

### Why It Matters
- Users see white screen instead of graceful error message
- Can't recover from component failures
- No error tracking for debugging

### The Solution

#### Step 1: Create Error Boundary Component
Create `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### Step 2: Wrap Your App
Update `src/app/layout.tsx`:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Expected Impact**: +5 points to Reliability score

---

## 🎨 Priority 2: Accessibility - Fix Color Contrast

### The Problem
Text color `#767676` on white background fails WCAG AA standards (contrast ratio: 4.54:1, needs 4.5:1).

### Why It Matters
- Users with visual impairments can't read the text
- Fails accessibility compliance
- Poor user experience in bright conditions

### The Solution

#### Update Colors in Your CSS
Change from:
```css
.text-muted {
  color: #767676; /* Contrast: 4.54:1 - FAILS */
}
```

To:
```css
.text-muted {
  color: #595959; /* Contrast: 7.0:1 - PASSES AA & AAA */
}
```

#### Or Use CSS Variables for Consistency
```css
:root {
  --color-text-primary: #000000;
  --color-text-secondary: #595959; /* AA compliant */
  --color-text-disabled: #949494; /* AA compliant for large text */
}
```

**Expected Impact**: +3 points to Accessibility score

---

## 🔧 Priority 3: Maintainability - Reduce Complexity

### The Problem
Two functions exceed complexity threshold (cyclomatic complexity > 10).

### Why It Matters
- Hard to understand and maintain
- Difficult to test all code paths
- Higher bug probability

### The Solution

#### Before (Complex):
```typescript
export async function scoreMaintainability(): Promise<{ score: number; issues: HealthIssue[] }> {
  const issues: HealthIssue[] = [];
  let score = 100;
  
  // 50+ lines of nested conditions...
  
  return { score: Math.max(0, score), issues };
}
```

#### After (Refactored):
```typescript
// Split into focused functions
async function checkTestCoverageScore(): Promise<ScoreResult> {
  const coverage = await getTestCoverage();
  if (coverage >= 80) return { points: 30, issues: [] };
  
  const penalty = Math.min(30, (80 - coverage) * 0.5);
  return {
    points: 30 - penalty,
    issues: [{
      severity: coverage < 50 ? 'major' : 'minor',
      category: 'maintainability',
      description: `Test coverage is ${coverage}% (target: 80%)`,
      remediation: 'Add unit tests for uncovered code paths',
      effort: 'medium',
    }]
  };
}

async function checkComplexityScore(): Promise<ScoreResult> {
  // Similar focused implementation
}

export async function scoreMaintainability(): Promise<{ score: number; issues: HealthIssue[] }> {
  const results = await Promise.all([
    checkTestCoverageScore(),
    checkComplexityScore(),
    checkDocumentationScore(),
  ]);
  
  const score = results.reduce((sum, r) => sum + r.points, 0);
  const issues = results.flatMap(r => r.issues);
  
  return { score: Math.max(0, score), issues };
}
```

**Expected Impact**: +2 points to Maintainability score

---

## 📋 Quick Win Checklist

Complete these in order for maximum impact:

- [ ] **5 min**: Fix color contrast in CSS
- [ ] **15 min**: Add ErrorBoundary component  
- [ ] **10 min**: Wrap app with ErrorBoundary
- [ ] **30 min**: Refactor complex functions
- [ ] **5 min**: Add missing ARIA labels
- [ ] **10 min**: Update semantic HTML structure

**Total Time**: ~75 minutes  
**Expected Score Improvement**: +10 points (87 → 97/100)

---

## 🔄 Continuous Improvement Plan

### Week 1 (This Week)
- Implement all Priority 1 & 2 fixes
- Set up automated health checks in CI

### Week 2
- Address all minor issues
- Add performance monitoring
- Implement accessibility testing

### Week 3
- Optimize bundle size further
- Add E2E tests for critical paths
- Document architectural decisions

### Month 2
- Achieve 90% test coverage
- Implement full observability
- Complete accessibility audit

---

## 🛠️ Automation Opportunities

### Add to CI Pipeline
```yaml
- name: Health Check
  run: |
    npm run health:check
    if [ $? -ne 0 ]; then
      echo "Health check failed"
      exit 1
    fi
```

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run health:quick-check"
    }
  }
}
```

### Daily Health Report
```typescript
// Schedule daily health checks
import { runHealthCheck } from '@/utils/health/scoring';

export async function dailyHealthReport() {
  const health = await runHealthCheck();
  if (health.overall < 70) {
    await notifyTeam('Health score critical!', health);
  }
  await saveReport(health);
}
```

---

## 📚 Resources & Documentation

### Error Boundaries
- [React Error Boundaries Guide](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Boundary Best Practices](https://kentcdodds.com/blog/use-react-error-boundary)

### Accessibility
- [WCAG Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)

### Code Quality
- [Refactoring Complex Functions](https://refactoring.guru/refactoring/techniques/composing-methods)
- [Cyclomatic Complexity Explained](https://www.ibm.com/docs/en/raa/6.1?topic=metrics-cyclomatic-complexity)

---

## 💬 Need Help?

The Project Doctor is available to:
- Explain any prescription in detail
- Help implement the fixes
- Re-run health checks after changes
- Provide alternative solutions

Just ask: "Help me implement the error boundary prescription"

---

*Prescriptions generated by Project Doctor agent*  
*Next check scheduled: 2025-01-27*