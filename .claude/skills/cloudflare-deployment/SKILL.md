---
name: cloudflare-deployment
description: Cloudflare Workers deployment patterns for Astro sites
---

# Cloudflare Workers Deployment

## Wrangler Configuration

Key settings in `wrangler.jsonc`:
```jsonc
{
  "name": "my-site",
  "account_id": "YOUR_ACCOUNT_ID",
  "main": "dist/_worker.js/index.js",
  "compatibility_date": "2025-08-15",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  }
}
```

## Deployment Commands

```bash
# Build and deploy
npm run deploy

# Deploy only (after build)
wrangler deploy

# Preview locally with Wrangler
npx wrangler pages dev ./dist --port 8799

# View logs
wrangler tail
```

## Custom Domains

Add to `wrangler.jsonc`:
```jsonc
"routes": [
  { "pattern": "example.com", "custom_domain": true },
  { "pattern": "www.example.com/*", "zone_name": "example.com" }
]
```

## Environment Variables

For secrets:
```bash
wrangler secret put MY_SECRET
```

For non-secrets, add to `wrangler.jsonc`:
```jsonc
"vars": {
  "PUBLIC_API_URL": "https://api.example.com"
}
```

## Workers Builds (CI/CD)

Enable in `wrangler.jsonc`:
```jsonc
"build": {
  "command": "npm run build"
}
```

Connect your GitHub/GitLab repo in Cloudflare dashboard.

## Debugging

```bash
# View recent logs
wrangler tail

# List deployments
wrangler deployments list

# Rollback
wrangler rollback
```

## Common Issues

1. **Node.js APIs not working**: Ensure `nodejs_compat` flag is enabled
2. **Assets not loading**: Check `assets.directory` path
3. **Build failing**: Verify `compatibility_date` is recent enough
