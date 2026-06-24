function applyUpgradesToCfg(){playerCfg={...PLAYER_CFG};playerCfg.punchDamage+=upgradeState.punchLv*UPGRADE_CFG.punchGain;playerCfg.comboSecondDamage+=upgradeState.punchLv*UPGRADE_CFG.punchGain;playerCfg.moveSpeed+=upgradeState.speedLv*UPGRADE_CFG.speedGain;playerCfg.maxHealth+=upgradeState.hpLv*UPGRADE_CFG.hpGain;}
function initMap(idx){
  currentMap=idx;cam.x=0;applyUpgradesToCfg();
  const prevHp=player?player.health:null;
  player=new Player(); if(prevHp!==null)player.health=Math.min(player.maxHealth,prevHp+20);
  enemies=[];coinList=[];crates=[];healthItems=[];particles=[];floatTexts=[];bossProjectiles=[];
  const enemySkins=['bat','woman','oldman'];let enemySkinIndex=0;
  for(const ed of MAPS[idx].enemyDefs){
    if(ed.t==='boss')enemies.push(new BossEnemy(ed.x));
    else{
      const skin=enemySkins[enemySkinIndex++%enemySkins.length];
      const type=skin==='bat'?'club':'melee';
      enemies.push(new EnemyBase(ed.x,ENEMY_CFG[type],type,skin));
    }
  }
  for(const bd of (MAPS[idx].bottleDefs||[])){
    enemies.push(new EnemyBase(bd.x,ENEMY_CFG.bottle,'bottle','bottle'));
  }
  const mapW=MAPS[idx].width;
  const crateXs=[Math.max(260,mapW*0.22),mapW*0.5,Math.min(mapW-280,mapW*0.78)];
  const potionIndex=Math.floor(Math.random()*crateXs.length);
  crateXs.forEach((x,i)=>{
    const gy=clamp(FLOOR+(i-1)*28+(Math.random()-0.5)*12,ROAD_TOP+20,ROAD_BOTTOM-6);
    crates.push(new Crate(x,gy,i===potionIndex));
  });
  portal=new Portal(MAPS[idx].width-110,FLOOR-30);
}

