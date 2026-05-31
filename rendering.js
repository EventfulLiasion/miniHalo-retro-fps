'use strict';

// ---------- Raycasting and rendering ----------
function castRay(px,py,angle){
  const dx = Math.cos(angle), dy = Math.sin(angle); let dist = 0, tile = 0;
  while(dist < 26){ const x = px + dx * dist, y = py + dy * dist; tile = mapAt(x,y); if(tile) return { dist, tile, x, y }; dist += .025; }
  return { dist:26, tile:1, x:px+dx*26, y:py+dy*26 };
}
function hasLineOfSight(x1,y1,x2,y2){
  const dx = x2-x1, dy = y2-y1, dist = Math.hypot(dx,dy), steps = Math.ceil(dist*14);
  for(let i = 0; i <= steps; i++){ const t = i/steps; if(mapAt(x1+dx*t,y1+dy*t)) return false; } return true;
}
function projectSprite(x,y,size=.7){
  const dx = x - player.x, dy = y - player.y, dist = Math.hypot(dx,dy); let a = angleNorm(Math.atan2(dy,dx) - player.angle); const fov = .66;
  if(Math.abs(a) > Math.PI / 2 || dist < .15) return null;
  const screenX = (.5 + a / (fov * 2)) * W, h = H * size / dist, w = h * .78;
  return { screenX, dist, w, h, x:screenX - w/2, y:H/2 - h/2 };
}
function drawWorld(){
  const sky = ctx.createLinearGradient(0,0,0,H/2); sky.addColorStop(0,'#071827'); sky.addColorStop(1,'#081017'); ctx.fillStyle = sky; ctx.fillRect(0,0,W,H/2);
  const floor = ctx.createLinearGradient(0,H/2,0,H); floor.addColorStop(0,'#07100d'); floor.addColorStop(1,'#020303'); ctx.fillStyle = floor; ctx.fillRect(0,H/2,W,H/2);
  const z = new Array(W);
  for(let x = 0; x < W; x++){
    const cam = (x / W - .5) * .66, a = player.angle + cam, ray = castRay(player.x, player.y, a);
    const corrected = ray.dist * Math.cos(cam), wallH = H / corrected, y = H/2 - wallH/2, shade = clamp(1 - corrected / 18, .28, 1);
    z[x] = corrected; ctx.fillStyle = shadeColor(WALL_COLORS[ray.tile] || '#333', shade); ctx.fillRect(x, y, 1, wallH);
  }
  drawPickups(z); drawSprites(z); drawProjectiles(); drawWeapon(); drawDamage();
}
function drawSprites(z){
  const sorted = enemies.filter(e => !e.dead).sort((a,b) => Math.hypot(b.x-player.x,b.y-player.y) - Math.hypot(a.x-player.x,a.y-player.y));
  for(const e of sorted){
    const p = projectSprite(e.x,e.y,e.size); if(!p) continue;
    const sx = clamp(Math.floor(p.screenX),0,W-1); if(z[sx] < p.dist) continue;
    ctx.globalAlpha = clamp(1 - p.dist / 22, .38, 1); ctx.drawImage(images[e.img], p.x, p.y, p.w, p.h); ctx.globalAlpha = 1;
    if(e.hitFlash > 0){ ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.fillRect(p.x,p.y,p.w,p.h); ctx.globalCompositeOperation = 'source-over'; }
    const hp = e.health / e.maxHealth; if(hp < 1){ ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(p.x,p.y-8,p.w,4); ctx.fillStyle = e.color; ctx.fillRect(p.x,p.y-8,p.w*hp,4); }
  }
}
function drawPickups(z){
  for(const item of pickups){
    const p = projectSprite(item.x,item.y,.22); if(!p) continue; const sx = clamp(Math.floor(p.screenX),0,W-1); if(z[sx] < p.dist) continue;
    const bob = Math.sin(item.bob) * 6, color = item.type === 'ammo' ? '#ffe082' : item.type === 'med' ? '#69ffb0' : '#54a8ff';
    ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.fillRect(p.x, p.y + bob, p.w, p.h); ctx.shadowBlur = 0;
  }
}
function drawProjectiles(){
  for(const b of bullets){
    const p = projectSprite(b.x,b.y,.035); if(!p) continue;
    ctx.globalAlpha = .72;
    ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.arc(p.screenX,p.y+p.h/2,Math.max(1.4,p.w*.65),0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
  for(let i = particles.length - 1; i >= 0; i--){ const p = particles[i]; const pr = projectSprite(p.x,p.y,.035); if(pr){ ctx.globalAlpha = Math.min(.65, p.life / p.max); ctx.fillStyle = p.color; ctx.fillRect(pr.screenX,pr.y,Math.max(1.2,pr.w*.7),Math.max(1.2,pr.w*.7)); ctx.globalAlpha = 1; } p.x += p.vx; p.y += p.vy; p.life--; if(p.life <= 0) particles.splice(i,1); }
}
function drawWeapon(){
  const w = weapons[currentWeapon], img = images[w.img], sway = Math.sin(performance.now()/130) * (keys['KeyW'] ? 8 : 2), recoil = shootTimer > w.fireRate - 1 ? 18 : 0;
  if(currentWeapon === 0) ctx.drawImage(img, W*.47, H*.49 + sway + recoil, Math.min(540,W*.52), Math.min(430,H*.52));
  else ctx.drawImage(img, W*.64, H*.56 + sway + recoil, Math.min(330,W*.34), Math.min(280,H*.35));
}
function drawDamage(){ damageFlash = Math.max(0, damageFlash - .025); ui.damage.style.opacity = damageFlash; }
function shadeColor(hex, factor){ const n = parseInt(hex.slice(1),16); let r = (n>>16)&255, g = (n>>8)&255, b = n&255; r = Math.floor(r*factor); g = Math.floor(g*factor); b = Math.floor(b*factor); return 'rgb('+r+','+g+','+b+')'; }
function burst(x,y,color,count,speed){ for(let i=0;i<count;i++){ const a = rand(0,Math.PI*2), s = rand(speed*.35,speed); particles.push({ x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:rand(14,34),max:34 }); } }

// ---------- Minimap ----------
function drawMinimap(){
  const S = minimap.width, cs = S / MAP_W; mmCtx.clearRect(0,0,S,S); mmCtx.fillStyle = 'rgba(0,0,0,.45)'; mmCtx.fillRect(0,0,S,S);
  for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++) if(mapAt(x,y)){ mmCtx.fillStyle = WALL_COLORS[mapAt(x,y)] || '#233'; mmCtx.fillRect(x*cs,y*cs,cs,cs); }
  for(const p of pickups){ mmCtx.fillStyle = p.type === 'ammo' ? '#ffe082' : p.type === 'med' ? '#69ffb0' : '#54a8ff'; mmCtx.fillRect(p.x*cs-2,p.y*cs-2,4,4); }
  for(const e of enemies){ if(e.dead) continue; mmCtx.fillStyle = e.color; mmCtx.fillRect(e.x*cs-2,e.y*cs-2,4,4); }
  mmCtx.fillStyle = '#00ffbf'; mmCtx.beginPath(); mmCtx.arc(player.x*cs,player.y*cs,4,0,Math.PI*2); mmCtx.fill();
  mmCtx.strokeStyle = '#00ffbf'; mmCtx.beginPath(); mmCtx.moveTo(player.x*cs,player.y*cs); mmCtx.lineTo(player.x*cs+Math.cos(player.angle)*13,player.y*cs+Math.sin(player.angle)*13); mmCtx.stroke();
}

// ---------- Main loop ----------
function loop(t){
  const dt = Math.min((t - last) / 16.7, 3); last = t;
  if(running && !paused){
    updatePlayer(dt); updateEnemies(dt); updateBullets(dt); shootTimer -= dt; if(shooting && shootTimer <= 0) shoot();
    drawWorld(); drawMinimap(); updateHUD();
  } else if(!running){ ctx.fillStyle = '#030609'; ctx.fillRect(0,0,W,H); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
