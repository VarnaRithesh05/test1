# GitHub Webhook Setup Guide

## Overview

AutoPatcher includes a GitHub webhook endpoint that automatically analyzes YAML files whenever you push changes to your repository. This guide explains how to set it up.

## Prerequisites

1. AutoPatcher deployed and running
2. GitHub repository with YAML files (Docker Compose, GitHub Actions, etc.)
3. Admin access to the GitHub repository

## Setup Steps

### 1. Generate a Webhook Secret

First, generate a secure random secret for webhook signature verification:

```bash
# Generate a random secret (use one of these methods)
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated secret - you'll need it in the next steps.

### 2. Configure Environment Variables

Add these environment variables to your AutoPatcher deployment:

```env
GITHUB_WEBHOOK_SECRET=your_generated_secret_here
GITHUB_TOKEN=your_github_personal_access_token  # Optional, for private repos
```

**Note:** `GITHUB_TOKEN` is only required if you want to analyze YAML files in private repositories.

### 3. Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure the webhook:
   - **Payload URL**: `https://your-autopatcher-domain.com/api/github-webhook`
   - **Content type**: `application/json`
   - **Secret**: Paste the secret you generated in step 1
   - **Which events**: Select "Just the push event"
   - **Active**: ✓ Checked

4. Click **Add webhook**

### 4. Test the Webhook

1. Make a change to any YAML file in your repository
2. Commit and push the change
3. Go to **Settings** → **Webhooks** → Click your webhook
4. Scroll to **Recent Deliveries**
5. Click on the latest delivery to see the response

**Expected Response:**
```json
{
  "message": "Analyzed 1 YAML file(s)",
  "repository": "your-username/your-repo",
  "analyzed": [
    {
      "file": "path/to/file.yml",
      "analysis": {
        "is_correct": true,
        "corrected_yaml": "...",
        "explanation": "..."
      }
    }
  ]
}
```

## Webhook Behavior

### What Gets Analyzed

The webhook automatically analyzes:
- Files ending in `.yml` or `.yaml`
- Only files that were added or modified in the push
- All commits in the push event

### Security

The webhook uses HMAC-SHA256 signature verification:
- GitHub signs each request using your secret
- AutoPatcher verifies the signature before processing
- Unsigned or invalid requests are rejected with `403 Forbidden`

### Response Codes

- `200 OK`: Successfully processed the webhook
- `403 Forbidden`: Invalid or missing signature
- `400 Bad Request`: Invalid payload format
- `500 Internal Server Error`: Server error during processing

## Troubleshooting

### Webhook Returns 403 Forbidden

**Cause:** Signature verification failed

**Solutions:**
1. Verify `GITHUB_WEBHOOK_SECRET` matches the secret configured in GitHub
2. Ensure the secret has no leading/trailing whitespace
3. Restart AutoPatcher after adding/changing the secret

### Webhook Returns 404 Not Found

**Cause:** Incorrect webhook URL

**Solution:** Double-check the Payload URL in GitHub webhook settings

### Files Not Being Analyzed

**Cause:** Files might not be recognized as YAML

**Solutions:**
1. Ensure files end in `.yml` or `.yaml`
2. Check the webhook delivery details in GitHub to see which files were detected

### Private Repository Access Issues

**Cause:** AutoPatcher can't fetch file content

**Solutions:**
1. Add a GitHub Personal Access Token with `repo` scope
2. Set it as `GITHUB_TOKEN` environment variable
3. Restart AutoPatcher

## Example Workflow

1. Developer pushes code to GitHub
2. GitHub sends webhook to AutoPatcher
3. AutoPatcher extracts YAML files from the commit
4. AutoPatcher fetches file content from GitHub
5. AI analyzes each YAML file
6. Results are returned to GitHub (viewable in webhook deliveries)

## Advanced Configuration

### Custom Token Scopes

If using `GITHUB_TOKEN`, ensure it has:
- `repo` (for private repositories)
- `public_repo` (for public repositories)

### Rate Limits

GitHub API has rate limits:
- **Without authentication**: 60 requests/hour
- **With authentication**: 5,000 requests/hour

For repositories with frequent pushes, configure `GITHUB_TOKEN` to avoid rate limiting.

## Security Best Practices

1. **Always use a strong webhook secret** (at least 32 characters)
2. **Never commit secrets** to your repository
3. **Use environment variables** for all sensitive data
4. **Rotate secrets periodically** (update both GitHub and AutoPatcher)
5. **Monitor webhook deliveries** for suspicious activity

## Need Help?

If you encounter issues:
1. Check webhook delivery details in GitHub
2. Review AutoPatcher server logs
3. Verify all environment variables are set correctly
4. Ensure AutoPatcher is accessible from GitHub's webhook servers
