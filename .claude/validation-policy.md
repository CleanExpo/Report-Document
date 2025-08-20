# Validation Policy for Claude/Agents

## Required Gates (Must Pass)

### 1. Tests
```bash
npm run test:unit      # Core functionality
npm run test:smoke     # Critical paths (optional for MVP)
npm run typecheck      # TypeScript validation
```

### 2. Quality
```bash
npm run lint           # No errors, minimal warnings
npm run format:check   # Consistent formatting
```

### 3. Bundle Size
- Home route: < 120kb JavaScript
- Check with: `npm run analyze`

## Manual Verification
Before marking complete:
1. `npm run dev` → Home page renders
2. Check `/404` → 404 page works
3. Trigger error → 500 page works
4. Check console → No secrets logged

## Secret Handling Rules

### ❌ NEVER DO THIS
```typescript
// Agents must NEVER read .env files directly
const secret = fs.readFileSync('.env')  // FORBIDDEN
const data = await read('.env')         // FORBIDDEN
```

### ✅ ALWAYS DO THIS
```typescript
// Import from config/env.ts ONLY
import { env } from '@/config/env'
const apiUrl = env.NEXT_PUBLIC_API_URL  // Safe, validated
```

### Why This Matters
1. `.env` files contain real secrets
2. Agents should not access secrets
3. `config/env.ts` provides safe, typed access
4. This prevents accidental secret exposure

## Validation Commands

### Quick Check (During Development)
```bash
npm run validate:quick
# Runs: typecheck, lint, format:check, test:unit
```

### Full Validation (Before PR)
```bash
npm run validate:full
# Runs: quick + integration tests + build
```

### Gate Status Script
```bash
# Bash (Mac/Linux)
./scripts/validate-gates.sh

# PowerShell (Windows)
./scripts/validate-gates.ps1
```

## Gate Status Meanings

- 🟢 **PASS** - Good to proceed
- 🟡 **WARN** - Fix if possible, not blocking
- 🔴 **FAIL** - Must fix before shipping
- ⚠️ **SKIP** - Not applicable yet

## Common Issues & Fixes

### TypeScript Errors
```bash
# See specific errors
npm run typecheck

# Common fix: add types
interface Props {
  name: string
}
```

### Lint Warnings
```bash
# Auto-fix most issues
npm run lint:fix

# Manual fix for specific warnings
npm run lint -- --max-warnings=0
```

### Format Issues
```bash
# Auto-format all files
npm run format

# Check specific file
npx prettier --check src/app/page.tsx
```

### Test Failures
```bash
# Run specific test
npm test -- LoginForm.test

# Update snapshots if needed
npm test -- -u
```

## Validation Workflow

1. **During Development**
   - Run `validate:quick` frequently
   - Fix issues immediately

2. **Before Commit**
   - Run `validate:full`
   - All must pass

3. **Before PR**
   - Run validation script
   - Manual checks complete
   - Document any warnings

4. **Before Deploy**
   - All gates GREEN
   - No WARN on critical paths
   - Release Captain approval

## Zero-Tolerance Items

These will always block deployment:
- 🚫 Secrets in code
- 🚫 TypeScript errors
- 🚫 Failing unit tests
- 🚫 Build failures
- 🚫 Console errors on home page

## Acceptable Warnings

These can be addressed later:
- ⚠️ Lint warnings (non-critical)
- ⚠️ Bundle size slightly over (< 10%)
- ⚠️ Missing optional tests
- ⚠️ TODO comments

## Remember
**Ship working code, not perfect code.**
Get the vertical slice working, gates passing, then iterate.