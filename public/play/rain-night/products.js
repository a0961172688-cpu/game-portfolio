import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A single original print atlas supplies all sixteen shop-brand packages.
export const PRODUCT_CATALOG = [
  ['绿茶',120,'bottle',.13,.30,.13], ['天然水',100,'bottle',.13,.29,.13],
  ['鲜牛奶',180,'carton',.15,.28,.14], ['蜜桃饮料',160,'bottle',.14,.29,.14],
  ['冰咖啡',150,'can',.13,.20,.13], ['柠檬汽水',130,'can',.13,.24,.13],
  ['原味薯片',180,'bag',.22,.30,.12], ['番茄薄脆',160,'bag',.21,.27,.12],
  ['黄油酥饼',200,'box',.20,.24,.10], ['巧克力饼干',220,'box',.18,.25,.10],
  ['草莓夹心饼干',210,'box',.21,.24,.11], ['海苔饭团',120,'rice',.20,.20,.12],
  ['咖喱杯面',230,'cup',.18,.20,.18], ['味噌汤',150,'cup',.17,.18,.17],
  ['金枪鱼三明治',240,'sandwich',.20,.23,.13], ['鸡蛋三明治',220,'sandwich',.20,.23,.13],
].map(([name,price,shape,width,height,depth],id)=>({id,name,price,shape,width,height,depth}));

function tileUV(geometry,id) {
  const uv=geometry.attributes.uv, inset=.006;
  const x=(id%4)/4, y=1-(Math.floor(id/4)+1)/4;
  for(let i=0;i<uv.count;i++)uv.setXY(i,x+inset+THREE.MathUtils.clamp(uv.getX(i),0,1)*(.25-2*inset),y+inset+THREE.MathUtils.clamp(uv.getY(i),0,1)*(.25-2*inset));
  return geometry;
}

function triangularPack() {
  const shape=new THREE.Shape();shape.moveTo(-.5,-.5);shape.lineTo(.5,-.5);shape.lineTo(0,.5);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.86,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:2,steps:1});
  geometry.translate(0,0,-.43);
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)+.5,pos.getY(i)+.5);
  return geometry;
}

export function createProducts(parent) {
  const loader=new THREE.TextureLoader();let resolveAtlas,rejectAtlas;
  const ready=new Promise((resolve,reject)=>{resolveAtlas=resolve;rejectAtlas=reject;});
  const atlas=loader.load(new URL('./assets/products-atlas-v1.png',import.meta.url).href,resolveAtlas,undefined,rejectAtlas);
  atlas.colorSpace=THREE.SRGBColorSpace;atlas.anisotropy=8;
  const print=new THREE.MeshStandardMaterial({map:atlas,color:0xffffff,roughness:.72,metalness:0});
  const trim=new THREE.MeshStandardMaterial({color:'#bac6c4',roughness:.33,metalness:.65});
  const cap=new THREE.MeshStandardMaterial({color:'#e9e3d2',roughness:.55});
  const nori=new THREE.MeshStandardMaterial({color:'#183c32',roughness:.88});
  const bread=new THREE.MeshStandardMaterial({color:'#ecddaf',roughness:.92});
  const filling=new THREE.MeshStandardMaterial({color:'#dfc86c',roughness:.85});
  const sharedBox=new THREE.BoxGeometry(1,1,1),round=new THREE.CylinderGeometry(.48,.48,1,12);
  const triangle=triangularPack();
  const shapes={
    box:new RoundedBoxGeometry(1,1,1,2,.035),
    bag:new RoundedBoxGeometry(1,1,1,3,.11),
    can:round, cup:new THREE.CylinderGeometry(.49,.36,1,14),
    carton:sharedBox,
    bottle:new THREE.LatheGeometry([[-.0,-.5],[.31,-.5],[.45,-.47],[.47,-.38],[.47,.18],[.42,.28],[.22,.38],[.19,.49]].map(([r,y])=>new THREE.Vector2(r,y)),16),
    rice:triangle,sandwich:triangle,
  };
  const skuGeometry=PRODUCT_CATALOG.map(p=>tileUV(shapes[p.shape].clone(),p.id));
  const priceCanvas=document.createElement('canvas');priceCanvas.width=1536;priceCanvas.height=704;
  const ctx=priceCanvas.getContext('2d');
  PRODUCT_CATALOG.forEach(p=>{
    const x=(p.id%4)*384,y=Math.floor(p.id/4)*176;
    ctx.fillStyle='#fff9e8';ctx.fillRect(x,y,384,176);
    ctx.fillStyle='#c65a38';ctx.fillRect(x,y,7,176);
    ctx.fillStyle='#284b40';ctx.font='700 31px "Microsoft YaHei",sans-serif';ctx.fillText(p.name,x+18,y+45);
    ctx.font='800 72px Arial,sans-serif';ctx.fillText(`¥${p.price}`,x+18,y+127);
    ctx.font='16px Arial,sans-serif';ctx.fillStyle='#718779';ctx.fillText('AME MART  /  TAX INCLUDED',x+19,y+158);
  });
  const priceAtlas=new THREE.CanvasTexture(priceCanvas);priceAtlas.colorSpace=THREE.SRGBColorSpace;priceAtlas.anisotropy=8;
  const tagMaterial=new THREE.MeshStandardMaterial({map:priceAtlas,roughness:.82});
  const tagGeometry=PRODUCT_CATALOG.map(p=>tileUV(new THREE.PlaneGeometry(1,1),p.id));
  const batches=new Map();const dummy=new THREE.Object3D();const local=new THREE.Object3D();
  const baseMatrix=new THREE.Matrix4();let count=0,tags=0;const stocked=new Set();
  function add(key,geometry,material,matrix,position=[0,0,0],scale=[1,1,1],rotation=0) {
    if(!batches.has(key))batches.set(key,{geometry,material,transforms:[]});
    local.position.fromArray(position);local.scale.fromArray(scale);local.rotation.set(0,rotation,0);local.updateMatrix();
    batches.get(key).transforms.push(new THREE.Matrix4().multiplyMatrices(matrix,local.matrix));
  }
  function place(id,x,baseY,z,yaw=0,size=1) {
    const p=PRODUCT_CATALOG[id];if(!p)throw new Error(`Unknown product ${id}`);
    const h=p.height*size,w=p.width*size,d=p.depth*size;
    dummy.position.set(x,baseY+h/2,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(w,h,d);dummy.updateMatrix();baseMatrix.copy(dummy.matrix);
    add(`sku-${id}`,skuGeometry[id],print,baseMatrix);
    if(p.shape==='bottle')add('bottle-caps',round,cap,baseMatrix,[0,.51,0],[.43,.10,.43]);
    if(p.shape==='can'||p.shape==='cup'){
      add('can-lids',round,trim,baseMatrix,[0,.495,0],[1.01,.035,1.01]);
      const bottom=p.shape==='cup'?.74:.94;
      add('can-bottoms',round,trim,baseMatrix,[0,-.49,0],[bottom,.025,bottom]);
      if(p.shape==='can')add('pull-tabs',sharedBox,trim,baseMatrix,[0,.522,.02],[.12,.012,.27]);
    }
    if(p.shape==='bag'){
      add('bag-seams',sharedBox,cap,baseMatrix,[0,.46,0],[.83,.018,.51]);
      add('bag-seams',sharedBox,cap,baseMatrix,[0,-.46,0],[.83,.018,.51]);
    }
    if(p.shape==='carton')add('carton-fold',triangle,cap,baseMatrix,[0,.48,0],[1,.20,1]);
    if(p.shape==='rice')add('seaweed-wrap',sharedBox,nori,baseMatrix,[0,-.23,.455],[.38,.49,.045]);
    if(p.shape==='sandwich'){
      add('bread-edges',triangle,bread,baseMatrix,[0,0,-.14],[1.02,1.02,.18]);
      add('sandwich-filling',triangle,filling,baseMatrix,[0,0,-.03],[.97,.97,.16]);
    }
    stocked.add(id);count++;
  }
  function priceTag(id,x,y,z,yaw=0,width=.23) {
    dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(width,.079,1);dummy.updateMatrix();
    add(`price-${id}`,tagGeometry[id],tagMaterial,dummy.matrix);tags++;
  }
  function finish() {
    for(const [key,batch] of batches){
      const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.transforms.length);
      mesh.name=`Store goods / ${key}`;mesh.castShadow=false;mesh.receiveShadow=true;
      batch.transforms.forEach((matrix,index)=>mesh.setMatrixAt(index,matrix));
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();parent.add(mesh);
    }
    return {units:count,varieties:stocked.size,priceTags:tags,batches:batches.size};
  }
  return {place,priceTag,finish,atlas,ready};
}
