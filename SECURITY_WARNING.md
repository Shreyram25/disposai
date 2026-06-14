# ⚠️ SECURITY WARNING

## API Keys in Repository

**IMPORTANT**: Your `.env` file containing API keys is currently tracked in git (as requested). This means your API keys will be committed to the repository.

### Risks:
1. **Public Repository**: If this repo is public, your API keys will be exposed to anyone
2. **Git History**: Even if you later remove the keys, they remain in git history
3. **Unauthorized Usage**: Exposed keys can be used by others, incurring charges on your account
4. **Security Breach**: Compromised keys can be used maliciously

### Recommended Actions:

#### Option 1: Make Repository Private (Recommended)
- If using GitHub/GitLab, make the repository private
- This limits exposure to authorized collaborators only

#### Option 2: Use Environment Variables in Production
- For production deployments, use platform-specific environment variable systems:
  - **Vercel**: Project Settings → Environment Variables
  - **Netlify**: Site Settings → Environment Variables
  - **Railway/Render**: Environment tab in dashboard
- Never commit `.env` files to production repos

#### Option 3: Rotate API Keys (If Already Exposed)
If your keys have been exposed in a public repository:
1. **OpenAI**: Go to https://platform.openai.com/api-keys and revoke the exposed key
2. **Google Maps**: Go to https://console.cloud.google.com/apis/credentials and delete/regenerate the key
3. Create new keys and update your `.env` file
4. Update any deployed applications with the new keys

### Best Practices Going Forward:

1. **Use `.env.example`** for documentation:
   ```env
   VITE_OPENAI_API_KEY=your_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

2. **Keep `.env` in `.gitignore`** (standard practice):
   ```
   .env
   .env.local
   .env.*.local
   ```

3. **Use separate keys for development and production**

4. **Monitor API usage** regularly:
   - OpenAI: https://platform.openai.com/usage
   - Google Cloud: https://console.cloud.google.com/billing

### Current Status:
- ✅ `.env` file created with your API keys
- ⚠️ `.env` is tracked in git (as you requested)
- ⚠️ Keys will be visible in repository

### If You Want to Remove Keys from Git:
If you change your mind and want to remove the keys from git tracking:

```bash
# Remove from git (but keep local file)
git rm --cached .env

# Add to .gitignore
echo ".env" >> .gitignore

# Commit the change
git commit -m "Remove .env from tracking"
```

**Note**: This won't remove keys from git history. If already pushed, you'll need to use `git filter-branch` or BFG Repo-Cleaner to remove from history.

