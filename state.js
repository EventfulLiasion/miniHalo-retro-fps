'use strict';

// ---------- Game state ----------
let player, enemies = [], bullets = [], particles = [], pickups = [], floatTexts = [];
let keys = {}, mouseDX = 0, shooting = false, running = false, paused = false, last = 0;
let kills = 0, score = 0, wave = 1, combo = 1, comboTimer = 0, shootTimer = 0, shieldDelay = 0, damageFlash = 0, dashCooldown = 0, meleeCooldown = 0, shieldWasCharging = false;
const DIFFICULTIES = {
  normal:{ label:'Normal', capWave:6 },
  nightmare:{ label:'Nightmare', capWave:9 },
  horde:{ label:'Horde Mode', capWave:Infinity }
};
let currentMode = 'normal';
let settingsReturn = 'main';
let mouseSensitivity = .0022;
const volumeSettings = { master:1, music:1, effect:1 };
const weapons = [
  { name:'ASSAULT RIFLE', img:'gun', damage:42, fireRate:6, ammo:32, maxAmmo:32, reserve:999, spread:.025, bulletSpeed:.29, shot:'assault', reload:'main', reloadPitch:1 },
  { name:'BATTLE RIFLE', img:'plasma', damage:26, fireRate:3.2, ammo:80, maxAmmo:80, reserve:999, spread:.05, bulletSpeed:.23, shot:'battle', reload:'alt', reloadPitch:.92 }
];
let currentWeapon = 0;
const weaponSounds = {
  assault:new Audio(ASSETS.gunshot),
  battle:new Audio(ASSETS.gunshot)
};
weaponSounds.assault.volume = .22;
weaponSounds.battle.volume = .22;
const reloadSound = new Audio(ASSETS.reload); reloadSound.volume = .38;
const reloadAltSound = new Audio(ASSETS.reloadAlt); reloadAltSound.volume = .38;
const meleeSound = new Audio(ASSETS.melee); meleeSound.volume = .42;
const enemyFireSound = new Audio(ASSETS.enemyPlasma); enemyFireSound.volume = .2;
const healthPickupSound = new Audio(ASSETS.healthPickup); healthPickupSound.volume = .36;
const shieldSound = new Audio(ASSETS.shield); shieldSound.volume = .18; shieldSound.loop = false;
const soundBaseVolumes = new Map([
  [weaponSounds.assault,.22],
  [weaponSounds.battle,.22],
  [reloadSound,.38],
  [reloadAltSound,.38],
  [meleeSound,.42],
  [enemyFireSound,.2],
  [healthPickupSound,.36],
  [shieldSound,.18]
]);
