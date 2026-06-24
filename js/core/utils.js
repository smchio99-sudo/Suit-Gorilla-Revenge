function addSpark(x,y,c,n){ for(let i=0;i<n;i++){ const a=Math.random()*6.28,s=2+Math.random()*4; particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:1,color:c,r:2+Math.random()*2}); } }
function addDust(x,y,dir){ for(let i=0;i<8;i++){ particles.push({x,y,vx:-dir*(1+Math.random()*3),vy:-(Math.random()*1.5),life:0.8,color:'#998877',r:2+Math.random()*3}); } }
function addFloat(x,y,t,c){ floatTexts.push({x,y,txt:t,color:c,life:1,vy:-1.2}); }
function doShake(m){ shake=Math.max(shake,m); }
function doHitstop(f){ hitstop=Math.max(hitstop,f); }
function fitSpriteFrame(fr,maxH,maxW){
  const scale=Math.min(maxH/fr.h,maxW/fr.w);
  return {dw:fr.w*scale,dh:fr.h*scale};
}
function drawGroundShadow(actor){
  if(!actor)return;
  const gy=actor.groundY||actor.y+actor.h;
  const w=actor.w||36;
  const isDown=actor.dying||(actor.health!==undefined&&actor.health<=0);
  ctx.save();
  ctx.globalAlpha=isDown?0.18:0.3;
  ctx.fillStyle='#000';
  ctx.beginPath();
  ctx.ellipse(actor.x-cam.x+w/2,gy+2,Math.max(14,w*0.62),isDown?4:7,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

