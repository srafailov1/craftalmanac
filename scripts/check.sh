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

# Run data validation
echo "Running data validation..."
node scripts/validate_data.mjs || { echo "FAIL: Data validation failed"; exit 1; }

echo "All checks PASSED"