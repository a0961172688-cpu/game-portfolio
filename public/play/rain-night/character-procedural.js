import * as THREE from 'three';

// Original, procedural character. All measurements are metres; she faces +Z.
export function createCharacter() {
  const group = new THREE.Group();
  group.name = 'Rain-walker';
  const rig = new THREE.Group();
  group.add(rig);

  const ramp = new THREE.DataTexture(
    new Uint8Array([88,88,88,255,165,165,165,255,223,223,223,255,255,255,255,255]),
    4, 1, THREE.RGBAFormat,
  );
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  const toon = (color, options = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...options });
  const mat = {
    skin: toon('#f3cdb7'),
    skinShade: toon('#dba68f'),
    shirt: toon('#eceae3'),
    shirtShade: toon('#c4c7c6'),
    shorts: toon('#24242c'),
    hair: toon('#493026'),
    hairDark: toon('#30231f'),
    hairLight: toon('#745141'),
    shoe: toon('#25262c'),
    sole: toon('#eeeee9'),
    eyeWhite: new THREE.MeshBasicMaterial({ color: '#fbf7ed' }),
    iris: new THREE.MeshBasicMaterial({ color: '#60402d' }),
    irisLight: new THREE.MeshBasicMaterial({ color: '#ad7851' }),
    pupil: new THREE.MeshBasicMaterial({ color: '#1d1a20' }),
    shine: new THREE.MeshBasicMaterial({ color: '#fffdf1' }),
    lashes: new THREE.MeshBasicMaterial({ color: '#312320' }),
    lip: new THREE.MeshBasicMaterial({ color: '#a16f68' }),
    blush: new THREE.MeshBasicMaterial({ color: '#e7a29b', transparent: true, opacity: 0.26, depthWrite: false }),
    metal: new THREE.MeshStandardMaterial({ color: '#b5bec4', metalness: 0.78, roughness: 0.27 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: '#52535b', metalness: 0.48, roughness: 0.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#c2dce0', transparent: true, opacity: 0.135, roughness: 0.15, metalness: 0, side: THREE.DoubleSide, depthWrite: false }),
    glassEdge: new THREE.MeshBasicMaterial({ color: '#d6e7e8', transparent: true, opacity: 0.52, depthWrite: false }),
  };
  const outlineMaterial = new THREE.MeshBasicMaterial({ color: '#302b31', side: THREE.BackSide });

  function mesh(geometry, material, parent, position, scale, outline = false) {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.set(...position);
    if (scale) object.scale.set(...scale);
    object.castShadow = material !== mat.glass && !material.transparent;
    object.receiveShadow = true;
    parent.add(object);
    if (outline) {
      const ink = new THREE.Mesh(geometry, outlineMaterial);
      ink.scale.setScalar(1.016);
      ink.renderOrder = -1;
      object.add(ink);
    }
    return object;
  }

  // Elliptical ring surfaces produce soft tailoring and tapered anatomy.
  function profile(rings, segments = 32, folds = 0) {
    const points = [], uv = [], indices = [];
    for (let j = 0; j < rings.length; j++) {
      const [y, width, depth, zOffset = 0] = rings[j];
      for (let i = 0; i <= segments; i++) {
        const angle = i / segments * Math.PI * 2;
        const pleat = 1 + folds * Math.cos(angle * 7 + j * 0.18);
        points.push(Math.sin(angle) * width * pleat, y, Math.cos(angle) * depth * pleat + zOffset);
        uv.push(i / segments, j / (rings.length - 1));
        if (j < rings.length - 1 && i < segments) {
          const a = j * (segments + 1) + i, b = a + segments + 1;
          indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    }
    // Close both ends without leaving open holes when seen from above.
    for (const j of [0, rings.length - 1]) {
      const center = points.length / 3;
      points.push(0, rings[j][0], rings[j][3] || 0);
      uv.push(0.5, j === 0 ? 0 : 1);
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i;
        if (j === 0) indices.push(center, a + 1, a);
        else indices.push(center, a, a + 1);
      }
    }
    // Limbs run from their upper joint downwards; keep the surface outward.
    if (rings.at(-1)[0] < rings[0][0]) {
      for (let i=0;i<indices.length;i+=3) [indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function line(points, radius, material, parent, curve = true) {
    const path = curve
      ? new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
      : new THREE.LineCurve3(new THREE.Vector3(...points[0]), new THREE.Vector3(...points[1]));
    return mesh(new THREE.TubeGeometry(path, curve ? 24 : 1, radius, 6, false), material, parent);
  }

  // Closed, gently rounded ribbons end in a fine point, instead of blocky hair.
  function lock(points, width, material, parent, thickness = 0.015) {
    const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const positions = [], indices = [], sections = 22, sides = 8;
    const normal = new THREE.Vector3(), across = new THREE.Vector3();
    for (let j = 0; j <= sections; j++) {
      const t = j / sections, point = path.getPoint(t), tangent = path.getTangent(t).normalize();
      normal.set(0, 0, 1).addScaledVector(tangent, -tangent.z).normalize();
      across.crossVectors(tangent, normal).normalize();
      const taper = Math.pow(Math.sin((0.15 + t * 0.85) * Math.PI), 0.55) * (1 - t * 0.17) + 0.008;
      for (let i = 0; i <= sides; i++) {
        const a = i / sides * Math.PI * 2;
        const vertex = point.clone().addScaledVector(across, Math.cos(a) * width * taper).addScaledVector(normal, Math.sin(a) * thickness * taper);
        positions.push(vertex.x, vertex.y, vertex.z);
        if (j < sections && i < sides) {
          const n = j * (sides + 1) + i, m = n + sides + 1;
          indices.push(n, m, n + 1, n + 1, m, m + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return mesh(geometry, material, parent);
  }

  const pelvis = mesh(profile([[0.89,0.15,0.092],[0.94,0.17,0.102],[1.04,0.156,0.09]]), mat.shorts, rig, null, null, true);
  pelvis.name = 'Tailored charcoal shorts';
  const shirt = mesh(profile([
    [1.015,0.24,0.126,0.01],[1.045,0.245,0.13,0.008],[1.13,0.218,0.12,0.004],
    [1.23,0.204,0.115],[1.33,0.226,0.124],[1.41,0.242,0.115],[1.445,0.19,0.092],
    [1.462,0.078,0.071],
  ], 40, 0.015), mat.shirt, rig, null, null, true);
  shirt.name = 'Soft ivory oversized tee';
  mesh(profile([[1.014,0.241,0.127,0.01],[1.032,0.245,0.13,0.01]]), mat.shirtShade, rig);
  mesh(profile([[1.455,0.079,0.072],[1.471,0.069,0.062]]), mat.shirtShade, rig);
  // Small chest seam and cloth folds catch the street lighting.
  line([[-0.135,1.265,0.112],[-0.14,1.18,0.123],[-0.165,1.09,0.118]],0.0018,mat.shirtShade,rig);
  line([[0.163,1.255,0.099],[0.157,1.16,0.111],[0.176,1.07,0.111]],0.0013,mat.shirtShade,rig);
  const pocketShape = new THREE.Shape();
  pocketShape.moveTo(-0.035,0.025); pocketShape.lineTo(0.035,0.025);
  pocketShape.lineTo(0.03,-0.025); pocketShape.quadraticCurveTo(0,-0.048,-0.03,-0.025); pocketShape.closePath();
  const pocket = mesh(new THREE.ShapeGeometry(pocketShape), mat.shirtShade, rig, [-0.105,1.31,0.118]);
  pocket.rotation.y = -0.12;
  mesh(new THREE.ShapeGeometry(pocketShape), mat.shirt, pocket, [0,0.001,0.0015], [0.9,0.87,1]);
  mesh(profile([[1.455,0.045,0.042],[1.55,0.05,0.043]]), mat.skin, rig);

  const head = new THREE.Group();
  head.position.set(0,1.647,0.014);
  rig.add(head);
  mesh(new THREE.SphereGeometry(1,40,30),mat.skin,head,[0,0,0],[0.148,0.185,0.13],true);
  for (const sign of [-1,1]) {
    mesh(new THREE.SphereGeometry(1,16,12),mat.skin,head,[sign*0.143,-0.018,0],[0.022,0.041,0.026]);
    mesh(new THREE.SphereGeometry(1,12,10),mat.skinShade,head,[sign*0.158,-0.017,0.008],[0.004,0.023,0.016]);
  }

  function eye(sign) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(sign*0.055,0.015,0.121);
    eyeGroup.rotation.y = sign*0.21;
    head.add(eyeGroup);
    const almond = new THREE.Shape();
    almond.moveTo(-0.038,0);
    almond.quadraticCurveTo(-0.01,0.027,0.028,0.016);
    almond.quadraticCurveTo(0.041,0.011,0.039,0);
    almond.quadraticCurveTo(0.006,-0.022,-0.028,-0.012);
    almond.quadraticCurveTo(-0.037,-0.006,-0.038,0);
    mesh(new THREE.ShapeGeometry(almond,16),mat.eyeWhite,eyeGroup);
    mesh(new THREE.CircleGeometry(0.019,32),mat.iris,eyeGroup,[0.003,-0.002,0.002],[1,1.1,1]);
    const lowerIris = mesh(new THREE.CircleGeometry(0.0155,24,Math.PI,Math.PI),mat.irisLight,eyeGroup,[0.003,-0.002,0.0025],[1,1.1,1]);
    lowerIris.rotation.z = 0;
    mesh(new THREE.CircleGeometry(0.0085,24),mat.pupil,eyeGroup,[0.003,0.002,0.003],[1,1.15,1]);
    mesh(new THREE.CircleGeometry(0.005,16),mat.shine,eyeGroup,[-0.004,0.009,0.004]);
    mesh(new THREE.CircleGeometry(0.0024,12),mat.shine,eyeGroup,[0.012,-0.009,0.004]);
    line([[-0.038,0,0.004],[-0.021,0.014,0.004],[0.008,0.021,0.004],[0.033,0.013,0.004],[0.04,0.002,0.004]],0.0032,mat.lashes,eyeGroup);
    line([[-0.028,-0.012,0.003],[0,-0.018,0.003],[0.029,-0.009,0.003]],0.0011,mat.lashes,eyeGroup);
    line([[sign*0.029,0.013,0.003],[sign*0.044,0.020,0.004]],0.0021,mat.lashes,eyeGroup,false);
    line([[-0.035,0.047,-0.005],[-0.01,0.052,-0.002],[0.025,0.048,-0.003]],0.0027,mat.hairDark,eyeGroup);
    mesh(new THREE.CircleGeometry(0.03,24),mat.blush,head,[sign*0.087,-0.04,0.111],[1,0.36,1]);
    return eyeGroup;
  }
  eye(-1); eye(1);
  mesh(new THREE.SphereGeometry(1,12,10),mat.skin,head,[0,-0.027,0.131],[0.01,0.023,0.009]);
  line([[-0.013,-0.069,0.120],[0,-0.072,0.123],[0.012,-0.067,0.120]],0.0016,mat.lip,head);

  const hair = new THREE.Group();
  head.add(hair);
  // The scalp is cut higher at the forehead and lower around the back.
  const scalpPositions = [], scalpIndices = [], scalpSegments = 48, scalpRows = 18;
  for (let j=0;j<=scalpRows;j++) {
    for (let i=0;i<=scalpSegments;i++) {
      const a=i/scalpSegments*Math.PI*2;
      const front=Math.max(0,Math.cos(a));
      const phi=j/scalpRows*(2.35-1.23*Math.pow(front,3));
      scalpPositions.push(Math.sin(a)*Math.sin(phi)*0.157,Math.cos(phi)*0.197+0.008,Math.cos(a)*Math.sin(phi)*0.142-0.007);
      if(j<scalpRows&&i<scalpSegments){const n=j*(scalpSegments+1)+i,m=n+scalpSegments+1;scalpIndices.push(n,m,n+1,n+1,m,m+1);}
    }
  }
  const scalpGeometry=new THREE.BufferGeometry();
  scalpGeometry.setAttribute('position',new THREE.Float32BufferAttribute(scalpPositions,3));
  scalpGeometry.setIndex(scalpIndices); scalpGeometry.computeVertexNormals();
  mesh(scalpGeometry,mat.hairDark,hair);

  const backHair = new THREE.Group();
  hair.add(backHair);
  for(let i=0;i<13;i++) {
    const x=(i-6)*0.027;
    const spread=x*1.55;
    const tip=-0.68 + Math.abs(i-6)*0.018 + 0.025*Math.sin(i*1.8);
    lock([[x*0.55,0.135,-0.105],[x,0.025,-0.141],[spread*0.93,-0.27,-0.155],[spread,-0.52,-0.10],[spread*1.05,tip,-0.065]],0.039,i%3===0?mat.hairLight:mat.hair,backHair,0.022);
    if(i%2===0) lock([[x*0.62,0.13,-0.12],[x,0,-0.158],[spread,-0.27,-0.177],[spread*1.02,-0.51,-0.123],[spread*1.03,tip+0.03,-0.088]],0.006,mat.hairLight,backHair,0.0025);
  }
  const sideHair=[];
  for(const sign of [-1,1]) {
    const side=new THREE.Group(); hair.add(side); sideHair.push(side);
    for(let j=0;j<4;j++) {
      const x=sign*(0.126+j*0.016), z=0.018-j*0.038;
      lock([[sign*0.093,0.148,z],[x,0.018,z+0.032],[sign*(0.183+j*0.014),-0.24,z+0.032],[sign*(0.218+j*0.015),-0.48,z+0.012],[sign*(0.218+j*0.014),-0.655+j*0.035,z-0.006]],0.029,j===0?mat.hairLight:mat.hair,side,0.018);
    }
    lock([[sign*0.086,0.153,0.068],[sign*0.139,0.085,0.107],[sign*0.143,-0.067,0.128],[sign*0.158,-0.239,0.079],[sign*0.181,-0.36,0.038]],0.035,mat.hair,side,0.017);
  }
  // A loose centre part with layered, asymmetric wisps.
  for(let i=0;i<7;i++) {
    const x=(i-3)*0.034;
    const sign=x<0?-1:1;
    const tipY=i===3?0.075:0.025+Math.abs(i-3)*0.01;
    lock([[x*0.46,0.179,0.064],[x*0.8,0.132,0.121],[x*1.08,0.073,0.148],[x*1.19+sign*0.006,tipY,0.141]],0.025,i%3===0?mat.hairLight:mat.hair,hair,0.012);
  }
  lock([[0.003,0.187,0.075],[-0.017,0.121,0.135],[-0.024,0.083,0.149],[-0.019,0.049,0.14]],0.012,mat.hair,hair,0.008);

  function limb(parent,start,end,geometry,material,outline=false) {
    const pivot=new THREE.Group(); pivot.position.set(...start); parent.add(pivot);
    const direction=new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
    pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),direction.normalize());
    mesh(geometry,material,pivot,null,null,outline);
    return pivot;
  }

  function makeArm(sign,raised=false) {
    const upperLength=0.26,foreLength=0.215;
    const start=[sign*0.238,1.404,0];
    const gripTarget=new THREE.Vector3(0.375,1.34,0.105);
    let end=[sign*0.275,1.151,0.004];
    if(raised) {
      // Solve the folded elbow so the palm really meets the umbrella shaft.
      const startPoint=new THREE.Vector3(...start),reach=gripTarget.clone().sub(startPoint);
      const distance=reach.length(),axis=reach.normalize(),palmReach=foreLength+0.035;
      const along=(upperLength*upperLength-palmReach*palmReach+distance*distance)/(2*distance);
      const bend=new THREE.Vector3(0,-1,0).addScaledVector(axis,axis.y).normalize();
      const elbowPosition=startPoint.addScaledVector(axis,along).addScaledVector(bend,Math.sqrt(Math.max(0,upperLength*upperLength-along*along)));
      end=elbowPosition.toArray();
    }
    const sleeve=profile([[0,0.10,0.09],[-0.045,0.105,0.095],[-0.18,0.099,0.09],[-0.259,0.082,0.076]],28,0.017);
    const arm=limb(rig,start,end,sleeve,mat.shirt,true);
    mesh(profile([[-0.24,0.084,0.077],[-0.26,0.084,0.078]]),mat.shirtShade,arm);
    const elbow=new THREE.Group(); elbow.position.y=-upperLength; arm.add(elbow);
    if(raised) {
      // Bring the forearm back up to the umbrella grip.
      const lowerWorldDirection=gripTarget.clone().sub(new THREE.Vector3(...end)).normalize();
      const relativeDirection=lowerWorldDirection.applyQuaternion(arm.quaternion.clone().invert());
      elbow.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),relativeDirection);
    } else elbow.rotation.x=-0.09;
    mesh(profile([[0,0.041,0.043],[-0.055,0.043,0.043],[-0.155,0.031,0.033],[-foreLength,0.027,0.029]]),mat.skin,elbow,null,null,true);
    mesh(new THREE.SphereGeometry(1,16,12),mat.skin,elbow,[0,0,0],[0.043,0.042,0.045]);
    const hand=new THREE.Group();hand.position.y=-foreLength;elbow.add(hand);
    mesh(profile([[0.007,0.027,0.03],[-0.035,0.031,0.03],[-0.07,0.021,0.024]]),mat.skin,hand,null,null,true);
    mesh(new THREE.SphereGeometry(1,12,10),mat.skin,hand,[-sign*0.028,-0.03,0.015],[0.013,0.028,0.015]);
    if(raised) {
      // Light finger creases suggest a grip without oversized cartoon hands.
      for(let i=0;i<3;i++) line([[-0.02,-0.033-i*0.01,0.025],[0.004,-0.034-i*0.01,0.03],[0.02,-0.029-i*0.01,0.021]],0.0008,mat.skinShade,hand);
    }
    return {arm,elbow,base:arm.quaternion.clone()};
  }
  const freeArm=makeArm(-1);
  const gripArm=makeArm(1,true);

  function shoe(parent) {
    const foot=new THREE.Group();parent.add(foot);
    mesh(profile([[-0.102,0.052,0.116,0.045],[-0.093,0.058,0.121,0.047],[-0.076,0.058,0.12,0.046]]),mat.sole,foot,null,null,true);
    mesh(profile([[-0.078,0.053,0.112,0.043],[-0.055,0.053,0.111,0.046],[-0.028,0.048,0.10,0.039],[-0.003,0.034,0.051,0.006]]),mat.shoe,foot,null,null,true);
    mesh(profile([[-0.007,0.033,0.034], [0.035,0.033,0.034]]),mat.sole,foot);
    mesh(profile([[0.027,0.034,0.035],[0.04,0.034,0.035]]),mat.shirtShade,foot);
    // White side piping, heel pull tab and four laces.
    for(const sign of [-1,1]) {
      line([[sign*0.046,-0.047,-0.009],[sign*0.05,-0.039,0.033],[sign*0.043,-0.043,0.102]],0.003,mat.sole,foot);
    }
    mesh(new THREE.BoxGeometry(0.021,0.028,0.009),mat.sole,foot,[0,-0.006,-0.047]);
    for(let i=0;i<4;i++) {
      const z=0.033+i*0.019,y=-0.022-i*0.004;
      line([[-0.019,y,z],[0.019,y-0.003,z+0.006]],0.0022,mat.sole,foot,false);
    }
    return foot;
  }

  function leg(sign) {
    // Include the thin outline shell when aligning the soles to local y = 0.
    const upper=new THREE.Group();upper.position.set(sign*0.103,0.937632,0);rig.add(upper);
    const thighLength=0.402,shinLength=0.432;
    mesh(profile([[0.017,0.079,0.076],[-0.05,0.08,0.076],[-0.148,0.071,0.065]]),mat.shorts,upper,null,null,true);
    mesh(profile([[-0.136,0.072,0.066],[-0.16,0.072,0.066]]),mat.shorts,upper);
    mesh(profile([[-0.12,0.064,0.066],[-0.22,0.065,0.066],[-0.315,0.052,0.052],[-thighLength,0.043,0.045]]),mat.skin,upper,null,null,true);
    const knee=new THREE.Group();knee.position.y=-thighLength;upper.add(knee);
    mesh(new THREE.SphereGeometry(1,20,14),mat.skin,knee,[0,-0.003,0],[0.044,0.044,0.046]);
    mesh(profile([[0,0.043,0.044],[-0.12,0.049,0.043],[-0.225,0.04,0.034],[-0.345,0.027,0.029],[-shinLength,0.026,0.027]]),mat.skin,knee,null,null,true);
    const ankle=new THREE.Group();ankle.position.y=-shinLength;knee.add(ankle);
    const foot=shoe(ankle);
    return {upper,knee,foot};
  }
  const leftLeg=leg(-1),rightLeg=leg(1);

  const umbrella=new THREE.Group();
  umbrella.name='Clear twelve-rib umbrella';
  umbrella.position.set(0.375,1.34,0.105);
  rig.add(umbrella);
  const poleLength=1.025;
  line([[0,-0.11,0],[0,poleLength+0.016,0]],0.0055,mat.metal,umbrella,false);
  line([[0,-0.11,0],[0,-0.158,0],[-0.018,-0.186,0],[-0.04,-0.17,0],[-0.04,-0.142,0]],0.009,mat.darkMetal,umbrella);
  mesh(new THREE.CylinderGeometry(0.011,0.011,0.075,12),mat.darkMetal,umbrella,[0,-0.027,0]);
  mesh(new THREE.CylinderGeometry(0.014,0.014,0.052,12),mat.metal,umbrella,[0,0.76,0]);

  const canopy=new THREE.Group();
  canopy.position.y=poleLength;
  umbrella.add(canopy);
  const radius=1.06,domeDepth=0.355,panels=12;
  const canopyPositions=[],canopyIndices=[];
  const radialSteps=16,angleSteps=panels*12;
  function canopyPoint(r,a,edge=true) {
    // Each panel ends in a shallow scallop with a tiny exposed metal tip.
    const scallop=edge?1-0.029*Math.pow(r/radius,7)*(1-Math.cos(a*panels))*0.5:1;
    const actualRadius=r*scallop;
    return new THREE.Vector3(Math.cos(a)*actualRadius,-domeDepth*Math.pow(r/radius,1.65),Math.sin(a)*actualRadius);
  }
  for(let j=0;j<=radialSteps;j++) {
    for(let i=0;i<=angleSteps;i++) {
      const point=canopyPoint(radius*j/radialSteps,i/angleSteps*Math.PI*2);
      canopyPositions.push(point.x,point.y,point.z);
      if(j<radialSteps&&i<angleSteps){const n=j*(angleSteps+1)+i,m=n+angleSteps+1;canopyIndices.push(n,n+1,m,n+1,m+1,m);}
    }
  }
  const clearGeometry=new THREE.BufferGeometry();
  clearGeometry.setAttribute('position',new THREE.Float32BufferAttribute(canopyPositions,3));
  clearGeometry.setIndex(canopyIndices);clearGeometry.computeVertexNormals();
  const clear=mesh(clearGeometry,mat.glass,canopy);clear.renderOrder=4;clear.castShadow=false;
  for(let i=0;i<panels;i++) {
    const a=i/panels*Math.PI*2;
    const rib=[];
    for(let j=0;j<=8;j++){const p=canopyPoint(radius*j/8,a,false);rib.push([p.x,p.y-0.008,p.z]);}
    line(rib,0.0034,mat.metal,canopy);
    const edge=canopyPoint(radius,a);
    mesh(new THREE.SphereGeometry(0.007,8,6),mat.darkMetal,canopy,[edge.x,edge.y,edge.z]);
    const bracePoint=canopyPoint(radius*0.43,a,false);
    line([[0,-0.26,0],[bracePoint.x,bracePoint.y-0.014,bracePoint.z]],0.0026,mat.metal,canopy,false);
    // Delicate seams and pale scalloped piping make the clear dome readable.
    const seam=[];
    for(let j=0;j<=7;j++){const p=canopyPoint(radius*j/7,a+Math.PI/panels);seam.push([p.x,p.y+0.001,p.z]);}
    line(seam,0.0012,mat.glassEdge,canopy);
    const rim=[];
    for(let j=0;j<=12;j++){const p=canopyPoint(radius,a+j/12*Math.PI*2/panels);rim.push([p.x,p.y,p.z]);}
    line(rim,0.003,mat.glassEdge,canopy);
  }
  mesh(new THREE.SphereGeometry(0.018,16,10),mat.darkMetal,canopy,[0,0.008,0],[1,0.6,1]);
  line([[0,0,0],[0,0.078,0]],0.006,mat.metal,canopy,false);
  // Sparse condensation glints; the clear sheet keeps the scene visible.
  for(let i=0;i<30;i++) {
    const a=i*2.399963229728653,r=radius*(0.32+0.63*((i*17%31)/31));
    const p=canopyPoint(r,a);
    const droplet=mesh(new THREE.SphereGeometry(0.0033,6,4),mat.glassEdge,canopy,[p.x,p.y+0.003,p.z],[0.7,1.2,0.7]);
    droplet.castShadow=false;
  }

  let phase=0,walkWeight=0,openWeight=1;
  const freeArmSwing=new THREE.Quaternion(),axisX=new THREE.Vector3(1,0,0);
  function update(dt,moveSpeed,time,umbrellaOpen=true) {
    const delta=THREE.MathUtils.clamp(Number.isFinite(dt)?dt:0,0,0.1);
    const speed=Math.abs(Number.isFinite(moveSpeed)?moveSpeed:0);
    const t=Number.isFinite(time)?time:0;
    const target=THREE.MathUtils.clamp(speed*0.65,0,1);
    walkWeight=THREE.MathUtils.lerp(walkWeight,target,1-Math.exp(-delta*9));
    phase+=delta*(6.7+Math.min(speed,3)*1.1)*Math.max(walkWeight,0.08);
    const stride=Math.sin(phase),other=Math.sin(phase+Math.PI);
    leftLeg.upper.rotation.x=-stride*0.42*walkWeight;
    rightLeg.upper.rotation.x=-other*0.42*walkWeight;
    leftLeg.knee.rotation.x=Math.max(0,stride)*0.58*walkWeight;
    rightLeg.knee.rotation.x=Math.max(0,other)*0.58*walkWeight;
    leftLeg.foot.rotation.x=-Math.max(0,-stride)*0.16*walkWeight;
    rightLeg.foot.rotation.x=-Math.max(0,-other)*0.16*walkWeight;
    rig.position.y=Math.abs(Math.cos(phase))*0.022*walkWeight+Math.sin(t*1.55)*0.003*(1-walkWeight);
    rig.rotation.z=Math.sin(phase)*0.015*walkWeight;
    freeArmSwing.setFromAxisAngle(axisX,stride*0.35*walkWeight-0.03+Math.sin(t*1.3)*0.014);
    freeArm.arm.quaternion.copy(freeArm.base).multiply(freeArmSwing);
    freeArm.elbow.rotation.x=-0.10-Math.max(0,-stride)*0.15*walkWeight;
    gripArm.arm.quaternion.copy(gripArm.base);
    head.rotation.y=Math.sin(t*0.37)*0.035*(1-walkWeight);
    head.rotation.z=-Math.sin(phase)*0.01*walkWeight;
    shirt.scale.z=1+Math.sin(t*1.55)*0.006*(1-walkWeight);
    backHair.rotation.x=-0.035*walkWeight+Math.sin(t*2.1+phase*0.15)*0.009;
    backHair.rotation.z=Math.sin(phase-0.45)*0.022*walkWeight;
    sideHair.forEach((side,i)=>{side.rotation.x=-0.02*walkWeight+Math.sin(t*1.8+i)*0.008;side.rotation.z=Math.sin(phase-0.6)*0.018*walkWeight;});
    umbrella.rotation.x=-0.027+Math.sin(t*1.2)*0.009+Math.cos(phase)*0.014*walkWeight;
    umbrella.rotation.z=-0.025+Math.sin(t*0.8)*0.012;
    openWeight=THREE.MathUtils.lerp(openWeight,umbrellaOpen?1:0,1-Math.exp(-delta*10));
    canopy.scale.set(0.065+openWeight*0.935,0.84+openWeight*0.16,0.065+openWeight*0.935);
    canopy.rotation.y=Math.sin(t*0.43)*0.012;
  }
  update(0,0,0);
  return {group,umbrella,update};
}
