#!/usr/bin/env node

/**
 * Pathway CLI - Bootstrap tool for NEW PROJECT PATHWAY
 * Simple launcher to guide users to the right starting point
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

// Action cue icons
const cues = {
  input: '📝',     // YOUR INPUT NEEDED
  review: '🔎',    // REVIEW & APPROVE
  auto: '✅',      // I WILL DO THIS
  manual: '🖐️'     // MANUAL STEP (YOU DO THIS)
};

function displayBanner() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${colors.bright}🚀 NEW PROJECT PATHWAY - Bootstrap CLI${colors.cyan}                    ║
║                                                              ║
║   ${colors.reset}AI-Led Development Platform for Non-Coders${colors.cyan}                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

function displayInstructions() {
  console.log(`${colors.bright}Getting Started:${colors.reset}
  
${cues.manual} ${colors.yellow}MANUAL STEP: Open Claude Code${colors.reset}
   1. Open this folder in Claude Code
   2. Select the ${colors.green}"Pathway Guide"${colors.reset} agent
   3. Choose your build prompt:

${colors.bright}Available BUILD PROMPTS:${colors.reset}

  ${colors.blue}BUILD PROMPT v2.1${colors.reset} - Interactive Wizard
  ${cues.input} Guides you step-by-step with clear questions
  ${cues.review} Shows you exactly what will be built
  ${cues.auto} Creates all files and configurations
  
  ${colors.magenta}BUILD PROMPT v3.0${colors.reset} - Town Square Debate
  ${cues.auto} Agents debate to find optimal solution
  ${cues.review} You approve the unified PLAN
  ${cues.input} Minimal input required
  
  ${colors.green}BUILD PROMPT v4.1${colors.reset} - Full Orchestration
  ${cues.auto} Complete automated workflow
  ${cues.review} Clear action cues throughout
  ${cues.manual} Tells you exactly when to act

${colors.bright}Quick Start Commands:${colors.reset}

  ${colors.cyan}npm run doctor${colors.reset}       - Check project health
  ${colors.cyan}npm run security:check${colors.reset} - Run security audit
  ${colors.cyan}npm run dev${colors.reset}          - Start development server
  ${colors.cyan}npm test${colors.reset}             - Run test suite

${colors.bright}Agent Registry:${colors.reset}

  • ${colors.green}Pathway Guide${colors.reset} - Project setup wizard
  • ${colors.blue}PR Planner${colors.reset} - Breaks work into slices
  • ${colors.yellow}Town Square${colors.reset} - Coordination hub
  • ${colors.magenta}QA Auditor${colors.reset} - Quality gates
  • ${colors.cyan}Release Captain${colors.reset} - Deployment manager
  • ${colors.green}Project Doctor${colors.reset} - Health monitoring

${colors.bright}Action Cue Legend:${colors.reset}

  ${cues.input} ${colors.yellow}YOUR INPUT NEEDED${colors.reset} - Type or provide information
  ${cues.review} ${colors.blue}REVIEW & APPROVE${colors.reset} - Check and confirm
  ${cues.auto} ${colors.green}I WILL DO THIS${colors.reset} - Automated by agent
  ${cues.manual} ${colors.magenta}MANUAL STEP${colors.reset} - You must do this yourself
`);
}

function checkEnvironment() {
  console.log(`\n${colors.bright}Environment Check:${colors.reset}\n`);
  
  const checks = [
    { name: 'Node.js', cmd: 'node --version', required: true },
    { name: 'npm', cmd: 'npm --version', required: true },
    { name: 'Git', cmd: 'git --version', required: true },
    { name: 'Python', cmd: 'python --version', required: false },
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    try {
      const version = execSync(check.cmd, { encoding: 'utf-8' }).trim();
      console.log(`  ${colors.green}✓${colors.reset} ${check.name}: ${version}`);
    } catch (error) {
      if (check.required) {
        console.log(`  ${colors.red}✗${colors.reset} ${check.name}: Not found (REQUIRED)`);
        allGood = false;
      } else {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${check.name}: Not found (optional)`);
      }
    }
  }
  
  // Check for Claude Code markers
  const claudeMdExists = fs.existsSync(path.join(process.cwd(), 'CLAUDE.md'));
  if (claudeMdExists) {
    console.log(`  ${colors.green}✓${colors.reset} CLAUDE.md: Found`);
  } else {
    console.log(`  ${colors.yellow}⚠${colors.reset} CLAUDE.md: Not found (will be created)`);
  }
  
  return allGood;
}

function displayBuildPrompts() {
  console.log(`\n${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}                    BUILD PROMPTS LIBRARY${colors.reset}`);
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  const promptsDir = path.join(__dirname, '..', 'docs', '10_prompts');
  if (!fs.existsSync(promptsDir)) {
    console.log(`${colors.yellow}Prompts directory not found. Creating...${colors.reset}`);
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  
  console.log(`${colors.cyan}Location: docs/10_prompts/${colors.reset}\n`);
  
  console.log(`Copy and paste these into Claude Code with Pathway Guide:\n`);
  
  console.log(`${colors.bright}1. For Quick Start:${colors.reset}`);
  console.log(`   ${cues.manual} Copy BUILD PROMPT v2.1 from docs/10_prompts/BUILD_PROMPT_v2.1.md`);
  console.log(`   ${cues.input} Answer the wizard questions`);
  console.log(`   ${cues.auto} Let it build your project\n`);
  
  console.log(`${colors.bright}2. For Orchestrated Build:${colors.reset}`);
  console.log(`   ${cues.manual} Copy BUILD PROMPT v3.0 from docs/10_prompts/BUILD_PROMPT_v3.0.md`);
  console.log(`   ${cues.review} Review the agent debate`);
  console.log(`   ${cues.auto} Approve the unified PLAN\n`);
  
  console.log(`${colors.bright}3. For Full Automation:${colors.reset}`);
  console.log(`   ${cues.manual} Copy BUILD PROMPT v4.1 from docs/10_prompts/BUILD_PROMPT_v4.1.md`);
  console.log(`   ${cues.auto} Everything automated with clear cues`);
  console.log(`   ${cues.review} Just approve when prompted\n`);
}

function main() {
  displayBanner();
  
  const envOk = checkEnvironment();
  if (!envOk) {
    console.log(`\n${colors.red}⚠️  Please install missing requirements before continuing.${colors.reset}\n`);
  }
  
  displayInstructions();
  displayBuildPrompts();
  
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Ready to begin! Follow the steps above to start your project.${colors.reset}`);
  console.log(`${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Create a quick reference file
  const quickRef = `# Quick Reference

## Start Here
1. ${cues.manual} Open this folder in Claude Code
2. ${cues.manual} Select "Pathway Guide" agent
3. ${cues.manual} Paste BUILD PROMPT (v2.1, v3.0, or v4.1)

## Action Cues
- ${cues.input} YOUR INPUT NEEDED - Provide information
- ${cues.review} REVIEW & APPROVE - Check and confirm
- ${cues.auto} I WILL DO THIS - Automated
- ${cues.manual} MANUAL STEP - You do this

## Commands
\`\`\`bash
npm run doctor          # Health check
npm run security:check  # Security audit
npm run dev            # Start server
npm test               # Run tests
node scripts/pathway-cli.mjs  # This CLI
\`\`\`
`;
  
  const quickRefPath = path.join(process.cwd(), 'QUICK_START.md');
  fs.writeFileSync(quickRefPath, quickRef);
  console.log(`${colors.cyan}📄 Created QUICK_START.md for your reference${colors.reset}\n`);
}

// Run the CLI
main();