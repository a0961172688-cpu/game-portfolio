// Street-facing shop windows, a small cafe terrace and neighbourhood planting.
// Everything is placed outside the existing shop entrance and walking aisles.
export function addStreetDetails(api) {
  const {box,cylinder,sphere,flat,panel,beamBetween,collide,textTexture,canvasTexture,pointLight,mat,cream,dark,wood,metal,blackMetal,glass}=api;
  const warmWindow=mat('neighbourWindow','#735c3f',.64,{emissive:'#e7b06c',emissiveIntensity:.80});
  const frame=mat('neighbourFrame','#344943',.78);
  const doorMat=mat('neighbourDoor','#587265',.70);
  const dough=mat('bakeryDough','#cda76e',.92);
  const flour=mat('breadScore','#edc98e',.94);
  function storefront(z,title,subtitle,color) {
    const x=-8.16;
    box(.12,1.95,3.4,x,1.22,z,frame);
    box(.026,1.67,3.12,x+.075,1.23,z,warmWindow);
    for(const zz of [z-1.57,z,z+1.57])box(.09,1.76,.055,x+.19,1.23,zz,wood);
    for(const y of [.38,2.08])box(.09,.065,3.21,x+.19,y,z,wood);
    box(.024,1.61,3.02,x+.27,1.23,z,glass);
    const clothTexture=canvasTexture(256,128,(c,w,h)=>{
      c.fillStyle=color;c.fillRect(0,0,w,h);c.fillStyle='#d9ccad';
      for(let i=0;i<8;i++)c.fillRect(i*32,0,14,h);
    },[1,6]);
    const cloth=mat(`awning-${title}`,'#ffffff',.94,{map:clothTexture});
    const awning=box(.84,.075,4.14,x+.39,2.30,z,cloth);awning.rotation.z=-.07;
    box(.045,.16,4.14,x+.80,2.19,z,cloth);
    panel(4.24,.48,x+.12,2.67,z,textTexture([{text:title,size:53},{text:subtitle,size:22}],color,'#fff0cd',1024,176),Math.PI/2,true);
    const doorZ=z+2.26;
    box(.07,1.94,.83,x+.03,1.17,doorZ,frame);
    box(.026,1.73,.66,x+.09,1.15,doorZ,doorMat);
    box(.031,.80,.51,x+.12,1.39,doorZ,glass);
    beamBetween([x+.19,.96,doorZ+.20],[x+.19,1.24,doorZ+.20],.016,metal);
    flat(.64,1.03,x+.42,doorZ,mat('shopDoorMat','#334940',.95),.165);
    collide(x+.09,doorZ,.18,.94);
    return x;
  }
  const cafeX=storefront(-11.4,'月あかり  COFFEE','HOT COFFEE / A QUIET CORNER','#3c5651');
  for(const y of [.68,1.13])box(.21,.037,2.90,cafeX+.14,y,-11.4,wood);
  for(let row=0;row<2;row++)for(let i=0;i<6;i++){
    const z=-12.50+i*.42;
    cylinder(.046,.094,cafeX+.19,.76+row*.45,z,cream);
    cylinder(.030,.01,cafeX+.19,.811+row*.45,z,dark);
  }
  panel(.67,.52,cafeX+.30,1.66,-11.4,textTexture([{text:'COFFEE',size:51},{text:'¥120',size:69}],'#4f5143','#f6dba3',384,320),Math.PI/2,false);
  pointLight('#ffd29b',5.2,-7.50,1.80,-11.4,6);
  const tableZ=-10.15;
  cylinder(.30,.045,-6.99,.84,tableZ,wood);cylinder(.037,.63,-6.99,.50,tableZ,blackMetal);
  cylinder(.19,.035,-6.99,.19,tableZ,blackMetal);
  cylinder(.034,.086,-7.08,.905,tableZ-.06,cream);
  cylinder(.023,.008,-7.08,.951,tableZ-.06,dark);
  collide(-6.99,tableZ,.63,.63);
  for(const [x,z] of [[-7.14,tableZ-.58],[-7.14,tableZ+.58]]){
    box(.34,.046,.31,x,.51,z,wood);
    for(const xx of [x-.12,x+.12])for(const zz of [z-.10,z+.10])beamBetween([xx,.19,zz],[xx,.51,zz],.017,blackMetal);
    box(.34,.27,.047,x,.75,z+(z<tableZ?-.14:.14),wood);collide(x,z,.36,.36);
  }
  const bakeryX=storefront(1.9,'KOMOREBI BAKERY','焼きたてのパン / FRESH EVERY MORNING','#936e50');
  for(let level=0;level<3;level++){
    const y=.59+level*.43;
    box(.23,.025,2.88,bakeryX+.14,y,1.9,wood);
    for(let i=0;i<8;i++){
      const z=.68+i*.34;
      const bun=sphere(.106,bakeryX+.19,y+.083,z,dough);bun.scale.x*=.65;bun.scale.y*=.70;bun.scale.z*=1.15;
      for(let score=0;score<2;score++)beamBetween([bakeryX+.252,y+.131,z-.053+score*.065],[bakeryX+.252,y+.16,z-.005+score*.065],.007,flour);
    }
  }
  pointLight('#f8c787',4.6,-7.56,1.81,1.9,5.8);
  panel(.56,.61,-8.00,.88,4.30,textTexture([{text:'OPEN',size:64},{text:'08:00 — 20:00',size:24}],'#ead7b7','#72563b',320,384),Math.PI/2,false);

  // Fine curb joints and a patched utility cover break long, uniform strips.
  const joint=mat('curbJoint','#526969',.88);
  for(const x of [2.185,-5.945])for(let z=-28;z<27;z+=1.20)box(.012,.105,.018,x,.095,z,joint);
  for(const [x,z] of [[3.87,6.85],[14.74,11.80],[-6.76,-20.1]]){
    flat(.53,.74,x,z,mat('pavementCover','#50655f',.62,{metalness:.23}),.166);
    for(let i=0;i<3;i++)flat(.36,.009,x,z-.24+i*.24,metal,.169);
  }
  const noticeBack=mat('noticeBack','#718074',.85);
  box(.08,1.16,.92,-8.13,1.52,6.20,noticeBack);
  panel(.79,1.02,-8.075,1.52,6.20,textTexture([{text:'青叶町',size:57},{text:'町内掲示板',size:37},{text:'雨の日も、ゆっくり。',size:28},{text:'KEEP OUR STREET CLEAN',size:17}],'#dddfc7','#445b48',384,512),Math.PI/2,false);

  // Two compact street trees leave a clear path past the storefronts.
  const bark=mat('treeBark','#5f6250',.98);
  const leaves=[mat('treeLeaf0','#355e4d',.94),mat('treeLeaf1','#547961',.94),mat('treeLeaf2','#748569',.94)];
  for(const [x,z] of [[-7.12,18.8],[14.78,14.7]]){
    box(.72,.46,.72,x,.39,z,mat('treePlanter','#586356',.87));
    flat(.64,.64,x,z,mat('treeSoil','#3b4233',.97),.624);
    cylinder(.070,2.35,x,1.80,z,bark);
    for(let i=0;i<5;i++){
      const angle=i*Math.PI*2/5;
      const xx=x+Math.cos(angle)*.55,zz=z+Math.sin(angle)*.55;
      beamBetween([x,2.3,z],[xx,3.02,zz],.024,bark);
      const crown=sphere(.64,xx,3.14+(i%2)*.20,zz,leaves[i%3]);crown.scale.y*=.78;crown.scale.z*=1.08;crown.castShadow=true;
    }
    const crown=sphere(.72,x,3.55,z,leaves[1]);crown.scale.y*=.78;crown.castShadow=true;
    collide(x,z,.78,.78);
  }
}
