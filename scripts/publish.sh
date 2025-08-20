#!/usr/bin/env bash
set -euo pipefail
msg=${1:-"feat: update"}

if [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ]; then
  slug=$(date +%Y%m%d-%H%M%S)
  git checkout -b "feature/$slug"
fi

git add -A || true
git commit -m "$msg" || true
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"

gh pr create --base main --fill || echo "Install GitHub CLI (gh) and authenticate."

echo "✅ Pushed and opened PR. Check PR for Vercel Preview URL."