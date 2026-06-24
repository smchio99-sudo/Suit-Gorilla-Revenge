class Player{
  constructor(){
    this.x=80;this.groundY=FLOOR;this.y=this.groundY-56;this.w=34;this.h=56;
    this.vx=0;this.vy=0;this.onGround=true;this.facing=1;
    this.maxHealth=playerCfg.maxHealth;this.health=this.maxHealth;
    this.comboStep=0;this.comboTimer=0;this.attackTimer=0;this.hitbox=null;
    this.attackType=null;this.attackDuration=0;this.attackActiveStart=0;this.attackActiveEnd=0;
    this.skillTimer=playerCfg.skillCooldown;this.invincible=0;this.isAttacking=false;
    this.climbing=false;this.knockback=0;this.animFrame=0;this.animTimer=0;this.hitFlash=0;
    this.isDashing=false;this.dashTimer=0;this.dashCd=0;this.afterimages=[];
    this.jumpPoseTimer=0;this.landPoseTimer=0;
    this.deathTimer=0;
    this.jumpHoldTimer=0;this.jumpLocked=false;
    this.depthMoving=false;
    this.stunTimer=0;
  }
  rect(){return {x:this.x,y:this.y,w:this.w,h:this.h};}
  tryDash(){
    if(this.stunTimer>0||this.isDashing||this.dashCd>0||this.climbing||this.isAttacking)return;
    this.isDashing=true;this.dashTimer=playerCfg.dashDuration;this.dashCd=playerCfg.dashCooldown;
    this.invincible=Math.max(this.invincible,playerCfg.dashIframes);
    this.vy=Math.min(this.vy,0);
    addDust(this.x+this.w/2,this.y+this.h-4,this.facing);
    doShake(3);
  }
  update(){
    const map=MAPS[currentMap]; const spd=playerCfg.moveSpeed; this.prevY=this.y;this.depthMoving=false;
    if(this.stunTimer>0){
      this.stunTimer-=16;
      this.vx=0;this.isAttacking=false;this.hitbox=null;this.isDashing=false;this.climbing=false;
      this.vy+=GRAV;this.y+=this.vy;if(this.y>=this.groundY-this.h){this.y=this.groundY-this.h;this.vy=0;this.onGround=true;}
      if(this.hitFlash>0)this.hitFlash-=16;
      return;
    }
    if(this.health<=0){
      if(this.deathTimer>0)this.deathTimer-=16;
      this.isAttacking=false;this.hitbox=null;this.isDashing=false;this.climbing=false;this.hitFlash=0;
      this.vy+=GRAV;this.y+=this.vy;if(this.y>=this.groundY-this.h){this.y=this.groundY-this.h;this.vy=0;this.onGround=true;}
      return;
    }
    const wasOnGround=this.onGround;
    if(!keys[' '])this.jumpLocked=false;
    let nearRope=null;
    for(const r of map.ropes){ if(Math.abs((this.x+this.w/2)-r.x)<16 && this.y+this.h>r.top && this.y<r.bottom) nearRope=r; }
    if(this.climbing){
      this.vx=0;this.vy=0;
      if(keys['ArrowUp'])this.y-=playerCfg.climbSpeed;
      if(keys['ArrowDown']||keys['s'])this.y+=playerCfg.climbSpeed;
      if(keys['ArrowLeft']||keys['a']){this.x-=spd;this.facing=-1;}
      if(keys['ArrowRight']||keys['d']){this.x+=spd;this.facing=1;}
      if(keys[' ']&&!this.jumpLocked){this.climbing=false;this.vy=playerCfg.jumpTapForce*0.8;this.jumpHoldTimer=playerCfg.jumpHoldTime*0.55;this.jumpLocked=true;this.jumpPoseTimer=90;this.landPoseTimer=0;}
      if(!nearRope)this.climbing=false;
      if(this.y+this.h>=FLOOR){this.y=FLOOR-this.h;this.climbing=false;}
    } else {
      this.vx=0;
      if(this.isDashing){
        this.dashTimer-=16;
        const t=Math.max(0,this.dashTimer/playerCfg.dashDuration);
        this.vx=this.facing*playerCfg.dashSpeed*(0.45+0.55*t); // 묵직: 시작 빠르고 끝에서 감속
        this.afterimages.push({x:this.x,y:this.y,facing:this.facing,life:0.55,dash:true});
        if(this.dashTimer<=0){ this.isDashing=false; this.vx*=0.3; }
      } else if(this.knockback!==0){
        this.vx=this.knockback; this.knockback*=0.85; if(Math.abs(this.knockback)<0.3)this.knockback=0;
      } else {
        if(keys['ArrowLeft']||keys['a']){this.vx=-spd;this.facing=-1;}
        if(keys['ArrowRight']||keys['d']){this.vx=spd;this.facing=1;}
      }
      if(!this.climbing&&!this.isDashing){
        let depth=0;
        if(keys['ArrowUp'])depth-=spd*0.72;
        if(keys['ArrowDown']||keys['s'])depth+=spd*0.72;
        this.depthMoving=depth!==0;
        this.groundY=clamp(this.groundY+depth,ROAD_TOP,ROAD_BOTTOM);
        if(this.onGround)this.y=this.groundY-this.h;
      }
      if(keys['ArrowUp']&&nearRope&&!this.isDashing){this.climbing=true;}
      if(keys[' ']&&this.onGround&&!this.isDashing&&!this.jumpLocked){this.vy=playerCfg.jumpTapForce;this.jumpHoldTimer=playerCfg.jumpHoldTime;this.jumpLocked=true;this.onGround=false;this.jumpPoseTimer=90;this.landPoseTimer=0;}
      if(keys[' ']&&this.jumpHoldTimer>0&&this.vy<0&&!this.isDashing){this.vy+=playerCfg.jumpHoldForce;this.jumpHoldTimer-=16;}
      if(!keys[' ']||this.vy>=0)this.jumpHoldTimer=0;
      this.vy+=this.isDashing?GRAV*0.35:GRAV; if(this.vy>16)this.vy=16;
      this.x+=this.vx;
      for(const o of map.obstacles){ if(this.x<o.x+o.w&&this.x+this.w>o.x&&this.y+this.h>o.y+4&&this.y<o.y+o.h){ if(this.vx>0)this.x=o.x-this.w; else if(this.vx<0)this.x=o.x+o.w; } }
      this.y+=this.vy; this.onGround=false;
      if(this.y>=this.groundY-this.h){this.y=this.groundY-this.h;this.vy=0;this.onGround=true;}
      if(this.vy>=0){ for(const p of map.platforms){ const pb=this.prevY+this.h; if(this.x+this.w>p.x+4&&this.x<p.x+p.w-4&&pb<=p.y+2&&this.y+this.h>=p.y){this.y=p.y-this.h;this.vy=0;this.onGround=true;} } }
      for(const o of map.obstacles){ const pb=this.prevY+this.h; if(this.x+this.w>o.x&&this.x<o.x+o.w&&pb<=o.y+2&&this.y+this.h>=o.y&&this.vy>=0){this.y=o.y-this.h;this.vy=0;this.onGround=true;} }
    }
    if(!wasOnGround&&this.onGround)this.landPoseTimer=120;
    const mapW=map.width; if(this.x<0)this.x=0; if(this.x>mapW-this.w)this.x=mapW-this.w;
    cam.x=Math.max(0,Math.min(this.x-330,mapW-800));
    if(this.attackTimer>0){
      this.attackTimer-=16;
      const elapsed=this.attackDuration-this.attackTimer;
      if(!this.hitbox&&this.attackType&&elapsed>=this.attackActiveStart&&elapsed<=this.attackActiveEnd){
        this.hitbox=this.makeAttackHitbox(this.attackType);
        enemies.forEach(e=>e.hitThisAttack=false);
        crates.forEach(c=>c.hitThisAttack=false);
      } else if(this.hitbox&&elapsed>this.attackActiveEnd){
        this.hitbox=null;
      }
      if(this.attackTimer<=0){this.hitbox=null;this.isAttacking=false;this.attackType=null;this.attackDuration=0;}
    }
    if(this.comboTimer>0)this.comboTimer-=16;
    if(this.skillTimer<playerCfg.skillCooldown)this.skillTimer+=16;
    if(this.invincible>0)this.invincible-=16;
    if(this.dashCd>0)this.dashCd-=16;
    if(this.hitFlash>0)this.hitFlash-=16;
    if(this.jumpPoseTimer>0)this.jumpPoseTimer-=16;
    if(this.landPoseTimer>0)this.landPoseTimer-=16;
    this.animTimer+=16;if(this.animTimer>180){this.animTimer=0;this.animFrame=(this.animFrame+1)%2;}
    for(const a of this.afterimages)a.life-=0.11; this.afterimages=this.afterimages.filter(a=>a.life>0);
    if(this.hitbox){ for(const e of enemies){ if(!e.alive||e.hitThisAttack)continue; const hb=this.hitbox;
      if(e.x<hb.x+hb.w&&e.x+e.w>hb.x&&e.y<hb.y+hb.h&&e.y+e.h>hb.y){
        const dmg=hb.type==='skill'?playerCfg.skillDamage:(hb.type==='combo2'?playerCfg.comboSecondDamage:playerCfg.punchDamage);
        e.takeDamage(dmg,this.facing,hb.type);e.hitThisAttack=true;
        addSpark(e.x+e.w/2,e.y+e.h/2,'#ff5',hb.type==='skill'?14:8);
        addFloat(e.x+e.w/2,e.y-5,dmg,hb.type==='skill'?'#ff4':'#fff');
        doShake(hb.type==='skill'?7:3);doHitstop(hb.type==='skill'?5:2);
      } } }
    if(this.hitbox){ for(const c of crates){ if(c.hp<=0||c.hitThisAttack)continue; const hb=this.hitbox;
      if(Math.abs(c.groundY-this.groundY)<36&&c.x<hb.x+hb.w&&c.x+c.w>hb.x&&c.y<hb.y+hb.h&&c.y+c.h>hb.y){
        c.takeHit(this.facing);
      } } }
    for(const c of coinList){ if(!c.alive)continue; const dx=(this.x+this.w/2)-c.x,dy=(this.y+this.h/2)-c.y;
      if(Math.sqrt(dx*dx+dy*dy)<30){coins+=c.val;c.alive=false;addFloat(c.x,c.y-6,'+'+c.val,'#FFD700');addSpark(c.x,c.y,'#FFD700',5);} }
    for(const h of healthItems){ if(!h.alive)continue; const dx=(this.x+this.w/2)-h.x,dy=this.groundY-h.groundY;
      if(Math.abs(dx)<34&&Math.abs(dy)<28){const before=this.health;this.health=Math.min(this.maxHealth,this.health+h.heal);h.alive=false;addFloat(this.x+this.w/2,this.y-8,'HP +'+(this.health-before),'#7f7');addSpark(h.x,h.y,'#7f7',10);} }
  }
  makeAttackHitbox(type){
    const range=type==='skill'?playerCfg.skillAttackRange:playerCfg.normalAttackRange;
    const cx=this.x+(this.facing>0?this.w:-range);
    if(type==='skill')return {x:cx,y:this.y+10,w:range,h:this.h-6,type};
    if(type==='combo2')return {x:cx,y:this.y+4,w:range,h:this.h-8,type};
    return {x:cx,y:this.y+8,w:range,h:this.h-16,type};
  }
  startAttack(type,duration,activeStart,activeEnd){
    this.isAttacking=true;this.attackType=type;this.attackDuration=duration;this.attackTimer=duration;
    this.attackActiveStart=activeStart;this.attackActiveEnd=activeEnd;this.hitbox=null;
  }
  tryAttack(){
    if(this.stunTimer>0||this.isAttacking||this.climbing||this.isDashing)return;
    if(this.comboTimer>0&&this.comboStep===1){this.comboStep=0;this.comboTimer=0;this.startAttack('combo2',340,185,260);}
    else{this.comboStep=1;this.comboTimer=780;this.startAttack('punch',320,150,225);}
  }
  trySkill(){
    if(this.stunTimer>0||this.skillTimer<playerCfg.skillCooldown||this.climbing||this.isDashing)return;
    this.skillTimer=0;this.startAttack('skill',460,220,335);
    doShake(2);
  }
  takeDamage(dmg,fromX,opts={}){
    if(this.isDashing||this.dashTimer>0||this.invincible>0)return;
    this.health-=dmg;if(this.health<0)this.health=0;
    this.invincible=opts.stun?220:900;this.hitFlash=200;this.knockback=(this.x<fromX?-1:1)*(opts.knockback??6);this.vy=-(opts.air??4);this.climbing=false;this.isDashing=false;
    if(opts.stun)this.stunTimer=Math.max(this.stunTimer,opts.stun);
    if(this.health<=0){this.deathTimer=playerCfg.deathDuration;this.hitFlash=0;this.invincible=0;this.isAttacking=false;this.hitbox=null;}
    addSpark(this.x+this.w/2,this.y+this.h/2,'#f44',10);addFloat(this.x+this.w/2,this.y-5,'-'+dmg,'#f55');doShake(8);doHitstop(4);
  }
  drawBody(ox,facing,alpha,ghost){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(ox+this.w/2,this.y+this.h/2);ctx.scale(facing,1);
    if(ghost){ ctx.scale(1.15,0.78); ctx.translate(0,8); } // 잔상은 기존 납작한 실루엣 유지
    const bob=this.onGround&&this.vx!==0&&!this.isDashing?Math.sin(this.animFrame*Math.PI)*1.5:0;ctx.translate(0,bob);
    const idleSpriteReady=playerSpriteSheet.complete&&playerSpriteSheet.naturalWidth>0;
    const jumpSpriteReady=playerJumpSpriteSheet.complete&&playerJumpSpriteSheet.naturalWidth>0;
    const punch1SpriteReady=playerPunch1SpriteSheet.complete&&playerPunch1SpriteSheet.naturalWidth>0;
    const punch2SpriteReady=playerPunch2SpriteSheet.complete&&playerPunch2SpriteSheet.naturalWidth>0;
    const walkSpriteReady=playerWalkSpriteSheet.complete&&playerWalkSpriteSheet.naturalWidth>0;
    const skillSpriteReady=playerSkillSpriteSheet.complete&&playerSkillSpriteSheet.naturalWidth>0;
    const dashSpriteReady=playerDashSpriteSheet.complete&&playerDashSpriteSheet.naturalWidth>0;
    const hitSpriteReady=playerHitSpriteSheet.complete&&playerHitSpriteSheet.naturalWidth>0;
    const deathSpriteReady=playerDeathSpriteSheet.complete&&playerDeathSpriteSheet.naturalWidth>0;
    const climbSpriteReady=playerClimbSpriteSheet.complete&&playerClimbSpriteSheet.naturalWidth>0;
    const isDeathSprite=!ghost&&this.health<=0;
    if(isDeathSprite&&deathSpriteReady){
      const frames=PLAYER_SPRITES.death;
      const elapsed=Math.max(0,playerCfg.deathDuration-this.deathTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(playerCfg.deathDuration/frames.length)))];
      const {dw,dh}=fitSpriteFrame(fr,92,128);
      ctx.drawImage(playerDeathSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isHitSprite=!ghost&&this.hitFlash>0;
    if(isHitSprite&&hitSpriteReady){
      const frames=PLAYER_SPRITES.hit;
      const elapsed=Math.max(0,200-this.hitFlash);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(200/frames.length)))];
      const dh=88,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerHitSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isDashSprite=!ghost&&this.isDashing&&this.hitFlash<=0;
    if(isDashSprite&&dashSpriteReady){
      const frames=PLAYER_SPRITES.dash;
      const elapsed=Math.max(0,playerCfg.dashDuration-this.dashTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(playerCfg.dashDuration/frames.length)))];
      const dh=80,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerDashSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.42,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isSkillSprite=!ghost&&this.isAttacking&&this.attackType==='skill'&&this.hitFlash<=0;
    if(isSkillSprite&&skillSpriteReady){
      const frames=PLAYER_SPRITES.skill;
      const elapsed=Math.max(0,this.attackDuration-this.attackTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackDuration/frames.length)))];
      const dh=86,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerSkillSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.35,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isPunch1Sprite=!ghost&&this.isAttacking&&this.attackType==='punch'&&this.hitFlash<=0;
    if(isPunch1Sprite&&punch1SpriteReady){
      const frames=PLAYER_SPRITES.punch1;
      const elapsed=Math.max(0,this.attackDuration-this.attackTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackDuration/frames.length)))];
      const dh=82,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerPunch1SpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.36,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isPunch2Sprite=!ghost&&this.isAttacking&&this.attackType==='combo2'&&this.hitFlash<=0;
    if(isPunch2Sprite&&punch2SpriteReady){
      const frames=PLAYER_SPRITES.punch2;
      const elapsed=Math.max(0,this.attackDuration-this.attackTimer);
      const fr=frames[Math.min(frames.length-1,Math.floor(elapsed/(this.attackDuration/frames.length)))];
      const {dw,dh}=fitSpriteFrame(fr,82,96);
      ctx.drawImage(playerPunch2SpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw*0.45,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isClimbSprite=!ghost&&!this.isAttacking&&!this.isDashing&&this.climbing&&this.hitFlash<=0;
    if(isClimbSprite&&climbSpriteReady){
      const frames=PLAYER_SPRITES.climb;
      const moving=keys['ArrowUp']||keys['ArrowDown']||keys['s'];
      const fr=frames[moving?Math.floor(Date.now()/150)%frames.length:0];
      const dh=98,dw=dh*(fr.w/fr.h);
      if(fr.mirror)ctx.scale(-1,1);
      ctx.drawImage(playerClimbSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh+2,dw,dh);
      ctx.restore();
      return;
    }
    const isJumpSprite=!ghost&&!this.isAttacking&&!this.isDashing&&!this.climbing&&(!this.onGround||this.landPoseTimer>0)&&this.hitFlash<=0;
    if(isJumpSprite&&jumpSpriteReady){
      const frames=PLAYER_SPRITES.jump;
      const phase=this.landPoseTimer>0?2:(this.jumpPoseTimer>0?0:1);
      const fr=frames[phase];
      const dh=82,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerJumpSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isWalkSprite=!ghost&&!this.isAttacking&&!this.isDashing&&!this.climbing&&this.onGround&&this.landPoseTimer<=0&&(Math.abs(this.vx)>0.05||this.depthMoving)&&this.hitFlash<=0;
    if(isWalkSprite&&walkSpriteReady){
      const frames=PLAYER_SPRITES.walk;
      const fr=frames[Math.floor(Date.now()/130)%frames.length];
      const dh=86,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerWalkSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const isIdleSprite=!ghost&&!this.isAttacking&&!this.isDashing&&!this.climbing&&this.onGround&&Math.abs(this.vx)<0.05&&this.hitFlash<=0;
    if(isIdleSprite&&idleSpriteReady){
      const frames=PLAYER_SPRITES.idle;
      const fr=frames[Math.floor(Date.now()/180)%frames.length];
      const dh=82,dw=dh*(fr.w/fr.h);
      ctx.drawImage(playerSpriteSheet,fr.x,fr.y,fr.w,fr.h,-dw/2,this.h/2-dh,dw,dh);
      ctx.restore();
      return;
    }
    const ghostCol=ghost?'#6cf':null;
    ctx.fillStyle=ghostCol||(this.hitFlash>0?'#fff':'#4a3a2a');ctx.fillRect(-17,-28,34,56);
    if(!ghost){ ctx.fillStyle=this.hitFlash>0?'#fdd':'#888';ctx.fillRect(-15,-26,30,32);
      ctx.fillStyle='#555';ctx.fillRect(-15,6,30,22);
      ctx.fillStyle='#fff';ctx.fillRect(-8,-8,6,16);ctx.fillRect(2,-8,6,16);
      ctx.fillStyle='#4a3a2a';ctx.fillRect(-18,-26,8,22);ctx.fillRect(10,-26,8,22); }
    if(this.isAttacking&&!ghost){ ctx.fillStyle='rgba(255,210,60,0.85)'; if(this.hitbox?.type==='skill')ctx.fillRect(14,4,24,12); else ctx.fillRect(12,-8,14,10); }
    ctx.restore();
  }
  draw(){
    for(const a of this.afterimages){ this.drawBody(a.x-cam.x,a.facing,a.life*0.5,true); }
    const sx=this.x-cam.x;
    let alpha=1; if(this.invincible>0&&!this.isDashing&&this.hitFlash<=0&&Math.floor(Date.now()/70)%2===0)alpha=0.45;
    this.drawBody(sx,this.facing,alpha,false);
    if(this.hitbox){ctx.save();ctx.globalAlpha=0.16;ctx.fillStyle=this.hitbox.type==='skill'?'#ff0':'#0ff';ctx.fillRect(this.hitbox.x-cam.x,this.hitbox.y,this.hitbox.w,this.hitbox.h);ctx.restore();}
  }
}

