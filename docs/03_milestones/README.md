# Milestone Planning

This directory contains the breakdown of project requirements into manageable vertical slices and PR plans.

## Structure

```
03_milestones/
├── README.md              # This file
├── milestone-plan.md      # Overall roadmap of slices
├── dependencies.md        # Dependency graph between slices
├── risks.md              # Risk assessment per slice
└── prs/                  # Individual PR plans
    ├── slice-1-plan.md
    ├── slice-2-plan.md
    └── slice-3-plan.md
```

## How to Use

1. **Run PR Planner Agent**
   - Select "PR Planner" in Claude Code
   - It reads the PRP and generates slices

2. **Review Milestone Plan**
   - Check `milestone-plan.md` for the roadmap
   - Each slice should be independently valuable

3. **Execute Slices**
   - Work on one slice at a time
   - Follow the PR plan in `prs/slice-N-plan.md`
   - Ship behind feature flags

## Slice Principles

### Good Vertical Slice
- ✅ User-visible feature
- ✅ Can be demoed independently
- ✅ Behind feature flag
- ✅ Has rollback plan
- ✅ Takes 1-3 days

### Bad Vertical Slice
- ❌ Pure technical setup
- ❌ Too large (> 1 week)
- ❌ No user value
- ❌ Can't be toggled off
- ❌ Blocks other work

## Example Slices

### E-commerce Example
1. **Browse Products** - List and search
2. **Product Details** - View single product
3. **Add to Cart** - Cart management
4. **Checkout** - Payment flow
5. **Order History** - View past orders

### SaaS Dashboard Example
1. **User Auth** - Login/logout
2. **Dashboard Shell** - Navigation and layout
3. **Data Widget** - First metric display
4. **Export Feature** - Download data
5. **Settings Panel** - User preferences

## Integration with Other Agents

- **Pathway Guide** → Creates initial PRP
- **PR Planner** → Breaks PRP into slices (YOU ARE HERE)
- **QA Auditor** → Validates each slice
- **Release Captain** → Manages rollout
- **Changelog Scribe** → Documents changes

## Commands

Generate new milestone plan:
```
Select "PR Planner" agent
Command: "Break down the PRP into vertical slices"
```

Adjust existing plan:
```
Command: "Make slices smaller" or "Combine slices 2 and 3"
```

Generate PR for specific slice:
```
Command: "Create PR plan for slice 1"
```