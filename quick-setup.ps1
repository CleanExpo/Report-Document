# Ultra-Simple Setup - Just paste the GitHub URL and go!
param([string]$GitHubUrl)

Clear-Host
Write-Host @"
🚀 NEW PROJECT PATHWAY - Quick Setup
═══════════════════════════════════════════

"@ -ForegroundColor Cyan

# If no URL provided, ask for it
if (-not $GitHubUrl) {
    Write-Host "📝 Paste your GitHub repo URL (or press Enter to use template):" -ForegroundColor Yellow
    $GitHubUrl = Read-Host
    if (-not $GitHubUrl) {
        $GitHubUrl = "https://github.com/yourusername/new-project-pathway"
    }
}

# Extract project name from URL
$projectName = ($GitHubUrl -split '/')[-1] -replace '\.git$', ''

Write-Host "`n✨ Setting up: $projectName" -ForegroundColor Green

# One-command setup
if (-not (Test-Path $projectName)) { 
    mkdir $projectName 
}
cd $projectName
git clone $GitHubUrl . 2>$null
if ($LASTEXITCODE -ne 0) {
    git init
    git remote add origin $GitHubUrl
    git fetch origin
    git checkout origin/main -- .
}
Remove-Item -Force -Recurse .git -ErrorAction SilentlyContinue
git init -b main

# Auto-install
Write-Host "📦 Installing..." -ForegroundColor Yellow
npm install --silent

# Auto-configure
"NODE_ENV=development
NEXT_PUBLIC_APP_NAME=$projectName
AI_SERVICE_URL=http://localhost:5051" | Out-File .env

# Auto-start
Write-Host "`n✅ Ready! Opening Claude Code..." -ForegroundColor Green
Write-Host "   Select: Pathway Guide" -ForegroundColor Cyan
Write-Host "   Then paste the BUILD PROMPT" -ForegroundColor Cyan
Start-Sleep -Seconds 2

# Copy prompt to clipboard
Get-Content docs/10_prompts/BUILD_PROMPT_v4.1.md | Set-Clipboard
Write-Host "`n📋 BUILD PROMPT copied to clipboard!" -ForegroundColor Green

# Open Claude
claude .