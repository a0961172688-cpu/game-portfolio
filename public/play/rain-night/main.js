import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createWorld } from './world.js';
import { createCharacter } from './character.js';
import { createWeather } from './weather.js';

const $ = id => document.getElementById(id);
const canvas = $('scene');
let started = false, paused = false, inside = false, coffeeBought = false, umbrellaOpen = true;
let rainLevel = .6, doorOpen = false, toastTimeout, cameraYaw = -.48, cameraPitch = .32, cameraDistance = 6.4;
let soundOn = false, audio, rainGain, indoorGain;
const keys = new Set();
const touchVector = {x:0,y:0};
const velocity = new THREE.Vector3();
let playerSpeed = 0;
const mobile = matchMedia('(pointer:coarse), (max-width:650px)').matches;
const clamp = THREE.MathUtils.clamp;
const damping = (a,b,lambda,dt) => THREE.MathUtils.damp(a,b,lambda,dt);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
} catch(e) { showError('浏览器无法启动 WebGL 2。请开启浏览器硬件加速后重新打开。'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.3:1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.info.autoReset = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x142238);
scene.fog = new THREE.FogExp2(0x182a42,.018);
const camera = new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,130);
const hemi = new THREE.HemisphereLight(0xb0c7f7,0x334060,2.0);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0xc3d4ff,1.35);
moon.position.set(-8,18,12);
moon.castShadow = true;
moon.shadow.mapSize.set(1024,1024);
moon.shadow.camera.left=-22;moon.shadow.camera.right=22;moon.shadow.camera.top=24;moon.shadow.camera.bottom=-24;
moon.shadow.bias=-.0003;
scene.add(moon);
const world = createWorld(scene);
let avatar;
try {
  avatar = await createCharacter({onProgress:progress => {
    const percent = progress.total ? Math.round(progress.loaded / progress.total * 100) : null;
    $('loading-message').textContent = percent === null ? '人物正在准备出门…' : `人物正在准备出门 · ${percent}%`;
  }});
} catch (error) {
  showError('人物资源加载失败。请通过启动项目.cmd 打开，并确认 dist/assets/rain-walker.vrm 文件完整。');
  throw error;
}
scene.add(avatar.group);
avatar.group.position.set(world.spawn.x,.02,world.spawn.z);
avatar.group.rotation.y = Math.PI;
const weather = createWeather(scene);
weather.setQuality(mobile?'low':'medium');

// A real planar reflection gives lights, buildings and the umbrella a wet-road reflection.
function reflectiveFloor(w,h,x,z,y,color,opacity,repeat){
  const f = new Reflector(new THREE.PlaneGeometry(w,h),{textureWidth:mobile?384:768,textureHeight:mobile?384:768,color,clipBias:.003,multisample:0});
  f.rotation.x=-Math.PI/2;f.position.set(x,y,z);
  f.material.transparent=true;f.material.opacity=opacity;
  f.material.uniforms.opacity={value:opacity};
  f.material.uniforms.surfaceMask={value:world.wetMask};
  f.material.uniforms.surfaceRepeat={value:new THREE.Vector2(...repeat)};
  f.material.vertexShader=f.material.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 vGroundUv;').replace('vUv = textureMatrix','vGroundUv = uv; vUv = textureMatrix');
  f.material.fragmentShader=f.material.fragmentShader
    .replace('uniform vec3 color;','uniform vec3 color; uniform float opacity; uniform sampler2D surfaceMask; uniform vec2 surfaceRepeat; varying vec2 vGroundUv;')
    .replace('vec4 base = texture2DProj( tDiffuse, vUv );',`
      float wetness=texture2D(surfaceMask,vGroundUv*surfaceRepeat).r;
      vec2 projected=vUv.xy/vUv.w;
      vec2 blur=vec2(.0008+(1.0-wetness)*.0022);
      vec4 base=texture2D(tDiffuse,projected)*.40;
      base+=(texture2D(tDiffuse,projected+vec2(blur.x,0.0))+texture2D(tDiffuse,projected-vec2(blur.x,0.0))+texture2D(tDiffuse,projected+vec2(0.0,blur.y))+texture2D(tDiffuse,projected-vec2(0.0,blur.y)))*.15;
    `)
    .replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4( blendOverlay( base.rgb, color ), opacity*(.22+.78*wetness) )');
  f.name='wet-reflection';
  scene.add(f);return f;
}
const roadReflection=reflectiveFloor(7.9,70,-2.02,0,.029,0x6b8099,.46,[1,8.75]);
const forecourtReflection=reflectiveFloor(11.9,8,8,-1.7,.162,0xb5bfb2,.18,[1.5,1]);
// Reflection surfaces never render one another recursively.
for(const floor of [roadReflection,forecourtReflection]){
  const original=floor.onBeforeRender;
  floor.onBeforeRender=function(...args){
    const others=[roadReflection,forecourtReflection].filter(f=>f!==this);
    const visible=others.map(f=>f.visible);others.forEach(f=>f.visible=false);
    original.apply(this,args);others.forEach((f,i)=>f.visible=visible[i]);
  };
}
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.23,.55,1.2);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const coffeeCup=new THREE.Group();
const cupBody=new THREE.Mesh(new THREE.CylinderGeometry(.055,.042,.14,16),new THREE.MeshStandardMaterial({color:0xeee7d5,roughness:.7}));
coffeeCup.add(cupBody);
const lid=new THREE.Mesh(new THREE.CylinderGeometry(.059,.059,.025,16),new THREE.MeshStandardMaterial({color:0x493c32}));lid.position.y=.082;coffeeCup.add(lid);
const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.054,.048,.052,16),new THREE.MeshStandardMaterial({color:0x5b877b}));sleeve.position.y=-.015;coffeeCup.add(sleeve);
coffeeCup.visible=false;avatar.attachCoffeeCup(coffeeCup);

function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('visible'),3600);}
function showError(message){$('error-panel').classList.remove('hidden');$('error-message').textContent=message;$('loading').classList.add('done');}
function begin(){
  if(started)return;started=true;document.body.classList.add('playing');
  $('walking-hint').classList.remove('hidden');
  if(mobile)$('touch-controls').classList.remove('hidden');
  toast('慢慢走。便利店就在前面的街角。');
}
$('start-button').addEventListener('click',begin);
$('wordmark')?.addEventListener('click',e=>e.preventDefault());
document.querySelector('.wordmark').addEventListener('click',e=>{e.preventDefault();resetPosition();});
function resetPosition(){avatar.group.position.set(0,.15,7);velocity.set(0,0,0);cameraYaw=-.48;cameraPitch=.32;cameraDistance=6.4;avatar.group.rotation.y=Math.PI;}

function interactionType(){
  const p=avatar.group.position;
  if(inside && Math.hypot(p.x-world.counter.x,p.z-world.counter.z)<2.4) return 'coffee';
  if(!inside && Math.hypot(p.x-world.entrance.x,p.z-world.entrance.z)<3.0) return 'door';
  return null;
}
function interact(){
  if(!started)begin();const type=interactionType();
  if(type==='coffee'){
    if(coffeeBought){toast('再暖一会儿。外面的雨还在下。');return;}
    coffeeBought=true;coffeeCup.visible=true;
    $('quest-text').textContent='热咖啡到手，慢慢回到雨里';$('quest-check').textContent='✓';
    $('quest-check').style.color='#c9e9bf';document.querySelector('.chapter-number').textContent='02';
    toast('☕ 热咖啡到手。今夜的小事，完成了。');bell([660,880,1100]);
  } else if(type==='door'){
    doorOpen=true;avatar.group.position.x=8;avatar.group.position.z=-7.3;avatar.group.rotation.y=Math.PI;
    velocity.set(0,0,0);
    toast('欢迎光临。把伞收好，暖一会儿吧。');bell([880,660]);
  }
}
$('touch-interact').addEventListener('click',interact);
$('shop-button').addEventListener('click',()=>{begin();avatar.group.position.set(8,.15,-3.4);velocity.set(0,0,0);avatar.group.rotation.y=Math.PI;cameraYaw=0;cameraPitch=.2;cameraDistance=5.2;toast('店门就在眼前，按 E 进入。');});
window.addEventListener('keydown',e=>{
  if($('help-dialog').open)return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].includes(e.key)&&e.key!=='Tab')e.preventDefault();
  keys.add(e.code);
  if(e.repeat)return;
  if(e.code==='KeyE')interact();
  if(e.code==='KeyF'){
    if(inside){toast('室内已经自动收伞。');return;}
    umbrellaOpen=!umbrellaOpen;toast(umbrellaOpen?'撑开伞，继续走。':'把伞收起，听雨落下来。');
  }
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))begin();
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();touchVector.x=touchVector.y=0;});
document.addEventListener('visibilitychange',()=>{paused=document.hidden;keys.clear();});
const pointers=new Map();let drag;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointermove',e=>{
  const old=pointers.get(e.pointerId);if(!old)return;
  if(pointers.size===2){const others=[...pointers.entries()].filter(([id])=>id!==e.pointerId);const p=others[0][1];const before=Math.hypot(old.x-p.x,old.y-p.y),after=Math.hypot(e.clientX-p.x,e.clientY-p.y);cameraDistance=clamp(cameraDistance+(before-after)*.022,2.6,9.5);}
  else if(drag?.id===e.pointerId){cameraYaw-=(e.clientX-old.x)*.005;cameraPitch=clamp(cameraPitch+(e.clientY-old.y)*.004,-.06,.75);}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
});
function releasePointer(e){pointers.delete(e.pointerId);if(drag?.id===e.pointerId)drag=null;}
canvas.addEventListener('pointerup',releasePointer);canvas.addEventListener('pointercancel',releasePointer);
canvas.addEventListener('wheel',e=>{e.preventDefault();cameraDistance=clamp(cameraDistance+e.deltaY*.004,2.6,9.5);},{passive:false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const joystick=$('joystick');
let joystickPointer;
function setJoystick(e){const r=joystick.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const length=Math.hypot(x,y),scale=length>35?35/length:1;touchVector.x=x*scale/35;touchVector.y=y*scale/35;$('joystick-knob').style.transform=`translate(${x*scale}px,${y*scale}px)`;}
joystick.addEventListener('pointerdown',e=>{begin();joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);setJoystick(e);});
joystick.addEventListener('pointermove',e=>{if(joystickPointer===e.pointerId)setJoystick(e);});
function resetJoystick(){joystickPointer=null;touchVector.x=touchVector.y=0;$('joystick-knob').style.transform='';}
joystick.addEventListener('pointerup',resetJoystick);joystick.addEventListener('pointercancel',resetJoystick);
$('help-button').addEventListener('click',()=>{$('help-dialog').showModal();keys.clear();});
for(const id of ['close-help','help-done'])$(id).addEventListener('click',()=>$('help-dialog').close());
$('fullscreen-button').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('experience').requestFullscreen();else await document.exitFullscreen();}catch{toast('当前浏览器暂不支持全屏。');}});
$('rain-button').addEventListener('click',()=>{
  rainLevel=rainLevel===.6?1:rainLevel===1?0:.6;
  const label=rainLevel===1?'大雨':rainLevel===0?'停雨':'小雨';$('rain-label').textContent=label;$('weather-title').textContent=label+' · 16°C';$('rain-button').setAttribute('aria-pressed',String(rainLevel>0));
  toast(rainLevel===0?'雨停了，路面还留着街灯的光。':rainLevel===1?'雨更大了，去店里躲一会儿。':'刚刚好的雨，刚刚好的夜。');
});
$('camera-button').addEventListener('click',()=>{
  const image=document.createElement('canvas');image.width=canvas.width;image.height=canvas.height;
  const ctx=image.getContext('2d');ctx.drawImage(canvas,0,0);const s=image.width/1280;
  ctx.fillStyle='#eef1e4';ctx.font=`${25*s}px serif`;ctx.fillText('雨宿り.',40*s,image.height-45*s);
  ctx.font=`${10*s}px sans-serif`;ctx.fillStyle='#cbd8d5';ctx.fillText('AME / A LITTLE NIGHT WALK',40*s,image.height-24*s);
  image.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='雨宿り-雨夜留影.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('这一刻，已经留住了。');},'image/png');
});

function initAudio(){
  if(audio)return;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  audio=new AudioContext();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const data=buffer.getChannelData(0);let prev=0;
  for(let i=0;i<data.length;i++){prev=(prev+.02*(Math.random()*2-1))/1.02;data[i]=prev*3;}
  const noise=audio.createBufferSource();noise.buffer=buffer;noise.loop=true;
  const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3400;
  rainGain=audio.createGain();rainGain.gain.value=0;noise.connect(filter).connect(rainGain).connect(audio.destination);noise.start();
  const hum=audio.createOscillator();hum.frequency.value=100;indoorGain=audio.createGain();indoorGain.gain.value=0;hum.connect(indoorGain).connect(audio.destination);hum.start();
}
function bell(notes){if(!audio||!soundOn)return;notes.forEach((freq,i)=>{const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;const now=audio.currentTime+i*.15;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.055,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.7);osc.connect(gain).connect(audio.destination);osc.start(now);osc.stop(now+.75);});}
$('sound-button').addEventListener('click',async()=>{
  initAudio();if(!audio){toast('当前浏览器暂不支持环境音。');return;}await audio.resume();soundOn=!soundOn;
  $('sound-button').setAttribute('aria-pressed',String(soundOn));$('sound-button').setAttribute('aria-label',soundOn?'关闭环境音':'开启环境音');$('sound-button').title=soundOn?'关闭环境音':'开启环境音';$('sound-waves').setAttribute('d',soundOn?'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14':'m16 9 5 6m0-6-5 6');
  toast(soundOn?'雨声已开启。':'环境音已关闭。');
});

function blocked(x,z){
  const radius=.23;
  if(x<-7.78||x>15.5||z<-30||z>27)return true;
  for(const c of world.colliders)if(x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius)return true;
  return false;
}
const moveVector=new THREE.Vector3();
const target=new THREE.Vector3(),desiredCamera=new THREE.Vector3();
let previousTime=performance.now();let time=0,frames=0;
function updatePlayer(dt){
  const p=avatar.group.position;
  const startX=p.x,startZ=p.z,startHeading=avatar.group.rotation.y;
  let h=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touchVector.x;
  let v=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touchVector.y;
  if(!started||$('help-dialog').open)h=v=0;
  const length=Math.hypot(h,v);if(length>1){h/=length;v/=length;}
  moveVector.set(Math.cos(cameraYaw)*h+Math.sin(cameraYaw)*v,0,-Math.sin(cameraYaw)*h+Math.cos(cameraYaw)*v);
  const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?3.2:1.5;
  moveVector.multiplyScalar(speed);
  const acceleration=length>.05?8:14;
  velocity.x=damping(velocity.x,moveVector.x,acceleration,dt);
  velocity.z=damping(velocity.z,moveVector.z,acceleration,dt);
  if(length<=.05&&velocity.lengthSq()<.0004)velocity.set(0,0,0);
  const dx=velocity.x*dt,dz=velocity.z*dt;
  if(!blocked(p.x+dx,p.z))p.x+=dx;else velocity.x=0;
  if(!blocked(p.x,p.z+dz))p.z+=dz;else velocity.z=0;
  playerSpeed=dt>0?Math.hypot(p.x-startX,p.z-startZ)/dt:0;
  if(playerSpeed>.025){
    const goal=Math.atan2(p.x-startX,p.z-startZ);
    const diff=THREE.MathUtils.euclideanModulo(goal-avatar.group.rotation.y+Math.PI,Math.PI*2)-Math.PI;
    avatar.group.rotation.y+=diff*(1-Math.exp(-dt*14));
  }
  const b=world.storeBounds;const wasInside=inside;inside=p.x>b.minX&&p.x<b.maxX&&p.z<b.maxZ&&p.z>b.minZ;
  p.y=damping(p.y,inside?.166:(p.x>1.95||p.x<-5.95)?.162:.02,15,dt);
  doorOpen=Math.hypot(p.x-8,p.z+6)<3.8;
  if(inside!==wasInside){
    $('location').textContent=inside?'雨宿り · 便利店':'青叶町 · 街角';
    $('weather-caption').textContent=inside?'便利店的灯，为你亮着':'让世界，安静一会儿';
    if(inside){bell([880,660]);if(!coffeeBought)toast('沿着左侧走道，到柜台买一杯热咖啡。');}
    else {toast(coffeeBought?'热咖啡握在手里，雨夜也变得温柔了。':'撑好伞，继续慢慢走。');}
  }
  if(world.roof)world.roof.visible=!inside;
  avatar.update(dt,playerSpeed,time,umbrellaOpen&&!inside,coffeeBought,{headingRate:dt>0?(avatar.group.rotation.y-startHeading)/dt:0,carryingUmbrella:!inside});
  avatar.umbrella.visible=!inside;
  const type=interactionType();$('interaction').classList.toggle('hidden',!type||!started);
  if(type)$('interaction-label').textContent=type==='door'?'进入便利店':coffeeBought?'再暖一会儿':'买一杯热咖啡 · ¥120';
  if(rainGain&&audio){rainGain.gain.setTargetAtTime(soundOn?(inside?.12:.45)*rainLevel:0,audio.currentTime,.2);indoorGain.gain.setTargetAtTime(soundOn&&inside?.003:0,audio.currentTime,.2);}
}
function updateCamera(dt){
  const p=avatar.group.position;
  target.copy(p).add(new THREE.Vector3(started?0:1.8,started?1.18:1.45,started?0:-2.0));
  const d=inside?Math.min(cameraDistance,4.8):cameraDistance;
  desiredCamera.set(p.x+Math.sin(cameraYaw)*d,p.y+1.6+Math.sin(cameraPitch)*d,p.z+Math.cos(cameraYaw)*d);
  if(!started)desiredCamera.y+=.5;
  // Look across the aisles rather than down through the ceiling fixtures.
  if(inside){desiredCamera.y=p.y+2.35+Math.sin(Math.max(.12,cameraPitch))*d*.50;target.y=p.y+1.13;}
  if(frames===0)camera.position.copy(desiredCamera);else camera.position.lerp(desiredCamera,1-Math.exp(-dt*6));
  camera.lookAt(target);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();showError('显卡暂时中断了画面。点击重新加载即可重新开始。');});
function animate(){
  requestAnimationFrame(animate);
  const now=performance.now();const dt=Math.min((now-previousTime)/1000,.04);previousTime=now;if(paused)return;time+=dt;
  updatePlayer(dt);world.update(time,dt,doorOpen);weather.update(dt,time,avatar.group.position,inside,rainLevel);updateCamera(dt);
  renderer.info.reset();composer.render();
  if(frames++===2){$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);}
  if(frames%6===0){
    const state={started,inside,coffeeBought,umbrellaOpen,character:avatar.modelName,position:{x:avatar.group.position.x,z:avatar.group.position.z},speed:playerSpeed,motion:avatar.motion.getState(),inventory:world.inventory,rainLevel,drawCalls:renderer.info.render.calls};
    window.__ameState=state;canvas.dataset.gameState=JSON.stringify(state);
  }
}
animate();
// Lightweight diagnostics read by smoke tests and useful when extending the project.
window.__ame={scene,camera,renderer,world,avatar,getState:()=>({started,inside,coffeeBought,umbrellaOpen,rainLevel,position:avatar.group.position.clone()})};
