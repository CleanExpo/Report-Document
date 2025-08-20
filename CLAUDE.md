# CLAUDE.md - Project Operating Rules

## 🔒 SECURITY FIRST
**CRITICAL**: Never expose secrets, passwords, API keys, or PII. All agents enforce strict security guardrails. See `docs/09_security/pii-safety.md` for mandatory guidelines.

## Configuration
This project uses `claude.config.json` for Claude Code settings with:
- **Default Mode**: Plan mode (propose before implementing)
- **Permissions**: Restricted access to sensitive files
- **Security**: Blocks access to `.env` files and secrets
- **Validation**: Automatic checks before commits
- **Command Filter**: Denies `docker login`, `npm publish`, `echo $*`

## Core Principles
1. **Always start in PLAN mode** - Propose changes before implementation
2. **Never access secrets** - `.env`, `.env.*`, `/secrets/**` are off-limits
3. **Minimal diffs with backups** - Create `.bak` files before modifications
4. **Vertical slices first** - Implement smallest working feature
5. **Feature flags always** - Ship behind flags until validation gates pass

## Project Structure
```
D:\New Project Pathway\
├── docs/
│   ├── 01_initial/       # Requirements gathering
│   ├── 02_prp/          # Project Requirements Plan
│   ├── 04_runbook/      # Execution procedures
│   └── 05_validation/   # Quality gates
├── src/                 # Source code
├── tests/               # Test files
└── CLAUDE.md           # This file
```

## Workflow Steps

### 1. Requirements Analysis
- Read `docs/01_initial/initial.md`
- Understand problem statement and context
- Identify key requirements

### 2. PRP Development
- Update `docs/02_prp/prp.md` with specifications
- No placeholders - only concrete details
- Define acceptance criteria

### 3. Planning
- Create execution plan in `docs/04_runbook/execution-runbook.md`
- Break into vertical slices
- Define implementation order

### 4. Implementation
- Start with smallest vertical slice
- Create feature flags
- Write tests alongside code
- Update documentation

### 5. Validation
- Run all gates from `docs/05_validation/validation-gates.md`
- Must achieve green status on all gates:
  - Code quality (lint, typecheck, coverage)
  - Testing (unit, integration, E2E)
  - Security scans
  - Performance checks
  - Documentation completeness

### 6. Release
- Hand off to release-captain
- Ensure feature flags configured
- Document rollback procedures

## Commands to Run

### Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Check code quality
npm run lint
npm run typecheck

# Build project
npm run build
```

### Validation
```bash
# Run all validation gates
./scripts/validate.sh

# Individual gates
npm run test:coverage
npm run security:scan
npm run test:e2e
```

## Important Rules

### File Operations
- Always create backups: `cp file.js file.js.bak`
- Use feature flags for new code
- Update tests when changing code
- Keep documentation synchronized

### Security
- No secrets in code
- No `.env` file access
- Use environment variables properly
- Run security scans before commit

### Quality Standards
- Code coverage > 80%
- All tests must pass
- Zero linting errors
- Type checking clean

## Feature Flag Pattern
```javascript
if (featureFlags.isEnabled('new_feature')) {
    // New implementation
} else {
    // Existing implementation
}
```

## Quick Reference
- Initial requirements: `docs/01_initial/initial.md`
- Project plan: `docs/02_prp/prp.md`
- Execution guide: `docs/04_runbook/execution-runbook.md`
- Validation criteria: `docs/05_validation/validation-gates.md`