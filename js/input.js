function setTitleVideoVisible(visible){
  titleVideo.classList.toggle('hidden',!visible);
  if(visible){
    titleVideo.currentTime=0;
    titleVideo.play().catch(()=>{});
  }else{
    titleVideo.pause();
  }
}

let titleMusicStopped=false;
let activeMusic=null;
const musicTracks=[titleMusic,cutsceneMusic,mapMusic,bossMusic];

function playMusic(track,volume){
  if(!track)return;
  track.volume=volume;
  track.play().catch(()=>{});
}

function stopMusic(track){
  if(!track)return;
  track.pause();
  track.currentTime=0;
}

function playTitleMusic(){
  if(titleMusicStopped)return;
  playMusic(titleMusic,0.72);
}

function stopTitleMusic(){
  titleMusicStopped=true;
  stopMusic(titleMusic);
}

function setActiveMusic(track,volume){
  if(activeMusic!==track){
    for(const music of musicTracks){
      if(music!==track)stopMusic(music);
    }
    activeMusic=track;
  }
  if(track)playMusic(track,volume);
}

function updateSceneMusic(){
  if(scene===SCENE.SPLASH||scene===SCENE.LOADING||scene===SCENE.TITLE){
    if(titleMusicStopped)setActiveMusic(null,0);
    else setActiveMusic(titleMusic,0.72);
  }else if(scene===SCENE.CUTSCENE||scene===SCENE.BOSS_CUTSCENE){
    setActiveMusic(cutsceneMusic,0.76);
  }else if(scene===SCENE.GAME){
    setActiveMusic(currentMap>=2?bossMusic:mapMusic,currentMap>=2?0.8:0.72);
  }else{
    setActiveMusic(null,0);
  }
}

function restartCutsceneText(){
  cutsceneTextStart=performance.now();
}

function revealCutsceneTextNow(text){
  cutsceneTextStart=performance.now()-(text.length+1)*CUTSCENE_CHAR_MS;
}

function advanceOpeningCutscene(){
  const text=CUTSCENES[cutsceneStep];
  if(!isCutsceneTextComplete(text)){
    revealCutsceneTextNow(text);
    return;
  }
  cutsceneStep++;
  restartCutsceneText();
  if(cutsceneStep>=CUTSCENES.length)scene=SCENE.TUTORIAL;
}

function startBossCutscene(nextMap){
  pendingMap=nextMap;
  bossCutsceneStep=0;
  scene=SCENE.BOSS_CUTSCENE;
  restartCutsceneText();
}

function finishBossCutscene(){
  const next=pendingMap;
  pendingMap=null;
  initMap(next);
  scene=SCENE.GAME;
}

function advanceBossCutscene(){
  const text=BOSS_CUTSCENES[bossCutsceneStep];
  if(!isCutsceneTextComplete(text)){
    revealCutsceneTextNow(text);
    return;
  }
  bossCutsceneStep++;
  restartCutsceneText();
  if(bossCutsceneStep>=BOSS_CUTSCENES.length)finishBossCutscene();
}

function startTitleScene(){
  if(scene!==SCENE.TITLE)return;
  stopTitleMusic();
  scene=SCENE.CUTSCENE;
  cutsceneStep=0;
  restartCutsceneText();
  setTitleVideoVisible(false);
}

function resetToTitle(){
  pendingMap=null;
  scene=SCENE.TITLE;
  sceneStart=performance.now();
  titleMusicStopped=false;
  playTitleMusic();
  coins=0;
  upgradeState={punchLv:0,speedLv:0,hpLv:0};
  setTitleVideoVisible(true);
}

document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(scene===SCENE.TITLE){
    if(e.key==='Enter')startTitleScene();
  }
  else if(scene===SCENE.CUTSCENE){
    if(e.key==='Enter')advanceOpeningCutscene();
  }
  else if(scene===SCENE.BOSS_CUTSCENE){
    if(e.key==='Enter')advanceBossCutscene();
  }
  else if(scene===SCENE.TUTORIAL){
    if(e.key==='Enter'){
      player=null;
      initMap(0);
      scene=SCENE.GAME;
    }
  }
  else if(scene===SCENE.GAME){
    if((e.key==='q'||e.key==='Q')&&!qPressed){qPressed=true;player.tryAttack();}
    if((e.key==='w'||e.key==='W')&&!wPressed){wPressed=true;player.trySkill();}
    if((e.key==='Shift'||e.key==='c'||e.key==='C')&&!dashPressed){dashPressed=true;player.tryDash();}
    if(e.key==='u'||e.key==='U')openUpgrade();
  }
  else if(scene===SCENE.GAMEOVER){
    if(e.key==='r'||e.key==='R'){
      pendingMap=null;
      player=null;
      initMap(currentMap);
      scene=SCENE.GAME;
    }
    if(e.key==='t'||e.key==='T')resetToTitle();
  }
  else if(scene===SCENE.CLEAR){
    if(e.key==='t'||e.key==='T')resetToTitle();
  }
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
});

document.addEventListener('keyup',e=>{
  keys[e.key]=false;
  if(e.key==='q'||e.key==='Q')qPressed=false;
  if(e.key==='w'||e.key==='W')wPressed=false;
  if(e.key==='Shift'||e.key==='c'||e.key==='C')dashPressed=false;
});

canvas.addEventListener('click',()=>{
  if(scene===SCENE.TITLE)startTitleScene();
  else if(scene===SCENE.CUTSCENE)advanceOpeningCutscene();
  else if(scene===SCENE.BOSS_CUTSCENE)advanceBossCutscene();
});

titleVideo.addEventListener('pointerdown',startTitleScene);
document.addEventListener('pointerdown',playTitleMusic,{passive:true});
document.addEventListener('keydown',playTitleMusic);
playTitleMusic();
setTitleVideoVisible(scene===SCENE.TITLE);
