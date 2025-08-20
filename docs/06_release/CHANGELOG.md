# Changelog

All notable changes to NEW PROJECT PATHWAY will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- PR Planner agent for breaking down requirements into vertical slices
- Changelog Scribe agent for automated changelog generation
- Bootstrap Wizard (Pathway Guide) for project onboarding
- Milestone planning structure in `docs/03_milestones/`
- Release documentation structure in `docs/06_release/`

## [0.2.0] - 2025-01-20

### Added
- AI Orchestrator service integration (ENH-001)
  - FastAPI Python service at `/services/ai-orchestrator`
  - POML template system for structured prompts
  - Offline mock responses for resilience
  - Docker support for containerized deployment
- Developer Pack (ENH-002)
  - `quick_start.py` for one-command setup
  - `usage_examples.py` with 8 ready-to-run examples
  - Lean vs. heavy dependency profiles
  - Comprehensive service documentation
- Feature flag system for progressive rollout
  - Simple and advanced flag configurations
  - Runtime toggle without deployment
  - Rollout percentage support
- Unit tests for critical paths
  - Feature flag tests
  - API proxy route tests
  - Mock response validation

### Changed
- Updated home page to display feature flags and system status
- Enhanced `/api/ai/generate` with automatic offline fallback
- Improved error handling with 5-second timeout
- Updated environment configuration to use Claude 4
- Increased MAX_TOKENS to 100,000 (leveraging Claude 4's capabilities)

### Fixed
- TypeScript compilation errors in configuration files
- Missing test coverage for feature flags
- API route error handling for offline scenarios

### Security
- Added environment variable validation with Zod
- Protected `.env` files from agent access
- Implemented secure proxy pattern for AI service

## [0.1.0] - 2025-01-15

### Added
- Initial Next.js 14 application with App Router
- Basic project structure and configuration
- GitHub Actions CI/CD pipeline
- Vercel deployment configuration
- PR template for consistent contributions
- Publishing scripts for Windows and Unix
- Claude Code configuration (`.claude/settings.json`)
- Documentation structure:
  - Intake process (`docs/00_intake/`)
  - Initial requirements (`docs/01_initial/`)
  - PRP documentation (`docs/02_prp/`)
  - Execution runbook (`docs/04_runbook/`)
  - Validation gates (`docs/05_validation/`)

### Changed
- Simplified CI workflow to essential checks
- Streamlined PR template for clarity

### Fixed
- Initial setup issues with TypeScript configuration
- Build errors in development environment

## [0.0.1] - 2025-01-10

### Added
- Repository initialization
- Basic README with project vision
- License file
- Git configuration

---

## Release Links

- [0.2.0](https://github.com/your-org/new-project-pathway/releases/tag/v0.2.0) - AI Integration Release
- [0.1.0](https://github.com/your-org/new-project-pathway/releases/tag/v0.1.0) - Foundation Release
- [0.0.1](https://github.com/your-org/new-project-pathway/releases/tag/v0.0.1) - Initial Commit

## Categories Guide

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes