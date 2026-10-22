import * as THREE from 'three';

/** Rain stays in world coordinates, so walking through it feels like weather. */
export function createWeather(scene) {
  const group = new THREE.Group();
  group.name = 'rain-and-ground-ripples';
  scene.add(group);

  let randomSeed = 19031;
  const random = () => {
    randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0;
    return randomSeed / 4294967296;
  };
  function outdoorPoint(px = 1, pz = 7) {
    const road = random() < .55;
    const left = !road && random() < (px < -6.12 ? .65 : .22);
    const xmin = road ? -6 : left ? -7.8 : 2.25, xmax = road ? 1.9 : left ? -6.2 : 15.9;
    const zmin = road || left ? -32 : -5.5, zmax = 30;
    let nearMinZ = Math.max(zmin, pz - 18), nearMaxZ = Math.min(zmax, pz + 18);
    if (nearMinZ >= nearMaxZ) { nearMinZ = zmin; nearMaxZ = zmax; }
    return { x:xmin + random() * (xmax - xmin), z:nearMinZ + random() * (nearMaxZ - nearMinZ) };
  }
  const maxDrops = 2800;
  const drops = new Float32Array(maxDrops * 5);
  const streakPositions = new Float32Array(maxDrops * 6);
  const streakColors = new Float32Array(maxDrops * 6);
  const rainGeometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(streakPositions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  rainGeometry.setAttribute('position', positionAttribute);
  rainGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));
  const rainMaterial = new THREE.LineBasicMaterial({
    color: 0xb3d4e8,
    vertexColors: true,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });
  const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
  rain.frustumCulled = false;
  rain.name = 'world-space-rain';
  group.add(rain);

  for (let i = 0; i < maxDrops; i++) {
    const d = i * 5;
    const position = outdoorPoint();
    drops[d] = position.x;
    drops[d + 1] = random() * 18;
    drops[d + 2] = position.z;
    drops[d + 3] = 15 + random() * 12;
    drops[d + 4] = 0.3 + random() * 0.45;
    const strength = 0.36 + random() * 0.56;
    const c = i * 6;
    streakColors[c] = strength * 0.62;
    streakColors[c + 1] = strength * 0.77;
    streakColors[c + 2] = strength;
    streakColors[c + 3] = strength * 0.17;
    streakColors[c + 4] = strength * 0.25;
    streakColors[c + 5] = strength * 0.33;
  }

  // A single instanced quad draw produces soft rings with individual lifetimes.
  // Ground reflection and puddle sheen belong to the scene's floor material.
  const maxRipples = 112;
  const rippleGeometry = new THREE.InstancedBufferGeometry();
  rippleGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1,
  ], 3));
  rippleGeometry.setIndex([0, 2, 1, 0, 3, 2]);
  const offsets = new Float32Array(maxRipples * 3);
  const phases = new Float32Array(maxRipples);
  const radii = new Float32Array(maxRipples);
  for (let i = 0; i < maxRipples; i++) {
    const road = random() < .55, left=!road&&random()<.22;
    offsets[i * 3] = road ? -5.8 + random() * 7.5 : left ? -7.65+random()*1.32 : 2.3 + random() * 13.2;
    offsets[i * 3 + 1] = road ? 0.046 : 0.178;
    offsets[i * 3 + 2] = road || left ? -30 + random() * 57 : -5.3 + random() * 32.3;
    phases[i] = random();
    radii[i] = 0.14 + random() * 0.32;
  }
  rippleGeometry.setAttribute('rippleOffset', new THREE.InstancedBufferAttribute(offsets, 3));
  rippleGeometry.setAttribute('ripplePhase', new THREE.InstancedBufferAttribute(phases, 1));
  rippleGeometry.setAttribute('rippleRadius', new THREE.InstancedBufferAttribute(radii, 1));
  const rippleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      weatherTime: { value: 0 },
      weatherStrength: { value: 1 },
      rippleTint: { value: new THREE.Color(0x80aeba) },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    vertexShader: `
      attribute vec3 rippleOffset;
      attribute float ripplePhase;
      attribute float rippleRadius;
      uniform float weatherTime;
      varying vec2 vLocal;
      varying float vAge;
      void main() {
        vAge = fract(weatherTime * 0.69 + ripplePhase);
        vLocal = position.xz;
        float radius = rippleRadius * (0.16 + vAge * 0.84);
        vec3 p = rippleOffset + vec3(position.x * radius, 0.0, position.z * radius);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float weatherStrength;
      uniform vec3 rippleTint;
      varying vec2 vLocal;
      varying float vAge;
      void main() {
        float r = length(vLocal);
        float mainRing = 1.0 - smoothstep(0.035, 0.085, abs(r - 0.79));
        float innerRing = (1.0 - smoothstep(0.025, 0.065, abs(r - 0.48))) * 0.30;
        float birth = smoothstep(0.0, 0.09, vAge);
        float fade = pow(1.0 - vAge, 1.65);
        float alpha = (mainRing + innerRing) * birth * fade * weatherStrength * 0.30;
        if (alpha < 0.006) discard;
        gl_FragColor = vec4(rippleTint, alpha);
      }
    `,
  });
  const ripples = new THREE.Mesh(rippleGeometry, rippleMaterial);
  ripples.name = 'expanding-rain-ripples';
  ripples.frustumCulled = false;
  group.add(ripples);

  let count = 2200;
  let strength = 1;
  let elapsed = 0;
  rainGeometry.setDrawRange(0, count * 2);
  rippleGeometry.instanceCount = 96;

  function setQuality(quality) {
    const q = typeof quality === 'string' ? quality.toLowerCase() : quality;
    if (q === 'low' || q === 0) {
      count = 850;
      rippleGeometry.instanceCount = 40;
    } else if (q === 'medium' || q === 1) {
      count = 1700;
      rippleGeometry.instanceCount = 72;
    } else {
      count = 2200;
      rippleGeometry.instanceCount = 96;
    }
    rainGeometry.setDrawRange(0, count * 2);
  }

  function update(dt, time, playerPosition, inside, rainIntensity = 1) {
    const step = Math.min(Math.max(Number(dt) || 0, 0), 0.08);
    elapsed = Number.isFinite(time) ? time : elapsed + step;
    const intensity = THREE.MathUtils.clamp(Number(rainIntensity) || 0, 0, 1);
    const target = intensity * (inside ? 0.46 : 1);
    strength += (target - strength) * (1 - Math.exp(-step * 2.4));
    rainMaterial.opacity = 0.37 * strength;
    rippleMaterial.uniforms.weatherTime.value = elapsed;
    rippleMaterial.uniforms.weatherStrength.value = strength;
    group.visible = strength > 0.002;
    const px = playerPosition?.x ?? 1;
    const pz = playerPosition?.z ?? 7;
    const wind = 0.45 + Math.sin(elapsed * 0.16) * 0.2;

    for (let i = 0; i < count; i++) {
      const d = i * 5;
      drops[d + 1] -= drops[d + 3] * step;
      drops[d] += wind * step;
      drops[d + 2] += 0.22 * step;
      const landingY=drops[d]>1.95||drops[d]<-5.95?.17:.03;
      if (drops[d + 1] < landingY || drops[d] > 16.0 || drops[d + 2] > 30 || (drops[d] > 2 && drops[d + 2] < -5.5)) {
        // Spawn near the observer, clipped to the outdoor road and forecourt.
        const position = outdoorPoint(px, pz);
        drops[d] = position.x;
        drops[d + 1] = 13 + random() * 5;
        drops[d + 2] = position.z;
      }
      const p = i * 6;
      const length = drops[d + 4];
      streakPositions[p] = drops[d];
      streakPositions[p + 1] = drops[d + 1];
      streakPositions[p + 2] = drops[d + 2];
      streakPositions[p + 3] = drops[d] - wind * length / drops[d + 3];
      streakPositions[p + 4] = drops[d + 1] + length;
      streakPositions[p + 5] = drops[d + 2] - 0.22 * length / drops[d + 3];
    }
    positionAttribute.needsUpdate = true;
  }

  update(0, 0, null, false, 1);
  return { update, setQuality };
}
