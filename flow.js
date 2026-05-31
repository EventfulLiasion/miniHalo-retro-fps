'use strict';

// ---------- Start, pause, waves ----------
function hideMenus(){
  ui.start.style.display = 'none';
  ui.difficultyMenu.style.display = 'none';
  ui.settings.style.display = 'none';
  ui.pause.style.display = 'none';
  ui.gameOver.style.display = 'none';
}

function showMainMenu(){
  running = false;
  paused = false;
  shooting = false;
  keys = {};
  stopShieldRechargeSound(true);
  if(document.pointerLockElement) document.exitPointerLock();
  hideMenus();
  ui.start.style.display = 'flex';
  ui.menuDifficulty.textContent = 'Selected difficulty: ' + DIFFICULTIES[currentMode].label;
  ui.objective.textContent = 'Stand by for deployment';
  ui.status.textContent = 'DIFFICULTY: ' + DIFFICULTIES[currentMode].label.toUpperCase();
}

function showDifficultyMenu(){
  hideMenus();
  ui.difficultyMenu.style.display = 'flex';
}

function selectDifficulty(mode){
  currentMode = mode;
  showMainMenu();
}

function showSettings(){
  settingsReturn = paused ? 'pause' : 'main';
  hideMenus();
  ui.settings.style.display = 'flex';
}

function closeSettings(){
  hideMenus();
  if(settingsReturn === 'pause' && running){
    ui.pause.style.display = 'flex';
    paused = true;
  }else{
    showMainMenu();
  }
}

function quitGame(){
  showToast('Close this browser tab to quit');
}

function restartRun(){
  startGame(currentMode);
}

function returnToMainMenu(){
  showMainMenu();
}

function startGame(mode=currentMode){
  if(!assetsReady){ showToast('Still loading assets...'); return; }
  currentMode = mode;
  hideMenus();
  player = { x:PLAYER_SPAWN.x, y:PLAYER_SPAWN.y, angle:PLAYER_SPAWN.angle, health:100, shield:100, stamina:100, reloading:false, radius:.22, reloadId:0 };
  weapons[0].ammo = 32; weapons[0].reserve = 999; weapons[1].ammo = 80; weapons[1].reserve = 999; currentWeapon = 0;
  stopShieldRechargeSound(true);
  enemies = []; bullets = []; particles = []; pickups = []; kills = 0; score = 0; wave = 1; combo = 1; comboTimer = 0; running = true; paused = false; shieldWasCharging = false;
  spawnWave(); spawnPickups(); updateHUD(); safePointerLock(); showToast(DIFFICULTIES[currentMode].label + ' run deployed');
}
function togglePause(force){
  if(!running) return;
  paused = force;
  ui.pause.style.display = paused ? 'flex' : 'none';
  if(!paused) ui.settings.style.display = 'none';
  if(paused) ui.pauseStats.textContent = DIFFICULTIES[currentMode].label + ' | Wave ' + wave + ' | ' + kills + ' kills';
  if(paused) stopShieldRechargeSound(false);
  if(paused && document.pointerLockElement) document.exitPointerLock();
  if(!paused) safePointerLock();
}
function spawnWave(){
  const dWave = effectiveWave();
  const count = 6 + dWave * 3;
  for(let i = 0; i < count; i++) spawnEnemy();
  ui.objective.textContent = 'Eliminate ' + enemies.length + ' hostiles';
  ui.wave.textContent = wave;
}
function spawnEnemy(){
  const dWave = effectiveWave();
  const types = [
    { kind:'Elite', img:'elite', health:95 + dWave * 8, speed:.018, size:.62, damage:9, color:'#5ab3ff' },
    { kind:'Grunt', img:'grunt', health:55 + dWave * 5, speed:.026, size:.48, damage:6, color:'#ffcf5a' },
    { kind:'Brute', img:'brute', health:155 + dWave * 12, speed:.014, size:.74, damage:13, color:'#ff6b6b' }
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const spot = pickSpawnPoint(ENEMY_SPAWN_POINTS, 5);
  const x = spot.x + rand(-.22,.22);
  const y = spot.y + rand(-.22,.22);
  enemies.push({ ...type, x, y, maxHealth:type.health, angle:0, shootTimer:rand(50,120), meleeTimer:rand(20,45), hitFlash:0, stunned:0, dead:false });
}

function effectiveWave(){
  return Math.min(wave, DIFFICULTIES[currentMode].capWave);
}
function spawnPickups(){
  pickups = FLOOR_PICKUP_SPOTS.filter(p => isSpawnSafe(p.x,p.y)).map((p,i) => ({ x:p.x, y:p.y, type:['ammo','med','shield'][i%3], bob:Math.random()*9 }));
}
