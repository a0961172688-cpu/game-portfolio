import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMAnimationLoaderPlugin, createVRMAnimationHumanoidTracks } from '@pixiv/three-vrm-animation';

const clamp = THREE.MathUtils.clamp;
const median = values => values.sort((a,b)=>a-b)[Math.floor(values.length/2)];

// Full skeletal poses are sampled by travelled distance. Holding a prop is
// an upper-body layer, so it does not replace the walk/run's leg movement.
export async function createVRMMotion(vrm, suppliedAnimations) {
  const humanoid = vrm.humanoid;
  let animations = suppliedAnimations;
  if (!animations) {
    const loader = new GLTFLoader();
    loader.register(parser => new VRMAnimationLoaderPlugin(parser));
    const entries = await Promise.all(['idle','walk','run'].map(async name => {
      const gltf = await loader.loadAsync(new URL(`./assets/animations/${name}.vrma`, import.meta.url).href);
      if (!gltf.userData.vrmAnimations?.[0]) throw new Error(`Missing ${name} animation.`);
      return [name, gltf.userData.vrmAnimations[0]];
    }));
    animations = Object.fromEntries(entries);
  }
  const names = Object.keys(humanoid.humanBones);
  const bones = {}, rawBones = {}, rest = {};
  for (const name of names) {
    bones[name] = humanoid.getNormalizedBoneNode(name);
    rawBones[name] = humanoid.getRawBoneNode(name);
    rest[name] = bones[name].quaternion.clone();
  }
  const hipsRest = bones.hips.position.clone();
  const worldPoint = new THREE.Vector3(), modelPoint = new THREE.Vector3();
  const modelScale = vrm.scene.scale.y;
  const floorY = -vrm.scene.position.y / modelScale;
  function inModel(bone, offset, out = modelPoint) {
    bone.localToWorld(worldPoint.copy(offset));
    return vrm.scene.worldToLocal(out.copy(worldPoint));
  }
  vrm.scene.updateMatrixWorld(true);
  const soles = {};
  for (const side of ['left','right']) {
    const ankleY = inModel(bones[`${side}Foot`], new THREE.Vector3()).y;
    const toeY = inModel(bones[`${side}Toes`], new THREE.Vector3()).y;
    soles[side] = {
      heel: new THREE.Vector3(0, floorY - ankleY, -0.028),
      ball: new THREE.Vector3(0, floorY - toeY, 0.014),
    };
  }
  // Heel/toe centres miss the shoe's wide heel and curved toe when the
  // captured pose rolls the foot. Keep the actual skinned shoe vertices
  // in each normalized influence bone's bind frame instead. This measures
  // the sole before the raw rig is transferred, without a second VRM update.
  const soleVertices = {left:[],right:[]};
  const soleBoneMatrices = new Map();
  const rawNameToNormalized = new Map(Object.keys(rawBones).map(name=>[rawBones[name]?.name,bones[name]]));
  const bindVertex = new THREE.Vector3(), bindLocal = new THREE.Vector3();
  vrm.scene.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    if(!materials.some(material=>material&&!material.isOutline&&/shoe/i.test(material.name)))return;
    const geometry=mesh.geometry, skinIndex=geometry.attributes.skinIndex, skinWeight=geometry.attributes.skinWeight;
    if(!skinIndex||!skinWeight)return;
    const vertexIndices=new Set();
    if(materials.length===1)for(let i=0;i<geometry.attributes.position.count;i++)vertexIndices.add(i);
    else for(const section of geometry.groups){
      if(!/shoe/i.test(materials[section.materialIndex]?.name||''))continue;
      for(let i=section.start;i<section.start+section.count;i++)vertexIndices.add(geometry.index?geometry.index.getX(i):i);
    }
    for(const vertexIndex of vertexIndices){
      mesh.getVertexPosition(vertexIndex,bindVertex);mesh.localToWorld(bindVertex);
      const side=vrm.scene.worldToLocal(bindLocal.copy(bindVertex)).x>=0?'left':'right';
      const influences=[];
      for(let i=0;i<4;i++){
        const weight=skinWeight.getComponent(vertexIndex,i);
        if(weight<=0)continue;
        const rawBone=mesh.skeleton.bones[skinIndex.getComponent(vertexIndex,i)];
        const bone=rawNameToNormalized.get(rawBone?.name);
        if(bone){
          if(!soleBoneMatrices.has(bone))soleBoneMatrices.set(bone,new THREE.Matrix4());
          influences.push({bone,weight,local:bone.worldToLocal(bindVertex.clone()),matrix:soleBoneMatrices.get(bone)});
        }
      }
      const weightSum=influences.reduce((sum,influence)=>sum+influence.weight,0);
      if(weightSum>.99){
        influences.forEach(influence=>influence.weight/=weightSum);
        soleVertices[side].push(influences);
      }
    }
  });
  const soleWorld=new THREE.Vector3(), soleInfluence=new THREE.Vector3(), soleModelInverse=new THREE.Matrix4();
  function footSample(side) {
    let lowest=Infinity;
    soleModelInverse.copy(vrm.scene.matrixWorld).invert();
    for(const [bone,matrix] of soleBoneMatrices)matrix.multiplyMatrices(soleModelInverse,bone.matrixWorld);
    for(const influences of soleVertices[side]){
      soleWorld.set(0,0,0);
      for(const influence of influences){
        // updateMatrixWorld has already refreshed the whole rig. Applying
        // cached matrices avoids walking each parent chain per shoe vertex.
        soleInfluence.copy(influence.local).applyMatrix4(influence.matrix);
        soleWorld.addScaledVector(soleInfluence,influence.weight);
      }
      lowest=Math.min(lowest,soleWorld.y);
    }
    if(!Number.isFinite(lowest)){
      const heel = inModel(bones[`${side}Foot`], soles[side].heel).y;
      const ball = inModel(bones[`${side}Toes`], soles[side].ball).y;
      lowest=Math.min(heel,ball);
    }
    const z = inModel(bones[`${side}Foot`], new THREE.Vector3()).z;
    return { y: lowest, z };
  }
  const clips = {};
  for (const name of ['idle','walk','run']) {
    const tracks = createVRMAnimationHumanoidTracks(animations[name], humanoid, vrm.meta.metaVersion);
    const all = [...tracks.translation.values(), ...tracks.rotation.values()];
    // Include the last-to-first interval missing from these sampled files.
    const duration = animations[name].duration + (name === 'run' ? 1/24 : 1/30);
    for (const track of all) {
      const stride = track.getValueSize();
      track.times = new Float32Array([...track.times, duration]);
      track.values = new Float32Array([...track.values, ...track.values.slice(0,stride)]);
    }
    // All actions bind the same joints, preventing idle's absent leg tracks
    // from leaving the final frame of the last walk on the skeleton.
    for (const boneName of names) if (!tracks.rotation.has(boneName)) {
      all.push(new THREE.QuaternionKeyframeTrack(`${bones[boneName].name}.quaternion`, [0,duration], [...rest[boneName].toArray(),...rest[boneName].toArray()]));
    }
    if (!tracks.translation.has('hips')) {
      all.push(new THREE.VectorKeyframeTrack(`${bones.hips.name}.position`, [0,duration], [...hipsRest.toArray(),...hipsRest.toArray()]));
    }
    const hipTrack = all.find(track => track.name === `${bones.hips.name}.position`);
    const xs = [], zs = [];
    for (let i=0;i<hipTrack.values.length;i+=3) { xs.push(hipTrack.values[i]); zs.push(hipTrack.values[i+2]); }
    const xCenter=median(xs), zCenter=median(zs);
    for (let i=0;i<hipTrack.values.length;i+=3) {
      hipTrack.values[i] += hipsRest.x - xCenter;
      hipTrack.values[i+2] += hipsRest.z - zCenter;
    }
    clips[name] = new THREE.AnimationClip(name,duration,all);
  }
  const root = humanoid.normalizedHumanBonesRoot;
  const calibration = {};
  for (const name of ['walk','run']) {
    const mixer = new THREE.AnimationMixer(root);
    mixer.clipAction(clips[name]).play();
    const samples = [], count = 80;
    for (let i=0;i<count;i++) {
      mixer.setTime(clips[name].duration*i/count);
      vrm.scene.updateMatrixWorld(true);
      samples.push({left:footSample('left'),right:footSample('right')});
    }
    const lows = samples.map(sample=>Math.min(sample.left.y,sample.right.y));
    // Calibrate a stance interval rather than a single minimum frame.
    // Running plants a foot during the lowest quarter of the cycle while
    // its higher poses retain a flight phase.
    const baseline = name === 'walk' ? median([...lows]) : [...lows].sort((a,b)=>a-b)[Math.floor(count*.25)];
    const correction = floorY - baseline;
    const hipTrack = clips[name].tracks.find(track=>track.name===`${bones.hips.name}.position`);
    for(let i=1;i<hipTrack.values.length;i+=3)hipTrack.values[i]+=correction;
    const velocities=[];
    for(let i=0;i<count;i++) {
      const next=samples[(i+1)%count], current=samples[i];
      const side=current.left.y<current.right.y?'left':'right';
      const velocity=-(next[side].z-current[side].z)/(clips[name].duration/count)*modelScale;
      if(velocity>.35&&velocity<6)velocities.push(velocity);
    }
    calibration[name]={speed:clamp(median(velocities)|| (name==='walk'?1.5:2.8),name==='walk'?.9:1.8,name==='walk'?2.2:4),correction};
    mixer.stopAllAction();mixer.uncacheRoot(root);
    humanoid.resetNormalizedPose();
  }
  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.fromEntries(['idle','walk','run'].map(name=>[name,mixer.clipAction(clips[name]).play()]));
  let moveWeight=0, runWeight=0, carryWeight=1, carryOpenWeight=1, coffeeWeight=0, cycle=0;
  let lastState={};
  const upperQ=new THREE.Quaternion(), lowerQ=new THREE.Quaternion(), inverseQ=new THREE.Quaternion();
  const modelQ=new THREE.Quaternion(), parentQ=new THREE.Quaternion(), desiredQ=new THREE.Quaternion();
  const direction=new THREE.Vector3(), lowerDirection=new THREE.Vector3();
  const axis=new THREE.Vector3(), euler=new THREE.Euler();
  const wristRight=new THREE.Quaternion(-.5,.5,.5,.5);
  const wristLeft=new THREE.Quaternion(-.5,-.5,-.5,.5);
  function layerRotation(name,q,weight) { bones[name]?.quaternion.slerp(q,weight); }
  function finger(name,angle,weight) {
    if(!bones[name])return;
    desiredQ.copy(rest[name]).multiply(lowerQ.setFromEuler(euler.set(0,0,angle)));
    layerRotation(name,desiredQ,weight);
  }
  function carryArm(side,weight,t) {
    if(weight<.0001)return;
    const left=side==='left', sign=left?1:-1;
    axis.set(sign,0,0);
    const raised=left?1:carryOpenWeight;
    direction.set(sign*.18,-.96,left?.11:THREE.MathUtils.lerp(.10,.21,raised)).normalize();
    upperQ.setFromUnitVectors(axis,direction);
    layerRotation(`${side}UpperArm`,upperQ,weight);
    lowerDirection.set(left?-.09:.04,left?.38:THREE.MathUtils.lerp(-.65,.80,raised),left?.92:THREE.MathUtils.lerp(.76,.60,raised)).normalize();
    inverseQ.copy(upperQ).invert();lowerDirection.applyQuaternion(inverseQ);
    lowerQ.setFromUnitVectors(axis,lowerDirection);
    layerRotation(`${side}LowerArm`,lowerQ,weight);
    const hand=bones[`${side}Hand`];
    hand.parent.updateWorldMatrix(true,false);
    vrm.scene.getWorldQuaternion(modelQ);
    hand.parent.getWorldQuaternion(parentQ);
    desiredQ.copy(modelQ).multiply(left?wristLeft:wristRight).premultiply(parentQ.invert());
    layerRotation(`${side}Hand`,desiredQ,weight);
    for(const digit of ['Index','Middle','Ring','Little']) {
      finger(`${side}${digit}Proximal`,-sign*(left?.72:1.02),weight);
      finger(`${side}${digit}Intermediate`,-sign*(left?1.0:1.30),weight);
      finger(`${side}${digit}Distal`,-sign*(left?.72:.95),weight);
    }
    // Thumb crosses the palm; its rest chain points diagonally, unlike
    // the four parallel fingers, so orient it using its actual rest vector.
    const thumb=bones[`${side}ThumbMetacarpal`], proximal=bones[`${side}ThumbProximal`];
    const distal=bones[`${side}ThumbDistal`];
    if(thumb&&proximal&&distal) {
      direction.copy(proximal.position).normalize();lowerDirection.set(sign*.041,-.016,.006).normalize();
      upperQ.setFromUnitVectors(direction,lowerDirection);layerRotation(`${side}ThumbMetacarpal`,upperQ,weight);
      direction.copy(distal.position).normalize();lowerDirection.set(sign*.026,.002,-.014).normalize().applyQuaternion(inverseQ.copy(upperQ).invert());
      lowerQ.setFromUnitVectors(direction,lowerDirection);layerRotation(`${side}ThumbProximal`,lowerQ,weight);
      finger(`${side}ThumbDistal`,-sign*.45,weight);
    }
  }
  function update(dt,actualSpeed,time,umbrellaOpen=true,coffeeBought=false,options={}) {
    const delta=clamp(Number.isFinite(dt)?dt:0,0,.08);
    const speed=clamp(Number.isFinite(actualSpeed)?actualSpeed:0,0,5);
    const t=Number.isFinite(time)?time:0;
    moveWeight=THREE.MathUtils.damp(moveWeight,THREE.MathUtils.smoothstep(speed,.04,.5),14,delta);
    runWeight=THREE.MathUtils.damp(runWeight,THREE.MathUtils.smoothstep(speed,1.8,2.9),10,delta);
    carryWeight=THREE.MathUtils.damp(carryWeight,options.carryingUmbrella===false?0:1,10,delta);
    carryOpenWeight=THREE.MathUtils.damp(carryOpenWeight,umbrellaOpen?1:0,umbrellaOpen?10:4,delta);
    coffeeWeight=THREE.MathUtils.damp(coffeeWeight,coffeeBought?1:0,10,delta);
    const strideLength=THREE.MathUtils.lerp(calibration.walk.speed*clips.walk.duration,calibration.run.speed*clips.run.duration,runWeight);
    cycle=(cycle+delta*speed/strideLength)%1;
    actions.walk.time=cycle*clips.walk.duration;actions.run.time=cycle*clips.run.duration;
    actions.idle.time=(actions.idle.time+delta)%clips.idle.duration;
    const walk=moveWeight*(1-runWeight), run=moveWeight*runWeight;
    actions.idle.setEffectiveWeight(1-moveWeight);actions.walk.setEffectiveWeight(walk);actions.run.setEffectiveWeight(run);
    mixer.update(0);
    // Keep captured heel/toe roll, but correct the lowest sole instead of
    // forcing the ankle itself onto the floor. Running retains its airtime.
    vrm.scene.updateMatrixWorld(true);
    const lowest=Math.min(footSample('left').y,footSample('right').y);
    const correction=THREE.MathUtils.lerp(floorY-lowest,Math.max(0,floorY-lowest),runWeight);
    // Correct the fully blended pose, including the last few stopping
    // frames; multiplying by moveWeight left the shoes below the floor.
    bones.hips.position.y+=correction;
    const turn=clamp(options.headingRate||0,-3,3);
    lowerQ.setFromEuler(euler.set(0,0,-turn*.012*moveWeight));bones.spine.quaternion.multiply(lowerQ);
    carryArm('right',carryWeight,t);carryArm('left',coffeeWeight,t);
    const expression=vrm.expressionManager;
    const blinkTime=(t+1.31)%4.7;
    if(expression?.getExpression('blink'))expression.setValue('blink',blinkTime<.16?Math.sin(blinkTime/.16*Math.PI):0);
    if(expression?.getExpression('happy'))expression.setValue('happy',.10*coffeeWeight);
    vrm.scene.updateMatrixWorld(true);
    lastState={mode:run>.5?'run':walk>.05?'walk':'idle',weights:{idle:1-moveWeight,walk,run},phase:cycle,umbrellaRaise:carryOpenWeight,soleMin:lowest+correction-floorY,contactPoints:{left:soleVertices.left.length,right:soleVertices.right.length},nativeSpeed:{walk:calibration.walk.speed,run:calibration.run.speed}};
  }
  update(0,0,0,true,false);
  return {update,bones,rawBones,getState:()=>lastState};
}
