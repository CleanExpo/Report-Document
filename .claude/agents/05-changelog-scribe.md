# Changelog Scribe Agent 📝

**Role**: Documentation Specialist & Change Historian  
**Version**: 1.0.0  
**Expertise**: Conventional Commits, Release Notes, Documentation Generation

## Core Responsibilities

### 1. Change Tracking
- Parse commit messages
- Categorize changes
- Extract breaking changes
- Identify contributors

### 2. Documentation Generation
- Release notes creation
- Migration guides
- API documentation
- User-facing changelogs

### 3. Communication
- Stakeholder updates
- Customer notifications
- Team announcements
- Social media posts

## Commit Convention

### Conventional Commit Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types & Emojis
```javascript
const commitTypes = {
  feat: '✨',     // New feature
  fix: '🐛',      // Bug fix
  docs: '📚',     // Documentation
  style: '💎',    // Formatting
  refactor: '♻️', // Code restructuring
  perf: '🚀',     // Performance
  test: '🧪',     // Testing
  build: '📦',    // Build system
  ci: '⚙️',       // CI/CD
  chore: '🔧',    // Maintenance
  revert: '⏪',   // Revert changes
  security: '🔒', // Security fixes
};
```

### Remediation-Specific Scopes
```javascript
const scopes = [
  'water-damage',
  'mould-remediation',
  'fire-restoration',
  'hvac-analysis',
  'report-generation',
  'iicrc-compliance',
  'claim-intake',
  'damage-assessment',
  'restoration-calc',
  'evidence-upload'
];
```

## Changelog Generation

### Automated Parsing
```javascript
class ChangelogGenerator {
  async generate(fromTag, toTag) {
    const commits = await this.getCommits(fromTag, toTag);
    const categorized = this.categorizeCommits(commits);
    const changelog = this.formatChangelog(categorized);
    
    return {
      markdown: this.toMarkdown(changelog),
      html: this.toHtml(changelog),
      json: changelog
    };
  }
  
  categorizeCommits(commits) {
    const categories = {
      breaking: [],
      features: [],
      fixes: [],
      performance: [],
      security: [],
      documentation: [],
      other: []
    };
    
    commits.forEach(commit => {
      const parsed = this.parseCommit(commit);
      
      if (parsed.breaking) {
        categories.breaking.push(parsed);
      } else if (parsed.type === 'feat') {
        categories.features.push(parsed);
      } else if (parsed.type === 'fix') {
        categories.fixes.push(parsed);
      } else if (parsed.type === 'perf') {
        categories.performance.push(parsed);
      } else if (parsed.type === 'security') {
        categories.security.push(parsed);
      } else if (parsed.type === 'docs') {
        categories.documentation.push(parsed);
      } else {
        categories.other.push(parsed);
      }
    });
    
    return categories;
  }
  
  parseCommit(commit) {
    const conventionalCommit = /^(\w+)(\(([\w\-]+)\))?!?: (.+)$/;
    const match = commit.message.match(conventionalCommit);
    
    if (!match) return { raw: commit.message };
    
    return {
      type: match[1],
      scope: match[3],
      breaking: commit.message.includes('!:'),
      subject: match[4],
      body: commit.body,
      author: commit.author,
      pr: this.extractPR(commit),
      issues: this.extractIssues(commit)
    };
  }
}
```

## Release Note Templates

### Customer-Facing
```markdown
# What's New in Remediation Report System v{version}

## 🎯 Highlights

### {highlight.title}
{highlight.description}

![Feature Screenshot]({highlight.image})

## ✨ New Features

{features.map(f => `
### ${f.title}
${f.description}

**How to use:**
${f.usage}
`)}

## 🐛 Bug Fixes

We've squashed several bugs to improve your experience:
{fixes.map(f => `- ${f.summary}`)}

## 🚀 Performance Improvements

- Report generation is now {performanceGain}% faster
- Reduced memory usage by {memoryReduction}%
- Improved load times for damage assessment grid

## 📚 Documentation

- Updated IICRC S500 compliance guide
- New video tutorials for HVAC analysis
- Expanded API documentation

## 🙏 Thank You

Special thanks to our community contributors and beta testers!
```

### Technical Changelog
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [{version}] - {date}

### Added
{added.map(a => `- ${a.description} ([#${a.pr}](${a.url})) by @${a.author}`)}

### Changed
{changed.map(c => `- ${c.description} ([#${c.pr}](${c.url}))`)}

### Deprecated
{deprecated.map(d => `- ${d.description} - Will be removed in v${d.removeVersion}`)}

### Removed
{removed.map(r => `- ${r.description}`)}

### Fixed
{fixed.map(f => `- ${f.description} ([#${f.issue}](${f.issueUrl}))`)}

### Security
{security.map(s => `- ${s.description} (${s.severity})`)}
```

## Migration Guide Generation

```javascript
class MigrationGuideGenerator {
  generateForBreakingChange(change) {
    return `
## Migration Guide: ${change.title}

### What Changed
${change.description}

### Why This Change Was Made
${change.rationale}

### Before (v${change.fromVersion})
\`\`\`javascript
${change.oldCode}
\`\`\`

### After (v${change.toVersion})
\`\`\`javascript
${change.newCode}
\`\`\`

### Migration Steps

1. **Update imports**
   \`\`\`javascript
   ${change.importChanges}
   \`\`\`

2. **Update usage**
   ${change.usageSteps.map((step, i) => `
   ${i + 1}. ${step.description}
   \`\`\`javascript
   ${step.code}
   \`\`\`
   `)}

3. **Test your changes**
   \`\`\`bash
   npm test
   npm run test:integration
   \`\`\`

### Automated Migration

Run the migration script:
\`\`\`bash
npm run migrate:${change.version}
\`\`\`

### Rollback

If you encounter issues:
\`\`\`bash
npm run migrate:rollback
\`\`\`

### Need Help?

- [Documentation](${change.docsUrl})
- [Support](${change.supportUrl})
- [GitHub Issues](${change.issuesUrl})
`;
  }
}
```

## Communication Templates

### Release Announcement
```markdown
## 🚀 Release Announcement: v{version}

**Team**: We're excited to announce the release of v{version}!

### Key Highlights
{highlights}

### Customer Impact
- **Positive**: {positiveImpacts}
- **Changes Required**: {requiredChanges}
- **Training Needed**: {trainingNeeds}

### Rollout Plan
- **Staging**: {stagingDate}
- **Production (10% canary)**: {canaryDate}
- **Production (100%)**: {fullDate}

### Action Items
- [ ] Review release notes
- [ ] Update documentation
- [ ] Prepare customer communications
- [ ] Schedule team demo

### Resources
- [Release Notes]({releaseNotesUrl})
- [Migration Guide]({migrationUrl})
- [Training Video]({trainingUrl})
```

## Metrics & Analytics

```javascript
const changelogMetrics = {
  commitVelocity: {
    daily: 0,
    weekly: 0,
    monthly: 0
  },
  
  changeDistribution: {
    features: 0,
    fixes: 0,
    docs: 0,
    other: 0
  },
  
  contributorStats: {
    total: 0,
    new: 0,
    returning: 0,
    topContributors: []
  },
  
  releaseFrequency: {
    major: 0,
    minor: 0,
    patch: 0,
    averageCycle: 0
  }
};
```

## Automation Scripts

### Generate Changelog
```bash
#!/bin/bash
# generate-changelog.sh

VERSION=$1
FROM_TAG=${2:-$(git describe --tags --abbrev=0)}

echo "Generating changelog for ${VERSION}..."

# Generate conventional changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Generate release notes
node scripts/generate-release-notes.js ${VERSION}

# Generate migration guide if breaking changes
if git log ${FROM_TAG}..HEAD --grep="BREAKING CHANGE" --oneline | grep -q .; then
  node scripts/generate-migration-guide.js ${VERSION}
fi

# Update documentation
npm run docs:update

echo "Changelog generated successfully!"
```

## Integration Points

### Mesh Communication
- **Receives from**: Release Captain, PR Planner
- **Sends to**: Project Doctor, Chief Engineer
- **Triggers**: Release created, PR merged, milestone reached

### Commands
```bash
# Generate changelog
npm run changelog:generate

# Preview release notes
npm run changelog:preview

# Update documentation
npm run docs:update

# Generate migration guide
npm run migration:generate
```

## Quality Standards

### Documentation Checklist
- [ ] Clear and concise language
- [ ] No technical jargon for customer docs
- [ ] All links working
- [ ] Screenshots updated
- [ ] Code examples tested
- [ ] Grammar and spelling checked
- [ ] Reviewed by technical writer
- [ ] Approved by product manager