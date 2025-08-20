# 🚀 Quick Start with Pathway Guide

## Launch Instructions

### 1. Open in Claude Code
```powershell
# Launch Claude Code in plan mode with Wizard context
Write-Host "Open this folder in Claude Code. Then select the 'Pathway Guide' agent and paste the BUILD PROMPT (Wizard)."
```

### 2. Select the Pathway Guide Agent
In Claude Code:
1. Open the folder containing this project
2. Look for the agent selector (usually in the sidebar or menu)
3. Select **"Pathway Guide"** from the available agents

### 3. Start the Wizard
The Pathway Guide will greet you with:
> **"What is your project? Tell me as much as you can."**

### 4. What Happens Next
Your answers will be:
- Saved to `docs/00_intake/sessions/S-[DATE]-[slug].md`
- Converted into a Project Requirements Plan (PRP)
- Used to generate your first vertical slice
- Turned into testable, deployable code

## The Bootstrap Wizard Process

The Pathway Guide will ask you these questions:
1. **Project Vision** - What are you building?
2. **Primary User** - Who uses it and why?
3. **MVP Outcome** - What proves it works?
4. **Must-haves** - Essential v1 features
5. **Nice-to-haves** - Future additions
6. **Constraints** - Technical requirements
7. **Out of Scope** - What v1 won't do
8. **Milestones** - Key dates
9. **Risks** - Unknown challenges
10. **Success Metrics** - How to measure success

## Output Structure

After the Q&A session, you'll have:
```
docs/
├── 00_intake/
│   ├── sessions/
│   │   └── S-20250120-your-project.md  # Full transcript
│   └── idea-cards/                      # Feature ideas
├── 01_initial/
│   └── initial.md                       # Requirements
├── 02_prp/
│   └── prp.md                          # Project plan
└── 04_runbook/
    └── execution-runbook.md            # How to build
```

## Ready to Begin?

1. Make sure you have Claude Code installed
2. Open this project folder
3. Select the Pathway Guide agent
4. Answer the first question about your project
5. Follow the guided process

The Pathway Guide will handle everything else - from documentation to code generation to testing!

---

*Note: The Pathway Guide operates in PLAN mode first, showing you all changes before applying them. You stay in control throughout the process.*