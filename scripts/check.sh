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

# Verify every food/ink/medicine species has a considered safety-tag decision
# (catches a new catalog entry shipping with an unconsidered safety decision)
echo "Verifying safety-tag completeness..."
node scripts/test_safety_tags.mjs || { echo "FAIL: Safety-tag completeness check failed"; exit 1; }

# Validate the extracted project-recipes.json (structure, ids, per-map kinds)
echo "Validating project recipes..."
node scripts/test_project_recipes.mjs || { echo "FAIL: Project recipes validation failed"; exit 1; }

# Verify the committed static SEO pages (materials/, projects/, sitemap.xml,
# robots.txt) match a fresh regeneration from the catalogs + recipes (catches
# stale pages when a species or recipe changes without rerunning the generator)
echo "Verifying static pages freshness..."
node scripts/build_static_pages.mjs --verify || { echo "FAIL: Static pages are stale — run: node scripts/build_static_pages.mjs"; exit 1; }

# Verify the committed QR field-card sheets (cards/) match a fresh
# regeneration from the catalogs (Phase 5.6 teaching pack)
echo "Verifying field-card sheets freshness..."
node scripts/build_field_cards.mjs --verify || { echo "FAIL: Field-card sheets are stale — run: node scripts/build_field_cards.mjs"; exit 1; }

# Validate the extracted rule tables (data/rules/*.json): envelope, provenance
# (checked.by/date), reserved-word rule ("Verified" only for owner-checked),
# baked record counts, and crown-jewel semantic anchors. While app.js still
# carries the original consts it also deep-compares JSON vs const.
echo "Validating extracted rule tables..."
node scripts/test_rules_extraction.mjs || { echo "FAIL: Rule-table extraction equivalence failed"; exit 1; }

# Rule staleness report — informational only, never fails the build; surfaces
# rules whose checked.date is older than 12 months in the CI log.
echo "Reporting rule staleness (informational)..."
node scripts/check_rule_staleness.mjs || true

# Run permission rule tests
echo "Running permission rule tests..."
node scripts/test_rules.mjs || { echo "FAIL: Permission rule tests failed"; exit 1; }

# Run overview coverage tests
echo "Running overview coverage tests..."
node scripts/test_overview_coverage.mjs || { echo "FAIL: Overview coverage tests failed"; exit 1; }

# Run zoom-handoff state-machine regression (KNOWN_ISSUES item 1): extracts the
# real aggregate<->points transition functions from app.js and drives scripted
# zoom/pan/load sequences against stub map/state, asserting no fully-blank state
# while viewport data exists and that the aggregate bridge always terminates
echo "Running zoom-handoff state-machine tests..."
node scripts/test_zoom_handoff.mjs || { echo "FAIL: Zoom-handoff regression tests failed"; exit 1; }

# Verify thin-park apportioning (KNOWN_ISSUES 1b): boundary cells carry
# per-status area fractions that reduce the allowed over-count in patchwork parks
echo "Verifying thin-park apportioning..."
node scripts/test_thin_park_apportioning.mjs || { echo "FAIL: Thin-park apportioning check failed"; exit 1; }

# Run register contrast audit (Phase 6)
echo "Running register contrast audit..."
node scripts/audit_contrast.mjs || { echo "FAIL: Register contrast audit failed"; exit 1; }

# Verify sw.js ASSET_VERSION/CACHE_VERSION stay in sync with index.html's ?v=
# strings. A mismatch precaches URLs the page never requests — online users are
# fine, but a cold OFFLINE launch boots a shell with no app.js/styles.css: a
# silent, offline-only failure nothing else catches.
echo "Verifying service-worker/asset version sync..."
AV=$(sed -n 's/^const ASSET_VERSION = "\(.*\)";$/\1/p' sw.js)
CV=$(sed -n 's/^const CACHE_VERSION = "\(.*\)";$/\1/p' sw.js)
if [ -z "$AV" ] || [ -z "$CV" ]; then
    echo "FAIL: could not extract ASSET_VERSION/CACHE_VERSION from sw.js"; exit 1
fi
QV_COUNT=$(grep -c "?v=$AV" index.html || true)
QV_TOTAL=$(grep -c "?v=" index.html || true)
if [ "$QV_COUNT" -ne 2 ] || [ "$QV_TOTAL" -ne "$QV_COUNT" ]; then
    echo "FAIL: index.html ?v= strings do not all match sw.js ASSET_VERSION ($AV): $QV_COUNT of $QV_TOTAL match"; exit 1
fi
case "$CV" in
    *"$AV"*) ;;
    *) echo "FAIL: sw.js CACHE_VERSION ($CV) does not contain ASSET_VERSION ($AV) — bump both together"; exit 1 ;;
esac
echo "Version sync OK: $AV / $CV"

echo "All checks PASSED"
