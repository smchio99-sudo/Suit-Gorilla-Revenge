function loop(){
  updateSceneMusic();
  ctx.clearRect(0,0,800,450);
  if(scene===SCENE.SPLASH){
    drawSplash();
    if(performance.now()-sceneStart>=SPLASH_DURATION){
      scene=SCENE.LOADING;
      sceneStart=performance.now();
    }
  }
  else if(scene===SCENE.LOADING){
    drawLoading();
    if(performance.now()-sceneStart>=LOADING_DURATION){
      scene=SCENE.TITLE;
      sceneStart=performance.now();
      setTitleVideoVisible(true);
    }
  }
  else if(scene===SCENE.TITLE)drawTitle();
  else if(scene===SCENE.CUTSCENE)drawCutscene();
  else if(scene===SCENE.BOSS_CUTSCENE)drawBossCutscene();
  else if(scene===SCENE.TUTORIAL)drawTutorial();
  else if(scene===SCENE.GAMEOVER)drawGameOver();
  else if(scene===SCENE.CLEAR)drawClear();
  else if(scene===SCENE.GAME||scene===SCENE.UPGRADE){
    const paused=scene===SCENE.UPGRADE;
    ctx.save();
    if(!paused&&shake>0){ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);shake*=0.85;if(shake<0.5)shake=0;}
    drawBg();
    const frozen=paused||hitstop>0; if(!paused&&hitstop>0)hitstop--;
    const allDead=enemies.every(e=>!e.alive&&!e.dying);
    if(!paused)portal.update();portal.draw(allDead);
    for(const c of coinList){if(!frozen)c.update();c.draw();} coinList=coinList.filter(c=>c.alive);
    for(const h of healthItems){if(!frozen)h.update();h.draw();} healthItems=healthItems.filter(h=>h.alive);
    for(const c of crates){if(!frozen)c.update();}
    for(const e of enemies){if((e.alive||e.dying)&&!frozen)e.update(player);}
    if(scene===SCENE.GAME&&!frozen)player.update();
    const actors=[...crates,...enemies.filter(e=>e.alive||e.dying),player].sort((a,b)=>(a.groundY||a.y+a.h)-(b.groundY||b.y+b.h));
    for(const a of actors){if(!(a instanceof Crate))drawGroundShadow(a);}
    for(const a of actors)a.draw();
    for(const d of bossProjectiles){if(!frozen)d.update(player);d.draw();} bossProjectiles=bossProjectiles.filter(d=>d.alive);
    for(const p of particles){if(!frozen){p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life-=0.04;}ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-cam.x-p.r/2,p.y-p.r/2,p.r,p.r);ctx.globalAlpha=1;} particles=particles.filter(p=>p.life>0);
    for(const f of floatTexts){if(!frozen){f.y+=f.vy;f.life-=0.025;}ctx.globalAlpha=Math.max(0,f.life);ctx.fillStyle=f.color;ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(f.txt,f.x-cam.x,f.y);ctx.globalAlpha=1;} floatTexts=floatTexts.filter(f=>f.life>0);ctx.textAlign='left';
    for(const e of enemies){if(!e.alive&&!e.dying&&e.coinDrop>0){const n=2+Math.floor(Math.random()*2);for(let i=0;i<n;i++)coinList.push(new Coin(e.x+e.w/2,e.y+e.h/2,Math.ceil(e.coinDrop/n)));e.coinDrop=0;}}
    ctx.restore();
    drawUI();
    if(scene===SCENE.GAME){
      const dx=(player.x+player.w/2)-portal.x,dy=(player.y+player.h/2)-portal.y;
      if(allDead&&Math.sqrt(dx*dx+dy*dy)<42){ if(currentMap<MAPS.length-1)openUpgrade(currentMap+1);else scene=SCENE.CLEAR; }
      if(player.health<=0&&player.deathTimer<=0)scene=SCENE.GAMEOVER;
      if(enemies.some(e=>e.type==='boss'&&!e.alive))scene=SCENE.CLEAR;
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
