import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// World-space fixtures for the self-service corner, facing the shop's +Z aisle.
export function createCoffeeCorner({ parent, box, cylinder, sphere, beamBetween, panel, canvasTexture, textTexture, mat, pointLight }) {
  const group = new THREE.Group();
  group.name = 'AME self-service coffee corner';
  parent.add(group);
  const dynamic = new THREE.Group();
  dynamic.name = 'Coffee cup warmth';
  group.add(dynamic);
  const roundedGeometry = new RoundedBoxGeometry(1, 1, 1, 2, .045);
  const cupGeometry = new THREE.CylinderGeometry(1, .83, 1, 24, 1, true);
  const cupRimGeometry = new THREE.TorusGeometry(.062, .004, 5, 24);
  const coffeeGeometry = new THREE.CircleGeometry(.059, 24);
  const cream = mat('coffeeCream', '#e8e5d5', .64);
  const green = mat('coffeeForest', '#37594d', .66);
  const inset = mat('coffeeInset', '#233832', .68, { metalness: .06 });
  const silver = mat('coffeeSatin', '#a1afac', .49, { metalness: .27 });
  const wood = mat('coffeePaleWood', '#c3a67e', .79);
  const paper = mat('coffeePaper', '#eee8d8', .85);
  const brown = mat('coffeeBrown', '#503826', .86);
  const liquid = mat('coffeeSurface', '#3b2920', .38);
  const ready = new THREE.MeshBasicMaterial({ color: '#a4c6a5' });
  const acrylic = mat('coffeeHopper', '#99876e', .48, { transparent: true, opacity: .33, depthWrite: false, metalness: 0 });

  function rounded(w, h, d, x, y, z, material, target = group) {
    const mesh = new THREE.Mesh(roundedGeometry, material);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.castShadow = h > .3;
    mesh.receiveShadow = true;
    target.add(mesh);
    return mesh;
  }

  // A washable tiled backsplash and a pale timber return soften the empty wall.
  const tileTexture = canvasTexture(768, 384, (c, w, h) => {
    c.fillStyle = '#d4dbcd'; c.fillRect(0, 0, w, h);
    const rows = 6, cols = 12, tw = w / cols, th = h / rows;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols + 1; col++) {
      const x = col * tw - (row % 2 ? tw / 2 : 0);
      c.fillStyle = ['#e4e6d9', '#e2e6dc', '#e8e8dc'][(row + col) % 3];
      c.fillRect(x + 1.7, row * th + 1.7, tw - 3.4, th - 3.4);
    }
  });
  panel(3.12, 1.45, 3.68, 1.87, -17.872, tileTexture, 0, false, group);
  box(3.12, .11, .055, 3.68, 1.10, -17.865, wood, group);
  box(.03, 1.05, 3.1, 2.105, .72, -16.31, wood, group);
  box(.032, .052, 3.10, 2.11, 1.24, -16.31, green, group);
  for (let i = 0; i < 12; i++) box(.007, .94, .006, 2.127, .72, -17.72 + i * .247, mat('coffeeWoodJoint', '#ab926e', .88), group);

  // The counter keeps the original collision footprint and service height.
  rounded(2.80, .80, .78, 3.7, .58, -17.1, cream);
  box(2.70, .09, .66, 3.7, .22, -17.12, inset, group);
  rounded(2.94, .09, .92, 3.7, 1.04, -17.1, green);
  box(2.89, .012, .87, 3.7, 1.090, -17.1, mat('coffeeWorktop', '#bec3b6', .67), group);
  for (let i = 0; i < 3; i++) {
    const x = 2.80 + i * .90;
    rounded(.858, .654, .026, x, .63, -16.696, cream);
    box(.155, .018, .025, x + .23, .884, -16.667, silver, group);
    box(.156, .016, .012, x + .23, .862, -16.676, inset, group);
  }
  box(2.77, .014, .027, 3.7, .983, -16.674, wood, group);

  const screenTexture = canvasTexture(512, 256, (c, w, h) => {
    c.fillStyle = '#18392f'; c.fillRect(0, 0, w, h);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#eeeada'; c.font = '600 25px Arial'; c.fillText('AME COFFEE', w / 2, 33);
    c.fillStyle = '#e0ae73'; c.fillRect(25, 66, 218, 116);
    c.fillStyle = '#b6d5cb'; c.fillRect(269, 66, 218, 116);
    c.fillStyle = '#36463a'; c.font = '700 36px Arial'; c.fillText('HOT', 134, 105); c.fillText('ICE', 378, 105);
    c.font = '600 29px Arial'; c.fillText('¥120', 134, 152); c.fillText('¥150', 378, 152);
    c.fillStyle = '#c7dbc7'; c.font = '21px "Yu Gothic", "Microsoft YaHei", sans-serif';
    c.fillText('カップを置いて、ボタンを押す', w / 2, 220);
  });
  const cupTexture = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#eee9d8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#426453'; c.fillRect(0, 191, w, 27);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#31574a'; c.font = '700 31px Georgia'; c.fillText('AME', 128, 114);
    c.font = '11px Arial'; c.fillText('A LITTLE COFFEE', 128, 143);
    c.strokeStyle = '#809a80'; c.lineWidth = 2; c.beginPath(); c.arc(128, 88, 9, 0, Math.PI * 2); c.stroke();
  });
  const cupMaterial = mat('coffeeBrandedCup', '#ffffff', .83, { map: cupTexture });
  let screenMaterial;
  const machineXs = [3.04, 4.17];
  machineXs.forEach((x, i) => {
    const z = -17.08;
    // Separate rear shell, two cheeks and head leave a real recessed cup bay.
    // Inset the rear shell so its side faces do not coincide with the cream head.
    rounded(.69, .91, .38, x, 1.555, z - .14, green);
    rounded(.095, .88, .63, x - .303, 1.55, z, cream);
    rounded(.095, .88, .63, x + .303, 1.55, z, cream);
    rounded(.71, .34, .63, x, 1.865, z, cream);
    rounded(.72, .086, .66, x, 1.135, z, green);
    box(.504, .445, .017, x, 1.48, -17.009, inset, group);
    rounded(.525, .238, .022, x, 1.86, -16.756, inset);
    const screen = panel(.472, .209, x, 1.862, -16.741, screenTexture, 0, true, group);
    if (screenMaterial) screen.material = screenMaterial; else screenMaterial = screen.material;
    box(.31, .016, .012, x, 2.006, -16.754, green, group);
    sphere(.0105, x + .24, 1.711, -16.752, ready, group);
    box(.12, .045, .096, x, 1.648, -16.902, silver, group);
    for (const dx of [-.026, .026]) cylinder(.012, .071, x + dx, 1.596, -16.866, silver, group);
    box(.066, .019, .024, x, 1.549, -16.865, inset, group);
    // Ribbed drainage surface reads as a tray even from the shoulder camera.
    rounded(.49, .040, .35, x, 1.185, -16.91, silver);
    box(.452, .008, .312, x, 1.208, -16.91, inset, group);
    for (let j = 0; j < 10; j++) box(.014, .007, .288, x - .198 + j * .044, 1.216, -16.91, silver, group);
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.scale.set(.064, .159, .064); cup.position.set(x, 1.300, -16.834); cup.rotation.y = Math.PI; group.add(cup);
    const rim = new THREE.Mesh(cupRimGeometry, paper); rim.rotation.x = Math.PI / 2; rim.position.set(x, 1.382, -16.834); group.add(rim);
    const coffee = new THREE.Mesh(coffeeGeometry, liquid); coffee.rotation.x = -Math.PI / 2; coffee.position.set(x, 1.375, -16.834); group.add(coffee);
    // Shallow translucent bean hopper with a removable cap, rather than a tall tower.
    cylinder(.114, .117, x, 2.091, z - .13, acrylic, group);
    cylinder(.12, .022, x, 2.153, z - .13, green, group);
    for (let j = 0; j < 8; j++) {
      const a = j * 2.39996, r = .030 + (j % 3) * .018;
      const bean = sphere(.021, x + Math.sin(a) * r, 2.066 + (j % 2) * .017, z - .13 + Math.cos(a) * r, brown, group);
      bean.scale.x *= 1.35; bean.scale.y *= .76;
    }
    for (let j = 0; j < 5; j++) box(.027, .072, .008, x - .08 + j * .04, 1.395, z - .345, inset, group);
    if (i === 0) {
      for (let j = 0; j < 2; j++) {
        const points = [];
        for (let k = 0; k < 10; k++) {
          const t = k / 9;
          points.push(new THREE.Vector3(Math.sin(t * 6 + j * 2) * .007, t * .17, 0));
        }
        const steam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#e6e4d5', transparent: true, opacity: .05, depthWrite: false }));
        steam.position.set(x - .017 + j * .034, 1.389, -16.805); dynamic.add(steam);
      }
    }
  });

  // One tidy organizer, with visible cup lips, lids and separate sugar/stirrer wells.
  rounded(.405, .026, .46, 4.91, 1.112, -17.08, wood);
  box(.010, .105, .44, 4.70, 1.16, -17.08, green, group);
  box(.010, .105, .44, 5.12, 1.16, -17.08, green, group);
  box(.40, .105, .010, 4.91, 1.16, -17.29, green, group);
  box(.40, .07, .010, 4.91, 1.14, -16.855, green, group);
  for (let i = 0; i < 5; i++) {
    cylinder(.065 + i * .0006, .054, 4.818, 1.149 + i * .023, -17.14, paper, group);
    cylinder(.067 + i * .0006, .008, 4.818, 1.177 + i * .023, -17.14, cream, group);
    cylinder(.069, .011, 4.995, 1.142 + i * .015, -17.15, green, group);
  }
  box(.112, .056, .114, 4.816, 1.162, -16.966, cream, group);
  box(.12, .075, .12, 4.997, 1.164, -16.966, green, group);
  for (let i = 0; i < 4; i++) {
    box(.063, .085, .012, 4.794 + i * .015, 1.210, -16.966, paper, group).rotation.z = -.12 + i * .06;
    beamBetween([4.969 + i * .014, 1.184, -16.966], [4.969 + i * .018, 1.376 - i * .014, -16.975], .005, wood, group);
  }
  panel(.35, .048, 4.91, 1.146, -16.846, textTexture([{ text: 'SUGAR  ·  LIDS', size: 29 }], '#e8e3d1', '#426453', 384, 64), 0, false, group);
  // A folded napkin dispenser occupies the small left service space.
  rounded(.255, .070, .26, 2.439, 1.132, -17.06, green);
  box(.23, .034, .23, 2.439, 1.183, -17.06, paper, group);
  box(.064, .015, .14, 2.439, 1.207, -17.047, paper, group).rotation.z = -.08;

  const menuTexture = canvasTexture(1024, 256, (c, w, h) => {
    c.fillStyle = '#eee8d6'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#365a48'; c.fillRect(0, 0, 20, h);
    c.textBaseline = 'middle'; c.textAlign = 'left';
    c.font = '700 56px "Yu Gothic", "Microsoft YaHei", sans-serif'; c.fillText('挽きたてコーヒー', 48, 91);
    c.font = '25px Arial'; c.fillStyle = '#687b62'; c.fillText('AME COFFEE  /  FRESHLY BREWED', 52, 164);
    c.strokeStyle = '#c4c9ad'; c.lineWidth = 2; c.beginPath(); c.moveTo(682, 37); c.lineTo(682, 217); c.stroke();
    c.fillStyle = '#365a48'; c.font = '600 37px Arial'; c.fillText('HOT  ¥120', 724, 84); c.fillText('ICE   ¥150', 724, 158);
    c.fillStyle = '#84927a'; c.font = '18px "Yu Gothic", sans-serif'; c.fillText('いつでも、淹れたて。', 726, 206);
  });
  rounded(2.68, .668, .069, 3.68, 2.773, -17.839, wood);
  panel(2.60, .59, 3.68, 2.775, -17.798, menuTexture, 0, false, group);
  box(2.50, .031, .065, 3.68, 2.427, -17.795, green, group);
  box(2.46, .012, .028, 3.68, 2.403, -17.774, mat('coffeeTaskLight', '#f2e4bb', .65, { emissive: '#d1b57b', emissiveIntensity: .18 }), group);
  pointLight('#ffe5b3', .12, 3.68, 2.32, -17.50, 3.4);

  const guideTexture = canvasTexture(384, 512, (c, w, h) => {
    c.fillStyle = '#ede8d8'; c.fillRect(0, 0, w, h);
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#345848';
    c.font = '700 31px Arial'; c.fillText('A LITTLE COFFEE', 24, 44);
    c.font = '18px "Yu Gothic", "Microsoft YaHei", sans-serif'; c.fillText('セルフサービス', 25, 82);
    const captions = [['01', 'カップを置く', 'PLACE YOUR CUP'], ['02', 'HOT / ICE を選ぶ', 'CHOOSE YOUR COFFEE'], ['03', 'ふたをして、どうぞ', 'LID ON. ENJOY.']];
    captions.forEach(([number, jp, en], i) => {
      const y = 155 + i * 118;
      c.fillStyle = '#c1d1b8'; c.beginPath(); c.arc(46, y, 24, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#345848'; c.font = '700 23px Arial'; c.textAlign = 'center'; c.fillText(number, 46, y);
      c.textAlign = 'left'; c.font = '600 25px "Yu Gothic", "Microsoft YaHei", sans-serif'; c.fillText(jp, 84, y - 11);
      c.fillStyle = '#7f8873'; c.font = '14px Arial'; c.fillText(en, 86, y + 23);
    });
    c.fillStyle = '#81906e'; c.font = '17px "Yu Gothic", sans-serif'; c.fillText('雨の日も、ひと息。', 25, 480);
  });
  box(.030, .88, .70, 2.116, 2.00, -15.93, wood, group);
  panel(.65, .83, 2.137, 2.00, -15.93, guideTexture, Math.PI / 2, false, group);

  function update(time) {
    dynamic.children.forEach((steam, i) => {
      steam.position.y = 1.389 + Math.sin(time * .9 + i * 2) * .015;
      steam.material.opacity = .040 + .012 * Math.sin(time * .65 + i * 1.9);
    });
  }
  return { group, dynamic, update };
}
