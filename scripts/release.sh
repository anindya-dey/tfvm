#!/bin/bash

# tfvm Release Script
# Usage: ./scripts/release.sh [patch|minor|major|beta]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if version type is provided
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|beta)$ ]]; then
    print_error "Invalid version type: $VERSION_TYPE"
    echo "Usage: $0 [patch|minor|major|beta]"
    exit 1
fi

print_info "Starting release process for: $VERSION_TYPE"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    git status -s
    exit 1
fi
print_success "Git working directory is clean"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    print_warning "You are on branch '$CURRENT_BRANCH', not 'main' or 'master'"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Release cancelled"
        exit 0
    fi
fi

# Pull latest changes
print_info "Pulling latest changes..."
git pull origin $CURRENT_BRANCH
print_success "Up to date with remote"

# Run tests
print_info "Running tests..."
bun test
print_success "All tests passed"

# Run linter
print_info "Running linter..."
bun run lint
print_success "Linting passed"

# Build
print_info "Building project..."
bun run build
print_success "Build completed"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Bump version
print_info "Bumping version..."
if [[ "$VERSION_TYPE" == "beta" ]]; then
    npm version prerelease --preid=beta -m "chore(release): v%s"
else
    npm version $VERSION_TYPE -m "chore(release): v%s"
fi

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version bumped: $CURRENT_VERSION → $NEW_VERSION"

# Create release notes
RELEASE_NOTES_FILE=".github/RELEASE_NOTES_${NEW_VERSION}.md"
mkdir -p .github

# Get commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
if [[ -n "$LAST_TAG" ]]; then
    COMMITS=$(git log ${LAST_TAG}..HEAD --pretty=format:"- %s" --reverse)
else
    COMMITS=$(git log --pretty=format:"- %s" --reverse)
fi

cat > "$RELEASE_NOTES_FILE" << EOF
# Release v${NEW_VERSION}

## Changes

${COMMITS}

---

**Full Changelog**: https://github.com/anindya-dey/tfvm/compare/${LAST_TAG}...v${NEW_VERSION}
EOF

print_success "Release notes created: $RELEASE_NOTES_FILE"

# Push changes and tags
print_info "Pushing changes to remote..."
git push origin $CURRENT_BRANCH
git push origin --tags
print_success "Changes pushed to remote"

echo ""
print_success "Release v${NEW_VERSION} completed successfully! 🎉"
echo ""
print_info "Next steps:"
echo "  1. Publish to npm: npm publish"
echo "  2. Create GitHub release: gh release create v${NEW_VERSION} --notes-file ${RELEASE_NOTES_FILE}"
echo "  3. Or visit: https://github.com/anindya-dey/tfvm/releases/new?tag=v${NEW_VERSION}"
