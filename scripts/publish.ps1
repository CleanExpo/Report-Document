param([string]$msg = "feat: update")

git status
Read-Host "Press Enter to continue if clean"

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -eq "main") {
  $slug = (Get-Date -Format "yyyyMMdd-HHmmss")
  $branch = "feature/$slug"
  git checkout -b $branch
}

git add -A
try { git commit -m $msg } catch { Write-Host "No changes to commit" }

git push -u origin $branch

try { gh pr create --base main --fill } catch { Write-Host "Install GitHub CLI and auth: https://cli.github.com/" }

Write-Host "`n✅ Pushed '$branch' and (attempted) PR. Check PR for Vercel Preview URL."