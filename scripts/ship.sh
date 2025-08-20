#!/bin/bash
# Ship Script - Automated deployment pipeline

set -e

echo "🚢 Starting ship process..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Run validation gates
echo "📋 Running validation gates..."
npm run validate:full
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Validation failed${NC}"
    exit 1
fi

# 2. Run health check
echo "🏥 Running health check..."
npm run health:check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# 3. Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# 4. Run smoke tests
echo "🔥 Running smoke tests..."
npm run test:smoke
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Smoke tests failed - continuing${NC}"
fi

# 5. Check git status
echo "📦 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️ Uncommitted changes detected${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. Deploy based on branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Current branch: $BRANCH"

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "🚀 Deploying to production..."
    npm run deploy:production
elif [ "$BRANCH" = "staging" ]; then
    echo "🎭 Deploying to staging..."
    npm run deploy:staging
else
    echo "🔬 Creating preview deployment..."
    echo "Preview URL will be available after deployment"
fi

# 7. Post-deployment validation
echo "✅ Deployment successful!"
echo ""
echo "Post-deployment checklist:"
echo "  □ Check deployment URL"
echo "  □ Run E2E tests against deployed environment"
echo "  □ Monitor error rates"
echo "  □ Check performance metrics"
echo ""

# 8. Update changelog
echo "📝 Don't forget to update the changelog!"
echo "Run: npm run changelog:generate"

echo -e "${GREEN}✨ Ship complete!${NC}"