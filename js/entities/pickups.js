class Coin{
  constructor(x,y,v){
    this.x=x;this.y=y;this.val=v;this.vy=-5;this.vx=(Math.random()-0.5)*3;this.alive=true;this.age=0;
  }
  update(){
    this.vy+=0.4;this.y+=this.vy;this.x+=this.vx;this.vx*=0.95;
    if(this.y>ROAD_BOTTOM-8){this.y=ROAD_BOTTOM-8;this.vy*=-0.4;if(Math.abs(this.vy)<1)this.vy=0;}
    this.age++;
  }
  draw(){
    ctx.save();
    ctx.translate(this.x-cam.x,this.y);
    const p=1+Math.sin(this.age*0.2)*0.12;
    ctx.scale(p,p);
    if(coinImage.complete&&coinImage.naturalWidth>0){
      const s=19;
      ctx.drawImage(coinImage,-s/2,-s/2,s,s);
    }else{
      ctx.beginPath();ctx.arc(0,0,7,0,7);ctx.fillStyle='#FFD700';ctx.fill();
      ctx.fillStyle='#AA8800';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('$',0,3);
    }
    ctx.restore();
  }
}

class HealthPotion{
  constructor(x,groundY){
    this.x=x;this.groundY=groundY;this.y=groundY-18;this.w=18;this.h=20;this.alive=true;this.age=0;this.heal=28;
  }
  update(){this.age++;}
  draw(){
    if(!this.alive)return;
    const bob=Math.sin(this.age*0.12)*3;
    ctx.save();
    ctx.translate(this.x-cam.x,this.y+bob);
    if(healthPackImage.complete&&healthPackImage.naturalWidth>0){
      const s=34;
      ctx.drawImage(healthPackImage,-s/2,-s+10,s,s);
    }else{
      ctx.fillStyle='rgba(255,60,80,0.25)';ctx.beginPath();ctx.arc(0,8,15,0,7);ctx.fill();
      ctx.fillStyle='#d22';ctx.fillRect(-7,-6,14,18);ctx.fillStyle='#f88';ctx.fillRect(-4,-10,8,5);
      ctx.fillStyle='#fff';ctx.fillRect(-2,-2,4,10);ctx.fillRect(-5,1,10,4);
    }
    ctx.restore();
  }
}

class Crate{
  constructor(x,groundY,hasPotion=false){
    this.x=x;this.groundY=groundY;this.w=48;this.h=44;this.y=groundY-this.h;
    this.hp=2;this.maxHp=2;this.hasPotion=hasPotion;this.alive=true;this.hitThisAttack=false;this.breakTimer=0;
  }
  takeHit(dir){
    if(!this.alive||this.hitThisAttack)return;
    this.hitThisAttack=true;this.hp--;this.breakTimer=180;
    addSpark(this.x+this.w/2,this.y+this.h/2,'#c86',9);addDust(this.x+this.w/2,this.groundY-4,dir);doShake(3);doHitstop(2);
    if(this.hp<=0){
      this.hp=0;this.alive=false;this.breakTimer=420;addSpark(this.x+this.w/2,this.y+this.h/2,'#d98',16);
      if(this.hasPotion)healthItems.push(new HealthPotion(this.x+this.w/2,this.groundY));
    }
  }
  update(){if(this.breakTimer>0)this.breakTimer-=16;}
  draw(){
    const frames=ENEMY_SPRITES.crate;
    let idx=this.maxHp-this.hp;
    if(this.hp<=0)idx=this.breakTimer>280?2:(this.breakTimer>140?3:4);
    const fr=frames[Math.min(frames.length-1,idx)];
    const dh=this.hp<=0?22:54,dw=dh*(fr.w/fr.h);
    const flash=this.breakTimer>0&&this.hp>0&&Math.floor(this.breakTimer/45)%2===0;
    ctx.save();ctx.translate(this.x+this.w/2-cam.x,this.groundY);if(flash)ctx.filter='brightness(1.7)';
    if(crateSpriteSheet.complete&&crateSpriteSheet.naturalWidth>0)ctx.drawImage(crateSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,-dh,dw,dh);
    else{ctx.fillStyle=flash?'#e9b56c':'#8a5428';ctx.fillRect(-this.w/2,-this.h,this.w,this.h);}
    ctx.restore();
  }
}
