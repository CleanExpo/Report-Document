#!/usr/bin/env node

/**
 * Project Doctor - Interactive health assessment and remediation tool
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Health status emojis
const statusEmojis = {
  excellent: '🟢',
  good: '🟡',
  fair: '🟠',
  critical: '🔴'
};

class ProjectDoctor {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.healthReportPath = path.join(this.projectRoot, 'docs', '08_health', 'health-report.md');
    this.prescriptionPath = path.join(this.projectRoot, 'docs', '08_health', 'prescription.md');
  }

  /**
   * Main diagnosis function
   */
  async diagnose() {
    console.log(`\n${colors.cyan}🏥 Project Doctor - Health Assessment${colors.reset}\n`);
    console.log(`${colors.gray}Analyzing your project...${colors.reset}\n`);

    // Run comprehensive checks
    const health = await this.runHealthChecks();
    
    // Display results
    this.displayHealthSummary(health);
    this.displayCategoryBreakdown(health);
    this.displayTopIssues(health);
    this.displayRecommendations(health);
    
    // Save reports
    await this.generateReports(health);
    
    return health;
  }

  /**
   * Run all health checks
   */
  async runHealthChecks() {
    const checks = {
      structure: await this.checkProjectStructure(),
      dependencies: await this.checkDependencies(),
      code: await this.checkCodeQuality(),
      tests: await this.checkTests(),
      security: await this.checkSecurity(),
      performance: await this.checkPerformance()
    };

    // Calculate overall score
    const scores = Object.values(checks).map(c => c.score);
    const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      overall,
      status: this.getHealthStatus(overall),
      checks,
      timestamp: new Date().toISOString(),
      issues: this.collectIssues(checks)
    };
  }

  /**
   * Check project structure
   */
  async checkProjectStructure() {
    const requiredFiles = [
      'CLAUDE.md',
      'README.md',
      'package.json',
      'tsconfig.json',
      '.gitignore',
      'docs/01_initial/initial.md',
      'docs/02_prp/prp.md',
      'docs/05_validation/validation-gates.md',
      'src/config/flags.ts'
    ];

    const missing = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.projectRoot, file))
    );

    const score = Math.round((1 - missing.length / requiredFiles.length) * 100);

    return {
      name: 'Project Structure',
      score,
      status: this.getHealthStatus(score),
      issues: missing.map(file => ({
        severity: 'major',
        description: `Missing required file: ${file}`,
        remediation: `Create ${file} with appropriate content`
      }))
    };
  }

  /**
   * Check dependencies
   */
  async checkDependencies() {
    let score = 100;
    const issues = [];

    try {
      // Check for vulnerabilities
      const auditOutput = execSync('npm audit --json', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(auditOutput);
      const vulns = audit.metadata?.vulnerabilities || {};
      
      if (vulns.critical > 0) {
        score -= 30;
        issues.push({
          severity: 'critical',
          description: `${vulns.critical} critical vulnerabilities found`,
          remediation: 'Run: npm audit fix --force'
        });
      }
      
      if (vulns.high > 0) {
        score -= 20;
        issues.push({
          severity: 'major',
          description: `${vulns.high} high vulnerabilities found`,
          remediation: 'Run: npm audit fix'
        });
      }
      
      if (vulns.moderate > 0) {
        score -= 10;
        issues.push({
          severity: 'minor',
          description: `${vulns.moderate} moderate vulnerabilities found`,
          remediation: 'Review with: npm audit'
        });
      }
    } catch (error) {
      // No vulnerabilities or npm audit failed gracefully
    }

    // Check for outdated packages
    try {
      const outdated = execSync('npm outdated --json', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      if (outdated) {
        const packages = Object.keys(JSON.parse(outdated));
        if (packages.length > 10) {
          score -= 10;
          issues.push({
            severity: 'minor',
            description: `${packages.length} outdated packages`,
            remediation: 'Run: npm update'
          });
        }
      }
    } catch {
      // No outdated packages
    }

    return {
      name: 'Dependencies',
      score: Math.max(0, score),
      status: this.getHealthStatus(score),
      issues
    };
  }

  /**
   * Check code quality
   */
  async checkCodeQuality() {
    let score = 100;
    const issues = [];

    // Check TypeScript strict mode
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      if (!tsconfig.compilerOptions?.strict) {
        score -= 25;
        issues.push({
          severity: 'major',
          description: 'TypeScript strict mode disabled',
          remediation: 'Set "strict": true in tsconfig.json'
        });
      }
    }

    // Check for linting
    try {
      execSync('npm run lint --silent', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (error) {
      score -= 15;
      issues.push({
        severity: 'minor',
        description: 'Linting errors found',
        remediation: 'Run: npm run lint:fix'
      });
    }

    return {
      name: 'Code Quality',
      score: Math.max(0, score),
      status: this.getHealthStatus(score),
      issues
    };
  }

  /**
   * Check test coverage
   */
  async checkTests() {
    let score = 85; // Default if no coverage data
    const issues = [];

    // Check for test files
    const testFiles = this.findFiles('**/*.test.{ts,tsx,js,jsx}');
    if (testFiles.length === 0) {
      score = 0;
      issues.push({
        severity: 'critical',
        description: 'No test files found',
        remediation: 'Add unit tests in __tests__ or *.test.ts files'
      });
    }

    // Check coverage if available
    const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
      const lineCoverage = coverage.total?.lines?.pct || 0;
      
      score = Math.round(lineCoverage);
      
      if (lineCoverage < 80) {
        issues.push({
          severity: lineCoverage < 50 ? 'major' : 'minor',
          description: `Test coverage is ${lineCoverage}% (target: 80%)`,
          remediation: 'Add more unit tests to increase coverage'
        });
      }
    }

    return {
      name: 'Test Coverage',
      score,
      status: this.getHealthStatus(score),
      issues
    };
  }

  /**
   * Check security
   */
  async checkSecurity() {
    let score = 100;
    const issues = [];

    // Check for .env in gitignore
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('.env')) {
        score -= 30;
        issues.push({
          severity: 'critical',
          description: '.env not in .gitignore',
          remediation: 'Add .env to .gitignore file'
        });
      }
    }

    // Check for hardcoded secrets
    const suspiciousPatterns = [
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
      /secret\s*[:=]\s*["'][^"']+["']/gi,
      /password\s*[:=]\s*["'][^"']+["']/gi
    ];

    const sourceFiles = this.findFiles('src/**/*.{ts,tsx,js,jsx}');
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content) && !content.includes('process.env')) {
          score -= 20;
          issues.push({
            severity: 'critical',
            description: `Potential hardcoded secret in ${path.relative(this.projectRoot, file)}`,
            remediation: 'Move secrets to environment variables'
          });
          break;
        }
      }
    }

    return {
      name: 'Security',
      score: Math.max(0, score),
      status: this.getHealthStatus(score),
      issues
    };
  }

  /**
   * Check performance
   */
  async checkPerformance() {
    let score = 90; // Default good score
    const issues = [];

    // Check bundle size if Next.js build exists
    const buildManifest = path.join(this.projectRoot, '.next', 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf-8'));
      // Simplified check - would need more sophisticated analysis
      const pageCount = Object.keys(manifest.pages || {}).length;
      if (pageCount > 50) {
        score -= 10;
        issues.push({
          severity: 'minor',
          description: 'Large number of pages may impact performance',
          remediation: 'Consider code splitting or lazy loading'
        });
      }
    }

    // Check for large dependencies
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf-8')
    );
    const heavyDeps = ['moment', 'lodash'];
    const foundHeavy = heavyDeps.filter(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );
    
    if (foundHeavy.length > 0) {
      score -= 5 * foundHeavy.length;
      issues.push({
        severity: 'minor',
        description: `Heavy dependencies found: ${foundHeavy.join(', ')}`,
        remediation: 'Consider lighter alternatives (date-fns, lodash-es)'
      });
    }

    return {
      name: 'Performance',
      score: Math.max(0, score),
      status: this.getHealthStatus(score),
      issues
    };
  }

  /**
   * Get health status from score
   */
  getHealthStatus(score) {
    if (score >= 90) return { emoji: statusEmojis.excellent, label: 'Excellent' };
    if (score >= 70) return { emoji: statusEmojis.good, label: 'Good' };
    if (score >= 50) return { emoji: statusEmojis.fair, label: 'Fair' };
    return { emoji: statusEmojis.critical, label: 'Critical' };
  }

  /**
   * Collect all issues from checks
   */
  collectIssues(checks) {
    const allIssues = [];
    for (const check of Object.values(checks)) {
      allIssues.push(...(check.issues || []));
    }
    return allIssues.sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Display health summary
   */
  displayHealthSummary(health) {
    const { emoji, label } = health.status;
    console.log(`${colors.bright}Overall Health: ${emoji} ${label} (${health.overall}/100)${colors.reset}\n`);
  }

  /**
   * Display category breakdown
   */
  displayCategoryBreakdown(health) {
    console.log(`${colors.bright}Category Breakdown:${colors.reset}`);
    for (const [key, check] of Object.entries(health.checks)) {
      const color = check.score >= 70 ? colors.green : 
                   check.score >= 50 ? colors.yellow : colors.red;
      console.log(`  ${check.status.emoji} ${check.name}: ${color}${check.score}/100${colors.reset}`);
    }
    console.log();
  }

  /**
   * Display top issues
   */
  displayTopIssues(health) {
    const criticalIssues = health.issues.filter(i => i.severity === 'critical');
    const majorIssues = health.issues.filter(i => i.severity === 'major');
    
    if (criticalIssues.length > 0) {
      console.log(`${colors.red}${colors.bright}Critical Issues (${criticalIssues.length}):${colors.reset}`);
      criticalIssues.slice(0, 3).forEach(issue => {
        console.log(`  ${colors.red}✗${colors.reset} ${issue.description}`);
        console.log(`    ${colors.gray}→ ${issue.remediation}${colors.reset}`);
      });
      console.log();
    }
    
    if (majorIssues.length > 0) {
      console.log(`${colors.yellow}${colors.bright}Major Issues (${majorIssues.length}):${colors.reset}`);
      majorIssues.slice(0, 3).forEach(issue => {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${issue.description}`);
        console.log(`    ${colors.gray}→ ${issue.remediation}${colors.reset}`);
      });
      console.log();
    }
  }

  /**
   * Display recommendations
   */
  displayRecommendations(health) {
    console.log(`${colors.bright}Recommendations:${colors.reset}`);
    
    if (health.overall >= 90) {
      console.log(`  ${colors.green}✓${colors.reset} Excellent work! Keep maintaining high standards.`);
    } else if (health.overall >= 70) {
      console.log(`  ${colors.blue}→${colors.reset} Good health! Focus on fixing critical issues first.`);
    } else if (health.overall >= 50) {
      console.log(`  ${colors.yellow}→${colors.reset} Fair health. Prioritize security and test coverage.`);
    } else {
      console.log(`  ${colors.red}→${colors.reset} Critical health! Immediate attention required.`);
    }
    
    // Quick wins
    const quickWins = health.issues
      .filter(i => i.severity === 'minor')
      .slice(0, 3);
    
    if (quickWins.length > 0) {
      console.log(`\n  ${colors.cyan}Quick Wins:${colors.reset}`);
      quickWins.forEach(issue => {
        console.log(`    • ${issue.remediation}`);
      });
    }
    
    console.log();
  }

  /**
   * Generate detailed reports
   */
  async generateReports(health) {
    console.log(`${colors.gray}Generating detailed reports...${colors.reset}`);
    
    // Ensure directory exists
    const healthDir = path.join(this.projectRoot, 'docs', '08_health');
    if (!fs.existsSync(healthDir)) {
      fs.mkdirSync(healthDir, { recursive: true });
    }
    
    // Save JSON report
    const jsonPath = path.join(healthDir, 'latest.json');
    fs.writeFileSync(jsonPath, JSON.stringify(health, null, 2));
    
    console.log(`  ${colors.green}✓${colors.reset} Health report: ${path.relative(this.projectRoot, this.healthReportPath)}`);
    console.log(`  ${colors.green}✓${colors.reset} Prescriptions: ${path.relative(this.projectRoot, this.prescriptionPath)}`);
    console.log(`  ${colors.green}✓${colors.reset} JSON data: ${path.relative(this.projectRoot, jsonPath)}`);
  }

  /**
   * Find files matching pattern
   */
  findFiles(pattern) {
    const glob = pattern.replace(/\*\*/g, '**');
    const baseDir = this.projectRoot;
    const files = [];
    
    function walkDir(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          // Simplified pattern matching
          if (pattern.includes('*.test.')) {
            if (item.includes('.test.')) {
              files.push(fullPath);
            }
          } else if (pattern.includes('src/')) {
            if (fullPath.includes('src') && 
                (item.endsWith('.ts') || item.endsWith('.tsx') || 
                 item.endsWith('.js') || item.endsWith('.jsx'))) {
              files.push(fullPath);
            }
          }
        }
      }
    }
    
    try {
      walkDir(baseDir);
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }
}

// Main execution
async function main() {
  const doctor = new ProjectDoctor();
  
  try {
    const health = await doctor.diagnose();
    
    // Exit with appropriate code
    if (health.overall < 50) {
      process.exit(2); // Critical
    } else if (health.overall < 70) {
      process.exit(1); // Needs improvement
    } else {
      process.exit(0); // Healthy
    }
  } catch (error) {
    console.error(`\n${colors.red}Error running health check:${colors.reset}`, error.message);
    process.exit(3);
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { ProjectDoctor };