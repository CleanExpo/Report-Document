# Validation Gates

## Tests to Pass
- **Unit**: `npm run test:unit`
- **E2E Smoke** (optional starter): `npm run test:smoke`
- **Types**: `npm run typecheck`

## Quality Gates
- **Lint**: `npm run lint` (no warnings)
- **Format**: `npm run format:check`
- **Bundle size**: home route JS < 120kb (baseline)

## Manual Checks
- Start → Home renders
- 404/500 pages present
- No secret values printed in logs

## Secret Handling Policy
- Never read `.env*` in agents; use `process.env.*` only through `src/config/env.ts`
- Local secrets in `.env` only; not committed

---

## Quick Validation Command
```bash
# Run all automated gates
npm run validate:quick

# Which runs:
npm run typecheck && \
npm run lint && \
npm run format:check && \
npm run test:unit
```

## Gate Status Indicators
- 🟢 **PASS** - Continue to next step
- 🟡 **WARN** - Fix if time permits
- 🔴 **FAIL** - Must fix before proceeding

## Validation Results Template
```
=================================
VALIDATION RESULTS
=================================
✅ TypeScript     : PASS
✅ Linting        : PASS (0 warnings)
✅ Formatting     : PASS
✅ Unit Tests     : PASS (12/12)
⚠️  Bundle Size    : WARN (125kb > 120kb)
✅ Manual Checks  : PASS

STATUS: READY TO SHIP
=================================
```