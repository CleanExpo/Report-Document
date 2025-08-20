# Release Documentation

This directory contains changelogs, release notes, and version history for NEW PROJECT PATHWAY.

## Structure

```
06_release/
├── README.md           # This file
├── CHANGELOG.md       # Complete changelog (Keep a Changelog format)
├── release-notes.md   # Current release notes
├── archive/           # Historical releases
│   ├── v0.1.0.md
│   └── v0.2.0.md
└── templates/         # Release templates
    ├── major-release.md
    ├── minor-release.md
    └── patch-release.md
```

## Using the Changelog Scribe

### Automatic Generation
1. Select "Changelog Scribe" agent in Claude Code
2. Command: "Generate changelog from recent PRs"
3. Review and approve the generated content

### Manual Update
1. After merging PRs, run:
   ```
   "Update changelog for PR #25"
   ```
2. For releases:
   ```
   "Create release notes for v0.2.0"
   ```

## Changelog Format

We follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

Format: `MAJOR.MINOR.PATCH` (e.g., 1.2.3)

## Release Process

### 1. Prepare Release
```bash
# Update version in package.json
npm version minor  # or major/patch

# Generate changelog
# Use Changelog Scribe agent
```

### 2. Create Release PR
```bash
git checkout -b release/v0.2.0
git add -A
git commit -m "chore: prepare release v0.2.0"
./scripts/publish.sh "chore: release v0.2.0"
```

### 3. Tag Release
```bash
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin v0.2.0
```

### 4. Create GitHub Release
```bash
gh release create v0.2.0 \
  --title "v0.2.0 - AI Integration" \
  --notes-file docs/06_release/release-notes.md
```

## Commit Message Convention

For automatic changelog generation:

- `feat:` New feature → Added
- `fix:` Bug fix → Fixed
- `docs:` Documentation → (usually omitted)
- `style:` Formatting → (usually omitted)
- `refactor:` Code change → Changed
- `perf:` Performance → Changed
- `test:` Tests → (usually omitted)
- `chore:` Maintenance → (usually omitted)
- `BREAKING CHANGE:` → Breaking Changes section

## Example Changelog Entry

```markdown
## [0.2.0] - 2025-01-20
### Added
- AI Orchestrator service for intelligent assistance (#12)
- Feature flag system for progressive rollout (#13)
- Offline mock responses when AI service unavailable (#14)

### Changed
- Updated home page to display active feature flags (#15)
- Improved error handling in API proxy routes (#16)

### Fixed
- TypeScript compilation errors in config files (#17)
- Missing test coverage for critical paths (#18)

### Security
- Added environment variable validation with Zod (#19)
```

## Release Notes Template

See `templates/minor-release.md` for the standard format.

Key sections:
1. **Highlights** - 3-5 bullet points
2. **What's New** - Feature details
3. **Improvements** - Enhancements
4. **Bug Fixes** - Fixed issues
5. **Breaking Changes** - If any
6. **Contributors** - Credits

## Automation

The Changelog Scribe agent can:
- Parse git history
- Extract PR information
- Categorize changes
- Generate formatted output
- Update multiple files
- Archive old releases

## Best Practices

1. **Update on PR Merge**: Keep changelog current
2. **Review Before Release**: Ensure accuracy
3. **Credit Contributors**: Include GitHub usernames
4. **Link PRs**: Reference with #number
5. **Highlight Breaking Changes**: Make them obvious
6. **Include Migration Guides**: For breaking changes
7. **Test Documentation**: Verify all links work

## Quick Commands

Generate full changelog:
```
"Generate complete changelog from git history"
```

Update for specific PR:
```
"Add PR #30 to changelog"
```

Prepare release:
```
"Prepare release notes for v0.3.0"
```

Archive old release:
```
"Archive release notes for v0.2.0"
```