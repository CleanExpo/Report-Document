#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Define all required files for project health
const required = [
  // Core configuration
  "CLAUDE.md",
  "package.json",
  "tsconfig.json",
  ".gitignore",
  
  // Documentation structure
  "docs/01_initial/initial.md",
  "docs/02_prp/prp.md",
  "docs/03_milestones/milestone-plan.md",
  "docs/04_runbook/execution-runbook.md",
  "docs/05_validation/validation-gates.md",
  "docs/06_release/release-notes.md",
  "docs/07_coordination/status.md",
  "docs/08_health/health-report.md",
  "docs/08_health/prescription.md",
  
  // Source code structure
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/config/env.ts",
  "src/config/flags.ts",
  "src/utils/health/scoring.ts",
  "src/utils/health/helpers.ts",
  
  // API routes
  "src/app/api/ai/generate/route.ts",
  "src/app/api/health/check/route.ts",
  
  // Agent configurations
  ".claude/agents/pathway-guide.md",
  ".claude/agents/pr-planner.md",
  ".claude/agents/qa-auditor.md",
  ".claude/agents/release-captain.md",
  ".claude/agents/changelog-scribe.md",
  ".claude/agents/town-square.md",
  ".claude/agents/project-doctor.md",
  
  // CI/CD
  ".github/workflows/main.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  
  // Scripts
  "scripts/ship.sh",
  "scripts/ship.ps1",
  
  // AI Service
  "services/ai-orchestrator/service.py",
  "services/ai-orchestrator/requirements.txt"
];

// Check which files are missing
const missing = required.filter(p => !fs.existsSync(path.join(process.cwd(), p)));

// Calculate health percentage
const healthPercentage = Math.round(((required.length - missing.length) / required.length) * 100);

// Determine health status
const getHealthStatus = (percentage) => {
  if (percentage === 100) return { emoji: "🟢", label: "Excellent" };
  if (percentage >= 90) return { emoji: "🟡", label: "Good" };
  if (percentage >= 70) return { emoji: "🟠", label: "Fair" };
  return { emoji: "🔴", label: "Critical" };
};

const status = getHealthStatus(healthPercentage);

// Build result object
const result = {
  ok: missing.length === 0,
  health: healthPercentage,
  status: status,
  total: required.length,
  found: required.length - missing.length,
  missing: missing.length,
  missingFiles: missing,
  summary: `Project health: ${status.emoji} ${status.label} (${healthPercentage}%)`
};

// Output results
console.log(JSON.stringify(result, null, 2));

// If running in CI, exit with error if not healthy
if (process.env.CI && !result.ok) {
  console.error(`\n❌ Health check failed: ${missing.length} required files missing`);
  process.exit(1);
}

process.exit(0);