// ============================================================================
// STEAMED HAMS: THE WORST ENGINEER - BACKEND API SERVER
// Royal Ministry of Questionable Engineering & Catastrophe Archival
// Runs on port 3001 with zero external dependencies (Node.js native http)
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'records.json');

// Default Victorian leaderboard records
const DEFAULT_LEADERBOARD = [
  {
    name: "Lord Bartholomew Piston-Twist",
    time: 142.5,
    deaths: 8,
    steamVented: 1420,
    upgrades: ["Gold-Plated Knees"],
    rank: "Grand High Disaster Architect",
    date: "1889-04-12"
  },
  {
    name: "Lady Clementine Gear-Snapper",
    time: 165.2,
    deaths: 14,
    steamVented: 2890,
    upgrades: ["Premium Steam", "Quantum Gear"],
    rank: "Honorary Boiler Detonator",
    date: "1891-11-03"
  },
  {
    name: "Archibald Steam-Blower Esq.",
    time: 198.8,
    deaths: 21,
    steamVented: 4100,
    upgrades: ["Inverted Cup Holder"],
    rank: "Senior Incompetence Inspector",
    date: "1894-02-28"
  }
];

// In-memory data store with file persistence
let store = {
  leaderboard: [...DEFAULT_LEADERBOARD],
  incidents: [],
  boilerTemperature: 98.4
};

// Load saved data if present
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    store = JSON.parse(raw);
  }
} catch (err) {
  console.warn('[SERVER] Could not load stored records, using defaults:', err.message);
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[SERVER] Failed to persist data:', err.message);
  }
}

// Ridiculous advice quotes from the Royal Ministry
const ADVICE_POOL = [
  "When pressure exceeds red indicators, applying more pressure will not solve the issue.",
  "Left and right are philosophical viewpoints; the gearbox reserves the right to disagree.",
  "Gold-plated knees add no structural integrity, but improve morale amongst scrap merchants.",
  "If the engine hums cheerfully, it is preparing for an unscheduled thermal disassembly.",
  "Please refrain from oiling the machine. The rust is holding the structural rivets together.",
  "The Royal Engineering Office closes precisely at tea time. Speed is ungentlemanly, yet mandatory.",
  "In event of catastrophic boiler rupture, please fill out Form 702-C posthumously."
];

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Helper for JSON responses
  const sendJson = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };

  // 1. Healthcheck
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(200, {
      status: 'operational_under_duress',
      engine: 'Steamed Hams Mk.IV',
      pressureKPa: Math.floor(Math.random() * 40 + 80),
      message: 'The Ministry confirms all levers are improperly calibrated.'
    });
  }

  // 2. Leaderboard / Deliveries
  if (req.method === 'GET' && pathname === '/api/leaderboard') {
    const sorted = [...store.leaderboard].sort((a, b) => a.time - b.time);
    return sendJson(200, {
      success: true,
      records: sorted.slice(0, 10)
    });
  }

  // 3. Submit Delivery Record
  if (req.method === 'POST' && pathname === '/api/records') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const record = JSON.parse(body);
        record.date = new Date().toISOString().split('T')[0];
        store.leaderboard.push(record);
        saveStore();
        console.log(`[MINISTRY] New record received from ${record.name || 'Anonymous Engineer'}! Time: ${record.time}s`);
        return sendJson(201, {
          success: true,
          message: 'The Royal Office acknowledges receipt of one (1) gear. The rail network remains offline.',
          record
        });
      } catch (err) {
        return sendJson(400, { error: 'Invalid JSON request payload' });
      }
    });
    return;
  }

  // 4. Report Catastrophic Incident / Explosion
  if (req.method === 'POST' && pathname === '/api/incident') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const incident = JSON.parse(body);
        incident.timestamp = new Date().toISOString();
        store.incidents.push(incident);
        if (store.incidents.length > 50) store.incidents.shift();
        saveStore();
        return sendJson(201, {
          success: true,
          notice: 'Catastrophe duly recorded in the Royal Misfortune Registry.'
        });
      } catch (err) {
        return sendJson(400, { error: 'Invalid incident payload' });
      }
    });
    return;
  }

  // 5. Absurd Advice Endpoint
  if (req.method === 'GET' && pathname === '/api/advice') {
    const randomAdvice = ADVICE_POOL[Math.floor(Math.random() * ADVICE_POOL.length)];
    return sendJson(200, {
      advice: randomAdvice,
      source: "Royal Board of Questionable Inventions"
    });
  }

  // Fallback 404
  sendJson(404, { error: 'Endpoint not found in the Royal Registry' });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` STEAMED HAMS: ROYAL ENGINEERING BACKEND API`);
  console.log(` Server active on http://localhost:${PORT}`);
  console.log(` Endpoints:`);
  console.log(`  - GET  http://localhost:${PORT}/api/health`);
  console.log(`  - GET  http://localhost:${PORT}/api/leaderboard`);
  console.log(`  - POST http://localhost:${PORT}/api/records`);
  console.log(`  - POST http://localhost:${PORT}/api/incident`);
  console.log(`  - GET  http://localhost:${PORT}/api/advice`);
  console.log(`================================================================`);
});
