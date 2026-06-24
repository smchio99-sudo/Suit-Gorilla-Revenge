class EnemyBase{
  constructor(x,cfg,type,skin='oldman'){
    this.x=x;this.spawnX=x;this.w=cfg.w;this.h=cfg.h;this.groundY=clamp(FLOOR+(Math.random()-0.5)*58,ROAD_TOP,ROAD_BOTTOM);this.y=this.groundY-this.h;
    this.health=cfg.health;this.maxHealth=cfg.health;
    this.moveSpeed=cfg.moveSpeed;this.damage=cfg.damage;this.attackRange=cfg.attackRange;this.attackCooldown=cfg.attackCooldown;this.windup=cfg.windup;
    this.coinDrop=cfg.coinDrop;this.color=cfg.color;this.detectRange=cfg.detectRange||360;this.loseRange=this.detectRange+180;
    this.vy=0;this.alive=true;this.cdTimer=0;this.windupTimer=0;this.state='patrol';
    this.hitThisAttack=false;this.type=type;this.skin=skin;this.facing=-1;this.knockback=0;this.hitFlash=0;this.didHit=false;
    this.dying=false;this.deathTimer=0;this.deathDuration=cfg.deathDuration||650;
    this.attackAnimDuration=cfg.windup+140;this.attackAnimTimer=0;
    this.attackFacing=this.facing;this.attackX=this.x;this.attackY=this.y;this.attackGroundY=this.groundY;this.attackTargetX=0;this.attackTargetY=0;
    this.patrolDir=Math.random()<0.5?-1:1;this.patrolDepthDir=Math.random()<0.5?-1:1;this.patrolLeft=Math.max(0,x-110);this.patrolRight=x+110;
  }
  takeDamage(dmg,dir,atk){const wasWindup=this.state==='windup';this.health-=dmg;this.knockback=dir*(atk==='skill'?9:5);this.hitFlash=150;this.state='chase';if(wasWindup){this.windupTimer=0;}if(this.health<=0){this.health=0;this.alive=false;this.dying=true;this.deathTimer=this.deathDuration;this.hitFlash=0;this.atkbox=null;}}
  inZone(p){const dx=Math.abs((this.x+this.w/2)-(p.x+p.w/2)),dy=Math.abs(this.groundY-p.groundY);return dx<this.attackRange&&dy<34;}
  canSeePlayer(p){const dx=Math.abs((this.x+this.w/2)-(p.x+p.w/2)),dy=Math.abs(this.groundY-p.groundY);return dx<this.detectRange&&dy<92;}
  shouldGiveUp(p){const dx=Math.abs((this.x+this.w/2)-(p.x+p.w/2));return dx>this.loseRange;}
  update(p){
    if(!this.alive){
      if(this.dying){this.deathTimer-=16;if(this.deathTimer<=0)this.dying=false;}
      return;
    }
    if(this.hitFlash>0)this.hitFlash-=16;
    const dx=(p.x+p.w/2)-(this.x+this.w/2);
    const dy=p.groundY-this.groundY;
    this.y=this.groundY-this.h;
    if(this.state==='patrol'){
      if(this.canSeePlayer(p)){this.state='chase';}
      else{
        this.facing=this.patrolDir;
        this.x+=this.patrolDir*this.moveSpeed*0.45+this.knockback;
        this.groundY=clamp(this.groundY+this.patrolDepthDir*this.moveSpeed*0.22,ROAD_TOP,ROAD_BOTTOM);
        if(this.groundY===ROAD_TOP||this.groundY===ROAD_BOTTOM)this.patrolDepthDir*=-1;
        if(this.x<this.patrolLeft){this.x=this.patrolLeft;this.patrolDir=1;}
        if(this.x>this.patrolRight){this.x=this.patrolRight;this.patrolDir=-1;}
      }
    }
    if(this.state==='chase'){
      this.facing=dx>0?1:-1;
      if(this.cdTimer>0)this.cdTimer-=16;
      if(this.shouldGiveUp(p)&&!this.inZone(p)){this.state='patrol';}
      else if(this.inZone(p)&&this.cdTimer<=0){
        this.state='windup';this.windupTimer=this.windup;this.attackAnimDuration=this.windup+140;this.attackAnimTimer=this.attackAnimDuration;this.didHit=false;
        this.attackFacing=this.facing;this.attackX=this.x;this.attackY=this.y;this.attackGroundY=this.groundY;
        this.attackTargetX=p.x+p.w/2;this.attackTargetY=p.y+p.h*0.42;
      }
      else if(!this.inZone(p)){
        this.x+=this.facing*this.moveSpeed+this.knockback;
        if(Math.abs(dy)>3)this.groundY=clamp(this.groundY+Math.sign(dy)*this.moveSpeed*0.78,ROAD_TOP,ROAD_BOTTOM);
      }
    } else if(this.state==='windup'){
      this.windupTimer-=16;this.facing=this.attackFacing;this.x+=this.knockback;
      if(this.attackAnimTimer>0)this.attackAnimTimer-=16;
      if(this.windupTimer<=0){
        this.state='strike';this.strikeTimer=this.type==='bottle'?220:140;
        if(this.type==='bottle')this.atkbox=null;
        else{const cx=this.attackX+(this.attackFacing>0?this.w:-this.attackRange*0.6);this.atkbox={x:cx,y:this.attackY+6,w:this.attackRange*0.6,h:this.h-6,groundY:this.attackGroundY,fromX:this.attackX+this.w/2};}
      }
    } else if(this.state==='strike'){
      this.strikeTimer-=16;this.facing=this.attackFacing;this.x+=this.knockback;
      if(this.attackAnimTimer>0)this.attackAnimTimer-=16;
      if(this.type==='bottle'&&!this.didHit){
        const px=this.attackTargetX,py=this.attackTargetY;
        const sx=this.attackX+this.w/2+this.attackFacing*18,sy=this.attackY+18;
        const len=Math.max(1,Math.hypot(px-sx,py-sy));
        bossProjectiles.push(new SojuBottle(sx,sy,this.attackGroundY,(px-sx)/len*5.4,(py-sy)/len*5.4-0.45,this));
        addSpark(sx,sy,'#bfe8a0',6);this.didHit=true;
      }
      if(!this.didHit&&this.atkbox){const a=this.atkbox,pr=p.rect();if(Math.abs(a.groundY-p.groundY)<32&&pr.x<a.x+a.w&&pr.x+pr.w>a.x&&pr.y<a.y+a.h&&pr.y+pr.h>a.y){p.takeDamage(this.damage,a.fromX);this.didHit=true;}}
      if(this.strikeTimer<=0){this.state='chase';this.cdTimer=this.attackCooldown;this.atkbox=null;}
    }
    this.y=this.groundY-this.h;
    this.knockback*=0.8;
  }
  draw(){
    if(!this.alive&&!this.dying)return;const sx=this.x-cam.x;
    if(this.dying){
      if(this.skin==='bat'&&enemyBatDeathSpriteSheet.complete&&enemyBatDeathSpriteSheet.naturalWidth>0){
        const frames=ENEMY_SPRITES.batDeath;
        const elapsed=Math.max(0,this.deathDuration-this.deathTimer);
        const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.deathDuration/frames.length)))];
        const {dw,dh}=fitSpriteFrame(fr,58,92);
        ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
        ctx.drawImage(enemyBatDeathSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
        ctx.restore();
        return;
      }
      if(this.skin==='woman'&&enemyWomanDeathSpriteSheet.complete&&enemyWomanDeathSpriteSheet.naturalWidth>0){
        const frames=ENEMY_SPRITES.womanDeath;
        const elapsed=Math.max(0,this.deathDuration-this.deathTimer);
        const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.deathDuration/frames.length)))];
        const {dw,dh}=fitSpriteFrame(fr,58,86);
        ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
        ctx.drawImage(enemyWomanDeathSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
        ctx.restore();
        return;
      }
      if(this.skin==='oldman'&&enemyOldmanCombatSpriteSheet.complete&&enemyOldmanCombatSpriteSheet.naturalWidth>0){
        const frames=ENEMY_SPRITES.oldmanDeath;
        const elapsed=Math.max(0,this.deathDuration-this.deathTimer);
        const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.deathDuration/frames.length)))];
        const {dw,dh}=fitSpriteFrame(fr,58,90);
        ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
        ctx.drawImage(enemyOldmanCombatSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
        ctx.restore();
        return;
      }
      ctx.save();ctx.globalAlpha=0.7;ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);ctx.fillStyle='#555';ctx.fillRect(-this.w/2,this.h/2-12,this.w,12);ctx.restore();
      return;
    }
    if(this.skin==='bat'&&(this.state==='windup'||this.state==='strike')&&enemyBatAttackSpriteSheet.complete&&enemyBatAttackSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.batAttack;
      const elapsed=Math.max(0,this.attackAnimDuration-this.attackAnimTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackAnimDuration/frames.length)))];
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyBatAttackSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('!',sx+this.w/2,this.y-8);}
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='bottle'&&enemyBottleSpriteSheet.complete&&enemyBottleSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.bottleAttack;
      let fr;
      if(this.state==='windup'||this.state==='strike'){
        const elapsed=Math.max(0,this.attackAnimDuration-this.attackAnimTimer);
        fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackAnimDuration/frames.length)))];
      }else{
        fr=frames[Math.floor(Date.now()/260)%2===0?0:5];
      }
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      if(this.hitFlash>0){ctx.globalAlpha=0.78;ctx.filter='brightness(2.2)';}
      ctx.drawImage(enemyBottleSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('!',sx+this.w/2,this.y-8);}
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='woman'&&(this.state==='windup'||this.state==='strike')&&enemyWomanAttackSpriteSheet.complete&&enemyWomanAttackSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.womanAttack;
      const elapsed=Math.max(0,this.attackAnimDuration-this.attackAnimTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackAnimDuration/frames.length)))];
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyWomanAttackSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('!',sx+this.w/2,this.y-8);}
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='oldman'&&(this.state==='windup'||this.state==='strike')&&enemyOldmanCombatSpriteSheet.complete&&enemyOldmanCombatSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.oldmanAttack;
      const elapsed=Math.max(0,this.attackAnimDuration-this.attackAnimTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackAnimDuration/frames.length)))];
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyOldmanCombatSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('!',sx+this.w/2,this.y-8);}
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='bat'&&(this.state==='patrol'||this.state==='chase')&&enemyBatWalkSpriteSheet.complete&&enemyBatWalkSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.batWalk;
      const fr=frames[Math.floor(Date.now()/135)%frames.length];
      const dh=60,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyBatWalkSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='woman'&&(this.state==='patrol'||this.state==='chase')&&enemyWomanWalkSpriteSheet.complete&&enemyWomanWalkSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.womanWalk;
      const fr=frames[Math.floor(Date.now()/135)%frames.length];
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyWomanWalkSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    if(this.skin==='oldman'&&(this.state==='patrol'||this.state==='chase')&&enemyOldmanWalkSpriteSheet.complete&&enemyOldmanWalkSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.oldmanWalk;
      const fr=frames[Math.floor(Date.now()/135)%frames.length];
      const dh=62,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      ctx.drawImage(enemyOldmanWalkSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
      return;
    }
    ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
    const lean=this.state==='windup'?-6:(this.state==='strike'?8:0);ctx.translate(lean,0);
    let body=this.color;if(this.hitFlash>0)body='#fff';else if(this.state==='windup')body='#ff8';else if(this.state==='strike')body='#fa4';
    ctx.fillStyle=body;ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
    ctx.fillStyle=this.color==='#a63'?'#864':'#a33';ctx.fillRect(-this.w/2+2,-this.h/2+2,this.w-4,22);
    ctx.fillStyle='#fff';ctx.fillRect(-8,-this.h/2+5,5,6);ctx.fillRect(3,-this.h/2+5,5,6);
    ctx.fillStyle='#f00';ctx.fillRect(-6,-this.h/2+13,12,3);
    if(this.type==='club'){ctx.fillStyle='#8B4513';ctx.fillRect(this.w/2-4,this.state==='strike'?-4:-14,7,28);}
    ctx.restore();
    if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('!',sx+this.w/2,this.y-8);}
    ctx.fillStyle='#400';ctx.fillRect(sx,this.y-9,this.w,4);ctx.fillStyle='#0f0';ctx.fillRect(sx,this.y-9,this.w*(this.health/this.maxHealth),4);ctx.textAlign='left';
  }
}
class BossEnemy extends EnemyBase{
  constructor(x){
    super(x,ENEMY_CFG.boss,'boss');
    this.name='포획 진압대장';
    this.phase=1;this.state='chase';this.actionTimer=0;this.postTimer=0;this.attackKind=null;this.recoveryKind=null;this.hitDone=false;
    this.meleeCooldown=0;this.dartCooldown=900;this.chargeCooldown=3600;this.chargeDir=1;this.chargeHit=false;
    this.damage=18;this.dartDamage=5;this.chargeDamage=30;
    this.attackFacing=this.facing;this.attackX=this.x;this.attackY=this.y;this.attackGroundY=this.groundY;this.attackTargetX=0;this.attackTargetY=0;
  }
  takeDamage(dmg,dir,atk){
    if(!this.alive)return;
    this.health-=dmg;this.knockback=dir*(atk==='skill'?7:4);this.hitFlash=150;
    if(this.health<=0){
      this.health=0;this.alive=false;this.dying=false;this.state='dead';this.attackKind=null;this.recoveryKind=null;this.atkbox=null;this.actionTimer=0;this.postTimer=0;
      bossProjectiles=bossProjectiles.filter(d=>d.owner!==this);
      addSpark(this.x+this.w/2,this.y+this.h/2,'#f44',18);doShake(14);
    }
  }
  startBossAttack(kind,p){
    this.attackKind=kind;this.state='windup';this.hitDone=false;this.atkbox=null;
    this.attackFacing=this.facing;this.attackX=this.x;this.attackY=this.y;this.attackGroundY=this.groundY;
    this.attackTargetX=p.x+p.w/2;this.attackTargetY=p.y+p.h*0.45;
    if(kind==='melee'){this.actionTimer=500;this.meleeCooldown=1500;}
    else if(kind==='dart'){this.actionTimer=500;this.dartCooldown=2300;}
    else if(kind==='charge'){this.actionTimer=700;this.chargeCooldown=4800;this.chargeDir=this.attackFacing;this.chargeHit=false;}
  }
  update(p){
    if(!this.alive)return;
    if(this.hitFlash>0)this.hitFlash-=16;
    if(this.meleeCooldown>0)this.meleeCooldown-=16;
    if(this.dartCooldown>0)this.dartCooldown-=16;
    if(this.chargeCooldown>0)this.chargeCooldown-=16;
    if(this.health<this.maxHealth*0.5&&this.phase===1){this.phase=2;this.moveSpeed*=1.22;doShake(10);addFloat(this.x+this.w/2,this.y-12,'분노','#f44');}
    const dx=(p.x+p.w/2)-(this.x+this.w/2);
    const dy=p.groundY-this.groundY;
    if(this.state!=='windup'&&this.state!=='strike'&&this.state!=='charge')this.facing=dx>=0?1:-1;
    this.y=this.groundY-this.h;
    if(this.state==='windup'){
      this.facing=this.attackFacing;
      this.actionTimer-=16;
      if(this.actionTimer<=0){
        if(this.attackKind==='melee'){
          this.state='strike';this.actionTimer=170;this.atkbox={x:this.attackX+(this.attackFacing>0?this.w:-70),y:this.attackY+8,w:70,h:this.h-10,groundY:this.attackGroundY,fromX:this.attackX+this.w/2};
          addSpark(this.attackX+this.w/2+this.attackFacing*50,this.attackY+34,'#7ff',8);
        }else if(this.attackKind==='dart'){
          const px=this.attackTargetX,py=this.attackTargetY;
          const sx=this.attackX+this.w/2+this.attackFacing*34,sy=this.attackY+28;
          const len=Math.max(1,Math.hypot(px-sx,py-sy));
          bossProjectiles.push(new TranquilizerDart(sx,sy,this.attackGroundY,(px-sx)/len*6.7,(py-sy)/len*6.7,this));
          addSpark(sx,sy,'#8ff',7);this.state='recovery';this.postTimer=420;this.recoveryKind=this.attackKind;this.attackKind=null;
        }else if(this.attackKind==='charge'){
          this.state='charge';this.actionTimer=420;this.groundY=this.attackGroundY;this.y=this.groundY-this.h;doShake(5);addDust(this.x+this.w/2,this.y+this.h-4,this.attackFacing);
        }
      }
      return;
    }
    if(this.state==='strike'){
      this.actionTimer-=16;
      if(!this.hitDone&&this.atkbox){
        const a=this.atkbox,pr=p.rect();
        if(Math.abs(a.groundY-p.groundY)<32&&pr.x<a.x+a.w&&pr.x+pr.w>a.x&&pr.y<a.y+a.h&&pr.y+pr.h>a.y){
          p.takeDamage(this.damage,a.fromX,{knockback:7,air:3});this.hitDone=true;doShake(7);addSpark(p.x+p.w/2,p.y+22,'#7ff',12);
        }
      }
      if(this.actionTimer<=0){this.state='recovery';this.postTimer=360;this.recoveryKind=this.attackKind;this.atkbox=null;this.attackKind=null;}
      return;
    }
    if(this.state==='charge'){
      this.actionTimer-=16;
      this.x+=this.chargeDir*8.4;
      this.groundY=this.attackGroundY;
      this.y=this.groundY-this.h;
      if(!this.chargeHit&&Math.abs(this.groundY-p.groundY)<38&&this.x<p.x+p.w&&this.x+this.w>p.x&&this.y<p.y+p.h&&this.y+this.h>p.y){
        p.takeDamage(this.chargeDamage,this.x+this.w/2,{knockback:12,air:6});this.chargeHit=true;doShake(12);addSpark(p.x+p.w/2,p.y+20,'#f80',18);
      }
      if(this.actionTimer<=0){this.state='recovery';this.postTimer=520;this.recoveryKind=this.attackKind;this.attackKind=null;}
      return;
    }
    if(this.state==='recovery'){
      this.postTimer-=16;
      if(this.postTimer<=0){this.state='chase';this.recoveryKind=null;}
      return;
    }
    const adx=Math.abs(dx),ady=Math.abs(dy);
    if(this.phase===2&&this.chargeCooldown<=0&&adx>95&&adx<260&&ady<52&&Math.random()<0.035){this.startBossAttack('charge',p);return;}
    if(adx<92&&ady<34&&this.meleeCooldown<=0){this.startBossAttack('melee',p);return;}
    if(adx>=120&&adx<520&&ady<90&&this.dartCooldown<=0){this.startBossAttack('dart',p);return;}
    if(adx>72)this.x+=this.facing*this.moveSpeed;
    if(Math.abs(dy)>3)this.groundY=clamp(this.groundY+Math.sign(dy)*this.moveSpeed*0.7,ROAD_TOP,ROAD_BOTTOM);
    this.x=clamp(this.x,0,MAPS[currentMap].width-this.w);
    this.y=this.groundY-this.h;
    this.knockback*=0.8;
  }
  draw(){
    if(!this.alive)return;const sx=this.x-cam.x;
    if((this.attackKind==='melee'||this.recoveryKind==='melee'||this.state==='strike')&&bossMeleeSpriteSheet.complete&&bossMeleeSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.bossMelee;
      let idx=0;
      if(this.state==='windup')idx=Math.min(1,Math.floor((500-this.actionTimer)/(500/2)));
      else if(this.state==='strike')idx=2+Math.min(1,Math.floor((170-this.actionTimer)/(170/2)));
      else if(this.state==='recovery')idx=4;
      const fr=frames[idx];
      const dh=106,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      if(this.hitFlash>0){ctx.globalAlpha=0.78;ctx.filter='brightness(2.4)';}
      ctx.drawImage(bossMeleeSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.43,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('!!',sx+this.w/2,this.y-10);}
      if(this.atkbox){ctx.save();ctx.globalAlpha=0.16;ctx.fillStyle='#7ff';ctx.fillRect(this.atkbox.x-cam.x,this.atkbox.y,this.atkbox.w,this.atkbox.h);ctx.restore();}
      const bw=320;ctx.fillStyle='#300';ctx.fillRect(240,12,bw,18);ctx.fillStyle=this.phase===2?'#f40':'#f00';ctx.fillRect(240,12,bw*(this.health/this.maxHealth),18);
      ctx.strokeStyle='#f88';ctx.strokeRect(240,12,bw,18);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.name+'  '+this.health+'/'+this.maxHealth+(this.phase===2?'  [분노]':''),400,25);ctx.textAlign='left';
      return;
    }
    if((this.attackKind==='dart'||this.recoveryKind==='dart')&&bossRangedSpriteSheet.complete&&bossRangedSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.bossRanged;
      let idx=0;
      if(this.state==='windup')idx=Math.min(1,Math.floor((500-this.actionTimer)/(500/2)));
      else if(this.state==='recovery'){
        const elapsed=420-this.postTimer;
        idx=elapsed<120?2:elapsed<260?3:4;
      }
      const fr=frames[idx];
      const dh=104,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      if(this.hitFlash>0){ctx.globalAlpha=0.78;ctx.filter='brightness(2.4)';}
      ctx.drawImage(bossRangedSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.48,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('AIM',sx+this.w/2,this.y-10);}
      const bw=320;ctx.fillStyle='#300';ctx.fillRect(240,12,bw,18);ctx.fillStyle=this.phase===2?'#f40':'#f00';ctx.fillRect(240,12,bw*(this.health/this.maxHealth),18);
      ctx.strokeStyle='#f88';ctx.strokeRect(240,12,bw,18);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.name+'  '+this.health+'/'+this.maxHealth+(this.phase===2?'  [遺꾨끂]':''),400,25);ctx.textAlign='left';
      return;
    }
    if((this.attackKind==='charge'||this.recoveryKind==='charge'||this.state==='charge')&&bossChargeSpriteSheet.complete&&bossChargeSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.bossCharge;
      let idx=0;
      if(this.state==='windup'){
        const elapsed=700-this.actionTimer;
        idx=elapsed<360?0:1;
      }else if(this.state==='charge'){
        const elapsed=420-this.actionTimer;
        idx=elapsed<130?1:elapsed<300?2:3;
      }else if(this.state==='recovery')idx=0;
      const fr=frames[idx];
      const dh=108,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      if(this.hitFlash>0){ctx.globalAlpha=0.78;ctx.filter='brightness(2.4)';}
      ctx.drawImage(bossChargeSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.45,this.h/2-dh,dw,dh);
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle='#f80';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('RUSH',sx+this.w/2,this.y-10);}
      const bw=320;ctx.fillStyle='#300';ctx.fillRect(240,12,bw,18);ctx.fillStyle=this.phase===2?'#f40':'#f00';ctx.fillRect(240,12,bw*(this.health/this.maxHealth),18);
      ctx.strokeStyle='#f88';ctx.strokeRect(240,12,bw,18);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.name+'  '+this.health+'/'+this.maxHealth+(this.phase===2?'  [분노]':''),400,25);ctx.textAlign='left';
      return;
    }
    if(bossWalkSpriteSheet.complete&&bossWalkSpriteSheet.naturalWidth>0){
      const frames=ENEMY_SPRITES.bossWalk;
      const fr=frames[Math.floor(Date.now()/150)%frames.length];
      const dh=108,dw=dh*(fr.w/fr.h);
      ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
      if(this.hitFlash>0){ctx.globalAlpha=0.78;ctx.filter='brightness(2.4)';}
      if(this.state==='windup'){ctx.translate(-5,5);ctx.scale(1.08,0.92);}
      if(this.state==='strike')ctx.translate(9,0);
      if(this.state==='charge')ctx.translate(14,8),ctx.scale(1.16,0.84);
      ctx.drawImage(bossWalkSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      if(this.attackKind==='melee'&&this.state==='windup'){ctx.fillStyle='rgba(120,240,255,0.8)';ctx.fillRect(18,-14,52,7);}
      if(this.attackKind==='dart'&&this.state==='windup'){ctx.fillStyle='rgba(130,255,255,0.85)';ctx.fillRect(22,-24,58,4);}
      ctx.restore();
      if(this.state==='windup'){ctx.fillStyle=this.attackKind==='charge'?'#f80':'#ff0';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText(this.attackKind==='dart'?'AIM':this.attackKind==='charge'?'RUSH':'!!',sx+this.w/2,this.y-10);}
      if(this.atkbox){ctx.save();ctx.globalAlpha=0.16;ctx.fillStyle='#7ff';ctx.fillRect(this.atkbox.x-cam.x,this.atkbox.y,this.atkbox.w,this.atkbox.h);ctx.restore();}
      const bw=320;ctx.fillStyle='#300';ctx.fillRect(240,12,bw,18);ctx.fillStyle=this.phase===2?'#f40':'#f00';ctx.fillRect(240,12,bw*(this.health/this.maxHealth),18);
      ctx.strokeStyle='#f88';ctx.strokeRect(240,12,bw,18);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.name+'  '+this.health+'/'+this.maxHealth+(this.phase===2?'  [분노]':''),400,25);ctx.textAlign='left';
      return;
    }
    ctx.save();ctx.translate(sx+this.w/2,this.y+this.h/2);ctx.scale(this.facing,1);
    let body=this.phase===2?'#8B0000':'#622';if(this.hitFlash>0)body='#fff';else if(this.state==='windup')body='#fa4';
    ctx.fillStyle=body;ctx.fillRect(-32,-40,64,80);ctx.fillStyle='#a00';ctx.fillRect(-28,-36,56,36);
    ctx.fillStyle='#fff';ctx.fillRect(-18,-30,10,10);ctx.fillRect(8,-30,10,10);
    ctx.fillStyle=this.phase===2?'#ff0':'#f00';ctx.fillRect(-14,-18,28,5);
    for(let i=0;i<3;i++){ctx.fillStyle='#555';ctx.fillRect(-30+i*24,-40,8,14);}
    ctx.restore();
    if(this.state==='windup'){ctx.fillStyle='#ff0';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('!!',sx+this.w/2,this.y-10);}
    const bw=320;ctx.fillStyle='#300';ctx.fillRect(240,12,bw,18);ctx.fillStyle=this.phase===2?'#f40':'#f00';ctx.fillRect(240,12,bw*(this.health/this.maxHealth),18);
    ctx.strokeStyle='#f88';ctx.strokeRect(240,12,bw,18);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('BOSS  '+this.health+'/'+this.maxHealth+(this.phase===2?'  [분노]':''),400,25);ctx.textAlign='left';
  }
}

