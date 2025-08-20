# Ship Script - Automated deployment pipeline (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🚢 Starting ship process..." -ForegroundColor Cyan

# 1. Run validation gates
Write-Host "📋 Running validation gates..." -ForegroundColor Yellow
npm run validate:full
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Validation failed" -ForegroundColor Red
    exit 1
}

# 2. Run health check
Write-Host "🏥 Running health check..." -ForegroundColor Yellow
npm run health:check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}

# 3. Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# 4. Run smoke tests
Write-Host "🔥 Running smoke tests..." -ForegroundColor Yellow
npm run test:smoke
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Smoke tests failed - continuing" -ForegroundColor DarkYellow
}

# 5. Check git status
Write-Host "📦 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ Uncommitted changes detected" -ForegroundColor DarkYellow
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne 'y') {
        exit 1
    }
}

# 6. Deploy based on branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "🌿 Current branch: $branch" -ForegroundColor Green

if ($branch -eq "main" -or $branch -eq "master") {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    npm run deploy:production
}
elseif ($branch -eq "staging") {
    Write-Host "🎭 Deploying to staging..." -ForegroundColor Cyan
    npm run deploy:staging
}
else {
    Write-Host "🔬 Creating preview deployment..." -ForegroundColor Cyan
    Write-Host "Preview URL will be available after deployment"
}

# 7. Post-deployment validation
Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Post-deployment checklist:" -ForegroundColor Yellow
Write-Host "  □ Check deployment URL"
Write-Host "  □ Run E2E tests against deployed environment"
Write-Host "  □ Monitor error rates"
Write-Host "  □ Check performance metrics"
Write-Host ""

# 8. Update changelog
Write-Host "📝 Don't forget to update the changelog!" -ForegroundColor Yellow
Write-Host "Run: npm run changelog:generate"

Write-Host "`n✨ Ship complete!" -ForegroundColor Green