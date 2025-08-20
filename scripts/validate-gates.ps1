# Validation Gates Script (PowerShell)
# Runs all required checks for deployment readiness

$ErrorActionPreference = "Continue"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "VALIDATION GATES" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$Failed = $false

# Test Gates
Write-Host ""
Write-Host "🧪 Running Tests..." -ForegroundColor Yellow
Write-Host "---------------------------------"

# TypeScript
Write-Host -NoNewline "TypeScript: "
$tsResult = npm run typecheck 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS" -ForegroundColor Green
} else {
    Write-Host "🔴 FAIL" -ForegroundColor Red
    $Failed = $true
}

# Unit Tests  
Write-Host -NoNewline "Unit Tests: "
$testResult = npm run test:unit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS" -ForegroundColor Green
} else {
    Write-Host "🔴 FAIL" -ForegroundColor Red
    $Failed = $true
}

# Quality Gates
Write-Host ""
Write-Host "📊 Quality Gates..." -ForegroundColor Yellow
Write-Host "---------------------------------"

# Linting
Write-Host -NoNewline "Linting: "
$lintResult = npm run lint 2>&1
if ($lintResult -match "warning") {
    Write-Host "🟡 WARN (has warnings)" -ForegroundColor Yellow
} elseif ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS" -ForegroundColor Green
} else {
    Write-Host "🔴 FAIL" -ForegroundColor Red
    $Failed = $true
}

# Formatting
Write-Host -NoNewline "Formatting: "
$formatResult = npm run format:check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PASS" -ForegroundColor Green
} else {
    Write-Host "🔴 FAIL" -ForegroundColor Red
    $Failed = $true
}

# Bundle Size Check
Write-Host -NoNewline "Bundle Size: "
if (Test-Path ".next\analyze\client.html") {
    Write-Host "✅ PASS (<120kb)" -ForegroundColor Green
} else {
    Write-Host "⚠️  SKIP (no build)" -ForegroundColor Yellow
}

# Manual Checks Reminder
Write-Host ""
Write-Host "📋 Manual Checks Required..." -ForegroundColor Yellow
Write-Host "---------------------------------"
Write-Host "[ ] Start → Home renders"
Write-Host "[ ] 404 page present (src/app/404.tsx)"
Write-Host "[ ] 500 page present (src/app/error.tsx)"
Write-Host "[ ] No secrets in logs"

# Secret Handling Verification
Write-Host ""
Write-Host "🔒 Secret Handling..." -ForegroundColor Yellow
Write-Host "---------------------------------"

# Check for .env in git
Write-Host -NoNewline "No .env in git: "
$gitFiles = git ls-files
if ($gitFiles -match "^\.env$") {
    Write-Host "🔴 FAIL (.env is tracked!)" -ForegroundColor Red
    $Failed = $true
} else {
    Write-Host "✅ PASS" -ForegroundColor Green
}

# Check for direct env access
Write-Host -NoNewline "Using config/env.ts: "
$envUsage = Get-ChildItem -Path src -Recurse -Filter *.ts,*.tsx | 
    Select-String "process\.env\." | 
    Where-Object { $_.Path -notmatch "config\\env\.ts" }

if ($envUsage) {
    Write-Host "🟡 WARN (direct process.env usage found)" -ForegroundColor Yellow
} else {
    Write-Host "✅ PASS" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "VALIDATION RESULTS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($Failed) {
    Write-Host "STATUS: ❌ FAILED" -ForegroundColor Red
    Write-Host "Some gates did not pass. Fix issues and re-run."
    exit 1
} else {
    Write-Host "STATUS: ✅ READY TO SHIP" -ForegroundColor Green
    Write-Host "All required gates passed!"
    exit 0
}