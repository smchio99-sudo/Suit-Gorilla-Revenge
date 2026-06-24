function drawBg(){
  const map=MAPS[currentMap];ctx.fillStyle=map.bg;ctx.fillRect(0,0,800,450);
  const readyBgs=streetBgs.filter(img=>img.complete&&img.naturalWidth>0);
  if(readyBgs.length>0){
    const tileW=800,start=Math.floor(cam.x/tileW)-1,end=Math.ceil((cam.x+800)/tileW)+1;
    for(let i=start;i<=end;i++){
      const img=readyBgs[((i%readyBgs.length)+readyBgs.length)%readyBgs.length];
      const x=i*tileW-cam.x;
      ctx.drawImage(img,x,0,tileW,450);
      if(i>start){
        ctx.save();
        ctx.globalAlpha=0.12;
        const g=ctx.createLinearGradient(x-18,0,x+18,0);
        g.addColorStop(0,'rgba(0,0,0,0)');
        g.addColorStop(0.5,'rgba(0,0,0,0.7)');
        g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g;
        ctx.fillRect(x-18,0,36,450);
        ctx.restore();
      }
    }
  }else{
    ctx.fillStyle='#121826';ctx.fillRect(0,0,800,450);
    ctx.fillStyle='#20242f';ctx.fillRect(0,0,800,ROAD_TOP-12);
    ctx.fillStyle='#101014';ctx.fillRect(0,ROAD_TOP,800,450-ROAD_TOP);
  }
}
function drawUI(){
  const drawFramedGauge=(img,x,y,w,h,fillX,fillY,fillW,fillH,ratio,color,readyColor,label)=>{
    const ready=ratio>=1;
    ctx.fillStyle='rgba(0,0,0,0.58)';
    ctx.fillRect(fillX,fillY,fillW,fillH);
    ctx.fillStyle=ready?readyColor:color;
    ctx.fillRect(fillX,fillY,fillW*ratio,fillH);
    if(ready){
      ctx.save();
      ctx.globalAlpha=0.24;
      ctx.fillStyle='#fff';
      ctx.fillRect(fillX,fillY,fillW,fillH);
      ctx.restore();
    }
    ctx.drawImage(img,x,y,w,h);
    ctx.fillStyle=ready?'#fff7cf':'#e7e7e7';
    ctx.font='bold 9px monospace';
    ctx.textAlign='center';
    ctx.fillText(label,fillX+fillW/2,fillY+Math.max(11,fillH*0.66));
    ctx.textAlign='left';
  };
  const hpRatio=clamp(player.health/player.maxHealth,0,1);
  if(healthFrameImage.complete&&healthFrameImage.naturalWidth>0){
    const hx=6,hy=4,hw=230,hh=38;
    const ix=hx+21,iy=hy+9,iw=187,ih=19;
    ctx.fillStyle='rgba(0,0,0,0.58)';
    ctx.fillRect(ix,iy,iw,ih);
    ctx.fillStyle='#c9302c';
    ctx.fillRect(ix,iy,iw*hpRatio,ih);
    ctx.drawImage(healthFrameImage,hx,hy,hw,hh);
    ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(Math.round(player.health)+' / '+player.maxHealth,ix+iw/2,iy+13);
    ctx.textAlign='left';
  }else{
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(6,6,184,18);
    ctx.fillStyle='#c9302c';ctx.fillRect(8,8,180*hpRatio,14);
    ctx.strokeStyle='#0f0';ctx.strokeRect(6,6,184,18);ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText('HP '+Math.round(player.health)+'/'+player.maxHealth,10,19);
  }
  const cd=playerCfg.skillCooldown,ratio=Math.min(1,player.skillTimer/cd);
  if(skillFrameImage.complete&&skillFrameImage.naturalWidth>0){
    const sx=6,sy=43,sw=192,sh=27;
    drawFramedGauge(skillFrameImage,sx,sy,sw,sh,sx+17,sy+7,sw-35,13,ratio,'#e0a020','#ffd36a',ratio>=1?'SKILL READY':`SKILL ${((cd-player.skillTimer)/1000).toFixed(1)}s`);
  }else{
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(6,54,96,12);ctx.fillStyle=ratio>=1?'#ffd36a':'#e0a020';ctx.fillRect(8,56,92*ratio,8);ctx.strokeStyle='#088';ctx.strokeRect(6,54,96,12);
    ctx.fillStyle='#aff';ctx.font='9px monospace';ctx.fillText(ratio>=1?'SKILL READY':`SKILL ${((cd-player.skillTimer)/1000).toFixed(1)}s`,9,63);
  }
  const dr=Math.min(1,(playerCfg.dashCooldown-player.dashCd)/playerCfg.dashCooldown);
  if(dashFrameImage.complete&&dashFrameImage.naturalWidth>0){
    const dx=6,dy=69,dw=192,dh=27;
    drawFramedGauge(dashFrameImage,dx,dy,dw,dh,dx+17,dy+7,dw-35,13,dr,'#17a2b8','#6ee7ff',dr>=1?'DASH READY':'DASH...');
  }else{
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(6,68,96,12);ctx.fillStyle=dr>=1?'#6ee7ff':'#17a2b8';ctx.fillRect(8,70,92*dr,8);ctx.strokeStyle='#850';ctx.strokeRect(6,68,96,12);
    ctx.fillStyle='#fda';ctx.font='9px monospace';ctx.fillText(dr>=1?'DASH READY':'DASH...',9,77);
  }
  ctx.fillStyle='#FFD700';ctx.font='bold 14px monospace';ctx.textAlign='left';ctx.fillText('$ '+coins,10,112);
  ctx.fillStyle='#aaa';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText(MAPS[currentMap].name,794,16);
  const rem=enemies.filter(e=>e.alive).length;ctx.fillStyle=rem>0?'#f88':'#8ff';ctx.fillText(rem>0?('적 '+rem+'마리'):'포탈 활성!',794,32);
  ctx.fillStyle='#555';ctx.font='10px monospace';ctx.fillText('[U] 강화상점',794,442);ctx.textAlign='left';
}

function drawCoverImage(img,x,y,w,h){
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function drawTitle(){
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,800,450);
}
function drawSplash(){
  const elapsed=performance.now()-sceneStart;
  const fadeIn=clamp(elapsed/420,0,1);
  const fadeOut=clamp((SPLASH_DURATION-elapsed)/520,0,1);
  const alpha=Math.min(fadeIn,fadeOut);
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,800,450);
  if(smGamesLogoImage.complete&&smGamesLogoImage.naturalWidth>0){
    const maxW=310,maxH=210;
    const scale=Math.min(maxW/smGamesLogoImage.naturalWidth,maxH/smGamesLogoImage.naturalHeight);
    const w=smGamesLogoImage.naturalWidth*scale;
    const h=smGamesLogoImage.naturalHeight*scale;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.drawImage(smGamesLogoImage,400-w/2,225-h/2,w,h);
    ctx.restore();
  }
}
function drawLoading(){
  const elapsed=performance.now()-sceneStart;
  const ratio=clamp(elapsed/LOADING_DURATION,0,1);
  const barW=360,barH=12,barX=220,barY=260;
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,800,450);
  ctx.fillStyle='#fff';
  ctx.font='bold 22px monospace';
  ctx.textAlign='center';
  ctx.fillText('loading...',400,224);
  ctx.strokeStyle='rgba(255,255,255,0.85)';
  ctx.lineWidth=2;
  ctx.strokeRect(barX,barY,barW,barH);
  ctx.fillStyle='#fff';
  ctx.fillRect(barX,barY,barW*ratio,barH);
  ctx.font='13px monospace';
  ctx.fillText(Math.floor(ratio*100)+'%',400,296);
  ctx.textAlign='left';
}
const CUTSCENES=['동물원 우리 속의 고릴라.\n오늘, 드디어 탈출했다.','도시로 나온 고릴라.\n옷가게 유리창을 부쉈다.','거울에 비친 양복 입은 모습.\n...나쁘지 않군.','이제 복수의 시간이다.\n[ Enter ] 계속'];
const BOSS_CUTSCENES=['거기까지다, 고릴라.','다시는 동물원으로 못 돌아가게 해주마!'];
const CUTSCENE_CHAR_MS=48;
function getCutsceneVisibleText(text){
  const count=Math.min(text.length,Math.floor((performance.now()-cutsceneTextStart)/CUTSCENE_CHAR_MS));
  return text.slice(0,count);
}
function isCutsceneTextComplete(text){
  return getCutsceneVisibleText(text).length>=text.length;
}
function drawCutsceneFrame(images,texts,step,totalLabel){
  ctx.fillStyle='#000';ctx.fillRect(0,0,800,450);
  const img=images[step];
  if(img&&img.complete&&img.naturalWidth>0){
    const scale=Math.max(800/img.naturalWidth,450/img.naturalHeight);
    const dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
    ctx.drawImage(img,(800-dw)/2,(450-dh)/2,dw,dh);
  }else{
    ctx.fillStyle='#111';ctx.fillRect(0,0,800,450);
  }
  const grad=ctx.createLinearGradient(0,250,0,450);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(0.45,'rgba(0,0,0,0.62)');
  grad.addColorStop(1,'rgba(0,0,0,0.88)');
  ctx.fillStyle=grad;ctx.fillRect(0,250,800,200);
  ctx.fillStyle='rgba(0,0,0,0.56)';ctx.fillRect(44,334,712,76);
  ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.strokeRect(44,334,712,76);
  ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';
  getCutsceneVisibleText(texts[step]).split('\n').forEach((l,i)=>ctx.fillText(l,400,363+i*24));
  ctx.fillStyle='#bbb';ctx.font='12px monospace';ctx.fillText(`[${step+1}/${texts.length}] ${totalLabel}`,400,428);
  ctx.textAlign='left';
}
function drawCutscene(){
  drawCutsceneFrame(cutsceneImages,CUTSCENES,cutsceneStep,'Enter / Click');
}
function drawBossCutscene(){
  drawCutsceneFrame(bossCutsceneImages,BOSS_CUTSCENES,bossCutsceneStep,'Enter / Click');
}
function drawTutorial(){
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,800,450);ctx.fillStyle='#aaf';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText('조작 안내',400,40);ctx.textAlign='left';
  const lines=[['← →  /  A D','좌우 이동'],['↑ ↓','도로 위아래 이동'],['Space','점프'],['Q','기본 공격 (연타 = 2콤보)'],['W','발차기 스킬 (7초 쿨)'],['Shift / C','대시! 몸 낮춰 돌진, 짧은 무적'],['도로','인도 위로는 이동 불가'],['U','강화 상점']];
  lines.forEach(([k,v],i)=>{const y=70+i*38;ctx.fillStyle=k.includes('Shift')?'#aa5500':'#4a4aff';ctx.fillRect(90,y,210,28);ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText(k,98,y+19);ctx.fillStyle='#ccc';ctx.font='12px monospace';ctx.fillText(v,320,y+19);});
  ctx.fillStyle='rgba(80,80,255,0.25)';ctx.fillRect(280,388,240,38);ctx.strokeStyle='#66f';ctx.lineWidth=2;ctx.strokeRect(280,388,240,38);ctx.fillStyle='#ccf';ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillText('[ Enter ] 게임 시작!',400,412);ctx.textAlign='left';
}
function drawGameOver(){ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,800,450);ctx.fillStyle='#f44';ctx.font='bold 52px monospace';ctx.textAlign='center';ctx.fillText('GAME OVER',400,180);ctx.fillStyle='#aaa';ctx.font='16px monospace';ctx.fillText('고릴라가 쓰러졌다...',400,228);ctx.fillStyle='#faa';ctx.font='bold 16px monospace';ctx.fillText('[ R ] 현재 맵 재도전',400,290);ctx.fillStyle='#aaf';ctx.fillText('[ T ] 타이틀로',400,320);ctx.textAlign='left';}
function drawClear(){ctx.fillStyle='rgba(0,0,0,0.9)';ctx.fillRect(0,0,800,450);ctx.fillStyle='#FFD700';ctx.font='bold 48px monospace';ctx.textAlign='center';ctx.fillText('GAME CLEAR!',400,160);ctx.fillStyle='#fff';ctx.font='18px monospace';ctx.fillText('복수 완료! 고릴라는 오늘도 양복을 입는다.',400,215);ctx.fillStyle='#FFD700';ctx.font='18px monospace';ctx.fillText('획득 코인: $ '+coins,400,255);ctx.fillStyle='#ccf';ctx.font='bold 16px monospace';ctx.fillText('[ T ] 타이틀로',400,310);ctx.textAlign='left';}

