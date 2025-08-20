# Release Ready Check (PowerShell)
# Quick verification that all release requirements are met

$ErrorActionPreference = "Continue"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "RELEASE READINESS CHECK" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$AllReady = $true

# 1. CI Status
Write-Host -NoNewline "CI Status: "
if (Get-Command gh -ErrorAction SilentlyContinue) {
    $ciStatus = gh pr checks 2>&1
    if ($ciStatus -match "fail") {
        Write-Host "❌ FAILING" -ForegroundColor Red
        $AllReady = $false
    } else {
        Write-Host "✅ Passing" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Cannot verify (gh CLI not installed)" -ForegroundColor Yellow
}

# 2. Feature Flags  
Write-Host -NoNewline "Feature Flags: "
$flagsContent = Get-Content "src\config\flags.ts" -ErrorAction SilentlyContinue
if ($flagsContent -match "enabled:\s*true") {
    Write-Host "❌ Some flags are ON (should be OFF)" -ForegroundColor Red
    $AllReady = $false
} else {
    Write-Host "✅ All OFF" -ForegroundColor Green
}

# 3. Changelog
Write-Host -NoNewline "Changelog: "
if (Test-Path "CHANGELOG.md") {
    $changelogAge = (Get-Date) - (Get-Item "CHANGELOG.md").LastWriteTime
    if ($changelogAge.Days -lt 1) {
        Write-Host "✅ Updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not recently updated" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Missing" -ForegroundColor Red
    $AllReady = $false
}

# 4. Rollback Plan
Write-Host -NoNewline "Rollback Plan: "
if (Test-Path "docs\06_release\rollback-plan.md") {
    Write-Host "✅ Ready" -ForegroundColor Green
} else {
    Write-Host "❌ Missing" -ForegroundColor Red
    $AllReady = $false
}

# 5. Validation Gates
Write-Host -NoNewline "Validation Gates: "
$validationResult = npm run validate:quick 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Passing" -ForegroundColor Green
} else {
    Write-Host "❌ Failing" -ForegroundColor Red
    $AllReady = $false
}

# 6. Git Status
Write-Host -NoNewline "Git Status: "
$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "✅ Clean" -ForegroundColor Green
} else {
    Write-Host "⚠️  Uncommitted changes" -ForegroundColor Yellow
}

# 7. Environment Check
Write-Host -NoNewline "Environment: "
if (Test-Path ".env") {
    Write-Host "✅ Configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file (may be intentional)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
if ($AllReady) {
    Write-Host "✅ READY TO RELEASE" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Run: npm run release"
    Write-Host "2. Monitor metrics after deployment"
    Write-Host "3. Enable feature flags gradually"
    exit 0
} else {
    Write-Host "❌ NOT READY" -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Fix the issues above before releasing."
    exit 1
}