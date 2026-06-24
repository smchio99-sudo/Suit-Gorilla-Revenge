class TranquilizerDart{
  constructor(x,y,groundY,vx,vy,owner){
    this.x=x;this.y=y;this.groundY=groundY;this.vx=vx;this.vy=vy;this.owner=owner;this.w=48;this.h=8;this.alive=true;this.life=1700;
    this.angle=Math.atan2(vy,vx);
  }
  update(p){
    if(!this.alive)return;
    this.x+=this.vx;this.y+=this.vy;this.life-=16;
    if(this.life<=0)this.alive=false;
    const depthOk=Math.abs(this.groundY-p.groundY)<28;
    const bx=this.x-this.w/2,by=this.y-this.h/2;
    if(depthOk&&p.health>0&&bx<p.x+p.w&&bx+this.w>p.x&&by<p.y+p.h&&by+this.h>p.y){
      p.takeDamage(5,this.owner?.x+this.owner?.w/2||this.x,{stun:500,knockback:3,air:1});
      addSpark(this.x,this.y,'#8ff',8);addFloat(p.x+p.w/2,p.y-12,'STUN','#8ff');doShake(3);
      this.alive=false;
    }
  }
  draw(){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x-cam.x,this.y);ctx.rotate(this.angle);
    if(bossRangedSpriteSheet.complete&&bossRangedSpriteSheet.naturalWidth>0){
      const fr=ENEMY_SPRITES.bossDart;
      ctx.drawImage(bossRangedSpriteSheet,fr.x,fr.y,fr.w,fr.h,-this.w/2,-this.h/2,this.w,this.h);
    }else{
      ctx.fillStyle='#ccf';ctx.fillRect(-this.w/2,-2,this.w,4);ctx.fillStyle='#6ff';ctx.fillRect(this.w/2-6,-3,6,6);
    }
    ctx.restore();
  }
}
class SojuBottle{
  constructor(x,y,groundY,vx,vy,owner){
    this.x=x;this.y=y;this.groundY=groundY;this.vx=vx;this.vy=vy;this.owner=owner;this.w=28;this.h=16;this.alive=true;this.life=1500;this.angle=0;
  }
  update(p){
    if(!this.alive)return;
    this.x+=this.vx;this.y+=this.vy;this.vy+=0.08;this.angle+=this.vx*0.035;this.life-=16;
    if(this.life<=0||this.y>this.groundY+18)this.alive=false;
    const depthOk=Math.abs(this.groundY-p.groundY)<34;
    const bx=this.x-this.w/2,by=this.y-this.h/2;
    if(depthOk&&p.health>0&&bx<p.x+p.w&&bx+this.w>p.x&&by<p.y+p.h&&by+this.h>p.y){
      p.takeDamage(7,this.owner?.x+this.owner?.w/2||this.x,{knockback:4,air:2});
      addSpark(this.x,this.y,'#bfe8a0',10);addFloat(p.x+p.w/2,p.y-12,'-7','#bfe8a0');doShake(3);
      this.alive=false;
    }
  }
  draw(){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x-cam.x,this.y);ctx.rotate(this.angle);
    if(enemyBottleSpriteSheet.complete&&enemyBottleSpriteSheet.naturalWidth>0){
      const fr=ENEMY_SPRITES.bottle;
      ctx.drawImage(enemyBottleSpriteSheet,fr.x,fr.y,fr.w,fr.h,-this.w/2,-this.h/2,this.w,this.h);
    }else{
      ctx.fillStyle='#69a45a';ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);ctx.fillStyle='#ddd';ctx.fillRect(-this.w/2+3,-this.h/2+2,8,this.h-4);
    }
    ctx.restore();
  }
}

