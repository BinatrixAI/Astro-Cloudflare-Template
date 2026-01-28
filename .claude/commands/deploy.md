---
name: deploy
description: Full deployment workflow - update docs, version, git push, and deploy to Cloudflare Workers
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Full Deployment Workflow

This command executes a complete deployment pipeline including documentation updates, versioning, git operations, and Cloudflare deployment.

## Step 1: Update CLAUDE.md

Review and update CLAUDE.md with:
- Any new patterns, conventions, or learnings from this session
- New components, utilities, or architectural decisions
- Updated file references if structure changed
- New environment variables or configuration options
- Bug fixes or workarounds discovered

Check for memory files or session notes that should be incorporated:
- Review recent changes with `git diff`
- Check for TODO comments in code
- Look for any `.md` files with session notes

## Step 2: Update README.md

Ensure README.md reflects current state:
- Update feature list if new features added
- Update installation/setup instructions if changed
- Update any outdated screenshots or examples
- Verify all links are working

## Step 3: Determine Version Bump

Analyze changes to determine version type:

**MAJOR version (x.0.0)** - Breaking changes:
- API changes that break existing integrations
- Removal of features or endpoints
- Database schema changes requiring migration
- Major UI/UX overhaul

**MINOR version (0.x.0)** - New features:
- New pages or components
- New API endpoints
- New integrations or bindings
- Significant enhancements

**PATCH version (0.0.x)** - Bug fixes:
- Bug fixes
- Typo corrections
- Minor styling adjustments
- Performance optimizations
- Documentation updates only

Ask user to confirm version type if unclear.

## Step 4: Generate Release Notes

Create comprehensive release notes including:

```markdown
## What's New
- [List new features with brief descriptions]

## Improvements
- [List enhancements and optimizations]

## Bug Fixes
- [List bugs that were fixed]

## Breaking Changes (if any)
- [List any breaking changes with migration steps]

## Technical Details
- [List technical changes: dependencies, config, etc.]
```

## Step 5: Git Operations

Execute in order:
1. Stage all changes: `git add -A`
2. Create commit with descriptive message
3. Create git tag with version: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
4. Push commits: `git push origin <branch>`
5. Push tags: `git push origin --tags`

## Step 6: Create GitHub Release

Use GitHub CLI to create release:
```bash
gh release create vX.Y.Z --title "vX.Y.Z - [Release Title]" --notes-file release-notes.md
```

Or interactively:
```bash
gh release create vX.Y.Z --generate-notes
```

## Step 7: Deploy to Cloudflare Workers

Execute deployment:
```bash
npm run build && wrangler deploy
```

Verify deployment:
1. Check Cloudflare dashboard for successful deployment
2. Test the live site at configured domain
3. Verify critical functionality works

## Step 8: Post-Deployment

After successful deployment:
1. Update version in package.json if not already done
2. Announce release if needed (Slack, email, etc.)
3. Monitor for any errors in Cloudflare logs: `wrangler tail`

---

## Quick Reference Commands

```bash
# Check current version
cat package.json | grep version

# View recent commits for release notes
git log --oneline -20

# View all changes since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Create and push release
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin main --tags
gh release create v1.2.3 --generate-notes

# Deploy to Cloudflare
npm run deploy

# Monitor deployment
wrangler tail
```
