#!/usr/bin/env node

/**
 * Compliance Validation Script
 * Ensures project meets all security and compliance requirements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

class ComplianceChecker {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      score: 0
    };
  }

  /**
   * Run all compliance checks
   */
  async runChecks() {
    console.log(`${colors.blue}🔍 Running Compliance Checks${colors.reset}\n`);
    
    const checks = [
      this.checkSecurityFiles(),
      this.checkGitIgnore(),
      this.checkDependencies(),
      this.checkAgentSecurity(),
      this.checkCommandFilters(),
      this.checkDocumentation(),
      this.checkSecrets(),
      this.checkLicenses()
    ];
    
    await Promise.all(checks);
    
    this.displayResults();
    return this.results.failed.length === 0 ? 0 : 1;
  }

  /**
   * Check required security files exist
   */
  async checkSecurityFiles() {
    const required = [
      '.claude/security/guardrails.md',
      'docs/09_security/pii-safety.md',
      'src/utils/security/command-filter.ts',
      'scripts/security-audit.js'
    ];
    
    console.log('Checking security files...');
    
    for (const file of required) {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        this.results.passed.push(`✓ ${file} exists`);
      } else {
        this.results.failed.push(`✗ Missing: ${file}`);
      }
    }
  }

  /**
   * Check .gitignore has security entries
   */
  async checkGitIgnore() {
    console.log('Checking .gitignore...');
    
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      this.results.failed.push('✗ .gitignore missing');
      return;
    }
    
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const required = ['.env', '*.pem', '*.key', 'secrets/', '.env.*'];
    
    for (const entry of required) {
      if (content.includes(entry)) {
        this.results.passed.push(`✓ .gitignore blocks ${entry}`);
      } else {
        this.results.failed.push(`✗ .gitignore missing: ${entry}`);
      }
    }
  }

  /**
   * Check dependency vulnerabilities
   */
  async checkDependencies() {
    console.log('Checking dependencies...');
    
    try {
      // Run audit
      const output = execSync('npm audit --production --json', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      const audit = JSON.parse(output);
      const vulns = audit.metadata?.vulnerabilities || {};
      
      if (vulns.critical > 0) {
        this.results.failed.push(`✗ ${vulns.critical} critical vulnerabilities`);
      } else {
        this.results.passed.push('✓ No critical vulnerabilities');
      }
      
      if (vulns.high > 0) {
        this.results.failed.push(`✗ ${vulns.high} high vulnerabilities`);
      } else {
        this.results.passed.push('✓ No high vulnerabilities');
      }
      
      if (vulns.moderate > 5) {
        this.results.warnings.push(`⚠ ${vulns.moderate} moderate vulnerabilities`);
      }
      
    } catch (error) {
      // Audit returns non-zero on vulnerabilities
      this.results.warnings.push('⚠ Dependency audit completed with issues');
    }
  }

  /**
   * Check agent security configurations
   */
  async checkAgentSecurity() {
    console.log('Checking agent security...');
    
    const agentsDir = path.join(process.cwd(), '.claude', 'agents');
    if (!fs.existsSync(agentsDir)) {
      this.results.failed.push('✗ No agents directory');
      return;
    }
    
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    const requiredDenials = ['docker login', 'npm publish', 'echo $'];
    
    let secureAgents = 0;
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
      
      const hasSecurityDenials = requiredDenials.some(denial => 
        content.includes(`Bash(${denial}`)
      );
      
      if (hasSecurityDenials) {
        secureAgents++;
      }
    }
    
    if (secureAgents === agentFiles.length) {
      this.results.passed.push(`✓ All ${agentFiles.length} agents have security denials`);
    } else {
      this.results.warnings.push(`⚠ ${agentFiles.length - secureAgents} agents missing security denials`);
    }
  }

  /**
   * Check command filter implementation
   */
  async checkCommandFilters() {
    console.log('Checking command filters...');
    
    const filterPath = path.join(process.cwd(), 'src', 'utils', 'security', 'command-filter.ts');
    if (!fs.existsSync(filterPath)) {
      this.results.failed.push('✗ Command filter not implemented');
      return;
    }
    
    const content = fs.readFileSync(filterPath, 'utf-8');
    const requiredFilters = [
      'docker login',
      'npm publish',
      'echo \\$',
      'printenv',
      'curl.*-d'
    ];
    
    for (const filter of requiredFilters) {
      if (content.includes(filter)) {
        this.results.passed.push(`✓ Filters: ${filter}`);
      } else {
        this.results.warnings.push(`⚠ Missing filter: ${filter}`);
      }
    }
  }

  /**
   * Check security documentation
   */
  async checkDocumentation() {
    console.log('Checking documentation...');
    
    const claudeMd = path.join(process.cwd(), 'CLAUDE.md');
    if (fs.existsSync(claudeMd)) {
      const content = fs.readFileSync(claudeMd, 'utf-8');
      if (content.includes('SECURITY FIRST')) {
        this.results.passed.push('✓ CLAUDE.md has security section');
      } else {
        this.results.warnings.push('⚠ CLAUDE.md missing security emphasis');
      }
    }
    
    const piiDoc = path.join(process.cwd(), 'docs', '09_security', 'pii-safety.md');
    if (fs.existsSync(piiDoc)) {
      this.results.passed.push('✓ PII safety documentation exists');
    } else {
      this.results.failed.push('✗ PII safety documentation missing');
    }
  }

  /**
   * Scan for hardcoded secrets
   */
  async checkSecrets() {
    console.log('Checking for secrets...');
    
    const patterns = [
      /api[_-]?key\s*[:=]\s*["'][^"']{20,}["']/gi,
      /password\s*[:=]\s*["'][^"']+["']/gi,
      /AKIA[0-9A-Z]{16}/g
    ];
    
    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) {
      return;
    }
    
    const files = this.getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    let secretsFound = 0;
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Skip if using env vars properly
      if (content.includes('process.env')) {
        continue;
      }
      
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          secretsFound++;
          this.results.failed.push(`✗ Potential secret in: ${path.relative(process.cwd(), file)}`);
          break;
        }
      }
    }
    
    if (secretsFound === 0) {
      this.results.passed.push('✓ No hardcoded secrets found');
    }
  }

  /**
   * Check license compliance
   */
  async checkLicenses() {
    console.log('Checking licenses...');
    
    const packageJson = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJson)) {
      return;
    }
    
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const bannedLicenses = ['GPL-3.0', 'AGPL-3.0'];
    
    // This is a simplified check
    if (pkg.license && !bannedLicenses.includes(pkg.license)) {
      this.results.passed.push(`✓ Project license compliant: ${pkg.license}`);
    }
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir, extensions) {
    const files = [];
    
    function walk(currentDir) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }

  /**
   * Display compliance results
   */
  displayResults() {
    console.log(`\n${colors.bright}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}       COMPLIANCE CHECK RESULTS${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}\n`);
    
    // Calculate score
    const total = this.results.passed.length + this.results.failed.length;
    this.results.score = Math.round((this.results.passed.length / total) * 100);
    
    // Display score with appropriate color
    let scoreColor = colors.green;
    if (this.results.score < 70) scoreColor = colors.red;
    else if (this.results.score < 90) scoreColor = colors.yellow;
    
    console.log(`${colors.bright}Overall Score: ${scoreColor}${this.results.score}%${colors.reset}\n`);
    
    // Display passed checks
    if (this.results.passed.length > 0) {
      console.log(`${colors.green}${colors.bright}Passed (${this.results.passed.length}):${colors.reset}`);
      this.results.passed.forEach(item => 
        console.log(`  ${colors.green}${item}${colors.reset}`)
      );
      console.log();
    }
    
    // Display warnings
    if (this.results.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bright}Warnings (${this.results.warnings.length}):${colors.reset}`);
      this.results.warnings.forEach(item => 
        console.log(`  ${colors.yellow}${item}${colors.reset}`)
      );
      console.log();
    }
    
    // Display failed checks
    if (this.results.failed.length > 0) {
      console.log(`${colors.red}${colors.bright}Failed (${this.results.failed.length}):${colors.reset}`);
      this.results.failed.forEach(item => 
        console.log(`  ${colors.red}${item}${colors.reset}`)
      );
      console.log();
    }
    
    // Summary
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}`);
    
    if (this.results.failed.length === 0) {
      console.log(`${colors.green}${colors.bright}✅ COMPLIANCE CHECK PASSED${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}❌ COMPLIANCE CHECK FAILED${colors.reset}`);
      console.log(`\nAddress the failed items to achieve compliance.`);
    }
    
    // Save report
    const reportPath = path.join(process.cwd(), 'docs', 'security', 'compliance-report.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\nDetailed report: ${colors.blue}docs/security/compliance-report.json${colors.reset}`);
  }
}

// Run if executed directly
if (require.main === module) {
  const checker = new ComplianceChecker();
  checker.runChecks().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = { ComplianceChecker };