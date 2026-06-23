#!/bin/bash

# Pre-commit check runner
# This script runs validation checks before committing

set -e # Exit on any error

echo "Running pre-commit checks..."

# Check JS syntax for app.js
echo "Checking app.js syntax..."
node --check app.js || { echo "FAIL: app.js has syntax errors"; exit 1; }

# Check JS syntax for all mjs scripts in scripts/ directory  
echo "Checking scripts syntax..."
for script in scripts/*.mjs; do
    if [ -f "$script" ]; then
        echo "Checking $script syntax..."
        node --check "$script" || { echo "FAIL: $script has syntax errors"; exit 1; }
    fi
done

# Lint for duplicate top-level declarations in app.js (node --check silently
# accepts a redeclared top-level function/var — the cause of KNOWN_ISSUES item 1)
echo "Checking for duplicate top-level declarations..."
node scripts/lint_top_level_dupes.mjs || { echo "FAIL: duplicate top-level declaration in app.js"; exit 1; }

# Run data validation
echo "Running data validation..."
node scripts/validate_data.mjs || { echo "FAIL: Data validation failed"; exit 1; }

# Verify phenology curves match each mode's species catalog (catches the silent
# drift where a new catalog species ships without a data/phenology/<mode>.json curve)
echo "Verifying phenology<->catalog consistency..."
node scripts/build_phenology_histograms.mjs --verify || { echo "FAIL: phenology/catalog mismatch"; exit 1; }

# Run permission rule tests
echo "Running permission rule tests..."
node scripts/test_rules.mjs || { echo "FAIL: Permission rule tests failed"; exit 1; }

# Run overview coverage tests
echo "Running overview coverage tests..."
node scripts/test_overview_coverage.mjs || { echo "FAIL: Overview coverage tests failed"; exit 1; }

# Run register contrast audit (Phase 6)
echo "Running register contrast audit..."
node scripts/audit_contrast.mjs || { echo "FAIL: Register contrast audit failed"; exit 1; }

echo "All checks PASSED"
