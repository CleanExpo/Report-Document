# PRP = PRD + Curated Code Intelligence + Agent Runbook

## PRD
- Users & JTBD: [Target user]; [Job to be done]
- Primary flows: [Main user journey]
- Edge cases: [Failure scenarios]

## Curated Code Intelligence
- Code patterns to reuse: [Existing patterns]
- Example style: [Coding conventions]
- Avoid: [Anti-patterns]

## Agent Runbook
1) Plan steps; propose diffs; wait for approval
2) Generate code + minimal tests
3) Run: `npm run typecheck && npm run lint && npm run test:unit`
4) If green: open PR with summary
5) If red: self-heal (max 2 tries); then ask human