function openUpgrade(nextMap=null){
  pendingMap=nextMap;
  scene=SCENE.UPGRADE;
  keys={};
  qPressed=false;
  wPressed=false;
  dashPressed=false;
  document.getElementById('closeUpgrade').textContent=pendingMap!==null?'다음 라운드 시작':'계속하기';
  document.getElementById('upgradePanel').classList.add('active');
  upgradeVideo.currentTime=0;
  upgradeVideo.play().catch(()=>{});
  refreshUpgradeUI();
}

function refreshUpgradeUI(){
  document.getElementById('upgradeCoins').textContent='보유 코인: $ '+coins;
  const set=(id,lv,arr,label,desc,img)=>{
    const b=document.getElementById(id);
    const maxed=lv>=arr.length;
    const cost=maxed?'MAX':arr[lv]+' 코인';
    b.innerHTML=`<div class="upg-icon" style="background-image:url('${img}')"></div><div class="upg-info"><div class="upg-name">${label}</div><div class="upg-meta">${desc}</div><div class="upg-meta">Lv.${lv}${maxed?' / MAX':' -> Lv.'+(lv+1)}</div><div class="upg-cost">${cost}</div></div>`;
    b.disabled=maxed||coins<arr[lv];
  };
  set('upgPunch',upgradeState.punchLv,UPGRADE_CFG.punchCost,'공격력','Q 공격과 콤보 데미지 증가','assets/upgrade_attack.png');
  set('upgSpeed',upgradeState.speedLv,UPGRADE_CFG.speedCost,'하체','걷기 속도와 기동성 증가','assets/upgrade_speed.png');
  set('upgHp',upgradeState.hpLv,UPGRADE_CFG.hpCost,'체력','최대 체력 증가','assets/upgrade_hp.png');
}

function buy(stat,arr){
  const lv=upgradeState[stat];
  if(lv>=arr.length||coins<arr[lv])return;
  coins-=arr[lv];
  upgradeState[stat]++;
  applyUpgradesToCfg();
  if(player&&stat==='hpLv'){
    player.maxHealth=playerCfg.maxHealth;
    player.health+=UPGRADE_CFG.hpGain;
  }
  refreshUpgradeUI();
}

document.getElementById('upgPunch').onclick=()=>buy('punchLv',UPGRADE_CFG.punchCost);
document.getElementById('upgSpeed').onclick=()=>buy('speedLv',UPGRADE_CFG.speedCost);
document.getElementById('upgHp').onclick=()=>buy('hpLv',UPGRADE_CFG.hpCost);
document.getElementById('closeUpgrade').onclick=()=>{
  document.getElementById('upgradePanel').classList.remove('active');
  upgradeVideo.pause();
  if(pendingMap!==null){
    const next=pendingMap;
    pendingMap=null;
    if(next===2){
      startBossCutscene(next);
      return;
    }
    initMap(next);
  }
  scene=SCENE.GAME;
};
