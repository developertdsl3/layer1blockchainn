#!/bin/bash
# Script to reorganize the project into a clean structure

set -e

echo "Creating clean folder structure..."

# Create new structure
mkdir -p node/src
mkdir -p runtime/src
mkdir -p scripts
mkdir -p config/chain-specs
mkdir -p config/genesis
mkdir -p docs
mkdir -p tests
mkdir -p archive

echo "Moving essential files..."

# Copy node files
if [ -d "substrate/bin/node/cli" ]; then
    cp -r substrate/bin/node/cli/src/* node/src/ 2>/dev/null || true
    cp substrate/bin/node/cli/Cargo.toml node/ 2>/dev/null || true
    cp substrate/bin/node/cli/build.rs node/ 2>/dev/null || true
fi

# Copy runtime files
if [ -d "substrate/bin/node/runtime" ]; then
    cp -r substrate/bin/node/runtime/src/* runtime/src/ 2>/dev/null || true
    cp substrate/bin/node/runtime/Cargo.toml runtime/ 2>/dev/null || true
    cp substrate/bin/node/runtime/build.rs runtime/ 2>/dev/null || true
fi

# Archive test data
if [ -d "alice-fresh" ]; then
    mv alice-fresh archive/ 2>/dev/null || true
fi

if [ -d "bob-fresh" ]; then
    mv bob-fresh archive/ 2>/dev/null || true
fi

# Move config files
if [ -f "local.json" ]; then
    mv local.json config/chain-specs/ 2>/dev/null || true
fi

if [ -f "local-raw.json" ]; then
    mv local-raw.json config/chain-specs/ 2>/dev/null || true
fi

# Move documentation
mv PROJECT_PLAN.md docs/ 2>/dev/null || true
mv SETUP_GUIDE.md docs/ 2>/dev/null || true
mv PHASE1_STATUS.md docs/ 2>/dev/null || true
mv CLEAN_STRUCTURE_PLAN.md docs/ 2>/dev/null || true

echo "Clean structure created!"
echo "Next steps:"
echo "1. Update Cargo.toml workspace members"
echo "2. Update import paths in source files"
echo "3. Test build"

