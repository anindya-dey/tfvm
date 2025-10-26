# Versioning and Release Guide

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH-PRERELEASE
```

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible functionality)
- **PATCH**: Bug fixes (backward-compatible bug fixes)
- **PRERELEASE**: Pre-release versions (beta, alpha, rc)

## Release Types

### Production Releases

#### Patch Release (Bug Fixes)
```bash
npm run release:patch
# or
./scripts/release.sh patch
```

Example: `2.0.0` → `2.0.1`

Use for:
- Bug fixes
- Security patches
- Documentation updates
- Performance improvements (no API changes)

#### Minor Release (New Features)
```bash
npm run release:minor
# or
./scripts/release.sh minor
```

Example: `2.0.1` → `2.1.0`

Use for:
- New features
- New commands
- Backward-compatible enhancements

#### Major Release (Breaking Changes)
```bash
npm run release:major
# or
./scripts/release.sh major
```

Example: `2.1.0` → `3.0.0`

Use for:
- Breaking API changes
- Removing deprecated features
- Major refactoring with incompatible changes

### Pre-release Versions

#### Beta Release
```bash
npm run release:beta
# or
./scripts/release.sh beta
```

Example: `2.0.0` → `2.0.1-beta.0`

## Release Process

### Automated Release (Recommended)

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Run release script:**
   ```bash
   # For patch (bug fixes)
   ./scripts/release.sh patch
   
   # For minor (new features)
   ./scripts/release.sh minor
   
   # For major (breaking changes)
   ./scripts/release.sh major
   
   # For beta release
   ./scripts/release.sh beta
   ```

3. **Publish to npm:**
   ```bash
   npm publish
   ```
   
   Or for beta:
   ```bash
   npm publish --tag beta
   ```

### Manual Release

1. **Update version:**
   ```bash
   npm version patch  # or minor, major
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Test:**
   ```bash
   npm test
   ```

4. **Push:**
   ```bash
   git push && git push --tags
   ```

5. **Publish:**
   ```bash
   npm publish
   ```

## What the Release Script Does

1. ✓ Checks git is clean
2. ✓ Confirms current branch
3. ✓ Pulls latest changes
4. ✓ Runs tests
5. ✓ Runs linter
6. ✓ Builds the project
7. ✓ Bumps version in package.json
8. ✓ Creates git commit & tag
9. ✓ Generates release notes
10. ✓ Pushes to remote with tags

## GitHub Actions Automation

When you push a tag (e.g., `v2.1.0`), GitHub Actions automatically:

1. Runs all tests
2. Builds the project
3. Creates a GitHub Release with notes
4. Publishes to npm registry

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature (triggers MINOR release)
- `fix`: Bug fix (triggers PATCH release)
- `perf`: Performance improvement
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `BREAKING CHANGE`: In footer (triggers MAJOR release)

### Examples:

```bash
# Feature (minor bump)
git commit -m "feat: add platform auto-detection for downloads"

# Bug fix (patch bump)
git commit -m "fix: resolve PATH configuration issue on Windows"

# Breaking change (major bump)
git commit -m "feat: redesign CLI command structure

BREAKING CHANGE: Changed 'tfvm install' to 'tfvm download'"

# Performance improvement
git commit -m "perf: optimize file comparison using stats instead of content"

# Refactoring
git commit -m "refactor: consolidate print functions into unified API"
```

## Changelog

The changelog is automatically generated from git commits:

```bash
npm run changelog
# or
./scripts/generate-changelog.sh
```

This creates/updates `CHANGELOG.md` with categorized changes.

## Version Checking

Users can check their installed version:

```bash
tfvm --version
```

The CLI automatically checks for updates and notifies users when a new version is available.

## Best Practices

1. **Always test before releasing**
2. **Write meaningful commit messages**
3. **Update documentation for new features**
4. **Use semantic versioning correctly**
5. **Create GitHub releases for major versions**
6. **Keep CHANGELOG.md updated**
7. **Test beta versions before production release**

## Troubleshooting

### Failed Release

If a release fails midway:

```bash
# Reset version
git tag -d v2.1.0  # Delete local tag
git push origin :refs/tags/v2.1.0  # Delete remote tag

# Fix the issue and try again
```

### Wrong Version Bumped

```bash
# Before pushing
npm version <correct-version>  # This will replace the wrong version

# After pushing (not recommended)
# Contact npm support to unpublish if within 72 hours
```

## References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
