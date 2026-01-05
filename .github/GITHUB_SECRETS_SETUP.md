# GitHub Secrets Configuration Guide

This guide explains how to configure GitHub Secrets for CI/CD workflows.

## 📋 Required Secrets

### **Repository Secrets** (Settings → Secrets and variables → Actions)

#### Staging Environment

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `STAGING_HOST` | Staging server hostname or IP | `staging.bvs.com` or `192.168.1.100` |
| `STAGING_USER` | SSH username | `deploy` or `ubuntu` |
| `STAGING_SSH_KEY` | Private SSH key for authentication | `-----BEGIN RSA PRIVATE KEY-----...` |
| `STAGING_PORT` | SSH port (optional, default: 22) | `22` |
| `STAGING_DEPLOY_PATH` | Path to project on server | `/var/www/bvs-staging` |
| `STAGING_URL` | Public staging URL | `https://staging.bvs.com` |
| `STAGING_API_URL` | API URL for frontend build | `https://staging.bvs.com` |

#### Production Environment

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PROD_HOST` | Production server hostname or IP | `bvs.com` or `prod.bvs.com` |
| `PROD_USER` | SSH username | `deploy` |
| `PROD_SSH_KEY` | Private SSH key for authentication | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PROD_PORT` | SSH port (optional, default: 22) | `22` |
| `PROD_DEPLOY_PATH` | Path to project on server | `/var/www/bvs-production` |
| `PROD_URL` | Public production URL | `https://bvs.com` |
| `PROD_API_URL` | API URL for frontend build | `https://api.bvs.com` |

#### Notifications (Optional)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SLACK_WEBHOOK` | Slack webhook URL for notifications | `https://hooks.slack.com/services/...` |

---

## 🔐 How to Add Secrets

### 1. Navigate to Repository Settings

```
Your Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2. Add Each Secret

For each secret listed above:
1. Click "New repository secret"
2. Enter the secret name exactly as shown (case-sensitive)
3. Paste the secret value
4. Click "Add secret"

---

## 🔑 Generating SSH Keys

If you don't have SSH keys for deployment:

```bash
# Generate a new SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@bvs" -f ~/.ssh/bvs_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/bvs_deploy.pub user@server

# Add private key to GitHub Secrets
cat ~/.ssh/bvs_deploy  # Copy this content to STAGING_SSH_KEY or PROD_SSH_KEY
```

**Important**: Never commit private keys to the repository!

---

## 🌐 Environment Configuration

### Create GitHub Environments

1. Go to **Settings → Environments**
2. Create two environments:
   - **staging** (no protection rules)
   - **production** (with protection rules)

### Configure Production Environment Protection

For the **production** environment:

1. ✅ **Required reviewers**: Add 1-2 reviewers who must approve deployments
2. ✅ **Wait timer**: Optional 5-minute wait before deployment
3. ✅ **Deployment branches**: Only `main` or tags matching `v*`

This ensures production deployments require manual approval.

---

## 🧪 Testing the Setup

### Test CI Workflow

```bash
# Create a test branch
git checkout -b test/ci-workflow

# Make a small change
echo "# Test" >> README.md

# Push and create PR
git add .
git commit -m "test: CI workflow"
git push origin test/ci-workflow
```

Then create a PR on GitHub. The CI workflow should run automatically.

### Test Staging Deployment

```bash
# Merge PR to main
# Staging deployment will trigger automatically
```

Monitor the deployment in **Actions** tab.

### Test Production Deployment

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# Go to Actions → Deploy to Production → Run workflow
# Select version: v1.0.0
# Approve deployment when prompted
```

---

## 📊 Verifying Secrets

To verify secrets are configured correctly (without exposing values):

```bash
# Check if secret exists (will not show value)
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_ORG/YOUR_REPO/actions/secrets
```

Or simply try running a workflow - it will fail with clear error messages if secrets are missing.

---

## 🔒 Security Best Practices

1. **Rotate keys regularly**: Change SSH keys every 6-12 months
2. **Use dedicated deploy users**: Don't use root or personal accounts
3. **Limit SSH key access**: Create keys with minimal required permissions
4. **Monitor deployments**: Review deployment logs regularly
5. **Enable 2FA**: Require 2FA for GitHub accounts with deployment access
6. **Review access**: Periodically review who has access to secrets

---

## 🆘 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution**: Verify SSH key is correctly added to GitHub Secrets and to server's `~/.ssh/authorized_keys`

### Issue: "Host key verification failed"

**Solution**: Add server to known_hosts:

```bash
# On GitHub runner, add this step:
- name: Add server to known hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts
```

### Issue: "Connection timed out"

**Solution**: Check firewall rules allow GitHub Actions IPs, or use a VPN/bastion host

### Issue: Health check fails

**Solution**: Verify `STAGING_URL` or `PROD_URL` is correct and accessible from GitHub runners

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Deployment Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)

---

**Last Updated**: 2026-01-05
**Sprint**: 8 - DevOps Crítico Parte 2
