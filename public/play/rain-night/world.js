import * as THREE from 'three';
import { createProducts } from './products.js';
import { addStreetDetails } from './street-details.js';
import { createCoffeeCorner } from './coffee-corner.js';
import { createCheckoutCounter } from './checkout-counter.js';

// Local textures and geometry keep the store entrance at (8,-6).
export function createWorld(scene) {
  const world = new THREE.Group();
  world.name = 'Rainy street and convenience store';
  scene.add(world);
  const colliders = [];
  const groundY = 0.15;
  const TAU = Math.PI * 2;
  let seed = 93147;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const mats = {};
  const standard = (color, roughness = .55, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
  const mat = (key, color, roughness = .55, extra = {}) => mats[key] || (mats[key] = standard(color, roughness, extra));
  const cream = mat('cream', '#eee8d1', .65);
  const mint = mat('mint', '#4dd8b5', .33, { emissive: '#1c796b', emissiveIntensity: .19 });
  const dark = mat('dark', '#193139', .45, { metalness: .3 });
  const orange = mat('orange', '#ee9d43', .4, { emissive: '#a94e15', emissiveIntensity: .18 });
  const metal = mat('metal', '#648082', .35, { metalness: .62 });
  const blackMetal = mat('blackMetal', '#1b2e3b', .34, { metalness: .65 });
  const wood = mat('wood', '#b78359', .75);
  const windowDark = mat('windowDark', '#0b293b', .14, { metalness: .55, emissive: '#082237', emissiveIntensity: .5 });
  const warmGlow = basic('#ffe8ad');
  const mintGlow = basic('#9cfade');
  const paper = mat('paper', '#f2ead5', .8);
  const geometry = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
    cone: new THREE.ConeGeometry(1, 1, 10),
    sphere: new THREE.SphereGeometry(1, 12, 8),
    plane: new THREE.PlaneGeometry(1, 1),
  };
  function box(w, h, d, x, y, z, material, parent = world) {
    const mesh = new THREE.Mesh(geometry.box, material);
    mesh.scale.set(w, h, d); mesh.position.set(x, y, z);
    mesh.castShadow = h > .4; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }
  function cylinder(r, h, x, y, z, material, parent = world) {
    const mesh = new THREE.Mesh(geometry.cylinder, material);
    mesh.scale.set(r, h, r); mesh.position.set(x, y, z);
    mesh.castShadow = true; parent.add(mesh); return mesh;
  }
  function sphere(r, x, y, z, material, parent = world) {
    const mesh = new THREE.Mesh(geometry.sphere, material);
    mesh.scale.setScalar(r); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function flat(w, d, x, z, material, y = groundY + .012, parent = world) {
    const mesh = new THREE.Mesh(geometry.plane, material);
    mesh.rotation.x = -Math.PI / 2; mesh.scale.set(w, d, 1);
    mesh.position.set(x, y, z); mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function collide(x, z, w, d) {
    const c = { minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 };
    colliders.push(c); return c;
  }
  function canvasTexture(width, height, draw, repeat) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); draw(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(...repeat); }
    return tex;
  }
  const textTexture = (lines, bg, fg, width = 768, height = 256) => canvasTexture(width, height, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((line, i) => {
      const label = typeof line === 'string' ? { text: line } : line;
      c.font = `${label.weight || 700} ${label.size || Math.min(h / lines.length * .7, w / (label.text.length + 1))}px "Yu Gothic", "Microsoft YaHei", Arial, sans-serif`;
      c.fillStyle = label.color || fg;
      c.fillText(label.text, w / 2, (i + .5) * h / lines.length);
    });
  });
  function panel(w, h, x, y, z, texture, ry = 0, emissive = false, parent = world) {
    const m = emissive ? new THREE.MeshBasicMaterial({ map: texture }) : standard('#ffffff', .65, { map: texture });
    const p = new THREE.Mesh(geometry.plane, m); p.scale.set(w, h, 1); p.position.set(x, y, z); p.rotation.y = ry;
    parent.add(p); return p;
  }
  function beamBetween(a, b, radius, material, parent = world) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
    const delta = bv.clone().sub(av);
    const mesh = new THREE.Mesh(geometry.cylinder, material);
    mesh.scale.set(radius, delta.length(), radius); mesh.position.copy(av.add(bv).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); parent.add(mesh);
    return mesh;
  }
  function pointLight(color, intensity, x, y, z, distance = 12) {
    const l = new THREE.PointLight(color, intensity, distance, 2); l.position.set(x, y, z); world.add(l); return l;
  }

  // Pavement, markings and the soft sheen of a wet street.
  const asphaltTexture = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#243242'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 17000; i++) { const v = Math.floor(35 + rnd() * 40); c.fillStyle = `rgba(${v},${v + 10},${v + 19},${.12 + rnd() * .2})`; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
    c.strokeStyle = '#172431'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) { let x = rnd() * w, y = rnd() * h; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += rnd() * 70 - 35; y += rnd() * 50; c.lineTo(x, y); } c.stroke(); }
  }, [4, 25]);
  const roadBump=asphaltTexture.clone();roadBump.colorSpace=THREE.NoColorSpace;roadBump.needsUpdate=true;
  const roadMat = standard('#9daeb4', .48, { map: asphaltTexture, bumpMap:roadBump,bumpScale:.035,metalness: .04 });
  const wetMask=canvasTexture(512,512,(c,w,h)=>{
    c.fillStyle='#454545';c.fillRect(0,0,w,h);
    for(let i=0;i<35;i++){
      const x=rnd()*w,y=rnd()*h,r=20+rnd()*90;
      const gradient=c.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,`rgba(255,255,255,${.30+rnd()*.45})`);gradient.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=gradient;c.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let i=0;i<10000;i++){c.fillStyle=rnd()>.5?'#ffffff0b':'#00000010';c.fillRect(rnd()*w,rnd()*h,2,2);}
  });
  wetMask.wrapS=wetMask.wrapT=THREE.RepeatWrapping;wetMask.colorSpace=THREE.NoColorSpace;
  box(100, .18, 150, 0, -.095, 0, mat('base', '#1c2d3c', .62));
  flat(8, 100, -2, 0, roadMat, .02);
  const sidewalkTexture = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#7a8b8c'; c.fillRect(0, 0, w, h);
    for(let y=0;y<512;y+=128)for(let x=0;x<512;x+=128){const v=120+Math.floor(rnd()*8);c.fillStyle=`rgb(${v},${v+12},${v+13})`;c.fillRect(x+2,y+2,124,124);}
    c.strokeStyle = '#536567'; c.lineWidth = 2;
    for (let y = 0; y <= 512; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(512, y); c.stroke(); }
    for (let x = 0; x <= 512; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 512); c.stroke(); }
    for (let i = 0; i < 2500; i++) { c.fillStyle = rnd() > .5 ? '#84979a25' : '#34484d20'; c.fillRect(rnd() * w, rnd() * h, rnd() * 5, rnd() * 3); }
  }, [7, 47.5]);
  const sidewalkBump=sidewalkTexture.clone();sidewalkBump.colorSpace=THREE.NoColorSpace;sidewalkBump.needsUpdate=true;
  const sidewalk = standard('#bbc7c4', .63, { map: sidewalkTexture,bumpMap:sidewalkBump,bumpScale:.014 });
  box(14,.15,95,9,.075,0,mat('sidewalkBase','#697f8a',.5));
  box(8,.15,95,-10,.075,0,mats.sidewalkBase);
  flat(14, 95, 9, 0, sidewalk);
  const leftSidewalk=sidewalk.clone();leftSidewalk.map=sidewalkTexture.clone();leftSidewalk.map.repeat.set(4,47.5);leftSidewalk.map.needsUpdate=true;
  leftSidewalk.bumpMap=sidewalkBump.clone();leftSidewalk.bumpMap.repeat.set(4,47.5);leftSidewalk.bumpMap.needsUpdate=true;
  flat(8, 95, -10, 0, leftSidewalk);
  const curb = mat('curb', '#8098a6', .36);
  box(.22, .14, 100, 2.07, .09, 0, curb);
  box(.22, .14, 100, -6.06, .09, 0, curb);
  const paintTexture=canvasTexture(256,256,(c,w,h)=>{
    c.fillStyle='#e2dfc7';c.fillRect(0,0,w,h);
    for(let i=0;i<4500;i++){c.fillStyle=rnd()>.5?'#8d988c60':'#c2c3b26b';c.fillRect(rnd()*w,rnd()*h,.6+rnd()*2,.6+rnd()*2);}
    c.globalCompositeOperation='destination-out';
    for(let i=0;i<300;i++){c.globalAlpha=.4+rnd()*.55;c.fillRect(rnd()*w,rnd()*h,1+rnd()*4,1+rnd()*7);}
  });
  const roadPaint = standard('#cbd2c6', .82, {map:paintTexture,transparent:true,alphaTest:.24,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  for (let z = -43; z < 43; z += 7) flat(.12, 3.6, -2, z, roadPaint,.038);
  flat(.11, 97, -5.68, 0, roadPaint,.038);
  flat(.11, 97, 1.67, 0, roadPaint,.038);
  for (let i = 0; i < 9; i++) flat(.62, 4.5, -5.35 + i * .87, 3.5, roadPaint,.038);
  for (const z of [7, -22]) {
    flat(6.8, .22, -2, z, roadPaint,.038);
    const stopTex=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#cbd0bd';c.textAlign='center';c.textBaseline='middle';c.font='800 145px "Yu Gothic","Microsoft YaHei",sans-serif';c.fillText('止まれ',w/2,h/2);});
    const stop=new THREE.Mesh(geometry.plane,new THREE.MeshStandardMaterial({map:stopTex,transparent:true,roughness:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
    stop.scale.set(1.35,1.65,1);stop.rotation.x=-Math.PI/2;stop.position.set(-1.1,.041,z+2);world.add(stop);
  }
  // Yellow tactile paving follows the sidewalk, with a branch to the door.
  const tactileTexture = canvasTexture(128, 128, (c, w, h) => {
    c.fillStyle = '#998650'; c.fillRect(0, 0, w, h); c.fillStyle = '#cfb875';
    for (let x = 13; x < 128; x += 25) { c.fillRect(x, 3, 9, 122); }
    c.strokeStyle = '#7e6428'; c.lineWidth = 3; c.strokeRect(1, 1, 126, 126);
  }, [1, 45]);
  const tactile = standard('#eee4bd', .8, { map: tactileTexture });
  flat(.62, 48, 3.02, 0, tactile, .171);
  const branchTactile = tactile.clone(); branchTactile.map = tactileTexture.clone(); branchTactile.map.repeat.set(1, 6); branchTactile.map.needsUpdate = true;
  const tactileBranch = flat(.62, 5.2, 5.62, -4.7, branchTactile, .174); tactileBranch.rotation.z = Math.PI / 2;
  const drainMat = mat('drain', '#152c39', .32, { metalness: .65 });
  for (const z of [-20, -2.5, 13, 26]) {
    flat(.38, 1.25, 1.76, z, drainMat, .041);
    for (let i = 0; i < 7; i++) flat(.29, .035, 1.76, z - .5 + i * .16, metal, .043);
  }
  const puddleTex = canvasTexture(128, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(138,204,217,.7)'); g.addColorStop(.66, 'rgba(98,161,184,.24)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  const puddleMat = new THREE.MeshBasicMaterial({ map: puddleTex, transparent: true, opacity: .12, depthWrite: false });
  for (let i = 0; i < 40; i++) { const x=-5.8+rnd()*17; const p = flat(.8 + rnd() * 3, .4 + rnd() * 1.8, x, -34 + rnd() * 70, puddleMat, x<2?.041:.168); p.rotation.z = rnd() * TAU; }
  cylinder(.40, .018, -3.3, .04, -1, drainMat);
  for (let i = 0; i < 7; i++) flat(.56, .019, -3.3, -1.23 + i * .076, metal, .051);

  // AME MART: warm lit interior and a wide glazed front.
  const shop = new THREE.Group(); shop.name = 'AME MART'; world.add(shop);
  const tileTexture = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#d8dfd1'; c.fillRect(0, 0, w, h); c.strokeStyle = '#a3b6ac'; c.lineWidth = 3;
    for (let i = 0; i <= 512; i += 128) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 512); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(512, i); c.stroke(); }
    c.fillStyle = '#e5e6cf'; c.fillRect(3, 3, 122, 122); c.fillRect(259, 259, 122, 122);
  }, [7, 7]);
  flat(12, 12, 8, -12, standard('#ffffff', .4, { map: tileTexture }), .166, shop);
  const shopWall = mat('shopWall', '#d4dfcf', .72);
  box(.25, 3.65, 12, 1.96, 1.98, -12, shopWall, shop); collide(1.96, -12, .3, 12.25);
  box(.25, 3.65, 12, 14.04, 1.98, -12, shopWall, shop); collide(14.04, -12, .3, 12.25);
  box(12, 3.65, .25, 8, 1.98, -18.04, shopWall, shop); collide(8, -18.04, 12, .3);
  box(12.4, .25, 12.5, 8, .02, -12, dark, shop);
  const roof = new THREE.Group(); roof.name = 'Store roof (hide inside)'; world.add(roof);
  box(12.7, .26, 12.9, 8, 4.02, -12, cream, roof);
  box(12.65, .12, 13.1, 8, 4.19, -11.9, dark, roof);
  box(2.3, .48, 1.5, 11.7, 4.56, -15.7, metal, roof);
  for (let i = 0; i < 7; i++) box(1.75, .027, .065, 11.7, 4.81, -16.14 + i * .12, dark, roof);
  cylinder(.08, 1.4, 3.1, 4.91, -16.2, metal, roof);
  const signTex = canvasTexture(1536, 256, (c, w, h) => {
    c.fillStyle = '#c4f2dc'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#159d85'; c.fillRect(0, 0, w, 24); c.fillRect(0, h - 26, w, 26);
    c.fillStyle = '#e89238'; c.fillRect(0, h - 48, w, 22);
    c.fillStyle = '#116153'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '900 126px Arial, sans-serif'; c.fillText('AME MART', 70, 124);
    c.font = '700 48px "Yu Gothic", "Microsoft YaHei", sans-serif'; c.fillText('雨 宿 り', 1020, 103);
    c.font = '600 35px Arial, sans-serif'; c.fillText('OPEN 24H', 1025, 168);
  });
  box(12.48, .85, .26, 8, 3.49, -5.86, dark, shop);
  panel(12.15, .76, 8, 3.5, -5.715, signTex, 0, true, shop);
  box(12.5, .09, 1, 8, 3.04, -5.58, mint, shop);
  box(12.5, .03, .06, 8, 3.003, -5.08, warmGlow, shop);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#8bcac0', transparent: true, opacity: .18, roughness: .05, metalness: .1, side: THREE.DoubleSide, depthWrite: false });
  const glassWindow = (x, width) => {
    box(width, 2.7, .055, x, 1.58, -5.96, glass, shop);
    for (const sx of [x - width / 2, x + width / 2]) box(.065, 2.75, .11, sx, 1.58, -5.9, dark, shop);
    box(width, .055, .11, x, .24, -5.9, dark, shop);
    box(width, .055, .11, x, 2.93, -5.9, dark, shop);
    box(width, .16, .06, x, 1.05, -5.92, mint, shop);
    box(width, .035, .064, x, .945, -5.916, orange, shop);
    collide(x, -5.96, width, .16);
  };
  glassWindow(4.35, 4.7); glassWindow(11.65, 4.7);
  const door = { left: new THREE.Group(), right: new THREE.Group() };
  door.left.name = 'Automatic glass door left'; door.right.name = 'Automatic glass door right';
  for (const [key, x] of [['left', 7.35], ['right', 8.65]]) {
    const g = door[key]; g.position.set(x, 0, -5.95); shop.add(g);
    box(1.27, 2.7, .05, 0, 1.59, 0, glass, g);
    for (const sx of [-.635, .635]) box(.04, 2.75, .08, sx, 1.59, .01, dark, g);
    box(1.3, .05, .1, 0, 2.93, 0, dark, g); box(1.3, .06, .1, 0, .24, 0, dark, g);
    box(1.28, .16, .054, 0, 1.05, .034, mint, g); box(1.28, .035, .06, 0, .945, .038, orange, g);
    panel(.52, .28, 0, 1.57, .045, textTexture([{ text: '自動ドア', size: 36 }, { text: 'AUTOMATIC', size: 21 }], '#daf5e0', '#216f60', 256, 128), 0, true, g);
  }
  box(2.76, .14, .28, 8, 3.01, -5.95, cream, shop);
  box(.23, .05, .1, 8, 2.94, -5.78, blackMetal, shop);
  sphere(.018, 8.03, 2.928, -5.717, basic('#50faad'), shop);
  const leftDoorCollider = collide(7.35, -5.95, 1.3, .12);
  const rightDoorCollider = collide(8.65, -5.95, 1.3, .12);
  flat(2.55, .55, 8, -5.59, mat('entranceMat', '#2a5958', .93), .168);
  for (let i = 0; i < 12; i++) flat(2.4, .015, 8, -5.82 + i * .04, dark, .173);
  // Ceiling fixtures follow the roof cutaway so they cannot cross the camera.
  for (const z of [-8.2, -12.1, -16.2]) {
    box(10.9, .065, .24, 8, 3.72, z, cream, roof);
    box(10.6, .015, .18, 8, 3.68, z, warmGlow, roof);
  }
  pointLight('#ffefd0', 11, 8, 3.4, -9, 15);
  pointLight('#fff2d8', 11, 8.5, 3.4, -14, 15);
  pointLight('#c4ffe9', 6, 8, 3.2, -4.5, 10);
  // Tiny gridlines keep the wall finish from looking empty.
  for (const y of [.55, 1.25, 2.1, 2.95]) box(11.7, .013, .015, 8, y, -17.892, mat('wallJoint', '#a4beb2', .8), shop);

  const goods = createProducts(shop);
  const productColors = ['#f2e2b7', '#d65b42', '#e9b947', '#69a66a', '#5cb2ac', '#6b8fac', '#c095bf', '#ededdf'];
  function fillShelf(cx, cz, length, orientation = 'z', levels = 4, category = 'SNACKS') {
    const g = new THREE.Group(); g.name = 'Stocked grocery aisle'; shop.add(g);
    const alongZ = orientation === 'z';
    box(alongZ ? .86 : length, .16, alongZ ? length : .86, cx, .29, cz, cream, g);
    box(alongZ ? .09 : length, 1.65, alongZ ? length : .09, cx, 1.22, cz, mat('shelfBack', '#a8b9a4', .82), g);
    for (const off of [-length / 2 + .08, length / 2 - .08]) {
      box(.05, 2.1, .05, alongZ ? cx : cx + off, 1.22, alongZ ? cz + off : cz, metal, g);
    }
    const slots = Math.floor(length / .30);
    const rows=category==='DRINKS'?[[12,13],[4,5],[0,3],[1,2]]:category==='DAILY FRESH'?[[11],[14,15],[8],[9,10]]:[[12,13],[6,7],[8,9],[9,10]];
    for (let level = 0; level < levels; level++) {
      const y = .39 + level * .45;
      box(alongZ ? 1.08 : length + .08, .035, alongZ ? length + .08 : 1.08, cx, y, cz, cream, g);
      for (const side of [-1, 1]) {
        box(alongZ ? .035 : length, .085, alongZ ? length : .035, alongZ ? cx + side * .532 : cx, y + .008, alongZ ? cz : cz + side * .532, mint, g);
        for (let j = 0; j < slots; j++) {
          const off = -length / 2 + .19 + j * .30;
          const ids=rows[level%rows.length],id=ids[Math.floor(j/3)%ids.length];
          const yaw=alongZ?side*Math.PI/2:side>0?0:Math.PI;
          const x=alongZ?cx+side*.36:cx+off,z=alongZ?cz+off:cz+side*.36;
          if((j+level*3+(side>0?2:0))%13!==0)goods.place(id,x,y+.025,z,yaw+(rnd()-.5)*.055,.94+rnd()*.07);
          if(j%5!==1)goods.place(id,alongZ?cx+side*.18:x,y+.025,alongZ?z:cz+side*.18,yaw,.97);
          if(j%3===0)goods.priceTag(id,alongZ?cx+side*.558:x,y+.007,alongZ?z:cz+side*.558,yaw);
        }
      }
    }
    panel(alongZ?.90:length-.3,.27,cx,2.23,cz+(alongZ?length/2+.035:.57),textTexture([category],category==='DRINKS'?'#345f64':category==='DAILY FRESH'?'#537449':'#78523e','#fff1d2',768,160),0,false,g);
    collide(cx, cz, alongZ ? 1.12 : length + .08, alongZ ? length + .08 : 1.12);
    return g;
  }
  fillShelf(5.65, -10.5, 4.5);
  fillShelf(10.6, -10.65, 4.8, 'z', 4, 'DRINKS');
  fillShelf(8.5, -16.9, 5.5, 'x', 4, 'DAILY FRESH');
  // Small promotional table by the window.
  box(1.5, .07, .85, 12.7, 1.03, -7, wood, shop);
  for (const x of [12.12, 13.28]) box(.08, .8, .08, x, .57, -7, dark, shop);
  box(1.37,.025,.65,12.7,1.082,-7,mat('freshTray','#d8c5a6',.85),shop);
  for (let row=0;row<2;row++)for(let i=0;i<5;i++)goods.place([11,14,15,11,14][i],12.18+i*.25,1.10,-6.82-row*.30,0,1.02);
  for(let i=0;i<3;i++)goods.priceTag([11,14,15][i],12.24+i*.43,.91,-6.56,0,.29);
  panel(1.14, .22, 12.7, .72, -6.56, textTexture(['朝ごはん / FRESH TODAY'], '#eee3c4', '#a4472d', 512, 128), 0, false, shop);
  collide(12.7, -7, 1.5, .85);
  // Furniture and fixtures share the existing counter and coffee-bar footprints.
  createCheckoutCounter({parent:shop,box,cylinder,beamBetween,panel,textTexture,canvasTexture,mat,goods});
  collide(3.8,-14,2.65,1.45);
  const coffeeCorner=createCoffeeCorner({parent:shop,box,cylinder,sphere,beamBetween,panel,canvasTexture,textTexture,mat,pointLight});
  collide(3.7,-17.1,2.8,.8);
  // Right-side cold drinks cabinets.
  for (let i = 0; i < 4; i++) {
    const z = -10.65 - i * 1.52;
    box(.72, 2.55, 1.46, 13.48, 1.48, z, dark, shop);
    box(.045, 2.24, 1.25, 13.092, 1.5, z, windowDark, shop);
    box(.028, .045, 1.35, 13.053, 2.58, z, warmGlow, shop);
    for (let level = 0; level < 4; level++) {
      const y = .47 + level * .46;
      box(.45, .025, 1.28, 13.25, y, z, cream, shop);
      for (let n = 0; n < 5; n++) {
        const zz = z - .5 + n * .25;
        const id=i<2?[1,0,3,2][level]:[11,14,15,2][level];
        goods.place(id,13.06,y+.019,zz,-Math.PI/2,.95);
        if(n===1||n===4)goods.priceTag(id,12.971,y+.025,zz,-Math.PI/2,.18);
      }
    }
    box(.028, 2.2, 1.3, 12.925, 1.48, z, glass, shop);
    for (const zz of [z - .68, z + .68]) box(.03, 2.26, .045, 12.89, 1.48, zz, mint, shop);
    box(.06, .55, .04, 12.857, 1.53, z + .51, metal, shop);
    panel(1.32, .22, 13.08, 2.82, z, textTexture([i < 2 ? 'COLD DRINKS • お飲み物' : 'DAILY FRESH • 毎日新鮮'], '#226c5d', '#d7ffe7', 640, 128), -Math.PI / 2, true, shop);
  }
  collide(13.42, -12.93, .92, 6.3);
  // Noticeboard, seasonal poster and tidy umbrella basket.
  panel(1.12, 1.55, 2.104, 2, -9.5, textTexture([{ text: 'おにぎり', size: 72, color: '#194f3d' }, { text: '毎朝 新鮮', size: 43 }, { text: '¥ 120', size: 76, color: '#b6442d' }], '#ecebd1', '#43745c', 512, 768), Math.PI / 2, false, shop);
  panel(1.5, .8, 10.4, 2.65, -17.89, textTexture([{ text: '今日も、おつかれさま。', size: 50 }, { text: 'Take a little shelter from the rain.', size: 24 }], '#d7e5ca', '#437163', 768, 256), 0, false, shop);
  box(.48, .48, .5, 2.7, .4, -7, dark, shop); collide(2.7, -7, .48, .5);
  for (let i = 0; i < 6; i++) { const x = 2.54 + i * .055; beamBetween([x, .3, -7], [x, 1.05 + rnd() * .16, -7], .015, metal, shop); sphere(.035, x, 1.13, -7, blackMetal, shop); }
  const inventory=goods.finish();

  // A beverage vending machine and recycling bins under the awning.
  const vendingTex = canvasTexture(512, 768, (c, w, h) => {
    c.fillStyle = '#54b8a3'; c.fillRect(0, 0, w, h); c.fillStyle = '#ecf4db'; c.fillRect(25, 60, 385, 465);
    c.fillStyle = '#174b49'; c.font = '800 44px Arial'; c.textAlign = 'center'; c.fillText('AME DRINKS', 225, 43);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) {
      const x = 55 + col * 71, y = 80 + row * 111;
      c.fillStyle = productColors[(col + row * 2) % 8]; c.fillRect(x, y, 34, 62); c.fillStyle = '#f8f5d9'; c.fillRect(x, y + 20, 34, 18); c.fillStyle = '#adb9a4'; c.fillRect(x + 4, y - 7, 26, 8);
      c.fillStyle = '#27695b'; c.fillRect(x - 7, y + 78, 48, 16); c.fillStyle = '#d5f3cd'; c.font = '12px Arial'; c.fillText('¥ 120', x + 17, y + 90);
    }
    c.fillStyle = '#194743'; c.fillRect(53, 585, 320, 75); c.fillStyle = '#88d2b8'; c.fillRect(70, 596, 286, 45);
    c.fillStyle = '#214a45'; c.fillRect(432, 223, 50, 160); c.fillStyle = '#dce1c7'; c.fillRect(440, 256, 36, 17); c.fillStyle = '#fbb561'; c.fillRect(443, 308, 30, 18);
    c.fillStyle = '#dcf5d6'; c.font = '700 24px "Microsoft YaHei", sans-serif'; c.fillText('つめた〜い', 230, 714);
  });
  goods.ready.then(texture=>{
    const c=vendingTex.image.getContext('2d'),image=texture.image,cellW=image.width/4,cellH=image.height/4;
    for(let row=0;row<4;row++)for(let col=0;col<5;col++){
      const id=[0,1,3,4,5][col],x=55+col*71,y=80+row*111;
      c.drawImage(image,(id%4)*cellW,Math.floor(id/4)*cellH,cellW,cellH,x,y+3,34,59);
    }
    vendingTex.needsUpdate=true;
  }).catch(error=>console.warn('商品包装贴图未加载',error));
  box(1.25, 2.3, .9, 15.02, 1.3, -7.22, mint);
  panel(1.15, 2.11, 15.02, 1.33, -6.75, vendingTex, 0, true);
  box(.84, .14, .85, 15.02, .27, -7.22, dark); collide(15.02, -7.22, 1.3, .95);
  pointLight('#5cf5d0', 3.2, 15, 1.5, -6.3, 5);
  for (let i = 0; i < 2; i++) {
    const x = 14.57 + i * .8;
    box(.62, .82, .62, x, .56, -9.2, mat('bins', '#456c66', .7));
    box(.67, .09, .67, x, 1, -9.2, dark);
    cylinder(.11, .04, x, 1.06, -9.2, blackMetal);
    panel(.32, .25, x, .7, -8.88, textTexture([i === 0 ? '缶・びん' : 'ペット'], '#b8d2bd', '#225846', 256, 128));
    collide(x, -9.2, .7, .7);
  }
  // Sandwich board and a quiet bench at the storefront.
  const board = new THREE.Group(); board.position.set(10.15, 0, -4.55); board.rotation.y = -.18; world.add(board);
  for (const x of [-.5, .5]) { const leg = box(.055, 1.4, .065, x, .83, 0, wood, board); leg.rotation.x = -.15; }
  box(1.13, 1.1, .08, 0, .99, -.08, wood, board);
  panel(1, .98, 0, .99, -.032, textTexture([{ text: '雨の日は', size: 60 }, { text: 'ほっと一息。', size: 52 }, { text: 'COFFEE & ONIGIRI', size: 24 }, { text: '☕ ¥120', size: 58, color: '#f1ca7a' }], '#234e46', '#ecedcf', 512, 640), 0, false, board);
  collide(10.15, -4.55, 1.15, .55);
  for (let i = 0; i < 4; i++) box(2.6, .085, .13, 12.45, .68, -3.42 + i * .16, wood);
  for (const x of [11.42, 13.48]) { box(.075, .5, .6, x, .42, -3.18, blackMetal); box(.075, .73, .075, x, .9, -3.65, blackMetal); }
  for (let i = 0; i < 3; i++) box(2.65, .13, .07, 12.45, .9 + i * .17, -3.64, wood);
  collide(12.45, -3.25, 2.8, .9);

  // Street lanterns, safety rails and lush small pots.
  const lamps = [];
  for (const [x, z] of [[1.5, 13], [1.5, -23], [-6.8, -9], [-6.8, 28], [15.6, 8]]) {
    cylinder(.075, 5.2, x, 2.73, z, blackMetal); cylinder(.16, .28, x, .3, z, dark);
    const arm = x < 0 ? .62 : -.62;
    beamBetween([x, 5.2, z], [x + arm, 5.47, z], .07, blackMetal);
    box(.72, .12, .33, x + arm, 5.46, z, metal);
    box(.58, .028, .25, x + arm, 5.387, z, warmGlow);
    const l = pointLight('#ffd9a2', 22, x + arm, 5.1, z, 16); lamps.push(l);
    collide(x, z, .35, .35);
  }
  for (const z0 of [9, -27]) {
    for (let i = 0; i < 4; i++) cylinder(.035, .8, 2.47, .57, z0 + i * 1.4, cream);
    for (const y of [.48, .84]) beamBetween([2.47, y, z0], [2.47, y, z0 + 4.2], .026, cream);
    collide(2.47, z0 + 2.1, .18, 4.2);
  }
  const leaves = [mat('leaf1', '#3d7663', .85), mat('leaf2', '#588d70', .85), mat('leaf3', '#8ca875', .85)];
  function planter(x, z, w = .75) {
    box(w, .45, w, x, .39, z, mat('pots', '#38544d', .85)); box(w + .07, .07, w + .07, x, .6, z, metal);
    flat(w * .85, w * .85, x, z, mat('soil', '#233932', .95), .64);
    for (let i = 0; i < 6; i++) { const l = sphere(.19 + rnd() * .12, x + (rnd() - .5) * w * .7, .72 + rnd() * .34, z + (rnd() - .5) * w * .7, leaves[i % 3]); l.scale.y *= .8; }
    collide(x, z, w + .08, w + .08);
  }
  planter(3.9, -4.6, .65); planter(15.1, -4.3, .72); planter(-7.1, .6, 1.05); planter(-7.2, -18, .9);
  // Bicycles have recognizable spoke-less wheels, frames, pedals and wire baskets.
  function bicycle(x, z, angle, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = angle; world.add(g);
    const frame = mat(`bike_${color}`, color, .32, { metalness: .45 });
    const tire = mat('tire', '#152830', .8);
    for (const xx of [-.7, .7]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.34, .032, 6, 24), tire); ring.position.set(xx, .53, 0); g.add(ring);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.294, .012, 5, 20), metal); rim.position.copy(ring.position); g.add(rim);
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; beamBetween([xx, .53, 0], [xx + Math.cos(a) * .28, .53 + Math.sin(a) * .28, 0], .004, metal, g); }
      cylinder(.045, .13, xx, .53, 0, dark, g).rotation.x = Math.PI / 2;
    }
    for (const [a, b] of [ [[-.7,.53,0],[-.19,.54,0]], [[-.7,.53,0],[-.36,1.08,0]], [[-.36,1.08,0],[-.19,.54,0]], [[-.19,.54,0],[.42,1.05,0]], [[-.36,1.08,0],[.42,1.05,0]], [[.42,1.05,0],[.7,.53,0]] ]) beamBetween(a,b,.023,frame,g);
    beamBetween([-.36,1.08,0],[-.39,1.23,0],.022,metal,g); box(.25,.045,.15,-.4,1.25,0,dark,g);
    beamBetween([.42,1.05,0],[.38,1.27,0],.022,metal,g); beamBetween([.38,1.27,-.22],[.38,1.27,.22],.021,metal,g);
    beamBetween([-.19,.54,-.14],[-.19,.54,.14],.018,metal,g); box(.1,.04,.18,-.19,.54,.15,dark,g);
    for (const zz of [-.16,.16]) beamBetween([.5,1.05,zz],[.94,1.05,zz],.012,metal,g);
    for (const xx of [.5,.61,.72,.83,.94]) for (const zz of [-.16,.16]) beamBetween([xx,1.05,zz],[xx,1.32,zz],.008,metal,g);
    for (const yy of [1.05,1.18,1.32]) { beamBetween([.5,yy,-.16],[.94,yy,-.16],.008,metal,g); beamBetween([.5,yy,.16],[.94,yy,.16],.008,metal,g); beamBetween([.94,yy,-.16],[.94,yy,.16],.008,metal,g); }
    beamBetween([-.25,.52,0],[-.45,.19,.19],.011,metal,g);
    collide(x,z,1.7,.7);
  }
  bicycle(4.2, .3, -.12, '#bc784f'); bicycle(4.3, 1.5, -.06, '#6caaa4');

  // Neighbourhood buildings use batched lit windows, signs, balconies and AC units.
  const windowTransforms = [];
  const buildingColors = ['#233e50', '#2e4353', '#3b4f5a', '#354854', '#20394c'];
  const buildingMat = buildingColors.map((c, i) => mat(`building${i}`, c, .75));
  function building(x, z, w, d, h, index, frontRotation = 0) {
    const b = new THREE.Group(); world.add(b);
    box(w, h, d, x, h / 2 + groundY, z, buildingMat[index % buildingMat.length], b);
    box(w + .15, .18, d + .15, x, h + groundY, z, dark, b);
    const faceZ = z + d / 2 + .018;
    const columns = Math.max(2, Math.floor(w / 1.7));
    const rows = Math.floor((h - 2) / 1.8);
    for (let row = 0; row < rows; row++) {
      const y = 2.6 + row * 1.8;
      box(w, .06, .075, x, y - .7, faceZ + .02, dark, b);
      for (let col = 0; col < columns; col++) {
        const xx = x - w / 2 + (col + .5) * w / columns;
        box(.96, 1.16, .04, xx, y, faceZ, windowDark, b);
        if (rnd() > .36) windowTransforms.push({ x:xx, y, z:faceZ + .026, sx:.84, sy:1.05, color:rnd() > .3 ? '#dabb86' : '#88b9b3' });
        box(.028, 1.17, .05, xx, y, faceZ + .032, dark, b);
      }
    }
    box(w - .2, .19, .9, x, 2.3, faceZ + .37, metal, b);
    box(w - .35, 1.7, .07, x, 1.12, faceZ, windowDark, b);
    for (const xx of [x - w / 2 + .3, x + w / 2 - .3]) box(.1, 2.1, .15, xx, 1.25, faceZ + .1, dark, b);
    const acx = x + w / 2 - .72;
    box(.9,.5,.37,acx,2.69,faceZ+.25,metal,b);
    const fan = cylinder(.16,.025,acx,2.69,faceZ+.45,dark,b); fan.rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) box(.6,.017,.03,acx,2.54+k*.12,faceZ+.46,cream,b);
    collide(x,z,w,d);
    return b;
  }
  building(-11.8, -11.4, 7, 9.5, 12, 0);
  building(-12.3, 1.9, 8, 9, 8.8, 2);
  building(-13.1, 16, 9.5, 11, 16, 1);
  building(-14, -29.5, 11, 13, 18, 3);
  building(22.1, -13.2, 12, 12, 15.3, 1);
  building(23.5, 4.6, 13, 12, 11.2, 4);
  building(23.7, 23.5, 14, 15, 20, 0);
  building(2.4, -44, 26, 8, 22, 4);
  building(-22, -48, 13, 12, 28, 1);
  // Give the street-facing side walls additional windows.
  for (const [x, z, rows, cols, facing] of [[-8.26,-11.4,5,4,1],[-8.25,1.9,3,4,1],[16.07,-13.2,6,5,-1],[16.98,4.6,4,5,-1]]) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const zz = z - (cols - 1) * .85 + c * 1.7, yy = 3.2 + r * 1.8;
      box(.05,1.08,.92,x,yy,zz,windowDark);
      if(rnd()>.4) { const m = basic(rnd()>.3 ? '#bda575' : '#719fa0'); box(.02,.96,.8,x+facing*.035,yy,zz,m); }
      box(.07,1.08,.025,x+facing*.045,yy,zz,dark);
    }
  }
  const warmWindows = new THREE.InstancedMesh(geometry.plane, basic('#ffffff'), windowTransforms.length);
  const dummy = new THREE.Object3D();
  windowTransforms.forEach((t,i) => { dummy.position.set(t.x,t.y,t.z); dummy.scale.set(t.sx,t.sy,1); dummy.updateMatrix(); warmWindows.setMatrixAt(i,dummy.matrix); warmWindows.setColorAt(i,new THREE.Color(t.color)); });
  world.add(warmWindows);
  // Shop signs opposite add a human scale to the silhouettes.
  panel(3.5,.55,-11.8,2.12,-6.61,textTexture(['喫茶  月あかり'], '#2a5359','#dbba87',768,128),0,true);
  panel(4.7,.54,-12.3,2.1,6.435,textTexture(['小さなパン屋  KOMOREBI'], '#d6b994','#425750',768,128),0,true);
  const verticalSign = box(.62,3.5,.21,-8.62,3.8,-6.6,mat('redSign','#853d3d',.45));
  panel(.55,3.3,-8.62,3.8,-6.48,textTexture([{text:'居',size:180},{text:'酒',size:180},{text:'屋',size:180}], '#ae5642','#ffe0a4',256,1024),0,true);
  pointLight('#e9a778',8,-9.5,2.7,-5.8,7);
  for (const z of [-6.05,6.99]) {
    for (let i = 0; i < 3; i++) { const lamp = sphere(.17,-12.2+i*.5,2.02,z,orange); lamp.scale.y *= 1.4; }
  }
  // Utility poles / overhead cables establish a rainy residential street.
  const cableMat = basic('#152633');
  for (const z of [-31,-13,7,27]) {
    cylinder(.135,8.3,-6.47,4.3,z,mat('utilityPole','#4b555c',.75));
    box(2.7,.12,.15,-6.47,7.28,z,dark);
    for (const x of [-7.6,-6.9,-6.05,-5.35]) { cylinder(.07,.25,x,7.44,z,cream); cylinder(.08,.05,x,7.51,z,metal); }
    box(.5,.7,.4,-6.18,6.1,z,metal); collide(-6.47,z,.4,.4);
  }
  for (const x of [-7.6,-6.9,-6.05,-5.35]) for (let s=0;s<3;s++) {
    const z1=[-31,-13,7][s], z2=[-13,7,27][s];
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(x,7.55,z1),new THREE.Vector3(x+.12,6.25,(z1+z2)/2),new THREE.Vector3(x,7.55,z2));
    const cable=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.012,3,false),cableMat); world.add(cable);
  }
  const overhead=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-6.47,7.6,-13),new THREE.Vector3(3,6.5,-13),new THREE.Vector3(16,8.8,-13));
  world.add(new THREE.Mesh(new THREE.TubeGeometry(overhead,20,.016,4,false),cableMat));
  // Quiet street furniture and a traffic mirror.
  cylinder(.045,2.35,1.15,1.325,-2.6,orange);
  const mirror=new THREE.Mesh(new THREE.CircleGeometry(.34,24),mat('mirror','#81999b',.06,{metalness:.85})); mirror.position.set(1.15,2.45,-2.6); mirror.rotation.y=-.55; world.add(mirror);
  const mirrorRim=new THREE.Mesh(new THREE.TorusGeometry(.355,.025,6,24),orange); mirrorRim.position.copy(mirror.position); mirrorRim.rotation.copy(mirror.rotation); world.add(mirrorRim);
  box(.58,1.05,.4,-7.21,.68,10.5,mat('streetCabinet','#49736e',.52)); collide(-7.21,10.5,.65,.5);
  panel(.41,.26,-7.21,.8,10.71,textTexture(['〒 POST'], '#cf9b72','#743f2e',256,128));
  for(const [x,z] of [[3.8,14.5],[-7.1,-23.5]]) { cylinder(.08,.62,x,.46,z,orange); cylinder(.13,.08,x,.2,z,dark); box(.3,.07,.3,x,.73,z,orange); collide(x,z,.3,.3); }
  // The glowing OPEN plate sits on the window without competing with the sign.
  const openSign=panel(.9,.32,5.8,2.51,-5.82,textTexture([{text:'OPEN',size:66}], '#124e42','#93ffcf',384,128),0,true,shop);
  const reflectedMint=flat(9.5,4.2,8,-3.05,new THREE.MeshBasicMaterial({color:'#5fc5b3',transparent:true,opacity:.055,depthWrite:false}),.18);
  reflectedMint.name='Store light reflected on wet sidewalk';
  addStreetDetails({world,box,cylinder,sphere,flat,panel,beamBetween,collide,textTexture,canvasTexture,pointLight,mat,cream,dark,wood,metal,blackMetal,glass});
  // Batch arbitrary primitive transforms, keeping independently moving groups intact.
  // This preserves detailed railings, shelf labels and windows at a modest draw cost.
  function batchStatic(container, excluded = new Set()) {
    container.updateWorldMatrix(true,true);
    const inverse=new THREE.Matrix4().copy(container.matrixWorld).invert();
    const batches=new Map();
    function visit(node) {
      if(excluded.has(node)) return;
      if(node.isMesh && !node.isInstancedMesh && !Array.isArray(node.material)) {
        const key=`${node.geometry.uuid}/${node.material.uuid}/${node.castShadow}/${node.receiveShadow}`;
        if(!batches.has(key)) batches.set(key,[]);
        batches.get(key).push(node);
      }
      for(const child of node.children) visit(child);
    }
    visit(container);
    for(const meshes of batches.values()) {
      if(meshes.length<2) continue;
      const first=meshes[0];
      const instances=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
      instances.name='Batched street detail'; instances.castShadow=first.castShadow; instances.receiveShadow=first.receiveShadow;
      meshes.forEach((mesh,i)=>{instances.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));mesh.parent.remove(mesh);});
      instances.instanceMatrix.needsUpdate=true; instances.computeBoundingSphere(); container.add(instances);
    }
  }
  batchStatic(world,new Set([roof,door.left,door.right,coffeeCorner.dynamic]));
  batchStatic(roof); batchStatic(door.left); batchStatic(door.right);
  const bounds={minX:2,maxX:14,minZ:-18,maxZ:-6};
  let opening=0;
  function update(time, dt, doorOpen) {
    opening = THREE.MathUtils.damp(opening, doorOpen ? 1 : 0, 7, Math.min(dt || .016,.1));
    door.left.position.x=7.35-opening*1.18;
    door.right.position.x=8.65+opening*1.18;
    leftDoorCollider.minX=door.left.position.x-.65; leftDoorCollider.maxX=door.left.position.x+.65;
    rightDoorCollider.minX=door.right.position.x-.65; rightDoorCollider.maxX=door.right.position.x+.65;
    coffeeCorner.update(time,dt);
    // Barely visible imperfection in the street light makes the rain feel alive.
    if(lamps[2]) lamps[2].intensity=22*(.985+.015*Math.sin(time*2.7));
    openSign.material.color.setScalar(.97+.03*Math.sin(time*.8));
  }
  return {world,colliders,door,roof,inventory,wetMask,storeBounds:bounds,spawn:{x:0,z:7},entrance:{x:8,z:-5},counter:{x:3.8,z:-14},groundY,update};
}
