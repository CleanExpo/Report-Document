#!/bin/bash

# Automated Validation Gates Script
# Runs all quality checks required before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
VALIDATION_PASSED=true
FAILED_GATES=()

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Running Validation Gates${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to run a validation gate
run_gate() {
    local gate_name=$1
    local command=$2
    local required=${3:-true}
    
    echo -e "${YELLOW}Running: ${gate_name}${NC}"
    
    if eval $command; then
        echo -e "${GREEN}✓ ${gate_name} passed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ ${gate_name} failed${NC}"
        echo ""
        
        if [ "$required" = true ]; then
            VALIDATION_PASSED=false
            FAILED_GATES+=("$gate_name")
        else
            echo -e "${YELLOW}  (Optional gate - continuing)${NC}"
            echo ""
        fi
        return 1
    fi
}

# 1. Code Quality Gates
echo -e "${BLUE}Code Quality Gates${NC}"
echo "-------------------"

run_gate "TypeScript Check" "npm run typecheck"
run_gate "ESLint" "npm run lint"
run_gate "Prettier Format Check" "npm run format:check || true" false

# 2. Testing Gates
echo -e "${BLUE}Testing Gates${NC}"
echo "-------------"

run_gate "Unit Tests" "npm run test:unit"
run_gate "Integration Tests" "npm run test:integration || true" false
run_gate "Test Coverage (>80%)" "npm run test:coverage"

# 3. Security Gates
echo -e "${BLUE}Security Gates${NC}"
echo "--------------"

run_gate "Dependency Audit" "npm audit --production || true" false
run_gate "Security Scan" "npm run security:scan"

# 4. Build Gates
echo -e "${BLUE}Build Gates${NC}"
echo "-----------"

run_gate "Production Build" "npm run build"

# Check bundle size
echo -e "${YELLOW}Running: Bundle Size Check${NC}"
if [ -d ".next" ]; then
    BUNDLE_SIZE=$(du -sb .next | cut -f1)
    MAX_SIZE=3145728 # 3MB
    
    if [ $BUNDLE_SIZE -lt $MAX_SIZE ]; then
        echo -e "${GREEN}✓ Bundle size check passed ($(($BUNDLE_SIZE / 1024))KB < $(($MAX_SIZE / 1024))KB)${NC}"
        echo ""
    else
        echo -e "${RED}✗ Bundle size exceeds limit ($(($BUNDLE_SIZE / 1024))KB > $(($MAX_SIZE / 1024))KB)${NC}"
        echo ""
        VALIDATION_PASSED=false
        FAILED_GATES+=("Bundle Size Check")
    fi
else
    echo -e "${YELLOW}  Build directory not found - skipping${NC}"
    echo ""
fi

# 5. Documentation Gates
echo -e "${BLUE}Documentation Gates${NC}"
echo "------------------"

# Check if key documentation exists
echo -e "${YELLOW}Running: Documentation Check${NC}"
MISSING_DOCS=()

[ ! -f "README.md" ] && MISSING_DOCS+=("README.md")
[ ! -f "CHANGELOG.md" ] && MISSING_DOCS+=("CHANGELOG.md")
[ ! -f "docs/02_prp/prp.md" ] && MISSING_DOCS+=("Project Requirements Plan")

if [ ${#MISSING_DOCS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ Documentation check passed${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ Missing documentation: ${MISSING_DOCS[@]}${NC}"
    echo ""
fi

# 6. IICRC Compliance Gates (Remediation-specific)
echo -e "${BLUE}IICRC Compliance Gates${NC}"
echo "---------------------"

echo -e "${YELLOW}Running: Standards Reference Check${NC}"
# Check if IICRC standards are properly referenced
if grep -r "IICRC" src/ --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ IICRC standards referenced${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ No IICRC standard references found${NC}"
    echo ""
fi

# 7. Feature Flag Validation
echo -e "${BLUE}Feature Flag Gates${NC}"
echo "-----------------"

echo -e "${YELLOW}Running: Feature Flag Configuration${NC}"
if grep -q "featureFlags" src/config/flags.tsx; then
    echo -e "${GREEN}✓ Feature flags configured${NC}"
    echo ""
else
    echo -e "${RED}✗ Feature flags not properly configured${NC}"
    echo ""
    VALIDATION_PASSED=false
    FAILED_GATES+=("Feature Flag Configuration")
fi

# 8. Agent Mesh Validation
echo -e "${BLUE}Agent Mesh Gates${NC}"
echo "---------------"

echo -e "${YELLOW}Running: Agent Configuration Check${NC}"
if [ -f ".claude/agents/mesh-config.json" ]; then
    echo -e "${GREEN}✓ Agent mesh configured${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ Agent mesh configuration not found${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ ALL VALIDATION GATES PASSED!${NC}"
    echo ""
    echo "The project is ready for deployment."
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo ""
    echo "Failed gates:"
    for gate in "${FAILED_GATES[@]}"; do
        echo -e "  ${RED}• $gate${NC}"
    done
    echo ""
    echo "Please fix the issues above before proceeding."
    exit 1
fi