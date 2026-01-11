# Deep Space Tracker

Live tracking of active interplanetary spacecraft with real-time data from NASA's JPL Horizons system.

**Live Site:** https://space.inwaves.io

## Features

- Real-time position and velocity data for 6 active deep space missions
- ASCII art visualizations of each spacecraft
- Logarithmic distance scale showing entire solar system
- Velocity comparisons across missions
- Mission timelines with key milestones
- Auto-refreshing data every 60 seconds

## Tracked Spacecraft

| Spacecraft | Launch | Destination | Current Distance |
|------------|--------|-------------|------------------|
| Voyager 1 | 1977 | Interstellar space | ~169 AU |
| Voyager 2 | 1977 | Interstellar space | ~142 AU |
| New Horizons | 2006 | Kuiper Belt | ~60 AU |
| Juno | 2011 | Jupiter system | ~5.2 AU |
| Parker Solar Probe | 2018 | Sun corona | ~0.5-0.07 AU |
| BepiColombo | 2018 | Mercury orbit | ~0.8 AU |

## Architecture

- **Frontend:** Static HTML/CSS/JavaScript
- **Backend:** Cloudflare Workers (serverless functions)
- **Data Source:** NASA JPL Horizons API
- **Hosting:** Cloudflare Pages

## Deployment to Cloudflare Pages

### Prerequisites

- GitHub account
- Cloudflare account (free tier)
- Domain configured in Cloudflare (optional, for custom subdomain)

### Setup Steps

1. **Create GitHub Repository**
   ```bash
   # Create new repo: space-tracker
   # Push this code to main branch
   ```

2. **Connect to Cloudflare Pages**
   - Go to Cloudflare Dashboard → Pages → Create project
   - Connect to GitHub and select `space-tracker` repository
   - Configure build settings:
     - **Build command:** (leave empty)
     - **Build output directory:** `/`
     - **Root directory:** `/`
   - Click "Save and Deploy"

3. **Configure Custom Domain** (Optional)
   - After first deployment: Pages → Custom domains
   - Add `space.inwaves.io` (or your preferred subdomain)
   - Cloudflare will auto-configure DNS if domain is on Cloudflare
   - Otherwise, add CNAME record: `space` → `<your-pages-url>.pages.dev`

4. **Verify Deployment**
   - Visit your site (e.g., https://space.inwaves.io)
   - Check for "LIVE" indicator showing connection to JPL Horizons
   - Verify spacecraft data updates

### Local Development

For local testing, you can use the original Flask server:

```bash
cd voyager/  # Use the original development directory
python server.py
```

Or use Wrangler CLI to test Workers locally:

```bash
npm install -g wrangler
wrangler pages dev .
```

## Project Structure

```
space-tracker/
├── index.html                 # Main page (static)
├── functions/                 # Cloudflare Workers
│   └── api/
│       └── [[route]].js      # API handler (catches all /api/* routes)
└── README.md
```

## API Endpoints

Cloudflare Workers automatically serve these endpoints:

- `GET /api/all` - Returns data for all tracked spacecraft
- `GET /api/voyager/:spacecraft` - Returns data for specific spacecraft
  - Available spacecraft: voyager1, voyager2, newhorizons, juno, parker, bepicolombo

## Data Source

All spacecraft ephemeris data is fetched in real-time from:
- **NASA JPL Horizons System:** https://ssd.jpl.nasa.gov/horizons/

The Horizons API provides:
- Heliocentric position vectors (X, Y, Z in km)
- Velocity vectors (VX, VY, VZ in km/s)
- Distance from Sun, light travel time
- Updated to current date

## Cost

**\$0 forever** on Cloudflare's free tier:
- 500 builds/month (only need ~1)
- Unlimited requests
- Unlimited bandwidth
- 100,000 Worker requests/day (tracker uses ~1,440/day)

## License

MIT License - Free to use and modify

## Credits

- Spacecraft data: NASA JPL Horizons
- Spacecraft icons: NASA
- ASCII art generation: Custom Python script using Pillow
- Built by Andrei Alexandru (https://inwaves.io)