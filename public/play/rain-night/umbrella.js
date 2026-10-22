import * as THREE from 'three';

// Local origin is the centre of the palm. +Y follows the shaft towards the
// canopy; the character controller owns the grip's position and orientation.
export function createUmbrella() {
  const group = new THREE.Group();
  group.name = 'Clear eight-rib commuter umbrella';
  const poleLength = 0.74;
  const ribLength = 0.785;
  const radius = 0.75;
  const panels = 8;
  const radialSteps = 16;
  const angleSteps = panels * 8;
  const tubeSides = 6;
  const ribSteps = 12;
  const braceLength = 0.44;
  const braceJoint = 0.48;
  const metal = new THREE.MeshStandardMaterial({
    color: '#aeb7bd', metalness: 0.66, roughness: 0.38,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: '#373b43', metalness: 0.28, roughness: 0.5,
  });
  const fabric = new THREE.MeshPhysicalMaterial({
    color: '#c6d9df', transparent: true, opacity: 0.115,
    roughness: 0.38, reflectivity: 0.12, metalness: 0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const edging = new THREE.LineBasicMaterial({
    color: '#bdcdd2', transparent: true, opacity: 0.42, depthWrite: false,
  });

  function addMesh(geometry, material, parent = group) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = !material.transparent;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  const shaft = addMesh(new THREE.CylinderGeometry(0.0035, 0.0035, poleLength + 0.091, 10), metal);
  shaft.position.y = (poleLength + 0.031 - 0.06) * 0.5;
  const grip = addMesh(new THREE.CylinderGeometry(0.009, 0.009, 0.105, 12), dark);
  grip.position.y = -0.008;
  const hookPoints = [new THREE.Vector3(0, -0.058, 0), new THREE.Vector3(0, -0.09, 0)];
  for (let i = 1; i <= 12; i++) {
    const angle = i / 12 * Math.PI;
    hookPoints.push(new THREE.Vector3(-0.028 + Math.cos(angle) * 0.028, -0.09 - Math.sin(angle) * 0.028, 0));
  }
  hookPoints.push(new THREE.Vector3(-0.056, -0.066, 0));
  const hook = addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hookPoints), 28, 0.007, 8, false), dark);
  hook.name = 'Short curved grip below the palm';

  const canopy = new THREE.Group();
  canopy.name = 'Articulated transparent canopy';
  canopy.position.y = poleLength;
  group.add(canopy);
  const cap = addMesh(new THREE.SphereGeometry(0.013, 12, 8), dark, canopy);
  cap.scale.y = 0.55;
  cap.position.y = 0.003;
  const runner = addMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.029, 12), dark);
  runner.name = 'Sliding opening collar';

  const sheetCount = (radialSteps + 1) * (angleSteps + 1);
  const sheetPositions = new Float32Array(sheetCount * 3);
  const sheetIndices = [];
  for (let row = 0; row < radialSteps; row++) {
    for (let column = 0; column < angleSteps; column++) {
      const a = row * (angleSteps + 1) + column;
      const b = a + angleSteps + 1;
      sheetIndices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const sheetGeometry = new THREE.BufferGeometry();
  sheetGeometry.setAttribute('position', new THREE.BufferAttribute(sheetPositions, 3).setUsage(THREE.DynamicDrawUsage));
  sheetGeometry.setIndex(sheetIndices);
  const sheet = addMesh(sheetGeometry, fabric, canopy);
  sheet.name = 'Canopy cloth with eight folding panels';
  sheet.castShadow = false;
  sheet.renderOrder = 4;

  // Curved ribs and straight stretchers share one mesh. Only positions change
  // while folding; no geometry or materials are allocated in the render loop.
  const tubeSpecs = [];
  for (let panel = 0; panel < panels; panel++) {
    tubeSpecs.push({ panel, steps: ribSteps, radius: 0.0025, brace: false });
    tubeSpecs.push({ panel, steps: 1, radius: 0.002, brace: true });
  }
  const tubeIndices = [];
  let tubeVertexCount = 0;
  for (const spec of tubeSpecs) {
    spec.offset = tubeVertexCount;
    for (let row = 0; row < spec.steps; row++) {
      for (let side = 0; side < tubeSides; side++) {
        const a = spec.offset + row * tubeSides + side;
        const b = spec.offset + row * tubeSides + (side + 1) % tubeSides;
        const c = a + tubeSides;
        const d = b + tubeSides;
        if (spec.brace) tubeIndices.push(a, c, b, b, c, d);
        else tubeIndices.push(a, b, c, b, d, c);
      }
    }
    tubeVertexCount += (spec.steps + 1) * tubeSides;
  }
  const tubePositions = new Float32Array(tubeVertexCount * 3);
  const tubeNormals = new Float32Array(tubeVertexCount * 3);
  const tubeGeometry = new THREE.BufferGeometry();
  tubeGeometry.setAttribute('position', new THREE.BufferAttribute(tubePositions, 3).setUsage(THREE.DynamicDrawUsage));
  tubeGeometry.setAttribute('normal', new THREE.BufferAttribute(tubeNormals, 3).setUsage(THREE.DynamicDrawUsage));
  tubeGeometry.setIndex(tubeIndices);
  const ribs = addMesh(tubeGeometry, metal, canopy);
  ribs.name = 'Constant-length ribs and stretchers';

  const tips = new THREE.InstancedMesh(new THREE.SphereGeometry(0.005, 8, 6), dark, panels);
  canopy.add(tips);
  const tipMatrix = new THREE.Matrix4();
  const edgePositions = new Float32Array(angleSteps * 2 * 3);
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3).setUsage(THREE.DynamicDrawUsage));
  const rim = new THREE.LineSegments(edgeGeometry, edging);
  rim.renderOrder = 5;
  canopy.add(rim);

  let openWeight = 1;
  let previousWeight = -1;
  let alpha = 0;
  let bend = 0;
  let runnerHeight = 0;

  // Integrating each rib's tangent keeps its arc length constant. Open ribs
  // form a shallow dome; closed ribs point down beside the shaft.
  function ribPoint(u) {
    const tangent = alpha - bend * u;
    return {
      r: ribLength * (Math.cos(tangent) - Math.cos(alpha)) / bend,
      y: -ribLength * (Math.sin(alpha) - Math.sin(tangent)) / bend,
      tangent,
    };
  }

  function clothPoint(u, angle) {
    const point = ribPoint(u);
    const panelFraction = angle / (Math.PI * 2) * panels;
    const fold = Math.sin((panelFraction - Math.floor(panelFraction)) * Math.PI);
    const scallop = 1 - 0.018 * Math.pow(u, 7) * fold * openWeight;
    const pleat = 1 - 0.22 * fold * (1 - openWeight);
    const r = point.r * scallop * pleat;
    return {
      x: Math.cos(angle) * r,
      y: point.y - (0.003 + 0.003 * (1 - openWeight)) * u * fold,
      z: Math.sin(angle) * r,
    };
  }

  function rebuild() {
    alpha = THREE.MathUtils.degToRad(3.5 + 81.5 * openWeight);
    bend = THREE.MathUtils.degToRad(1.5 + 20.5 * openWeight);
    const joint = ribPoint(braceJoint);
    runnerHeight = poleLength + joint.y - Math.sqrt(braceLength * braceLength - joint.r * joint.r);
    runner.position.y = runnerHeight;
    fabric.opacity = 0.115 + 0.075 * (1 - openWeight);

    let index = 0;
    for (let row = 0; row <= radialSteps; row++) {
      for (let column = 0; column <= angleSteps; column++) {
        const point = clothPoint(row / radialSteps, column / angleSteps * Math.PI * 2);
        sheetPositions[index++] = point.x;
        sheetPositions[index++] = point.y;
        sheetPositions[index++] = point.z;
      }
    }
    sheetGeometry.attributes.position.needsUpdate = true;
    sheetGeometry.computeVertexNormals();
    sheetGeometry.computeBoundingSphere();
    sheetGeometry.computeBoundingBox();

    for (const spec of tubeSpecs) {
      const angle = spec.panel / panels * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      let braceTangent = 0;
      if (spec.brace) {
        braceTangent = Math.atan2(joint.r, poleLength + joint.y - runnerHeight);
      }
      for (let row = 0; row <= spec.steps; row++) {
        const u = row / spec.steps;
        const point = spec.brace ? {
          r: joint.r * u,
          y: runnerHeight - poleLength + (poleLength + joint.y - runnerHeight) * u,
          tangent: braceTangent,
        } : ribPoint(u);
        // A radial-plane normal and azimuthal binormal frame the round rod.
        const normalR = Math.cos(point.tangent);
        const normalY = spec.brace ? -Math.sin(point.tangent) : Math.sin(point.tangent);
        for (let side = 0; side < tubeSides; side++) {
          const radial = Math.cos(side / tubeSides * Math.PI * 2);
          const azimuthal = Math.sin(side / tubeSides * Math.PI * 2);
          const nx = radial * normalR * cosA - azimuthal * sinA;
          const ny = radial * normalY;
          const nz = radial * normalR * sinA + azimuthal * cosA;
          const offset = (spec.offset + row * tubeSides + side) * 3;
          tubePositions[offset] = point.r * cosA + nx * spec.radius;
          tubePositions[offset + 1] = point.y + ny * spec.radius - (spec.brace ? 0 : 0.002);
          tubePositions[offset + 2] = point.r * sinA + nz * spec.radius;
          tubeNormals[offset] = nx;
          tubeNormals[offset + 1] = ny;
          tubeNormals[offset + 2] = nz;
        }
      }
    }
    tubeGeometry.attributes.position.needsUpdate = true;
    tubeGeometry.attributes.normal.needsUpdate = true;
    tubeGeometry.computeBoundingSphere();
    tubeGeometry.computeBoundingBox();

    const edge = ribPoint(1);
    for (let panel = 0; panel < panels; panel++) {
      const angle = panel / panels * Math.PI * 2;
      tipMatrix.makeTranslation(Math.cos(angle) * edge.r, edge.y, Math.sin(angle) * edge.r);
      tips.setMatrixAt(panel, tipMatrix);
    }
    tips.instanceMatrix.needsUpdate = true;
    tips.computeBoundingSphere();
    tips.computeBoundingBox();
    for (let segment = 0; segment < angleSteps; segment++) {
      for (let end = 0; end < 2; end++) {
        const point = clothPoint(1, (segment + end) / angleSteps * Math.PI * 2);
        const offset = (segment * 2 + end) * 3;
        edgePositions[offset] = point.x;
        edgePositions[offset + 1] = point.y;
        edgePositions[offset + 2] = point.z;
      }
    }
    edgeGeometry.attributes.position.needsUpdate = true;
    edgeGeometry.computeBoundingSphere();
    edgeGeometry.computeBoundingBox();
    previousWeight = openWeight;
  }

  function update(dt, _time, open = true) {
    const delta = THREE.MathUtils.clamp(Number.isFinite(dt) ? dt : 0, 0, 0.1);
    const target = open ? 1 : 0;
    // Folding takes roughly half a second; pause/resume keeps the same shape.
    openWeight = THREE.MathUtils.damp(openWeight, target, open ? 8.5 : 10, delta);
    if (Math.abs(openWeight - target) < 0.001) openWeight = target;
    if (Math.abs(previousWeight - openWeight) > 0.0001) rebuild();
  }
  rebuild();
  return {
    group, update, canopy, poleLength, radius,
    gripAxis: new THREE.Vector3(0, 1, 0),
    get openWeight() { return openWeight; },
  };
}
