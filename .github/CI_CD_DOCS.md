# CI/CD Documentation

This document describes the continuous integration and deployment workflows for the TFVM project.

## 🚀 Workflows Overview

### Core Development Workflows

#### 1. **Unit Tests** (`test.yml`)
- **Triggers:** Push to `main`, `develop`; PRs to `main`, `develop`; manual dispatch
- **Purpose:** Comprehensive testing across multiple environments
- **Matrix Testing:**
  - **Operating Systems:** Ubuntu, Windows, macOS
  - **Node.js Versions:** 16, 18, 20, 21
  - **Total Combinations:** 12 test scenarios
- **Features:**
  - Cross-platform compatibility testing
  - CLI functionality validation
  - Test results artifact upload

#### 2. **Code Quality** (`lint.yml`)
- **Triggers:** Push to branches; PRs; manual dispatch
- **Purpose:** Code formatting, linting, and type checking
- **Features:**
  - ESLint and Prettier validation
  - TypeScript type checking
  - Git diff verification for formatting consistency

#### 3. **Build Validation** (`build.yml`)
- **Triggers:** Push to branches; PRs; manual dispatch
- **Purpose:** Validate package build and CLI functionality
- **Features:**
  - Package size monitoring
  - Build artifact validation
  - CLI smoke testing
  - Build artifacts upload

#### 4. **Test Coverage** (`coverage.yml`)
- **Triggers:** Push to `main`, `develop`; PRs; manual dispatch
- **Purpose:** Track test coverage and report trends
- **Features:**
  - Codecov integration
  - PR comments with coverage data
  - Historical trend tracking

### Security Workflows

#### 5. **Security Audit** (`security-audit.yml`)
- **Triggers:** Push to branches; PRs; daily schedule (2 AM UTC); manual dispatch
- **Purpose:** Dependency vulnerability scanning
- **Features:**
  - Bun audit for npm vulnerabilities
  - Additional security checks with audit-ci
  - Daily automated scans

#### 6. **CodeQL Analysis** (`codeql-analysis.yml`)
- **Triggers:** Push to branches; PRs; weekly schedule (Monday 2 AM UTC); manual dispatch
- **Purpose:** Static code security analysis
- **Features:**
  - GitHub's CodeQL engine
  - Security and quality rule sets
  - Results in GitHub Security tab

#### 7. **Secrets Detection** (`secrets-scan.yml`)
- **Triggers:** Push to branches; PRs; weekly schedule (Sunday 3 AM UTC); manual dispatch
- **Purpose:** Scan for exposed secrets and credentials
- **Features:**
  - TruffleHog OSS integration
  - Full repository history scanning
  - Verified secrets detection only

#### 8. **License Compliance** (`license-check.yml`)
- **Triggers:** Push to branches; PRs; monthly schedule (1st at 4 AM UTC); manual dispatch
- **Purpose:** License compliance monitoring
- **Features:**
  - Comprehensive license reporting
  - Problematic license detection
  - CSV and summary report generation

### Deployment Workflows

#### 9. **NPM Publishing** (`publish.yml`)
- **Triggers:** GitHub releases; manual dispatch with tag selection
- **Purpose:** Automated package publishing to NPM registry
- **Features:**
  - NPM provenance attestation
  - Environment protection
  - Support for `latest`, `beta`, `alpha` tags
  - Publication summary with install instructions

### Automation

#### 10. **Dependency Updates** (`dependabot.yml`)
- **Schedule:** Weekly on Mondays at 9 AM UTC
- **Purpose:** Automated dependency maintenance
- **Features:**
  - Grouped updates for related packages
  - Separate handling for production vs development dependencies
  - GitHub Actions updates
  - Automatic PR creation with appropriate labels

## 🔧 Configuration Details

### Environment Variables Required

#### For NPM Publishing:
- `NPM_TOKEN`: NPM registry authentication token
- `CODECOV_TOKEN`: Codecov service token (optional)

#### Secrets Setup:
1. **NPM_TOKEN**: 
   - Go to [npmjs.com](https://www.npmjs.com) → Account Settings → Access Tokens
   - Create an "Automation" token
   - Add to GitHub repository secrets

2. **CODECOV_TOKEN** (optional):
   - Sign up at [codecov.io](https://codecov.io)
   - Add repository and get token
   - Add to GitHub repository secrets

### Workflow Architecture

Our modular approach provides several benefits:

#### **Single Responsibility:**
- Each workflow has one clear purpose
- Easier debugging and maintenance
- Independent scaling and optimization

#### **Flexible Scheduling:**
- Different workflows run on different schedules
- Resource-intensive tasks run less frequently
- Critical checks run on every change

#### **Targeted Triggers:**
- Development workflows: Push/PR triggers
- Security workflows: Scheduled + on-demand
- Publishing workflows: Release-based triggers

### Matrix Strategy

Unit testing uses a comprehensive matrix strategy:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [16, 18, 20, 21]
```

This creates **12 test combinations** to ensure cross-platform compatibility.

### Security Measures

1. **Dependency Scanning:**
   - `bun audit` for npm vulnerabilities
   - `audit-ci` for CI-specific security checks
   - Weekly automated scans

2. **Code Analysis:**
   - CodeQL for static security analysis
   - TruffleHog for secrets detection
   - License compliance checking

3. **Publishing Security:**
   - NPM provenance attestation
   - Environment protection rules
   - Build validation before publish

## 📊 Monitoring and Reporting

### GitHub Actions
- All workflows provide detailed step summaries
- Failed builds include artifact uploads for debugging
- Security scan results are reported in GitHub Security tab

### Codecov Integration
- Coverage reports on every PR
- Trend tracking over time
- Coverage threshold enforcement (configurable)

### Dependabot
- Automatic PRs for dependency updates
- Grouped updates to reduce noise
- Automatic labeling and assignment

## 🛠 Development Workflow

### Pre-commit Checklist
Before pushing code, ensure:
- [ ] `bun test` passes locally
- [ ] `bun run lint` passes
- [ ] `bun run build` succeeds
- [ ] No secrets in code

### Workflow Dependencies

Understanding how workflows interact:

```
Push/PR → test.yml + lint.yml + build.yml + coverage.yml + security-audit.yml
       ↓
   All pass → Ready for merge
       ↓
Release → publish.yml → NPM publication
```

#### **Scheduled Workflows:**
- **Daily:** `security-audit.yml` (dependency vulnerabilities)
- **Weekly:** 
  - `codeql-analysis.yml` (Monday - static analysis)
  - `secrets-scan.yml` (Sunday - secrets detection)
  - `dependabot.yml` (Monday - dependency updates)
- **Monthly:** `license-check.yml` (1st - license compliance)

### Release Process
1. **Prepare Release:**
   ```bash
   # Ensure all workflows pass
   git checkout main
   git pull origin main
   
   # Update version in package.json
   npm version patch|minor|major
   
   # Push tags
   git push origin main --tags
   ```

2. **Create GitHub Release:**
   ```bash
   # Tag the release
   git tag v1.2.3
   git push origin v1.2.3
   
   # Create GitHub release (triggers publish.yml)
   gh release create v1.2.3 --title "Release v1.2.3" --notes "Release notes here"
   ```

3. **Manual Publishing (if needed):**
   ```bash
   # Trigger manual publish workflow
   gh workflow run publish.yml -f npm-tag=beta
   ```

## 🔍 Troubleshooting

### Common Issues by Workflow

#### **test.yml Failures:**
- **Node version issues:** Check compatibility across Node 16-21
- **Platform-specific:** Review matrix results for OS-specific failures
- **Dependency conflicts:** Run `bun install --frozen-lockfile` locally

#### **lint.yml Failures:**
- **Formatting:** Run `bun run lint` locally to fix
- **Type errors:** Check `tsc --noEmit` output
- **Git diff issues:** Ensure all formatting changes are committed

#### **build.yml Failures:**
- **Build output missing:** Check if `dist/tfvm.js` is generated
- **CLI test failures:** Verify CLI commands work locally
- **Size warnings:** Monitor package size growth

#### **coverage.yml Issues:**
- **Codecov upload:** Check `CODECOV_TOKEN` secret
- **Coverage drops:** Review test coverage in affected areas
- **Report generation:** Ensure coverage data is properly generated

#### **Security Workflow Failures:**
- **security-audit.yml:** Run `bun audit` locally, update vulnerable dependencies
- **codeql-analysis.yml:** Review security findings in GitHub Security tab
- **secrets-scan.yml:** Remove detected secrets, rotate if exposed
- **license-check.yml:** Review license compatibility issues

#### **publish.yml Issues:**
- **NPM token expired:** Regenerate token in NPM account settings
- **Version conflicts:** Ensure package.json version is unique on NPM
- **Environment protection:** Check GitHub environment settings
- **Provenance issues:** Verify GitHub Actions permissions

### Monitoring and Alerting

#### **GitHub Insights:**
- Repository activity and PR metrics
- Workflow success/failure rates
- Action usage and billing

#### **External Dashboards:**
- **Codecov:** [codecov.io/github/anindya-dey/tfvm](https://codecov.io/github/anindya-dey/tfvm)
- **NPM:** [npmjs.com/package/tfvm](https://npmjs.com/package/tfvm)
- **Security:** GitHub Security tab for vulnerability tracking

### Workflow Status Badges

Add these to your README.md for quick status visibility:

```markdown
[![Tests](https://github.com/anindya-dey/tfvm/workflows/Unit%20Tests/badge.svg)](https://github.com/anindya-dey/tfvm/actions)
[![Code Quality](https://github.com/anindya-dey/tfvm/workflows/Code%20Quality/badge.svg)](https://github.com/anindya-dey/tfvm/actions)
[![Security](https://github.com/anindya-dey/tfvm/workflows/Security%20Audit/badge.svg)](https://github.com/anindya-dey/tfvm/actions)
[![Coverage](https://codecov.io/gh/anindya-dey/tfvm/branch/main/graph/badge.svg)](https://codecov.io/gh/anindya-dey/tfvm)
```

## 📈 Metrics and KPIs

### Workflow Performance Metrics

#### **Success Rates (Target: 95%+):**
- `test.yml`: Cross-platform test success
- `lint.yml`: Code quality compliance
- `build.yml`: Build success rate
- `publish.yml`: Publishing success rate

#### **Security Metrics:**
- Zero high/critical vulnerabilities (security-audit.yml)
- Clean CodeQL scans (codeql-analysis.yml)  
- No exposed secrets (secrets-scan.yml)
- License compliance (license-check.yml)

#### **Quality Metrics:**
- Test coverage trend (coverage.yml)
- Dependency freshness (dependabot.yml)
- Build artifact size monitoring (build.yml)

### Workflow Architecture Benefits

#### **Modularity:**
- 10 focused workflows vs 2 monolithic ones
- Independent scaling and optimization
- Easier troubleshooting and maintenance

#### **Resource Efficiency:**
- Targeted execution based on triggers
- Scheduled vs. event-driven workflows
- Optimized CI/CD resource usage

#### **Developer Experience:**
- Clear workflow purposes and naming
- Focused failure investigation
- Granular workflow re-running

### Monitoring Dashboards

#### **GitHub Actions:**
- Workflow runs and success rates
- Resource usage and billing
- Artifact storage and retention

#### **External Services:**
- **Codecov:** Test coverage trends and reports
- **NPM:** Package download statistics and version adoption
- **Security:** GitHub Security tab for vulnerability tracking

---

## 📋 Quick Reference

### Workflow Files Structure
```
.github/workflows/
├── test.yml              # Unit testing across platforms
├── lint.yml              # Code quality and formatting
├── build.yml             # Build validation and CLI testing
├── coverage.yml          # Test coverage reporting
├── security-audit.yml    # Dependency vulnerability scanning
├── codeql-analysis.yml   # Static code security analysis
├── secrets-scan.yml      # Secrets and credentials detection
├── license-check.yml     # License compliance monitoring
├── publish.yml           # NPM package publishing
└── dependabot.yml        # Automated dependency updates
```

### Manual Workflow Triggers
```bash
# Run specific workflows manually
gh workflow run test.yml
gh workflow run lint.yml
gh workflow run build.yml
gh workflow run security-audit.yml
gh workflow run publish.yml -f npm-tag=beta
```

---

*This documentation reflects the modular workflow architecture. Last updated: October 26, 2025*