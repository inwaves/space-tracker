# Cloudflare Pages Deployment Guide

## Step 1: Create GitHub Repository

```bash
# On GitHub, create new repository: space-tracker
# Clone it locally:
git clone https://github.com/inwaves/space-tracker.git
cd space-tracker

# Copy these files into the repo:
cp -r /path/to/space-tracker/* .

# Commit and push:
git add .
git commit -m "Initial commit: Deep Space Tracker"
git push origin main
```

## Step 2: Connect to Cloudflare Pages

1. Log in to Cloudflare Dashboard
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create project** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select repository: `inwaves/space-tracker`
6. Configure build settings:
   - **Project name:** `space-tracker` (or choose your own)
   - **Production branch:** `main`
   - **Build command:** (leave empty)
   - **Build output directory:** `/`
   - **Root directory:** `/`
7. Click **Save and Deploy**

Cloudflare will deploy in ~30 seconds. You'll get a URL like `space-tracker.pages.dev`.

## Step 3: Configure Custom Domain

**Prerequisites:** Your domain (inwaves.io) must be using Cloudflare nameservers.

1. Go to your deployed project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `space.inwaves.io`
4. Click **Activate domain**

Cloudflare will automatically:
- Create the DNS record
- Provision SSL certificate
- Configure routing

DNS propagation takes ~5-10 minutes. After that, `https://space.inwaves.io` will work.

## Step 4: Verify Deployment

Visit your site and check:

- ✅ Page loads correctly
- ✅ "LIVE" indicator appears at top
- ✅ Spacecraft data shows recent values (not fallback data)
- ✅ All 6 spacecraft tabs work
- ✅ Wikipedia links open in new tabs
- ✅ ASCII art displays correctly

If you see "CACHED" indicator, check:
- Cloudflare Pages dashboard for deployment errors
- Browser console for JavaScript errors
- Worker logs in Cloudflare Dashboard → Workers & Pages → Functions

## Step 5: Update Main Site Link

On your inwaves.github.io repository:

1. Edit `config.toml` to add the navigation link (already done in our changes)
2. Commit and push
3. GitHub Actions will rebuild and deploy your main site
4. The "space tracker" link will appear in your navigation

## Troubleshooting

### "CACHED" instead of "LIVE"

Check Worker logs:
1. Cloudflare Dashboard → Workers & Pages
2. Select your deployment
3. Click **Functions** tab
4. View real-time logs

Common issues:
- Horizons API timeout (30s limit on Workers)
- Parsing error in Worker code
- Network issues fetching from JPL

### ASCII Art Not Showing

Ensure backticks and backslashes in spacecraftAscii are properly escaped in JavaScript string literals.

### 404 on /api/all

Verify the `functions/api/[[route]].js` file exists and is in the correct location.
Cloudflare Pages automatically detects files in `functions/` directory.

## Local Testing with Wrangler

Optional: Test Workers locally before deploying.

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Start local dev server
wrangler pages dev .

# Site will run at http://localhost:8788
```

## Updating the Site

After initial deployment, updates are automatic:

```bash
# Make changes to index.html or Worker code
git add .
git commit -m "Update: description of changes"
git push

# Cloudflare auto-deploys in ~30 seconds
```

No manual rebuild needed - Cloudflare watches your GitHub repo.

## Performance Notes

- **Global CDN:** Page loads from 200+ edge locations worldwide
- **Worker response time:** Typically 50-200ms (depends on Horizons API)
- **Caching:** Consider adding Cache API to Worker if Horizons is slow

## Cost

Cloudflare Pages free tier includes:
- Unlimited requests and bandwidth
- 500 builds/month (way more than needed)
- 100,000 Worker invocations/day

**Expected usage:** ~1,440 Worker requests/day (one per minute if someone's watching continuously)

**Total cost:** \$0/month