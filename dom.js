'use strict';

// ---------- Canvas and DOM references ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const minimap = document.getElementById('minimap');
const mmCtx = minimap.getContext('2d');
const ui = {
  crosshair: document.getElementById('crosshair'), meleeArc: document.getElementById('meleeArc'), damage: document.getElementById('damageVignette'),
  start: document.getElementById('start'), difficultyMenu: document.getElementById('difficultyMenu'), settings: document.getElementById('settings'), pause: document.getElementById('pause'), gameOver: document.getElementById('gameOver'), toast: document.getElementById('toast'),
  shieldFill: document.getElementById('shieldFill'), healthFill: document.getElementById('healthFill'), staminaFill: document.getElementById('staminaFill'),
  shieldNum: document.getElementById('shieldNum'), healthNum: document.getElementById('healthNum'), staminaNum: document.getElementById('staminaNum'),
  ammo: document.getElementById('ammo'), reserve: document.getElementById('reserveAmmo'), reload: document.getElementById('reloadText'), weapon: document.getElementById('weaponName'),
  kills: document.getElementById('kills'), wave: document.getElementById('wave'), combo: document.getElementById('combo'), objective: document.getElementById('objectiveText'), status: document.getElementById('statusText'), finalStats: document.getElementById('finalStats'), pauseStats: document.getElementById('pauseStats'), menuDifficulty: document.getElementById('menuDifficultyText'),
  masterVolume: document.getElementById('masterVolume'), musicVolume: document.getElementById('musicVolume'), effectVolume: document.getElementById('effectVolume'), mouseSensitivity: document.getElementById('mouseSensitivity'), masterVolumeText: document.getElementById('masterVolumeText'), musicVolumeText: document.getElementById('musicVolumeText'), effectVolumeText: document.getElementById('effectVolumeText'), mouseSensitivityText: document.getElementById('mouseSensitivityText')
};

let W = 0, H = 0;
function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

// ---------- Asset loading and PNG background cleanup ----------
function loadImage(src){
  return new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.src = src; });
}

function cleanWhitePngBackground(img){
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, c.width, c.height);
  const p = data.data;

  // Key out near-white pixels and soften pale edges, which removes the white box/halo around PNG enemies.
  for(let i = 0; i < p.length; i += 4){
    const r = p[i], gr = p[i+1], b = p[i+2];
    const max = Math.max(r, gr, b), min = Math.min(r, gr, b);
    const bright = (r + gr + b) / 3;
    if(bright > 238 && max - min < 28){ p[i+3] = 0; continue; }
    if(bright > 210 && max - min < 38){ p[i+3] = Math.min(p[i+3], Math.max(0, (238 - bright) * 7)); }
  }
  g.putImageData(data, 0, 0);
  const out = new Image(); out.src = c.toDataURL('image/png');
  return out;
}

const images = {};
let assetsReady = false;
(async function prepareAssets(){
  images.gun = await loadImage(ASSETS.gun);
  images.plasma = await loadImage(ASSETS.plasma);
  images.elite = cleanWhitePngBackground(await loadImage(ASSETS.elite));
  images.grunt = cleanWhitePngBackground(await loadImage(ASSETS.grunt));
  images.brute = cleanWhitePngBackground(await loadImage(ASSETS.brute));
  assetsReady = true;
  ui.status.textContent = 'Assets loaded - ready to deploy';
})();
