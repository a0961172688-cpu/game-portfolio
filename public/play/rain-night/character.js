import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { createVRMMotion } from './vrm-motion.js';
import { createUmbrella } from './umbrella.js';

// pixiv's licensed sample includes painted textures, MToon materials,
// facial expressions, humanoid bones and spring chains for the long hair.
export async function createCharacter({ onProgress } = {}) {
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(new URL('./assets/rain-walker.vrm', import.meta.url).href, onProgress);
  const vrm = gltf.userData.vrm;
  if (!vrm?.humanoid) throw new Error('The character file has no VRM humanoid.');
  VRMUtils.rotateVRM0(vrm);
  VRMUtils.removeUnnecessaryVertices(vrm.scene);
  VRMUtils.combineSkeletons(vrm.scene);

  const group = new THREE.Group();
  group.name = 'Rain-walker / pixiv VRM sample';
  group.add(vrm.scene);
  // Compute the skinned soles rather than a loose bind-pose bounding box.
  const bounds = new THREE.Box3().setFromObject(vrm.scene, true);
  const scale = 1.80 / (bounds.max.y - bounds.min.y);
  vrm.scene.scale.setScalar(scale);
  vrm.scene.position.y = -bounds.min.y * scale;
  const materials = new Set();
  vrm.scene.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    // Keep the painted facial shading soft in the night lighting.
    // The character still casts a shadow onto the street.
    object.receiveShadow = false;
    // Animated limbs and spring-bone hair can move beyond the bind-pose box.
    object.frustumCulled = false;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (materials.has(material)) continue;
      materials.add(material);
      if (!material.isMToonMaterial) continue;
      material.shadingToonyFactor = Math.max(material.shadingToonyFactor, 0.85);
      material.giEqualizationFactor = 0.90;
      // The texture already contains delicate painted contours. This
      // double-sided sample's extra inverted hull intersects fine strands
      // and fingers, so use the painted lines without a second ink pass.
      if (material.isOutline) material.visible = false;
      material.needsUpdate = true;
    }
  });
  const motion = await createVRMMotion(vrm);
  const umbrella = createUmbrella();
  group.add(umbrella.group);
  const coffeeAnchor = new THREE.Group();
  group.add(coffeeAnchor);
  const handPosition = new THREE.Vector3();
  const lastPosition = new THREE.Vector3();
  const cupOffset = new THREE.Vector3(0.065, -0.018, 0);
  const gripOffset = new THREE.Vector3(-0.070, -0.025, 0);
  let positioned = false;

  function anchorAtHand(anchor, hand, offset) {
    if (!hand) return;
    // The grip belongs in palm coordinates, including wrist rotation.
    hand.localToWorld(handPosition.copy(offset));
    group.worldToLocal(handPosition);
    anchor.position.copy(handPosition);
  }
  function update(dt, moveSpeed, time, umbrellaOpen = true, coffeeBought = false, options = {}) {
    motion.update(dt, moveSpeed, time, umbrellaOpen, coffeeBought, options);
    group.updateMatrixWorld(true);
    // A teleport must not leave the simulated hair trailing across the map.
    if (positioned && lastPosition.distanceToSquared(group.position) > 4) {
      vrm.humanoid.update();
      group.updateMatrixWorld(true);
      vrm.springBoneManager?.reset();
    }
    vrm.update(dt);
    group.updateMatrixWorld(true);
    anchorAtHand(umbrella.group, motion.rawBones.rightHand, gripOffset);
    anchorAtHand(coffeeAnchor, motion.rawBones.leftHand, cupOffset);
    // Lift the closed shaft clear of the head before unfurling the canopy;
    // on closing, fold first while the elbow lowers more slowly.
    umbrella.update(dt, time, umbrellaOpen && motion.getState().umbrellaRaise > .60);
    // The closed umbrella hangs from the grip; its point faces downward.
    const carryAngle = THREE.MathUtils.smoothstep(1-umbrella.openWeight,.80,1)*Math.PI;
    umbrella.group.rotation.set(Math.sin(time*1.8)*.012*umbrella.openWeight,0,carryAngle);
    coffeeAnchor.rotation.set(0, 0, -0.045);
    lastPosition.copy(group.position);
    positioned = true;
  }
  function attachCoffeeCup(cup) {
    coffeeAnchor.add(cup);
    cup.position.set(0, 0, 0);
  }
  update(0, 0, 0, true, false);
  return { group, umbrella: umbrella.group, update, attachCoffeeCup, vrm, motion, modelName: vrm.meta?.name || 'pixiv VRM' };
}
