#!/usr/bin/env node

/**
 * Env Doctor - Reports on environment variable health
 * Only validates truly required keys and optional profiles
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Core required environment variables (always needed)
const REQUIRED_VARS = {
  NODE_ENV: {
    description: 'Environment mode',
    valid: ['development', 'test', 'production'],
    default: 'development'
  },
  NEXT_PUBLIC_APP_NAME: {
    description: 'Application name',
    example: 'My App'
  },
  AI_SERVICE_URL: {
    description: 'AI service endpoint',
    default: 'http://localhost:5051',
    optional: true // Can work with mock
  }
};

// Optional environment profiles (only validate if ANY key from profile exists)
const OPTIONAL_PROFILES = {
  supabase: {
    description: 'Supabase database',
    keys: {
      NEXT_PUBLIC_SUPABASE_URL: {
        description: 'Supabase project URL',
        pattern: /^https:\/\/.*\.supabase\.co$/
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        description: 'Supabase anonymous key',
        pattern: /^eyJ/
      }
    }
  },
  auth: {
    description: 'NextAuth authentication',
    keys: {
      NEXTAUTH_SECRET: {
        description: 'NextAuth secret key',
        minLength: 32
      },
      NEXTAUTH_URL: {
        description: 'NextAuth callback URL',
        pattern: /^https?:\/\//
      }
    }
  },
  database: {
    description: 'Database connection',
    keys: {
      DATABASE_URL: {
        description: 'Database connection string',
        pattern: /^(postgresql|mysql|sqlite):\/\//
      }
    }
  },
  analytics: {
    description: 'Google Analytics',
    keys: {
      NEXT_PUBLIC_GA_ID: {
        description: 'Google Analytics ID',
        pattern: /^(UA-|G-)/
      }
    }
  },
  stripe: {
    description: 'Stripe payments',
    keys: {
      STRIPE_SECRET_KEY: {
        description: 'Stripe secret key',
        pattern: /^sk_(test|live)_/
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        description: 'Stripe publishable key',
        pattern: /^pk_(test|live)_/
      }
    }
  }
};

class EnvDoctor {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.envExamplePath = path.join(process.cwd(), '.env.example');
    this.env = this.loadEnv();
    this.results = {
      required: { passed: [], failed: [], warnings: [] },
      profiles: {},
      health: 'UNKNOWN',
      score: 0
    };
  }

  /**
   * Load environment variables
   */
  loadEnv() {
    // Start with process.env
    const env = { ...process.env };
    
    // Try to load .env file
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          env[key] = value;
        }
      });
    }
    
    return env;
  }

  /**
   * Run the diagnosis
   */
  diagnose() {
    console.log(`\n${colors.cyan}${colors.bright}🩺 Environment Doctor${colors.reset}\n`);
    
    this.checkRequired();
    this.checkProfiles();
    this.calculateHealth();
    this.displayResults();
    this.generateRecommendations();
    
    return this.results.health === 'HEALTHY' ? 0 : 1;
  }

  /**
   * Check required variables
   */
  checkRequired() {
    console.log(`${colors.bright}Checking Required Variables...${colors.reset}\n`);
    
    for (const [key, config] of Object.entries(REQUIRED_VARS)) {
      const value = this.env[key];
      
      if (!value && !config.optional && !config.default) {
        this.results.required.failed.push({
          key,
          reason: 'Not set',
          ...config
        });
        console.log(`  ${colors.red}✗${colors.reset} ${key}: Missing (required)`);
      } else if (!value && config.default) {
        this.results.required.warnings.push({
          key,
          reason: `Using default: ${config.default}`,
          ...config
        });
        console.log(`  ${colors.yellow}⚠${colors.reset} ${key}: Using default (${config.default})`);
      } else if (value && config.valid && !config.valid.includes(value)) {
        this.results.required.warnings.push({
          key,
          reason: `Invalid value: ${value}`,
          ...config
        });
        console.log(`  ${colors.yellow}⚠${colors.reset} ${key}: Invalid (${value})`);
      } else {
        this.results.required.passed.push({ key, value: '***SET***' });
        console.log(`  ${colors.green}✓${colors.reset} ${key}: Set`);
      }
    }
    
    console.log();
  }

  /**
   * Check optional profiles
   */
  checkProfiles() {
    console.log(`${colors.bright}Checking Optional Profiles...${colors.reset}\n`);
    
    for (const [profileName, profile] of Object.entries(OPTIONAL_PROFILES)) {
      const profileKeys = Object.keys(profile.keys);
      const presentKeys = profileKeys.filter(key => this.env[key]);
      
      if (presentKeys.length === 0) {
        // Profile not in use
        this.results.profiles[profileName] = {
          status: 'NOT_IN_USE',
          keys: []
        };
        console.log(`  ${colors.gray}○${colors.reset} ${profileName}: Not in use`);
      } else if (presentKeys.length === profileKeys.length) {
        // Profile fully configured
        this.results.profiles[profileName] = {
          status: 'ACTIVE',
          keys: presentKeys
        };
        console.log(`  ${colors.green}✓${colors.reset} ${profileName}: Active (${presentKeys.length}/${profileKeys.length} keys)`);
      } else {
        // Profile partially configured (problem!)
        const missingKeys = profileKeys.filter(key => !this.env[key]);
        this.results.profiles[profileName] = {
          status: 'INCOMPLETE',
          keys: presentKeys,
          missing: missingKeys
        };
        console.log(`  ${colors.red}✗${colors.reset} ${profileName}: Incomplete (${presentKeys.length}/${profileKeys.length} keys)`);
        missingKeys.forEach(key => {
          console.log(`      Missing: ${key}`);
        });
      }
    }
    
    console.log();
  }

  /**
   * Calculate overall health
   */
  calculateHealth() {
    const requiredOk = this.results.required.failed.length === 0;
    const profilesOk = !Object.values(this.results.profiles).some(p => p.status === 'INCOMPLETE');
    
    if (requiredOk && profilesOk) {
      this.results.health = 'HEALTHY';
      this.results.score = 100;
    } else if (requiredOk) {
      this.results.health = 'DEGRADED';
      this.results.score = 75;
    } else {
      this.results.health = 'UNHEALTHY';
      this.results.score = 25;
    }
  }

  /**
   * Display results
   */
  displayResults() {
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}           DIAGNOSIS COMPLETE${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════${colors.reset}\n`);
    
    const healthColor = 
      this.results.health === 'HEALTHY' ? colors.green :
      this.results.health === 'DEGRADED' ? colors.yellow :
      colors.red;
    
    console.log(`Overall Health: ${healthColor}${colors.bright}${this.results.health}${colors.reset} (${this.results.score}/100)\n`);
    
    // Summary
    const requiredTotal = Object.keys(REQUIRED_VARS).length;
    const requiredPassed = this.results.required.passed.length;
    
    console.log(`${colors.bright}Required Variables:${colors.reset}`);
    console.log(`  ✓ Passed: ${requiredPassed}/${requiredTotal}`);
    if (this.results.required.failed.length > 0) {
      console.log(`  ✗ Failed: ${this.results.required.failed.length}`);
    }
    if (this.results.required.warnings.length > 0) {
      console.log(`  ⚠ Warnings: ${this.results.required.warnings.length}`);
    }
    
    console.log(`\n${colors.bright}Optional Profiles:${colors.reset}`);
    const activeProfiles = Object.entries(this.results.profiles)
      .filter(([, p]) => p.status === 'ACTIVE')
      .map(([name]) => name);
    
    if (activeProfiles.length > 0) {
      console.log(`  Active: ${activeProfiles.join(', ')}`);
    } else {
      console.log(`  None active (minimal configuration)`);
    }
    
    const incompleteProfiles = Object.entries(this.results.profiles)
      .filter(([, p]) => p.status === 'INCOMPLETE')
      .map(([name]) => name);
    
    if (incompleteProfiles.length > 0) {
      console.log(`  ${colors.red}Incomplete: ${incompleteProfiles.join(', ')}${colors.reset}`);
    }
    
    console.log();
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log(`${colors.bright}Recommendations:${colors.reset}\n`);
    
    if (this.results.health === 'HEALTHY') {
      console.log(`  ${colors.green}✓${colors.reset} Environment is healthy!`);
      console.log(`  ${colors.green}✓${colors.reset} Minimal configuration achieved`);
      
      if (Object.values(this.results.profiles).every(p => p.status === 'NOT_IN_USE')) {
        console.log(`  ${colors.green}✓${colors.reset} No optional profiles - excellent!`);
      }
    } else {
      // Required fixes
      if (this.results.required.failed.length > 0) {
        console.log(`  ${colors.red}Critical:${colors.reset} Set these required variables:`);
        this.results.required.failed.forEach(item => {
          console.log(`    • ${item.key}=${item.example || item.default || 'your-value'}`);
        });
        console.log();
      }
      
      // Profile fixes
      const incomplete = Object.entries(this.results.profiles)
        .filter(([, p]) => p.status === 'INCOMPLETE');
      
      if (incomplete.length > 0) {
        console.log(`  ${colors.yellow}Important:${colors.reset} Complete these profiles or remove their keys:`);
        incomplete.forEach(([name, profile]) => {
          console.log(`    • ${name}: Add ${profile.missing.join(', ')}`);
        });
        console.log();
      }
    }
    
    // Generate .env.example if needed
    if (!fs.existsSync(this.envExamplePath)) {
      this.generateEnvExample();
      console.log(`  ${colors.cyan}ℹ${colors.reset} Generated .env.example with minimal configuration`);
    }
    
    console.log();
  }

  /**
   * Generate .env.example file
   */
  generateEnvExample() {
    let content = '# Minimal Required Environment Variables\n\n';
    
    // Add required vars
    for (const [key, config] of Object.entries(REQUIRED_VARS)) {
      content += `# ${config.description}\n`;
      if (config.valid) {
        content += `# Valid: ${config.valid.join(', ')}\n`;
      }
      if (config.default) {
        content += `${key}=${config.default}\n`;
      } else {
        content += `${key}=${config.example || ''}\n`;
      }
      content += '\n';
    }
    
    content += '\n# ─────────────────────────────────────────\n';
    content += '# Optional Profiles (uncomment if needed)\n';
    content += '# ─────────────────────────────────────────\n\n';
    
    // Add optional profiles (commented out)
    for (const [profileName, profile] of Object.entries(OPTIONAL_PROFILES)) {
      content += `# ${profile.description}\n`;
      for (const [key, keyConfig] of Object.entries(profile.keys)) {
        content += `# ${keyConfig.description}\n`;
        content += `# ${key}=\n`;
      }
      content += '\n';
    }
    
    fs.writeFileSync(this.envExamplePath, content);
  }
}

// Run if executed directly
if (require.main === module) {
  const doctor = new EnvDoctor();
  const exitCode = doctor.diagnose();
  process.exit(exitCode);
}

module.exports = { EnvDoctor };