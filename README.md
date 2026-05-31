# War Marines

War Marines is a browser FPS built with HTML5 Canvas and vanilla JavaScript. It features a raycasting-style renderer, enemy AI, wave survival, difficulty modes, melee combat, projectile collision, pickups, shields, weapon reloads, audio settings, and embedded image/audio assets.

## Play

Open `index.html` in a modern desktop browser.

For GitHub Pages, publish the repository from the `main` branch root. The game runs directly in the browser with no build step.

## Features

- Vanilla HTML, CSS, and JavaScript with no framework dependency
- Embedded PNG and MP3 assets kept in a dedicated asset module
- Retro FPS-style Canvas renderer with textured walls and sprites
- Pointer-lock mouse aiming with movement, sprinting, dashing, and weapon bob
- Wave-based enemy encounters with separate enemy types, stats, and damage values
- Normal, Nightmare, and Horde Mode difficulty profiles
- Capped scaling for Normal and Nightmare, endless scaling for Horde Mode
- Assault Rifle and Battle Rifle weapon systems with reload logic
- One-hit melee kill mechanic with close-range enemy melee attacks
- Projectile collision, line-of-sight checks, wall blocking, and hit feedback
- Shield, health, stamina, ammo, reload, and pickup systems
- Health pickup, weapon fire, reload, melee, and shield recharge audio feedback
- Main menu, pause menu, difficulty selection, and settings menu
- Master, music, effects, and mouse sensitivity controls
- Minimap, HUD, damage feedback, floating score text, and combo system
- Spawn safety and accessible arena layout

## Controls

| Action | Control |
| --- | --- |
| Move | `WASD` |
| Aim | Mouse |
| Fire | Left click |
| Melee | `F` or right click |
| Dash/Sprint | `Shift` |
| Switch weapon | `Tab` |
| Reload | `R` |
| Pause | `P` or `Esc` |

## Difficulty Modes

| Mode | Behavior |
| --- | --- |
| Normal | Waves continue forever, but difficulty scaling caps around the current version's 100-kill intensity. |
| Nightmare | Waves continue forever, with a higher cap around the current version's 170-kill intensity. |
| Horde Mode | Endless scaling with no cap. |

## Technical Highlights

- Uses a grid-based map with raycasting-style wall projection.
- Implements player collision, bullet collision, wall blocking, and enemy line-of-sight checks.
- Uses curated safe spawn points so enemies and the player avoid blocked rectangles and corner traps.
- Cleans enemy PNG backgrounds at runtime before rendering sprites.
- Stores all visuals and sounds as embedded data URLs so deployment stays simple.
- Separates gameplay state, menus, rendering, input, audio, settings, and assets into focused source files.

## Repository Structure

```text
.
├── index.html
├── README.md
├── .gitignore
└── src
    ├── assets.js
    ├── combat.js
    ├── dom.js
    ├── flow.js
    ├── input.js
    ├── rendering.js
    ├── state.js
    ├── styles.css
    ├── systems.js
    └── world.js
```

## Source Layout

| File | Purpose |
| --- | --- |
| `src/assets.js` | Embedded image and audio data URLs. Kept separate so gameplay code stays readable. |
| `src/dom.js` | Canvas setup, HUD references, image loading, and PNG background cleanup. |
| `src/world.js` | Arena layout, spawn safety, enemy definitions, and world helpers. |
| `src/state.js` | Player/game state, weapons, difficulty settings, and audio objects. |
| `src/input.js` | Keyboard, mouse, pointer lock, and browser input handling. |
| `src/flow.js` | Main menu, pause menu, difficulty selection, settings navigation, and wave setup. |
| `src/combat.js` | Player movement, firing, melee, enemy AI, damage, bullets, and kills. |
| `src/systems.js` | Pickups, reloads, HUD updates, volume controls, feedback, and utility audio. |
| `src/rendering.js` | Raycasting renderer, sprites, pickups, projectiles, weapon view, minimap, and main loop. |

## Notes

This is a personal/student project inspired by retro FPS mechanics. It is not affiliated with Halo, Bungie, or Microsoft.
