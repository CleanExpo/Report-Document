#!/usr/bin/env node

/**
 * Update all agent configurations with security guardrails
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');
const SECURITY_DENIALS = [
  'Bash(docker login:*)',
  'Bash(npm publish:*)', 
  'Bash(echo $*)',
  'Bash(printenv:*)',
  'Bash(curl -d:*)',
  'Bash(cat *.env:*)',
  'Bash(cat *secret*:*)'
];

function updateAgentConfig(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse YAML frontmatter
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!yamlMatch) {
    console.log(`  Skipping ${path.basename(filePath)} - no frontmatter`);
    return false;
  }
  
  const yaml = yamlMatch[1];
  const rest = content.substring(yamlMatch[0].length);
  
  // Check if deny list exists
  const denyMatch = yaml.match(/deny:\s*\[(.*?)\]/);
  
  let updatedYaml;
  if (denyMatch) {
    // Parse existing denials
    const existingDenials = denyMatch[1]
      .split(',')
      .map(d => d.trim().replace(/['"]/g, ''))
      .filter(Boolean);
    
    // Add security denials if not present
    const allDenials = [...new Set([...existingDenials, ...SECURITY_DENIALS])];
    
    // Format deny list
    const denyList = allDenials.map(d => `"${d}"`).join(', ');
    
    updatedYaml = yaml.replace(
      /deny:\s*\[.*?\]/,
      `deny: [${denyList}]`
    );
  } else {
    // Add deny section after ask or allow
    const insertPoint = yaml.match(/ask:\s*\[.*?\]/);
    if (insertPoint) {
      const denyList = SECURITY_DENIALS.map(d => `"${d}"`).join(', ');
      updatedYaml = yaml.replace(
        insertPoint[0],
        `${insertPoint[0]}\n  deny: [${denyList}]`
      );
    } else {
      console.log(`  Warning: ${path.basename(filePath)} - no permissions section`);
      return false;
    }
  }
  
  // Write updated content
  const updatedContent = `---\n${updatedYaml}\n---${rest}`;
  fs.writeFileSync(filePath, updatedContent);
  
  return true;
}

function main() {
  console.log('🔒 Updating agent security configurations...\n');
  
  // Get all agent files
  const agentFiles = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(AGENTS_DIR, f));
  
  console.log(`Found ${agentFiles.length} agent configurations\n`);
  
  let updated = 0;
  for (const file of agentFiles) {
    console.log(`Processing: ${path.basename(file)}`);
    if (updateAgentConfig(file)) {
      updated++;
      console.log(`  ✓ Updated with security denials`);
    }
    console.log();
  }
  
  console.log(`\n✅ Updated ${updated}/${agentFiles.length} agent configurations`);
  console.log('\nSecurity denials added:');
  SECURITY_DENIALS.forEach(d => console.log(`  • ${d}`));
}

if (require.main === module) {
  main();
}

module.exports = { updateAgentConfig };