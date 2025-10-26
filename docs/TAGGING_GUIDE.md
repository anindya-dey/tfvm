# Tagging and Release Guide

## How It Works

When you create a tag (from GitHub's website or command line), the GitHub Actions workflow automatically:

1. ✅ Extracts version from tag (e.g., `v2.1.0` → `2.1.0`)
2. ✅ Updates `package.json` version to match the tag
3. ✅ Runs all tests
4. ✅ Builds the project with correct version
5. ✅ Creates GitHub Release with release notes
6. ✅ Publishes to npm registry

## Method 1: Create Tag from GitHub Website (Recommended)

### Step-by-Step:

1. **Go to Releases Page:**
   ```
   https://github.com/anindya-dey/tfvm/releases/new
   ```

2. **Create a New Tag:**
   - Click "Choose a tag"
   - Type: `v2.1.0` (or your desired version)
   - Click "Create new tag: v2.1.0 on publish"

3. **Fill Release Information:**
   - Release title: `v2.1.0` or `Release v2.1.0`
   - Description: Describe the changes (optional, auto-generated if empty)
   - Check "Set as a pre-release" for beta/alpha versions

4. **Publish:**
   - Click "Publish release"
   - GitHub Actions will automatically handle the rest!

### What Happens Automatically:

```
Create Tag on GitHub (v2.1.0)
         ↓
GitHub Actions Triggered
         ↓
package.json version updated to 2.1.0
         ↓
Tests run → Build → GitHub Release created → npm publish
         ↓
Package live on npm! 🎉
```

## Method 2: Create Tag from Command Line

### Quick Command:

```bash
# Create and push tag
git tag v2.1.0
git push origin v2.1.0
```

### Using the Release Script (Recommended):

```bash
# Patch release (2.0.0 → 2.0.1)
./scripts/release.sh patch

# Minor release (2.0.0 → 2.1.0)
./scripts/release.sh minor

# Major release (2.0.0 → 3.0.0)
./scripts/release.sh major

# Beta release (2.0.0 → 2.0.1-beta.0)
./scripts/release.sh beta
```

The release script will:
- Update `package.json` version
- Create git commit & tag
- Push to remote
- GitHub Actions takes over from there

## Method 3: Using npm version Commands

```bash
# Patch release
npm run release:patch  # or: npm version patch

# Minor release
npm run release:minor  # or: npm version minor

# Major release
npm run release:major  # or: npm version major

# Beta release
npm run release:beta   # or: npm version prerelease --preid=beta
```

These commands will:
1. Update `package.json` version
2. Create git commit
3. Create git tag
4. Push to remote (via `postversion` hook)
5. Trigger GitHub Actions

## Version Format

Tags **must** follow this format:

```
v[MAJOR].[MINOR].[PATCH][-PRERELEASE]

Examples:
✅ v2.0.0
✅ v2.1.0
✅ v2.1.5
✅ v3.0.0
✅ v2.1.0-beta.0
✅ v2.1.0-rc.1
✅ v2.1.0-alpha.1

❌ 2.0.0        (missing 'v' prefix)
❌ v2.0         (missing patch version)
❌ v2.0.0.1     (too many version parts)
```

## Pre-release Tags

For beta/alpha/rc releases:

```bash
# Beta
v2.1.0-beta.0
v2.1.0-beta.1

# Release Candidate
v2.1.0-rc.1
v2.1.0-rc.2

# Alpha
v2.1.0-alpha.0
```

These are automatically marked as "pre-release" in GitHub and published with `--tag beta` to npm.

## Important Notes

### ✅ What Gets Updated Automatically:

1. **package.json version** - Updated to match tag version
2. **dist/tfvm.js** - Rebuilt with correct version
3. **GitHub Release** - Created with release notes
4. **npm package** - Published with correct version

### ⚠️ What You Need to Configure:

1. **NPM_TOKEN** - Must be added as GitHub Secret
   - Go to: `https://github.com/anindya-dey/tfvm/settings/secrets/actions`
   - Add secret named `NPM_TOKEN`
   - Value: Your npm automation token

2. **Repository permissions** - Ensure workflow has write access
   - Already configured in workflow: `permissions: contents: write`

### 📝 Before Creating a Tag:

- [ ] All changes committed
- [ ] Tests passing locally (`bun test`)
- [ ] Code linted (`bun run lint`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG reviewed (optional)

### 🎯 After Tag is Pushed:

1. **Check GitHub Actions:**
   ```
   https://github.com/anindya-dey/tfvm/actions
   ```

2. **Verify GitHub Release:**
   ```
   https://github.com/anindya-dey/tfvm/releases
   ```

3. **Check npm Package:**
   ```
   https://www.npmjs.com/package/tfvm
   ```

4. **Test Installation:**
   ```bash
   npm install -g tfvm@2.1.0
   tfvm --version
   ```

## Workflow Status

You can monitor the release process in real-time:

```
https://github.com/anindya-dey/tfvm/actions/workflows/release.yml
```

Typical workflow duration: **2-3 minutes**

## Troubleshooting

### Tag Already Exists

```bash
# Delete local tag
git tag -d v2.1.0

# Delete remote tag
git push origin :refs/tags/v2.1.0

# Create new tag
git tag v2.1.0
git push origin v2.1.0
```

### Workflow Failed

1. Check GitHub Actions logs
2. Common issues:
   - NPM_TOKEN not configured
   - Tests failing
   - Build errors
   - Version format incorrect

### Wrong Version Published

```bash
# Delete npm version (within 72 hours)
npm unpublish tfvm@2.1.0

# Or deprecate it
npm deprecate tfvm@2.1.0 "Wrong version, use X.X.X instead"
```

### Version Mismatch

The workflow automatically updates `package.json`, so:
- ✅ Tag version is **source of truth**
- ✅ `package.json` is updated to match tag
- ✅ No manual version updates needed

## Example Workflow

### Scenario: Releasing v2.1.0

**Option A: GitHub Website**
1. Go to: `https://github.com/anindya-dey/tfvm/releases/new`
2. Type tag: `v2.1.0`
3. Click "Publish release"
4. ☕ Wait 2-3 minutes
5. ✅ Check npm: `npm view tfvm version`

**Option B: Command Line**
```bash
# Ensure everything is committed
git status

# Create and push tag
git tag v2.1.0
git push origin v2.1.0

# Monitor workflow
open "https://github.com/anindya-dey/tfvm/actions"

# Verify on npm
npm view tfvm version
```

**Option C: Release Script**
```bash
./scripts/release.sh minor
# Follow prompts
# Script handles everything
```

## Best Practices

1. ✅ **Always use release script** for consistency
2. ✅ **Test locally** before tagging
3. ✅ **Follow semantic versioning** strictly
4. ✅ **Write meaningful commit messages**
5. ✅ **Keep CHANGELOG updated**
6. ✅ **Use pre-release tags** for testing
7. ✅ **Monitor GitHub Actions** after tagging

## Quick Reference

| Action | Command |
|--------|---------|
| Create tag from web | `github.com/anindya-dey/tfvm/releases/new` |
| Create tag CLI | `git tag v2.1.0 && git push origin v2.1.0` |
| Patch release | `./scripts/release.sh patch` |
| Minor release | `./scripts/release.sh minor` |
| Major release | `./scripts/release.sh major` |
| Beta release | `./scripts/release.sh beta` |
| Delete tag | `git tag -d v2.1.0 && git push origin :refs/tags/v2.1.0` |
| Check workflow | `github.com/anindya-dey/tfvm/actions` |
| View on npm | `npm view tfvm` |

---

**Summary:** Just create a tag (any method) with format `v*.*.*` and GitHub Actions handles everything else automatically! 🚀
