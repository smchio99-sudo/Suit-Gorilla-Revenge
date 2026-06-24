let scene=SCENE.SPLASH, sceneStart=performance.now(), cutsceneStep=0, bossCutsceneStep=0, cutsceneTextStart=performance.now(), keys={}, coins=0, currentMap=0, pendingMap=null;
let upgradeState={punchLv:0,speedLv:0,hpLv:0};
let playerCfg={...PLAYER_CFG};
const cam={x:0,y:0};
const TITLE_START_RECT={x:118,y:292,w:304,h:92};
let shake=0, hitstop=0, particles=[], floatTexts=[];
let qPressed=false, wPressed=false, dashPressed=false;
let player, enemies, coinList, crates, healthItems, portal, bossProjectiles=[];
