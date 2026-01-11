/**
 * Cloudflare Worker for Deep Space Tracker API
 * Handles all /api/* routes and proxies to JPL Horizons
 */

const HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api";

const SPACECRAFT = {
  voyager1: "-31",
  voyager2: "-32",
  newhorizons: "-98",
  juno: "-61",
  parker: "-96",
  bepicolombo: "-121"
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Route: /api/all
  if (url.pathname === '/api/all') {
    const results = {};
    
    for (const [name, horizonsId] of Object.entries(SPACECRAFT)) {
      const data = await fetchHorizonsData(horizonsId);
      if (!data.error) {
        data.spacecraft = name;
      }
      results[name] = data;
    }
    
    results.timestamp = new Date().toISOString();
    results.source = "JPL Horizons";
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Route: /api/voyager/:spacecraft  
  const match = url.pathname.match(/^\/api\/voyager\/(.+)$/);
  if (match) {
    const spacecraft = match[1];
    
    if (!SPACECRAFT[spacecraft]) {
      return new Response(
        JSON.stringify({ error: `Unknown spacecraft: ${spacecraft}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    const data = await fetchHorizonsData(SPACECRAFT[spacecraft]);
    
    if (data.error) {
      return new Response(JSON.stringify(data), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    data.spacecraft = spacecraft;
    data.timestamp = new Date().toISOString();
    data.source = "JPL Horizons";
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

async function fetchHorizonsData(spacecraftId) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: spacecraftId,
    EPHEM_TYPE: 'VECTORS',
    CENTER: '@sun',
    START_TIME: formatDate(today),
    STOP_TIME: formatDate(tomorrow),
    STEP_SIZE: '1d',
    OUT_UNITS: 'KM-S'
  });
  
  try {
    const response = await fetch(`${HORIZONS_API}?${params}`);
    const data = await response.json();
    
    if (!data.result) {
      return { error: "No result in Horizons response" };
    }
    
    return parseHorizonsVectors(data.result);
  } catch (error) {
    return { error: `Failed to fetch from Horizons: ${error.message}` };
  }
}

function parseHorizonsVectors(resultText) {
  const match = resultText.match(/\$\$SOE\n(.+?)\n\$\$EOE/s);
  if (!match) return { error: "Failed to parse Horizons data" };
  
  const dataBlock = match[1];
  
  const x = parseFloat(dataBlock.match(/X\s*=\s*([-\d.E+]+)/)?.[1]);
  const y = parseFloat(dataBlock.match(/Y\s*=\s*([-\d.E+]+)/)?.[1]);
  const z = parseFloat(dataBlock.match(/Z\s*=\s*([-\d.E+]+)/)?.[1]);
  const vx = parseFloat(dataBlock.match(/VX\s*=\s*([-\d.E+]+)/)?.[1]);
  const vy = parseFloat(dataBlock.match(/VY\s*=\s*([-\d.E+]+)/)?.[1]);
  const vz = parseFloat(dataBlock.match(/VZ\s*=\s*([-\d.E+]+)/)?.[1]);
  const rg = parseFloat(dataBlock.match(/RG\s*=\s*([-\d.E+]+)/)?.[1]);
  const rr = parseFloat(dataBlock.match(/RR\s*=\s*([-\d.E+]+)/)?.[1] || 0);
  const lt = parseFloat(dataBlock.match(/LT\s*=\s*([-\d.E+]+)/)?.[1]);
  
  if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(vx) || isNaN(vy) || isNaN(vz)) {
    return { error: "Failed to parse Horizons data" };
  }
  
  const velocityKms = Math.sqrt(vx**2 + vy**2 + vz**2);
  const AU_KM = 149597870.7;
  
  return {
    position_km: { x, y, z },
    velocity_kms: { vx, vy, vz },
    distance_km: rg,
    distance_au: rg / AU_KM,
    total_velocity_kms: velocityKms,
    total_velocity_au_yr: (velocityKms / AU_KM) * 31557600,
    radial_velocity_kms: rr,
    light_time_seconds: lt,
    light_time_hours: lt / 3600
  };
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}