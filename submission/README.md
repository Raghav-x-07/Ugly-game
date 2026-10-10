# STEAMED HAMS: THE WORST ENGINEER
### *A Revolutionary Machine Designed by Someone Who Has Never Operated a Machine*

**Game Vita 5.0 Entry** | **Theme: Steampunk** | **Category: “The Worst Game Wins”**

---

## 👥 Team Information
* **Team Name:** [INSERT YOUR TEAM NAME HERE]
* **Game Title:** STEAMED HAMS: THE WORST ENGINEER
* **Version:** 1.0.0 (Competition Ready)
* **Jam:** Game Vita 5.0

---

## 🎩 Game Description
You are an exceptionally terrible Victorian engineer piloting an absurd steam-powered bipedal walking contraption. Your solemn duty under Royal Contract #1889-B is to deliver **one single brass gear** across an industrial foundry to the Royal Engineering Office.

Unfortunately, every single component of your machine is catastrophically inconvenient.

Navigate an obstacle course of high-torque hazard cogs, manage erratic boiler steam pressure, file triplicate government paperwork to open blast doors, install completely useless patent upgrades, and survive an emotional gearbox that periodically debates the philosophical definition of "Right".

---

## 🕹️ Controls

| Key | Mechanical Action | Operational Detail |
|---|---|---|
| **A / D** or **Left / Right** | Shuffle Contraption | Accelerates with clumsy steam momentum. Walking steadily builds boiler pressure. |
| **Space** | The Bureaucratic Jump | Requires at least 20% steam pressure. If pressed on empty, the machine emits a tragic wheeze! |
| **W** | Vent Steam Valve | Releases excess steam pressure to prevent catastrophic boiler detonation. |
| **E** | Operate / File Paperwork | Stamps bureaucratic forms at blast doors and installs useless upgrades at patent terminals. |
| **R** | Reconstruct Machine | Instantly reassembles your contraption after a catastrophic explosion. |
| **Esc** | Emergency Brake | Pauses boiler combustion and opens the pause menu. |

---

## 🚀 How to Run the Project

This project includes both a **Frontend** and a **Backend** architecture. Both can be run concurrently from the root directory or launched independently.

### Option 1: Run Full Stack (Backend + Frontend together)
From the root workspace directory (`BadGame`):
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:3001`

### Option 2: Run Frontend Only
```bash
cd frontend
npm run dev
```
* Or open `frontend/index.html` directly in any modern browser! The game is 100% self-contained and operates gracefully with local storage if the backend is offline.

### Option 3: Run Backend Only
```bash
cd backend
npm run dev
```
* Runs the Royal Ministry of Questionable Engineering API on `http://localhost:3001`.

---

## ⚙️ Steampunk Theme Implementation
* **Aesthetic Palette:** Polished brass, weathered copper, charcoal iron, and warm gaslight amber glows.
* **Procedural Canvas Rendering:** Walking bipedal contraption with animated pistons, jointed legs, cyclopean glowing visor, smoking chimney, and a mechanical claw holding the spinning brass gear.
* **Victorian Machinery World:** Multi-layered parallax background with rotating silhouette clockwork gears, iron truss girders, glowing arched foundry furnace windows, and drifting steam clouds.
* **Physical Analog Gauges:** Brass-rimmed analog pressure dials with moving needles and redline danger zones.
* **Procedural Web Audio Engine:** 100% synthesized sound without external assets: steam hisses, piston clanks, ratcheting gear clicks, overpressure steam whistles, comical failure trombones, and pompous Royal victory fanfares.

---

## 🤡 The 5 Signature Intentionally Terrible Mechanics

### 1. The Reversed Direction Gearbox
Passing the experimental magnetic transmission zone triggers a loud mechanical clunk and flashing warning:
> *“ENGINEERING UPDATE: LEFT NOW MEANS EMOTIONAL RIGHT.”*
Controls invert horizontally for 12 seconds. Telegraphed and learnable, yet delightfully confusing.

### 2. Steam Pressure Management & Critical Overheat
* Walking pumps pistons and steadily increases boiler pressure.
* Jumping consumes 20% pressure.
* Venting (W) blows off excess pressure.
* If pressure hits 100%, a 5-second emergency countdown begins with screeching steam whistles. Failure to vent results in a catastrophic boiler explosion!

### 3. The Bureaucratic Jump
Jumping is a government-regulated privilege:
* If steam pressure is < 20%, the machine wheezes pathetically and emits a tiny puff of dust.
* At >= 20%, the steam piston fires with a mighty clank and launches the contraption upward.

### 4. Sir Clanksworth-v0.1 (The Unhelpful Assistant)
A monocled brass drone hovering nearby providing unhelpful commentary:
* *“Splendid progress! You are now 3 metres farther from the factory entrance.”*
* *“Have you tried turning the entire contraption off and striking it with an iron mallet?”*
* *“Warning: The warning detection apparatus has detected a warning about a missing warning.”*
* Contextually reacts to jumps, overheats, door interactions, idling, and deaths.

### 5. The Useless Patent Upgrade Terminal
A pneumatic terminal offering four ridiculous enhancements:
* **Gold-Plated Knees:** Increases machine mass by 300%. Makes footsteps thunderous and screen shake catastrophic.
* **Artisanal Steam Extract:** Infuses exhaust with regal golden sparkles and an unnecessarily loud royal trumpet fanfare.
* **Quantum Gear of Apathy:** Spins an auxiliary decorative cog at 12,000 RPM connected to absolutely nothing.
* **Inverted Cup Holder:** An upside-down porcelain teacup that continuously spills virtual Earl Grey tea.

### Bonus Mechanic: The Bureaucratic Triplicate Door
A massive blast door requiring the player to press `[E]` three times to file Forms 104-A, 104-B, and 104-C before opening.

---

## 🛠️ Technical Details & Architecture

```
BadGame/
├── frontend/                  # Frontend Game Client
│   ├── dev-server.js          # Zero-dependency instant HTTP dev server
│   ├── index.html             # UI overlay, analog dials, canvas
│   ├── style.css              # Rich Victorian Steampunk CSS styling
│   ├── audio.js               # Web Audio API procedural sound engine
│   ├── robot.js               # Sir Clanksworth AI assistant & dialogue logic
│   ├── player.js              # Contraption physics, steam pressure, procedural rendering
│   ├── level.js               # Handcrafted platforms, cogs, doors, parallax renderer
│   ├── game.js                # State machine, particles, input, backend sync
│   └── package.json           # Frontend scripts (npm run dev)
├── backend/                   # Backend Records & Bureaucracy API
│   ├── server.js              # Node.js zero-dependency HTTP REST API
│   ├── records.json           # Leaderboard & incident persistence
│   └── package.json           # Backend scripts (npm run dev)
├── submission/                # Self-contained ZIP-ready competition bundle
│   ├── index.html, style.css, audio.js, robot.js, player.js, level.js, game.js
│   └── SUBMISSION_CHECKLIST.md
├── dev.js                     # Concurrent runner for root npm run dev
├── package.json               # Root scripts
└── README.md                  # Project documentation
```

* **Game Loop:** Delta-time (`dt`) based `requestAnimationFrame` loop, frame-rate independent.
* **Collision Detection:** Continuous AABB physics with platform snapping and one-way riding moving platforms.
* **Zero External Dependencies:** Built with vanilla HTML5, Canvas 2D, Web Audio API, and native Node.js. No npm download lag or broken dependencies.
* **Offline Resilience:** If backend is not running, frontend automatically falls back to `localStorage` for leaderboards and records.

---

## 🔍 Known Limitations
* The Royal Ministry confirms that despite delivering the gear, the national railway network remains completely offline due to administrative tea breaks.
