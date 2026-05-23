# MiniHalo: Retro FPS in Vanilla JavaScript

MiniHalo is a single-file browser FPS built with HTML5 Canvas and vanilla JavaScript. It uses a raycasting-style renderer, enemy AI, waves, melee combat, projectiles, pickups, shield/health systems, a minimap, HUD overlays, and embedded image/audio assets.

## Play

Open `index.html` in a browser.

For GitHub Pages, publish this repository from the `main` branch root and the game will run directly in the browser.

## Features

- Single-file HTML build with embedded assets
- Retro FPS-style Canvas rendering
- Keyboard/mouse movement with pointer lock
- Enemy waves with different enemy types and damage values
- Projectile and melee combat
- Shield, health, stamina, reload, ammo, and pickup systems
- Minimap and real-time HUD
- Spawn safety and accessible arena layout
- Audio feedback for firing, reloads, melee, and shield recharge

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

## Technical Highlights

- Implements wall collision, bullet collision, and line-of-sight checks.
- Uses curated safe spawn points so enemies and the player do not spawn inside blocked areas.
- Cleans enemy PNG backgrounds at runtime before rendering sprites.
- Keeps the project portable by embedding assets directly into `index.html`.

## Notes

This is a personal/student project inspired by retro FPS mechanics. It is not affiliated with Halo, Bungie, or Microsoft.
