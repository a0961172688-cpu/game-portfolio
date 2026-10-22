import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// The service counter keeps its original footprint so the aisle remains clear.
export function createCheckoutCounter(api) {
  const {parent,box,cylinder,beamBetween,panel,textTexture,canvasTexture,mat,goods}=api;
  const group=new THREE.Group();group.name='Checkout and pastry display';parent.add(group);
  const green=mat('checkoutGreen','#376e61',.78);
  const cream=mat('checkoutCream','#ddd9c6',.82);
  const trim=mat('checkoutTrim','#a6b4ac',.55,{metalness:.18});
  const dark=mat('checkoutDark','#243b3b',.75,{metalness:.04});
  const paper=mat('checkoutPaper','#efe6d1',.93);
  const woodTexture=canvasTexture(256,256,(c,w,h)=>{
    c.fillStyle='#ba9b74';c.fillRect(0,0,w,h);
    for(let i=0;i<55;i++){
      const x=i*4.8;c.strokeStyle=i%3?'#896c4928':'#ecd0a047';c.lineWidth=i%4?.8:1.4;
      c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+2,70,x-3,180,x+1,h);c.stroke();
    }
  });
  const wood=mat('checkoutOak','#f5eee0',.86,{map:woodTexture});
  const roundedGeometry=new Map();
  function rounded(w,h,d,r,x,y,z,material,parentGroup=group){
    const key=[w,h,d,r].join('/');
    if(!roundedGeometry.has(key))roundedGeometry.set(key,new RoundedBoxGeometry(w,h,d,2,r));
    const mesh=new THREE.Mesh(roundedGeometry.get(key),material);mesh.position.set(x,y,z);
    mesh.castShadow=h>.12;mesh.receiveShadow=true;parentGroup.add(mesh);return mesh;
  }
  box(2.51,.075,1.31,3.8,.208,-14,dark,group);
  rounded(2.65,.88,1.45,.025,3.8,.65,-14,green);
  // Inset oak panels, a thin brand rail and a stone-like work surface.
  for(const x of [3.135,4.465])box(1.285,.66,.024,x,.69,-13.26,wood,group);
  box(2.64,.045,.028,3.8,1.048,-13.258,cream,group);
  rounded(2.84,.08,1.60,.017,3.8,1.13,-14,cream);
  box(2.72,.018,1.49,3.8,1.088,-14,dark,group);
  panel(1.26,.22,3.8,.83,-13.244,textTexture([
    {text:'AME MART',size:44},{text:'いらっしゃいませ',size:20,weight:500},
  ],'#376e61','#efe8d1',512,128),0,false,group);
  for(const x of [3.75,3.86])box(.022,.11,.028,x,.46,-13.228,trim,group);

  // The screen face and its housing share one tilted transform.
  rounded(.49,.09,.44,.016,3.55,1.225,-14.1,dark);
  box(.41,.015,.023,3.55,1.235,-13.875,trim,group);
  box(.045,.26,.06,3.55,1.38,-14.29,dark,group);
  const display=new THREE.Group();display.position.set(3.55,1.57,-14.29);display.rotation.x=-.16;group.add(display);
  rounded(.48,.33,.052,.014,0,0,0,dark,display);
  panel(.418,.265,0,0,.027,textTexture([
    {text:'AME MART',size:26},{text:'¥ 0',size:53},{text:'お会計はこちら',size:18,weight:500},
  ],'#1e403a','#c8ead4',384,240),0,true,display);
  cylinder(.009,.005,.192,-.143,.030,mat('checkoutReady','#8ed0a3',.9),display).rotation.x=Math.PI/2;
  rounded(.42,.045,.18,.012,3.55,1.192,-13.775,dark);
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){
    box(.035,.012,.033,3.415+col*.045,1.222,-13.83+row*.045,col===6?green:cream,group);
  }
  // Contactless reader has a sloped face, rather than a glowing flat block.
  const reader=new THREE.Group();reader.position.set(4.68,1.25,-13.68);reader.rotation.x=-.28;group.add(reader);
  rounded(.215,.095,.31,.018,0,0,0,dark,reader);
  const readerFace=panel(.16,.15,0,.05,-.038,canvasTexture(256,192,(c,w,h)=>{
    c.fillStyle='#d6e4cf';c.fillRect(0,0,w,h);c.fillStyle='#32594d';
    c.textAlign='center';c.font='bold 28px Arial';c.fillText('TAP',w/2,43);
    c.strokeStyle='#32594d';c.lineWidth=5;
    for(const r of [18,32,46]){c.beginPath();c.arc(110,115,r,-.75,.75);c.stroke();}
    c.fillRect(57,103,31,24);
  }),0,false,reader);readerFace.rotation.x=-Math.PI/2;
  for(let i=0;i<3;i++)box(.026,.007,.028,-.041+i*.041,.054,.10,trim,reader);
  // Receipt, cash tray and a compact pen pot keep a clear customer edge.
  rounded(.21,.055,.12,.008,4.18,1.201,-13.57,green);
  box(.18,.004,.087,4.18,1.230,-13.57,dark,group);
  rounded(.18,.12,.20,.009,3.93,1.236,-14.29,dark);
  const receipt=new THREE.Group();receipt.position.set(3.93,1.304,-14.19);receipt.rotation.x=.18;group.add(receipt);
  box(.083,.002,.13,0,0,0,paper,receipt);
  for(let i=0;i<5;i++)box(.05,.001,.003,0,.0015,-.027+i*.011,trim,receipt);
  cylinder(.053,.115,2.82,1.233,-14.38,cream,group);
  for(let i=0;i<3;i++)beamBetween([2.8+i*.018,1.23,-14.38],[2.794+i*.023,1.425,-14.375],.004,green,group);

  // Separate glass faces prevent the pastry case from looking like a solid cube.
  const glass=mat('checkoutClearGlass','#d7efdf',.13,{transparent:true,opacity:.18,depthWrite:false,metalness:0});
  rounded(.76,.035,.48,.008,4.53,1.198,-14.37,cream);
  box(.72,.32,.012,4.53,1.376,-14.124,glass,group);
  box(.012,.32,.46,4.164,1.376,-14.37,glass,group);
  box(.012,.32,.46,4.896,1.376,-14.37,glass,group);
  box(.73,.012,.46,4.53,1.541,-14.37,glass,group);
  for(const x of [4.158,4.902])for(const z of [-14.60,-14.13])box(.014,.34,.014,x,1.38,z,trim,group);
  for(const z of [-14.60,-14.13])box(.755,.014,.014,4.53,1.548,z,trim,group);
  for(const x of [4.158,4.902])box(.014,.014,.48,x,1.548,-14.37,trim,group);
  for(let i=0;i<3;i++)goods.place(8,4.32+i*.21,1.222,-14.39,0,.73);
  panel(.30,.08,4.53,1.25,-14.112,textTexture([{text:'BUTTER · ¥200',size:30}], '#f0e7cf','#597461',384,80),0,false,group);
  return {group};
}
