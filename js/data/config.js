const SCENE={SPLASH:'splash',LOADING:'loading',TITLE:'title',CUTSCENE:'cutscene',BOSS_CUTSCENE:'boss_cutscene',TUTORIAL:'tutorial',GAME:'game',GAMEOVER:'gameover',CLEAR:'clear',UPGRADE:'upgrade'};
const SPLASH_DURATION=2200, LOADING_DURATION=3000;

const PLAYER_CFG={
  maxHealth:100, moveSpeed:3.2, jumpForce:-13.5, climbSpeed:3,
  punchDamage:12, comboSecondDamage:18, skillDamage:38, skillCooldown:7000,
  normalAttackRange:52, skillAttackRange:88,
  dashSpeed:12.4, dashDuration:240, dashIframes:360, dashCooldown:650, deathDuration:760,
  jumpTapForce:-10.2, jumpHoldForce:-0.38, jumpHoldTime:170
};
const ENEMY_CFG={
  melee:{health:40,moveSpeed:1.4,damage:8, attackRange:42,attackCooldown:1500,windup:320,coinDrop:8, color:'#c44',w:30,h:48,detectRange:360,deathDuration:620},
  club: {health:65,moveSpeed:1.1,damage:14,attackRange:60,attackCooldown:1900,windup:420,coinDrop:14,color:'#a63',w:32,h:50,detectRange:420,deathDuration:720},
  bottle:{health:38,moveSpeed:1.05,damage:7,attackRange:320,attackCooldown:2200,windup:520,coinDrop:10,color:'#345',w:30,h:50,detectRange:460,deathDuration:620},
  boss: {health:340,moveSpeed:1.0,damage:18,attackRange:80,attackCooldown:2200,windup:500,coinDrop:0, color:'#622',w:64,h:80,detectRange:700}
};
const UPGRADE_CFG={ punchCost:[40,80,150],punchGain:8, speedCost:[40,80,140],speedGain:0.45, hpCost:[50,100,170],hpGain:25 };
const FLOOR=410, ROAD_TOP=345, ROAD_BOTTOM=430, GRAV=0.6;

const MAPS=[
  { name:'Map 1: 도시 거리', width:2400, bg:'#1a1a2e', ground:'#2a2a4a',
    platforms:[], obstacles:[], ropes:[],
    enemyDefs:[{t:'melee',x:400},{t:'melee',x:650},{t:'melee',x:900},{t:'club',x:1100},{t:'melee',x:1300},{t:'melee',x:1450},{t:'club',x:1650},{t:'melee',x:1900},{t:'club',x:2050},{t:'melee',x:2200}],
    bottleDefs:[{x:520},{x:1180},{x:1760},{x:2140}] },
  { name:'Map 2: 도시 거리 (심화)', width:3000, bg:'#1a1206', ground:'#2a2000',
    platforms:[], obstacles:[], ropes:[],
    enemyDefs:[{t:'melee',x:350},{t:'club',x:550},{t:'club',x:750},{t:'melee',x:1000},{t:'club',x:1200},{t:'melee',x:1400},{t:'club',x:1600},{t:'club',x:1800},{t:'melee',x:2000},{t:'club',x:2200},{t:'club',x:2450},{t:'melee',x:2650},{t:'club',x:2800}],
    bottleDefs:[{x:430},{x:980},{x:1530},{x:2110},{x:2700}] },
  { name:'Map 3: 보스 구역', width:1700, bg:'#1a0606', ground:'#2a0000',
    platforms:[], obstacles:[], ropes:[],
    enemyDefs:[{t:'melee',x:400},{t:'club',x:600},{t:'melee',x:750},{t:'boss',x:1300}] }
];
