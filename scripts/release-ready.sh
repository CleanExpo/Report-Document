#!/bin/bash

# Release Ready Check
# Quick verification that all release requirements are met

set -e

echo "================================="
echo "RELEASE READINESS CHECK"
echo "================================="
echo ""

ALL_READY=true

# 1. CI Status
echo -n "CI Status: "
if gh pr checks 2>/dev/null | grep -q "fail"; then
    echo "❌ FAILING"
    ALL_READY=false
elif command -v gh &> /dev/null; then
    echo "✅ Passing"
else
    echo "⚠️  Cannot verify (gh CLI not installed)"
fi

# 2. Feature Flags
echo -n "Feature Flags: "
if grep -r "enabled: true" src/config/flags.ts > /dev/null 2>&1; then
    echo "❌ Some flags are ON (should be OFF)"
    ALL_READY=false
else
    echo "✅ All OFF"
fi

# 3. Changelog
echo -n "Changelog: "
if [ -f "CHANGELOG.md" ]; then
    # Check if changelog has been updated recently (within last day)
    if find CHANGELOG.md -mtime -1 | grep -q CHANGELOG; then
        echo "✅ Updated"
    else
        echo "⚠️  Not recently updated"
    fi
else
    echo "❌ Missing"
    ALL_READY=false
fi

# 4. Rollback Plan
echo -n "Rollback Plan: "
if [ -f "docs/06_release/rollback-plan.md" ]; then
    echo "✅ Ready"
else
    echo "❌ Missing"
    ALL_READY=false
fi

# 5. Validation Gates
echo -n "Validation Gates: "
if npm run validate:quick > /dev/null 2>&1; then
    echo "✅ Passing"
else
    echo "❌ Failing"
    ALL_READY=false
fi

# 6. Git Status
echo -n "Git Status: "
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Clean"
else
    echo "⚠️  Uncommitted changes"
fi

# 7. Environment Check
echo -n "Environment: "
if [ -f ".env" ]; then
    echo "✅ Configured"
else
    echo "⚠️  No .env file (may be intentional)"
fi

# Summary
echo ""
echo "================================="
if [ "$ALL_READY" = true ]; then
    echo "✅ READY TO RELEASE"
    echo "================================="
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run release"
    echo "2. Monitor metrics after deployment"
    echo "3. Enable feature flags gradually"
    exit 0
else
    echo "❌ NOT READY"
    echo "================================="
    echo ""
    echo "Fix the issues above before releasing."
    exit 1
fi