#!/bin/bash

# CHANGELOG Generator for tfvm
# Generates a formatted CHANGELOG.md from git history

set -e

OUTPUT_FILE="CHANGELOG.md"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info "Generating CHANGELOG.md..."

# Start the changelog
cat > "$OUTPUT_FILE" << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

EOF

# Get all tags sorted by version
TAGS=$(git tag -l --sort=-v:refname)

# If no tags exist
if [[ -z "$TAGS" ]]; then
    echo "## [Unreleased]" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    git log --pretty=format:"- %s (%h)" --reverse >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    print_success "CHANGELOG.md generated (no tags found)"
    exit 0
fi

# Process each tag
PREVIOUS_TAG=""
for TAG in $TAGS; do
    # Get tag date
    TAG_DATE=$(git log -1 --format=%ai "$TAG" | cut -d' ' -f1)
    
    # Write version header
    echo "## [$TAG] - $TAG_DATE" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Get commits for this version
    if [[ -z "$PREVIOUS_TAG" ]]; then
        # First tag - get all commits up to it
        COMMITS=$(git log "$TAG" --pretty=format:"%s|||%h" --reverse)
    else
        # Get commits between tags
        COMMITS=$(git log "${PREVIOUS_TAG}..${TAG}" --pretty=format:"%s|||%h" --reverse)
    fi
    
    # Categorize commits
    declare -A categories
    categories["Features"]=""
    categories["Bug Fixes"]=""
    categories["Performance"]=""
    categories["Refactor"]=""
    categories["Documentation"]=""
    categories["Chores"]=""
    categories["Other"]=""
    
    while IFS='|||' read -r message hash; do
        case "$message" in
            feat:*|feat\(*) 
                categories["Features"]+="- ${message#feat:} (${hash})\n"
                ;;
            fix:*|fix\(*)
                categories["Bug Fixes"]+="- ${message#fix:} (${hash})\n"
                ;;
            perf:*|perf\(*)
                categories["Performance"]+="- ${message#perf:} (${hash})\n"
                ;;
            refactor:*|refactor\(*)
                categories["Refactor"]+="- ${message#refactor:} (${hash})\n"
                ;;
            docs:*|docs\(*)
                categories["Documentation"]+="- ${message#docs:} (${hash})\n"
                ;;
            chore:*|chore\(*)
                categories["Chores"]+="- ${message#chore:} (${hash})\n"
                ;;
            *)
                categories["Other"]+="- ${message} (${hash})\n"
                ;;
        esac
    done <<< "$COMMITS"
    
    # Write categorized commits
    for category in "Features" "Bug Fixes" "Performance" "Refactor" "Documentation" "Chores" "Other"; do
        if [[ -n "${categories[$category]}" ]]; then
            echo "### $category" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            echo -e "${categories[$category]}" >> "$OUTPUT_FILE"
        fi
    done
    
    echo "" >> "$OUTPUT_FILE"
    PREVIOUS_TAG="$TAG"
done

# Add unreleased changes if any
UNRELEASED=$(git log "$TAGS"..HEAD --pretty=format:"- %s (%h)" --reverse 2>/dev/null || echo "")
if [[ -n "$UNRELEASED" ]]; then
    echo "## [Unreleased]" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "$UNRELEASED" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

print_success "CHANGELOG.md generated successfully!"
print_info "File: $OUTPUT_FILE"
