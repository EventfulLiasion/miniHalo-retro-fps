'use strict';

// ---------- Pickups, reloads, feedback ----------
function updatePickups(dt){
  for(let i = pickups.length - 1; i >= 0; i--){
    const p = pickups[i]; p.bob += dt * .08;
    if(Math.hypot(p.x-player.x,p.y-player.y) < .55){
      if(p.type === 'ammo'){ weapons[0].reserve += 32; weapons[1].reserve += 60; showToast('Ammo restocked'); }
      if(p.type === 'med'){ player.health = Math.min(100, player.health + 30); playHealthPickupSound(); showToast('Health restored'); }
      if(p.type === 'shield'){ player.shield = 100; showToast('Shield overcharged'); }
      pickups.splice(i,1); updateHUD();
    }
  }
}
function playHealthPickupSound(){
  healthPickupSound.currentTime = 0;
  healthPickupSound.play().catch(()=>{});
}
function startReload(){
  const w = weapons[currentWeapon]; if(player.reloading || w.ammo >= w.maxAmmo || w.reserve <= 0) return;
  player.reloading = true; const id = ++player.reloadId; updateHUD(); playReloadSound(w);
  setTimeout(() => { if(!running || id !== player.reloadId) return; const need = w.maxAmmo - w.ammo, take = Math.min(need, w.reserve); w.ammo += take; w.reserve -= take; player.reloading = false; updateHUD(); }, 1250);
}

function playReloadSound(weapon){
  const sound = weapon.reload === 'alt' ? reloadAltSound : reloadSound;
  reloadSound.pause();
  reloadAltSound.pause();
  sound.currentTime = 0;
  sound.playbackRate = weapon.reloadPitch || 1;
  sound.play().catch(()=>{});
}

function switchWeapon(){ currentWeapon = (currentWeapon + 1) % weapons.length; player.reloading = false; reloadSound.pause(); reloadAltSound.pause(); updateHUD(); showToast(weapons[currentWeapon].name); }
function hitMarker(){ ui.crosshair.classList.add('hit'); setTimeout(() => ui.crosshair.classList.remove('hit'), 85); beep(560,.025,'square',.03); }
function showToast(text){ ui.toast.textContent = text; ui.toast.classList.add('show'); clearTimeout(showToast.id); showToast.id = setTimeout(() => ui.toast.classList.remove('show'), 1300); }
function showFloat(text,x,y,color){ const el = document.createElement('div'); el.className = 'floatText'; el.textContent = text; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.color = color; document.body.appendChild(el); setTimeout(() => el.remove(), 780); }
function setVolume(kind,value){
  volumeSettings[kind] = Number(value) / 100;
  if(kind === 'master') ui.masterVolumeText.textContent = value;
  if(kind === 'music') ui.musicVolumeText.textContent = value;
  if(kind === 'effect') ui.effectVolumeText.textContent = value;
  applyVolumes();
}
function setMouseSensitivity(value){
  const numeric = Number(value);
  mouseSensitivity = .0022 * (numeric / 100);
  ui.mouseSensitivityText.textContent = value;
}
function applyVolumes(){
  if(typeof soundBaseVolumes === 'undefined') return;
  const volume = volumeSettings.master * volumeSettings.effect;
  for(const [sound,base] of soundBaseVolumes) sound.volume = clamp(base * volume, 0, 1);
}
applyVolumes();

function beep(freq,dur,type,vol){ try{ const ac = beep.ac || (beep.ac = new (AudioContext || webkitAudioContext)()); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; o.type = type; g.gain.value = vol * volumeSettings.master * volumeSettings.effect; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur); }catch{} }
function updateHUD(){
  ui.healthFill.style.width = player.health + '%'; ui.shieldFill.style.width = player.shield + '%'; ui.staminaFill.style.width = player.stamina + '%';
  ui.healthNum.textContent = Math.ceil(player.health); ui.shieldNum.textContent = Math.ceil(player.shield); ui.staminaNum.textContent = Math.ceil(player.stamina);
  const w = weapons[currentWeapon]; ui.weapon.textContent = w.name; ui.ammo.textContent = w.ammo; ui.reserve.textContent = '/ ' + w.reserve; ui.reload.textContent = player.reloading ? 'RELOADING' : (meleeCooldown > 0 ? 'MELEE READY IN ' + Math.ceil(meleeCooldown/10) : '');
  ui.kills.textContent = kills; ui.wave.textContent = wave; ui.combo.textContent = 'x' + combo; ui.objective.textContent = enemies.filter(e => !e.dead).length + ' hostiles remain'; ui.status.textContent = 'DIFFICULTY: ' + DIFFICULTIES[currentMode].label.toUpperCase();
}
