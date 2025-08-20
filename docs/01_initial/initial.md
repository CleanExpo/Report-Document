# Project Initialization Guide

## Current Vertical Slice: Home + AI Proxy + Flags

### FEATURE: MVP Foundation
The first vertical slice establishes the core system with AI integration capability.

**Components:**
1. Home page showing system status and feature flags
2. AI proxy endpoint with offline mock fallback
3. Feature flag system controlling progressive rollout

### Acceptance Criteria
- [x] Home page displays "NEW PROJECT PATHWAY" and flags
- [x] `/api/ai/generate` returns mock when service offline
- [x] `/api/ai/generate` proxies to Python service when online
- [x] Feature flag `aiOrchestrator` controls AI features
- [x] All tests pass (unit, typecheck, lint)
- [x] CI pipeline configured and green
- [ ] Vercel preview deployment working

### Technical Implementation
- **Frontend**: Next.js App Router at `/`
- **API**: Proxy at `/api/ai/generate` with 5s timeout
- **Fallback**: Mock response ensuring 100% availability
- **Flags**: Simple config at `src/config/flags.simple.ts`
- **Tests**: Jest unit tests for flags and proxy

## Quick Start: Feature Definition

Use the streamlined **FEATURE** template for rapid requirement capture:

```markdown
# FEATURE
Describe the first vertical slice (example: Auth → Empty Dashboard).

## Acceptance
- [ ] Vertical slice demonstrably working
- [ ] Tests pass per validation gates
- [ ] Docs updated; feature behind flag OFF by default

## Constraints
- Language/Runtime: Node 20, Next.js (App Router)
- Libraries: pinned in package.json
- Integrations: Vercel envs; OAuth later (flagged)
- Non-Functional: A11y baseline; Core Web Vitals SSG/ISR ready
```

See examples:
- [Auth → Dashboard Example](./example-auth-dashboard.md)
- [Feature Template](./feature-template.md)

## Detailed Requirements (When Needed)

### 1. Problem Statement
- **What problem are we solving?**
- **Who is affected by this problem?**
- **What is the current impact?**

### 2. Business Context
- **Business objectives**
- **Success metrics**
- **Stakeholders**
- **Timeline constraints**

### 3. Technical Context
- **Existing system overview**
- **Technical constraints**
- **Integration points**
- **Performance requirements**

### 4. User Requirements
- **User stories**
- **Acceptance criteria**
- **User personas**
- **Use cases**

### 5. Non-Functional Requirements
- **Security requirements**
- **Scalability needs**
- **Compliance requirements**
- **Performance benchmarks**

## Output
This document feeds into the PRP (Project Requirements Plan) where requirements are formalized into:
- Technical specifications
- Implementation approach
- Testing strategy
- Release criteria

## Next Steps
1. Define feature using template
2. Review acceptance criteria
3. Validate constraints
4. Begin vertical slice implementation