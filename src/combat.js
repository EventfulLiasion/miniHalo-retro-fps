'use strict';

// ---------- Player, combat, and enemy logic ----------
function updatePlayer(dt){
  player.angle = angleNorm(player.angle + mouseDX * mouseSensitivity); mouseDX = 0;
  const sprinting = keys['KeyW'] && (keys['ShiftLeft'] || keys['ShiftRight']) && player.stamina > 4;
  const speed = sprinting ? .073 : .046;
  let mx = 0, my = 0;
  if(keys['KeyW']){ mx += Math.cos(player.angle); my += Math.sin(player.angle); }
  if(keys['KeyS']){ mx -= Math.cos(player.angle); my -= Math.sin(player.angle); }
  if(keys['KeyA']){ mx += Math.cos(player.angle - Math.PI/2); my += Math.sin(player.angle - Math.PI/2); }
  if(keys['KeyD']){ mx += Math.cos(player.angle + Math.PI/2); my += Math.sin(player.angle + Math.PI/2); }
  const len = Math.hypot(mx,my); if(len){ mx /= len; my /= len; }
  if(sprinting) player.stamina = Math.max(0, player.stamina - .65 * dt); else player.stamina = Math.min(100, player.stamina + .35 * dt);
  movePlayer(mx * speed * dt, my * speed * dt);
  if(dashCooldown > 0) dashCooldown -= dt;
  if(meleeCooldown > 0) meleeCooldown -= dt;
  if(comboTimer > 0){ comboTimer -= dt; } else combo = 1;
  handleShieldRecharge(dt);
  updatePickups(dt);
}

function handleShieldRecharge(dt){
  if(shieldDelay > 0){
    shieldDelay -= dt;
    stopShieldRechargeSound(false);
    return;
  }

  if(player.shield < 100){
    player.shield = Math.min(100, player.shield + .22 * dt);
    if(!shieldWasCharging){
      shieldWasCharging = true;
      shieldSound.currentTime = 0;
      shieldSound.play().catch(()=>{});
    }
    if(player.shield >= 100) stopShieldRechargeSound(true);
  }else{
    stopShieldRechargeSound(true);
  }
}

function stopShieldRechargeSound(resetCue=false){
  shieldSound.pause();
  shieldSound.currentTime = 0;
  if(resetCue) shieldWasCharging = false;
}
function movePlayer(dx,dy){
  const r = player.radius;
  const canX = !mapAt(player.x + dx + Math.sign(dx)*r, player.y - r) && !mapAt(player.x + dx + Math.sign(dx)*r, player.y + r);
  const canY = !mapAt(player.x - r, player.y + dy + Math.sign(dy)*r) && !mapAt(player.x + r, player.y + dy + Math.sign(dy)*r);
  if(canX) player.x += dx; if(canY) player.y += dy;
}
function dash(){
  if(!running || paused || dashCooldown > 0 || player.stamina < 28) return;
  player.stamina -= 28; dashCooldown = 42;
  movePlayer(Math.cos(player.angle) * 1.05, Math.sin(player.angle) * 1.05);
  burst(player.x, player.y, '#8fffee', 18, .06);
}
function shoot(){
  const w = weapons[currentWeapon];
  if(player.reloading) return;
  if(w.ammo <= 0){ startReload(); return; }
  w.ammo--; shootTimer = w.fireRate; playWeaponSound(w);
  const a = player.angle + rand(-w.spread, w.spread);
  bullets.push({ x:player.x + Math.cos(a)*.38, y:player.y + Math.sin(a)*.38, vx:Math.cos(a)*w.bulletSpeed, vy:Math.sin(a)*w.bulletSpeed, enemy:false, life:58, damage:w.damage, color:currentWeapon ? '#84ffef' : '#ffe082' });
  if(w.ammo <= 0) startReload(); updateHUD();
}

function playWeaponSound(weapon){
  const sound = weaponSounds[weapon.shot] || weaponSounds.assault;
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

function meleeAttack(){
  if(!running || paused || meleeCooldown > 0) return;
  playMeleeSound();
  meleeCooldown = 34; ui.meleeArc.classList.add('show'); setTimeout(() => ui.meleeArc.classList.remove('show'), 90);
  const range = 1.25, arc = Math.PI / 3;
  let best = null, bestDist = Infinity;
  for(const e of enemies){
    const dx = e.x - player.x, dy = e.y - player.y, dist = Math.hypot(dx,dy);
    const diff = Math.abs(angleNorm(Math.atan2(dy,dx) - player.angle));
    if(dist <= range && diff <= arc && hasLineOfSight(player.x,player.y,e.x,e.y) && dist < bestDist){ best = e; bestDist = dist; }
  }
  if(best){ killEnemy(best, 'MELEE', true); hitMarker(); }
  else showFloat('MISS', W/2, H/2 + 45, '#b8ffff');
}

function playMeleeSound(){
  meleeSound.currentTime = 0;
  meleeSound.play().catch(()=>{});
}
function playEnemyFireSound(){
  enemyFireSound.currentTime = 0;
  enemyFireSound.play().catch(()=>{});
}
function updateEnemies(dt){
  for(let i = enemies.length - 1; i >= 0; i--){
    const e = enemies[i]; if(e.dead){ enemies.splice(i,1); continue; }
    const dx = player.x - e.x, dy = player.y - e.y, dist = Math.hypot(dx,dy), a = Math.atan2(dy,dx); e.angle = a;
    if(e.stunned > 0){ e.stunned -= dt; continue; }
    const chase = dist < 11 || hasLineOfSight(e.x,e.y,player.x,player.y);
    if(chase && dist > .76){
      const nx = e.x + Math.cos(a) * e.speed * dt, ny = e.y + Math.sin(a) * e.speed * dt;
      if(isOpen(nx,e.y)) e.x = nx; if(isOpen(e.x,ny)) e.y = ny;
    }
    if(e.meleeTimer > 0) e.meleeTimer -= dt;
    if(dist < .82 && e.meleeTimer <= 0){
      e.meleeTimer = 52;
      playMeleeSound();
      damagePlayer(e.damage * 1.8);
      burst(player.x, player.y, '#ffffff', 8, .035);
    }
    e.shootTimer -= dt; if(e.shootTimer <= 0 && dist < 8.5 && hasLineOfSight(e.x,e.y,player.x,player.y)){
      e.shootTimer = rand(70,115) - Math.min(25,effectiveWave()*2);
      playEnemyFireSound();
      bullets.push({ x:e.x + Math.cos(a)*.36, y:e.y + Math.sin(a)*.36, vx:Math.cos(a)*.105, vy:Math.sin(a)*.105, enemy:true, life:95, damage:e.damage, color:e.color });
    }
    if(e.hitFlash > 0) e.hitFlash -= dt;
  }
}
function updateBullets(dt){
  for(let i = bullets.length - 1; i >= 0; i--){
    const b = bullets[i];
    if(!moveBullet(b, dt)){ burst(b.x,b.y,b.color,3,.018); bullets.splice(i,1); continue; }
    if(b.enemy){
      if(Math.hypot(b.x-player.x,b.y-player.y) < .28){ damagePlayer(b.damage); bullets.splice(i,1); }
    } else {
      for(const e of enemies){
        if(Math.hypot(b.x-e.x,b.y-e.y) < e.size * .48){
          e.health -= b.damage; e.hitFlash = 6; e.stunned = 3; hitMarker(); burst(e.x,e.y,e.color,8,.04);
          if(e.health <= 0) killEnemy(e, 'KILL', false); bullets.splice(i,1); break;
        }
      }
    }
  }
}

function moveBullet(b,dt){
  const totalX = b.vx * dt, totalY = b.vy * dt;
  const steps = Math.max(1, Math.ceil(Math.hypot(totalX,totalY) / .06));
  for(let s = 0; s < steps; s++){
    b.x += totalX / steps;
    b.y += totalY / steps;
    if(mapAt(b.x,b.y)) return false;
  }
  b.life -= dt;
  return b.life > 0;
}

function damagePlayer(amount){
  if(!running) return;
  shieldDelay = 150; damageFlash = Math.min(1, damageFlash + .22); stopShieldRechargeSound(true);
  if(player.shield > 0){ const s = Math.min(player.shield, amount); player.shield -= s; amount -= s; }
  if(amount > 0) player.health = Math.max(0, player.health - amount);
  if(player.health <= 0) endGame();
}
function killEnemy(e,label,melee){
  if(e.dead) return; e.dead = true; kills++;
  const gained = (melee ? 175 : 100) * combo; score += gained; combo = Math.min(9, combo + 1); comboTimer = 145;
  burst(e.x,e.y,melee ? '#ffffff' : e.color, melee ? 30 : 16, melee ? .085 : .055);
  const p = projectSprite(e.x,e.y,e.size); if(p) showFloat(label + ' +' + gained, p.screenX, p.y, melee ? '#fff' : '#ffe082');
  if(Math.random() < .18) pickups.push({ x:e.x, y:e.y, type:Math.random() < .5 ? 'ammo' : 'med', bob:0 });
  if(enemies.filter(x => !x.dead).length === 0){ wave++; setTimeout(() => { if(!running) return; spawnWave(); spawnPickups(); showToast('Wave ' + wave + ' incoming'); }, 900); }
  updateHUD();
}
function endGame(){
  running = false; paused = false; stopShieldRechargeSound(true); if(document.pointerLockElement) document.exitPointerLock();
  ui.finalStats.textContent = 'Kills: ' + kills + ' | Score: ' + score + ' | Reached wave ' + wave;
  ui.gameOver.style.display = 'flex';
}
