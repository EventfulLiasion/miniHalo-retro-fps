'use strict';

// ---------- Input ----------
addEventListener('keydown', e => {
  keys[e.code] = true;
  if(e.code === 'Tab'){ e.preventDefault(); switchWeapon(); }
  if(e.code === 'KeyR') startReload();
  if(e.code === 'KeyF') meleeAttack();
  if(e.code === 'ShiftLeft' || e.code === 'ShiftRight') dash();
  if(e.code === 'KeyP' || e.code === 'Escape') togglePause(!paused);
});
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('mousemove', e => { if(document.pointerLockElement === canvas && running && !paused) mouseDX += e.movementX; });
addEventListener('mousedown', e => { if(e.button === 0) shooting = true; if(e.button === 2) meleeAttack(); });
addEventListener('mouseup', e => { if(e.button === 0) shooting = false; });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('blur', () => { keys = {}; shooting = false; });
canvas.addEventListener('click', () => { if(running && !paused) safePointerLock(); });

function safePointerLock(){
  try{
    const lock = canvas.requestPointerLock && canvas.requestPointerLock();
    if(lock && lock.catch) lock.catch(() => {});
  }catch{}
}
