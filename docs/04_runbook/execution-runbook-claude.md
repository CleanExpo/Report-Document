# Execution Runbook (Claude-facing)
Inputs: initial.md, prp.md  
Outputs: working vertical slice + passing gates

## Steps

### 1) "/plan" — outline file graph & tests
```bash
# Read inputs
cat docs/01_initial/{feature}.md
cat docs/02_prp/prp-{feature}.md

# Generate plan
echo "📋 File Graph:"
echo "├── src/app/(auth)/login/page.tsx"
echo "├── src/app/(auth)/login/page.test.tsx"
echo "├── src/app/api/auth/[...nextauth]/route.ts"
echo "├── src/app/api/auth/route.test.ts"
echo "└── src/middleware.ts"
echo ""
echo "🧪 Test Coverage:"
echo "- Unit: Auth utilities, validation"
echo "- Integration: API routes"
echo "- E2E: Full auth flow"
```

**WAIT FOR APPROVAL**

### 2) Implement minimal files under /src
```typescript
// Minimal = just enough to work
// No extras, no nice-to-haves
// Server Components by default
// Feature flag OFF

// ✅ Minimal
export default async function LoginPage() {
  return (
    <form action={login}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button>Login</button>
    </form>
  )
}

// ❌ Not minimal (extras)
// - Forgot password link
// - Social login buttons  
// - Remember me checkbox
// - Animations
```

### 3) Generate tests alongside code
```typescript
// For every file.tsx → file.test.tsx
// Same directory, side-by-side

// src/app/(auth)/login/page.tsx
// src/app/(auth)/login/page.test.tsx

describe('LoginPage', () => {
  it('renders login form', () => {
    // Minimal test for minimal code
  })
  
  it('handles submission', () => {
    // Test the core flow
  })
})
```

### 4) Run `npm run test:all`
```bash
# Single command to run everything
npm run test:all

# Which runs:
# - npm run typecheck
# - npm run lint  
# - npm run test:unit
# - npm run test:integration
```

### 5) Address failures; re-run
```bash
# Parse errors
npm run test:all 2>&1 | grep -E "error|fail|Error|FAIL"

# Common fixes
npm run lint:fix          # Auto-fix formatting
npm run typecheck -- --strict false  # Temporarily relax types
npm test -- --updateSnapshot  # Update snapshots

# Re-run
npm run test:all

# If still failing after 2 attempts
echo "❌ Tests failing - need human help"
echo "Errors: {specific errors}"
```

### 6) Prepare PR + release notes; tag Release Captain
```markdown
## PR Title
feat: {feature name} - minimal vertical slice

## Description
Implements {feature} per execution runbook.

**Inputs:**
- docs/01_initial/{feature}.md
- docs/02_prp/prp-{feature}.md

**Outputs:**
- ✅ Working vertical slice
- ✅ All gates passing
- ✅ Feature flag: OFF

## Files Changed
- {list of files}

## Test Results
```
npm run test:all
✅ TypeScript: No errors
✅ Linting: Clean
✅ Unit tests: X passing
✅ Integration: Y passing
```

## Release Notes
### {Version}
- Added {feature} (behind flag)
- Minimal implementation per runbook
- Ready for gradual rollout

@release-captain Ready for deployment review
```

## Quick Reference Card

```yaml
Input: 
  - docs/01_initial/{feature}.md
  - docs/02_prp/prp-{feature}.md

Output:
  - Working code in /src
  - Tests passing
  - PR ready

Commands:
  plan: "/plan"
  test: "npm run test:all"
  fix: "npm run lint:fix"
  pr: "gh pr create"

Rules:
  - Minimal only (no extras)
  - Tests alongside code
  - Feature flag OFF
  - Server Components default
  - 2 fix attempts max
```

## Example Execution

```bash
# 1. Plan
$ /plan
📋 Creating auth system:
- 5 components
- 3 API routes  
- 8 tests
Continue? [y/n]

# 2. Implement
Creating src/app/(auth)/login/page.tsx...
Creating src/app/(auth)/login/page.test.tsx...

# 3. Test
$ npm run test:all
✅ All tests passing (8/8)

# 4. PR
$ gh pr create
✅ PR #123 created

# 5. Tag
@release-captain PR #123 ready for review
```

## Failure Playbook

### TypeScript Errors
```bash
# Add temporary any
// @ts-ignore
const problematicVar: any = value

# Fix later with proper types
```

### Lint Errors
```bash
npm run lint:fix
# Most issues auto-fixed
```

### Test Failures
```bash
# Skip failing test temporarily
it.skip('problematic test', () => {
  // TODO: Fix this
})

# File issue for follow-up
```

### Build Errors
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Success Criteria
- [ ] Code runs without errors
- [ ] Basic happy path works
- [ ] Tests cover core functionality
- [ ] No console errors
- [ ] Feature flag toggles correctly
- [ ] PR created with description

## Anti-patterns to Avoid
- 🚫 Perfect code (aim for working)
- 🚫 Full feature set (just vertical slice)
- 🚫 Complex abstractions (keep simple)
- 🚫 Premature optimization
- 🚫 Client Components everywhere
- 🚫 Inline styles

## When to Stop
✅ Vertical slice works  
✅ Tests pass  
✅ PR ready  
❌ Don't polish  
❌ Don't add extras  
❌ Don't refactor yet

**Ship it! 🚀**