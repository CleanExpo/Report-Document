# PRP: Auth → Empty Dashboard

## PRD
- **Users & JTBD**: Non-coder owner needs to access admin dashboard; technicians/managers will use later for monitoring
- **Primary flows**: 
  1. Sign up with email → Verify → Login
  2. Login → See empty dashboard shell with welcome message
  3. Logout → Return to login page
- **Edge cases**: 
  - Missing AUTH_SECRET env → Clear error message
  - Database connection failure → Graceful fallback
  - API timeout → Retry with exponential backoff
  - Offline mode → Show cached content if available
  - Invalid credentials → Rate limit after 3 attempts

## Curated Code Intelligence

### Code patterns to reuse:
```typescript
// config/env.ts - Already validates environment
import { env } from '@/config/env'

// config/flags.ts - Feature flag system ready
import { featureFlags } from '@/config/flags'

// Server-safe components by default
export default async function Dashboard() {
  const session = await getServerSession()
  // Server Component - no useState, useEffect
}
```

### Example style:
```typescript
// ✅ Server Components by default
export default async function Page() {
  const data = await fetchData()
  return <ServerComponent data={data} />
}

// ✅ Client Components only when needed
'use client'
export function InteractiveButton() {
  const [state, setState] = useState()
  // Client-side interactivity
}

// ✅ Typed environment usage
const apiUrl = env.NEXT_PUBLIC_API_URL // Type-safe

// ✅ Error boundaries
export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Something went wrong: {error.message}</div>
}
```

### Avoid:
```typescript
// ❌ Wide writes to database
await db.users.updateMany({}) // Too broad

// ❌ Untyped env usage
process.env.RANDOM_VAR // Not validated

// ❌ Client Components for static content
'use client' // Unnecessary for static UI

// ❌ Inline styles
<div style={{ color: 'red' }}> // Use Tailwind

// ❌ Direct fetch without error handling
const data = await fetch(url) // No try-catch
```

## Agent Runbook

### Step 1: Plan & Propose
```bash
# Analyze current state
ls -la src/app
cat package.json | grep "next-auth"

# Propose file structure
src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── (protected)/
│   ├── dashboard/page.tsx
│   └── layout.tsx
├── api/auth/[...nextauth]/route.ts
└── middleware.ts
```

**WAIT FOR APPROVAL before proceeding**

### Step 2: Generate Code
```typescript
// Generate each file with:
- TypeScript strict mode
- Proper error handling
- Server Components by default
- Feature flag integration
- Environment validation
```

### Step 3: Run Validation
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Unit tests
npm run test:unit

# Combined check
npm run typecheck && npm run lint && npm run test:unit
```

### Step 4: Handle Results

#### If GREEN ✅:
```bash
# Create feature branch
git checkout -b feature/auth-dashboard

# Stage changes
git add -A

# Commit with conventional format
git commit -m "feat: add auth system with empty dashboard

- Implement NextAuth with email/password
- Add protected dashboard route
- Server Components with proper error handling
- Feature flag: auth_system (default OFF)

Closes #123"

# Create PR
gh pr create \
  --title "feat: Auth → Empty Dashboard vertical slice" \
  --body "## Summary
- Basic auth flow with email/password
- Protected dashboard route
- Feature flagged (OFF by default)

## Testing
- ✅ Type checking passes
- ✅ Linting clean
- ✅ Unit tests passing

## Checklist
- [x] Tests pass
- [x] Documentation updated
- [x] Feature flag configured
- [x] No breaking changes"
```

#### If RED ❌:

**Attempt 1: Auto-fix common issues**
```bash
# Fix linting
npm run lint:fix

# Rebuild if needed
rm -rf .next
npm run build

# Retry validation
npm run typecheck && npm run lint && npm run test:unit
```

**Attempt 2: Diagnose specific failures**
```bash
# Check TypeScript errors
npm run typecheck 2>&1 | head -20

# Common fixes:
# - Add missing types
# - Fix import paths
# - Update tsconfig paths

# Retry validation
npm run typecheck && npm run lint && npm run test:unit
```

**After 2 attempts:**
```markdown
## 🚨 Validation Failed - Human Assistance Required

### Errors Found:
1. TypeScript: [specific error]
2. Linting: [specific violation]
3. Tests: [failing test name]

### Attempted Fixes:
1. Ran lint:fix
2. Rebuilt project
3. [Other attempts]

### Suggested Next Steps:
- Check [specific file:line]
- Review [dependency conflict]
- Verify [environment setup]

Please review and advise on how to proceed.
```

## Success Metrics
- [ ] Auth flow works end-to-end
- [ ] Dashboard loads in < 1.5s
- [ ] All validation gates GREEN
- [ ] Feature flag toggles correctly
- [ ] Zero console errors
- [ ] Graceful error handling

## Rollout Plan
1. **Deploy OFF** - Code merged but feature disabled
2. **Internal Testing** - Enable for team (1 day)
3. **Beta Users** - 10% rollout (2 days)
4. **Gradual Rollout** - 25% → 50% → 100% (1 week)
5. **Full Launch** - Remove feature flag (next sprint)

## Dependencies
- `next-auth@4.24.0` - Authentication
- `@auth/prisma-adapter@1.0.0` - Database adapter
- `bcryptjs@2.4.3` - Password hashing
- Database migration completed
- AUTH_SECRET environment variable set

## Risk Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth bypass | Critical | Rate limiting, secure sessions |
| Database overload | High | Connection pooling, caching |
| Slow login | Medium | Optimize queries, add indices |
| Session hijacking | Critical | HttpOnly cookies, CSRF tokens |

## Documentation Updates Required
- [ ] README.md - Add auth setup instructions
- [ ] .env.example - Add AUTH_SECRET template
- [ ] API docs - Document auth endpoints
- [ ] Architecture diagram - Add auth flow