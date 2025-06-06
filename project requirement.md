# 🌐 WebApp Game Design: Vertical City Tycoon (Yoot Tower Clone)

## ✅ Target Platform

**Web browser** (Chrome, Firefox, Edge, Safari)

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Game Framework**: [Phaser.js](https://phaser.io/) or [Pixi.js](https://pixijs.com/)
- **State Management**: Vanilla JS or lightweight libraries (e.g. Zustand, Redux Toolkit)
- **Asset Loading**: Texture atlases, tilemaps (Tiled or similar format)
- **Optional Backend** (for saving): Firebase / Supabase / localStorage

---

## 🧠 Core Features

### 🧱 1. Construction System
- Tilemap-based drag & drop building interface.
- Layers:
  - Ground
  - Above-ground floors
  - Underground floors
- Snapping grid for placing elevators, rooms, stairs.
- UI panel with building options and costs.

### 🧑‍🤝‍🧑 2. Tenant Simulation
- NPCs spawn and animate through tower.
- React to:
  - Elevator wait time
  - Rent pricing
  - Facility proximity
- Pathfinding: A* or navmesh within floors & elevators

### 🧮 3. Economic System
- Real-time money tracking panel.
- Adjustable rent system.
- Income from tenants and shops.
- Maintenance and electricity costs.
- Game pause / speed control.

### 🛗 4. Elevator System
- Simulates local and express elevators.
- Occupancy, wait time, and destination logic.
- Elevator placement UI.

---

## 🖼 Visual Requirements

### Art Style
- **2D pixel art**, cross-sectional "cutaway" look.
- 32x32 or 64x64 tiles
- Spritesheets for:
  - Office workers
  - Shoppers
  - Maintenance staff
  - Tourists

### Background Layers
- Parallax scrolling background:
  - Sky with clouds
  - City skyline
  - Park or landscape foreground

---

## 🖱 UI Design

### Main Interface
- Left Sidebar:
  - Build tools (rooms, elevators, stairs)
  - Demolish tool
- Top Bar:
  - Money, population, prestige stars
  - Date/time progression
- Right Sidebar:
  - Tenant log
  - Alerts & events
  - Statistics panel

### Modal Windows
- Room Info: income, tenant status, maintenance
- Rent Adjuster: per-room or global

---

## 🧩 Modularity & Saving

- **localStorage** or **IndexedDB** for save data.
- Modular tile & room definitions stored in JSON.
- Event system loaded from YAML/JSON (for expandability).
- Room packs & scenarios can be loaded dynamically via external JSON.

---

## 🎮 Game Loop

```js
function gameLoop() {
  updateEconomy();
  updateNPCs();
  updateElevators();
  checkEvents();
  renderScene();
  requestAnimationFrame(gameLoop);
}
````

---

## 📁 Folder Structure Example

```
/public
  index.html
/assets
  /tilesets
  /sprites
  /backgrounds
  /audio
/src
  main.js
  renderer.js
  simulation.js
  economy.js
  ui.js
  elevatorSystem.js
/data
  rooms.json
  events.json
  npcs.json
```

---

## 💡 Optional Features

* Cloud saves via Supabase
* Online leaderboard (based on tower rating)
* Unlockable city themes (Tokyo, Hawaii, Underground Lab)
* Mobile responsiveness for tablet play

---

## 🚀 Deployment

* Bundle via **Vite**, **Parcel**, or **Webpack**
* Host on **Netlify**, **Vercel**, or **GitHub Pages**
* Offline play via PWA (Progressive Web App) support
