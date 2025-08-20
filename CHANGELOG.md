# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 14 and TypeScript
- Feature flag system with runtime toggling
- Environment validation through config/env.ts
- Validation gates and automated checking
- Release automation scripts
- Claude/AI agent configurations

### Security
- Strict secret handling policy - no direct .env access
- All environment variables validated through central config

### Documentation
- Comprehensive project operating rules
- Lean templates for rapid development
- Agent runbooks for automation

## [0.1.0] - 2024-01-15

### Added
- Project scaffolding
- Basic Next.js application structure
- Initial documentation

---

## Release Types
- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features (backwards compatible)
- **Patch (0.0.X)**: Bug fixes and minor improvements

## How to Release
1. Update version in package.json
2. Move Unreleased items to new version section
3. Run `npm run release`
4. Tag and push: `git tag v0.1.0 && git push --tags`