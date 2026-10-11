/*  Particle background for the homepage hero (usta.agency-style motion).
    The particles form a rocket, car + GPS pin, CCTV camera and responsive devices in step with
    the rotating hero words, bursting apart and re-forming at each word change.
    Needs three.js r128 loaded first.
    Markup: <section class="hero-section"><canvas class="hero-rocket-canvas"></canvas> ...content... </section>
    If WebGL is unavailable the hero keeps its original network background. */
(function(){
'use strict';
const canvas=document.querySelector('.hero-rocket-canvas');
if(!canvas||typeof THREE==='undefined')return;
const hero=canvas.closest('.hero-section')||canvas.parentElement;

let isMobile=innerWidth<=768;
const R=Math.random;
const PALETTE=['#f48c18','#4089dd','#33478B','#8A5894','#DE466E','#EC9354'].map(c=>new THREE.Color(c));

/* ---------------- procedural shapes, surface-sampled ---------------- */
const V3=THREE.Vector3;
// area-weighted random points over a list of {g: geometry, w: density}
function sampleParts(parts,count){
  const tris=[],cum=[];let total=0;
  parts.forEach(({g,w=1})=>{
    const geo=g.index?g.toNonIndexed():g,p=geo.attributes.position.array;
    for(let i=0;i<p.length;i+=9){
      const ax=p[i],ay=p[i+1],az=p[i+2],ux=p[i+3]-ax,uy=p[i+4]-ay,uz=p[i+5]-az,vx=p[i+6]-ax,vy=p[i+7]-ay,vz=p[i+8]-az;
      const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx,area=.5*Math.hypot(cx,cy,cz)*w;
      if(area<=0)continue;total+=area;tris.push([ax,ay,az,ux,uy,uz,vx,vy,vz]);cum.push(total);
    }
  });
  const out=new Float32Array(count*3);
  for(let n=0;n<count;n++){
    const r=R()*total;let lo=0,hi=cum.length-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(cum[mid]<r)lo=mid+1;else hi=mid;}
    const t=tris[lo];let u=R(),v=R();if(u+v>1){u=1-u;v=1-v;}
    out[n*3]=t[0]+t[3]*u+t[6]*v;out[n*3+1]=t[1]+t[4]*u+t[7]*v;out[n*3+2]=t[2]+t[5]*u+t[8]*v;
  }
  return out;
}

// Rocket built in model units (axis = +y, 1 unit = 0.011 scene units); profiles are [radius, height] pairs.
const lathe=(pts,seg=64)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);
function rocket(n){
  const body=lathe([[40,-375],[163,-375],[163,-360],[171,-345],[181,-315],[194,-285],[208,-240],[221,-195],[231,-150],[238,-90],[242,-45],[243,0],
    [242,45],[238,90],[233,150],[225,195],[215,240],[203,285],[190,330],[179,360],[170,375],[160,390],[148,392]]);
  const nose=lathe([[159,375],[163,390],[159,405],[143,435],[122,465],[100,495],[78,510],[59,525],[43,540],[22,552],[0,556]]);
  const engine=lathe([[0,-375],[149,-345],[139,-375],[128,-405],[116,-435],[106,-450],[102,-465],[60,-465],[60,-390],[0,-390]]);
  // porthole on the +z side at height 136: domed glass + deep frame
  const glassR=144,glass=new THREE.SphereGeometry(glassR,32,12,0,Math.PI*2,0,Math.asin(88/glassR));
  glass.rotateX(Math.PI/2);glass.translate(0,136,255-glassR);
  const frame=new THREE.CylinderGeometry(112,112,80,48,1,true);frame.rotateX(Math.PI/2);frame.translate(0,136,215);
  const frameLip=new THREE.RingGeometry(78,112,48);frameLip.translate(0,136,255);
  // swept legs on the four diagonals, 20 units thick
  const legShape=new THREE.Shape([[235,-85],[250,-120],[264,-160],[269,-200],[272,-260],[270,-300],[264,-340],[254,-380],[240,-405],[232,-427],
    [215,-427],[195,-405],[165,-375],[170,-345],[190,-290],[212,-230],[228,-170],[236,-110],[232,-85]].map(([d,y])=>new THREE.Vector2(d,y)));
  const legs=[0,1,2,3].map(k=>{const g=new THREE.ExtrudeGeometry(legShape,{depth:20,bevelEnabled:false});g.translate(0,0,-10);g.rotateY(Math.PI/4+k*Math.PI/2);return g;});
  // body takes what is left, every other part gets an equal share (so small parts read dense)
  const parts=[body,glass,mergeGeos([frame,frameLip]),engine,nose,...legs],share=Math.floor(.7*n/(parts.length-1));
  const out=new Float32Array(n*3);let at=0;
  parts.forEach((g,i)=>{const c=i===0?n-share*(parts.length-1):share;out.set(sampleParts([{g}],c),at*3);at+=c;});
  // model space -> scene: scale, lay the axis on z, then the reference orientation (applied as successive turns)
  const m=new THREE.Matrix4().makeRotationZ(-Math.PI*.75)
    .multiply(new THREE.Matrix4().makeRotationY(Math.PI*.85))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI*.5))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI*.5))
    .multiply(new THREE.Matrix4().makeScale(.011,.011,.011));
  const v=new V3();
  for(let i=0;i<out.length;i+=3){v.set(out[i],out[i+1],out[i+2]).applyMatrix4(m);out[i]=v.x;out[i+1]=v.y;out[i+2]=v.z;}
  return out;
}
function mergeGeos(list){
  const arrs=list.map(g=>(g.index?g.toNonIndexed():g).attributes.position.array),len=arrs.reduce((s,a)=>s+a.length,0),pos=new Float32Array(len);
  let o=0;arrs.forEach(a=>{pos.set(a,o);o+=a.length;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));return g;
}

/* ---- shapes for the other hero words (same look: each part gets a fixed share of particles) ---- */
function limb(a,b,r,seg=16){
  const A=new V3(...a),B=new V3(...b),d=B.clone().sub(A),len=d.length();
  const g=new THREE.CylinderGeometry(r,r,len,seg,1,true);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize())));
  const mid=A.add(B).multiplyScalar(.5);g.translate(mid.x,mid.y,mid.z);return g;
}
// parts: [[geometry, share], ...]; the first part also takes any rounding remainder
function byShares(parts,n){
  const counts=parts.map(([,s])=>Math.floor(s*n));counts[0]+=n-counts.reduce((a,b)=>a+b,0);
  const out=new Float32Array(n*3);let at=0;
  parts.forEach(([g],i)=>{out.set(sampleParts([{g}],counts[i]),at*3);at+=counts[i];});
  return out;
}
// centre on the bounding box, fit the largest side to `size`, then turn by [x,y,z]
function fit(arr,size,rot){
  const min=[1e9,1e9,1e9],max=[-1e9,-1e9,-1e9];
  for(let i=0;i<arr.length;i+=3)for(let k=0;k<3;k++){min[k]=Math.min(min[k],arr[i+k]);max[k]=Math.max(max[k],arr[i+k]);}
  const s=size/Math.max(max[0]-min[0],max[1]-min[1],max[2]-min[2]),c=[0,1,2].map(k=>(min[k]+max[k])/2);
  const m=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)),v=new V3();
  for(let i=0;i<arr.length;i+=3){v.set((arr[i]-c[0])*s,(arr[i+1]-c[1])*s,(arr[i+2]-c[2])*s).applyMatrix4(m);arr[i]=v.x;arr[i+1]=v.y;arr[i+2]=v.z;}
  return arr;
}

// thin tube along a 2D outline placed at depth z: gives shapes crisp, dense edges
function outline(pts,z,r=.035,closed=true){
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p.x,p.y,z)),closed,'centripetal');
  return new THREE.TubeGeometry(curve,Math.max(64,pts.length*4),r,6,closed);
}
const v2=list=>list.map(([x,y])=>new THREE.Vector2(x,y));

// Vehicle Tracking: holographic location pin (matching the reference icon) over a GPS fix -
// round head (r=1.86) with a centred round hole (r=0.93), straight tangent sides to a softly rounded tip.
// Proportions measured from the 512px icon: head r 186, hole r 93, tip 310 below the head centre.
function vehicle(n){
  const R=1.86,D=3.1,HOLE=.93;
  const ty=-R*R/D,tx=R*Math.sqrt(1-(R/D)*(R/D));            // where the straight sides touch the head
  const a0=Math.atan2(ty,tx),a1=Math.PI-a0;                    // right / left tangent angles
  const pin=new THREE.Shape();
  pin.moveTo(tx,ty);
  pin.absarc(0,0,R,a0,a1,false);                               // over the top
  pin.lineTo(-.12,-D+.16);                                      // left side down to the tip
  pin.quadraticCurveTo(0,-D-.02,.12,-D+.16);                    // rounded tip
  pin.lineTo(tx,ty);
  const hole=new THREE.Path();hole.absarc(0,0,HOLE,0,Math.PI*2,true);
  pin.holes.push(hole);
  const DEPTH=.8;
  const body=new THREE.ExtrudeGeometry(pin,{depth:DEPTH,bevelEnabled:true,bevelThickness:.14,bevelSize:.1,bevelSegments:4,curveSegments:64});
  body.translate(0,0,-DEPTH/2);
  const Z=DEPTH/2+.14;
  const rim=pin.getPoints(48),holePts=hole.getPoints(48);
  // hologram look: thin crisp edge lines (front, middle, back) with a light fill between them
  const outerEdges=mergeGeos([outline(rim,Z,.035),outline(rim,0,.025),outline(rim,-Z,.035)]);
  const holeEdges=mergeGeos([outline(holePts,Z,.035),outline(holePts,-Z,.035)]);
  // GPS fix under the floating tip: one thin ring + small target dot
  const G=-D-.45;
  const ring=new THREE.TorusGeometry(1.15,.025,6,96);ring.rotateX(Math.PI/2);ring.translate(0,G,0);
  const dot=new THREE.CircleGeometry(.16,32);dot.rotateX(-Math.PI/2);dot.translate(0,G,0);
  return fit(byShares([[body,.34],[outerEdges,.38],[holeEdges,.18],[ring,.07],[dot,.03]],n),7.6,[.32,-.3,0]);
}

// Surveillance: dome CCTV camera matching the reference icon (hologram style), with a detection-box overlay.
// Measured on the 512px icon (centre 256,255; 100px = 1 unit): mount bar y 55-150, dome = circle r200
// cut flat at y165, lens rings r115 / r62 centred 35px below the dome centre.
function cctv(n){
  const circle=(cx,cy,r)=>{const p=new THREE.Path();p.absarc(cx,cy,r,0,Math.PI*2,true);return p;};
  const rrect=(x0,y0,x1,y1,r)=>{const s=new THREE.Shape();s.moveTo(x0+r,y0);s.lineTo(x1-r,y0);s.quadraticCurveTo(x1,y0,x1,y0+r);s.lineTo(x1,y1-r);s.quadraticCurveTo(x1,y1,x1-r,y1);s.lineTo(x0+r,y1);s.quadraticCurveTo(x0,y1,x0,y1-r);s.lineTo(x0,y0+r);s.quadraticCurveTo(x0,y0,x0+r,y0);return s;};
  const DEPTH=.7,Z=DEPTH/2+.1;
  const ext=sh=>{const g=new THREE.ExtrudeGeometry(sh,{depth:DEPTH,bevelEnabled:true,bevelThickness:.1,bevelSize:.07,bevelSegments:3,curveSegments:48});g.translate(0,0,-DEPTH/2);return g;};

  // mount bar with the slot and dot cut out
  const mount=rrect(-2.32,1.05,2.32,2.0,.12);
  const slot=new THREE.Path();slot.moveTo(-2.1,1.47);slot.lineTo(-1.27,1.47);slot.absarc(-1.27,1.525,.055,-Math.PI/2,Math.PI/2,false);slot.lineTo(-2.1,1.58);slot.absarc(-2.1,1.525,.055,Math.PI/2,Math.PI*1.5,false);
  mount.holes.push(slot,circle(-.96,1.525,.07));

  // dome: circle r2 cut flat at y=.9
  const R=2,cut=.9,a=Math.asin(cut/R);
  const dome=new THREE.Shape();dome.moveTo(R*Math.cos(a),cut);dome.absarc(0,0,R,a,Math.PI-a-Math.PI*2,true);dome.lineTo(R*Math.cos(a),cut);

  // lens: raised disc + outer ring + inner ring + glint
  const LY=-.35,LZ=Z+.2;
  const lensBody=new THREE.CylinderGeometry(1.15,1.15,.2,64,1,true);lensBody.rotateX(Math.PI/2);lensBody.translate(0,LY,Z+.1);
  const lensFace=new THREE.CircleGeometry(1.15,64);lensFace.translate(0,LY,LZ);
  const ringPts=(r,y)=>circle(0,y,r).getPoints(64);
  const lensRings=mergeGeos([outline(ringPts(1.15,LY),LZ,.045),outline(ringPts(1.03,LY),LZ,.03),outline(ringPts(.62,LY),LZ+.02,.045),outline(ringPts(.5,LY),LZ+.02,.03)]);
  const glintPath=new THREE.Path();glintPath.absarc(0,LY,.3,Math.PI*.6,Math.PI*1.05,false);
  const glint=outline(glintPath.getPoints(16),LZ+.04,.04,false);

  // dome highlight arc on the left + the two small dots
  const hl=new THREE.Path();hl.absarc(0,0,1.78,Math.PI*1.02,Math.PI*1.2,false);
  const highlight=outline(hl.getPoints(20),Z,.045,false);
  const dots=mergeGeos([(()=>{const g=new THREE.CircleGeometry(.07,16);g.translate(-1.76,.33,Z);return g;})(),(()=>{const g=new THREE.CircleGeometry(.07,16);g.translate(1.04,.65,Z);return g;})()]);

  // hologram edges: front / back outlines of mount and dome, plus the cut-outs
  const edge=(sh,z,r)=>outline(sh.getPoints(48),z,r);
  const edges=mergeGeos([edge(mount,Z,.035),edge(mount,-Z,.035),edge(dome,Z,.035),edge(dome,-Z,.035),outline(slot.getPoints(24),Z,.03),outline(circle(-.96,1.525,.07).getPoints(16),Z,.03)]);

  // futuristic overlay: detection-box corner brackets floating in front of the lens + reticle ticks
  const BZ=LZ+.35,BX=2.35,BY=1.28,L=.5,bw=.032;   // box frames the dome, just below the mount
  const brackets=mergeGeos([[-1,1],[1,1],[1,-1],[-1,-1]].map(function(c){
    const x=c[0]*BX,y=LY+c[1]*BY;
    return mergeGeos([limb([x,y,BZ],[x-c[0]*L,y,BZ],bw,6),limb([x,y,BZ],[x,y-c[1]*L,BZ],bw,6)]);
  }));
  const ticks=mergeGeos([0,1,2,3].map(function(k){const a=k*Math.PI/2;return limb([Math.cos(a)*1.2,LY+Math.sin(a)*1.2,LZ+.02],[Math.cos(a)*1.38,LY+Math.sin(a)*1.38,LZ+.02],.03,6);}));

  return fit(byShares([
    [ext(mount),.11],[ext(dome),.17],[lensBody,.04],[lensFace,.05],
    [edges,.23],[lensRings,.19],[glint,.03],[highlight,.05],[dots,.03],[brackets,.07],[ticks,.03]
  ],n),7.4,[.12,-.32,0]);
}

// Branding: responsive devices (monitor, tablet, phone) matching the reference icon, hologram style.
// Measured on the 512px icon (centre 256,256; 100px = 1 unit). The devices are layered in depth
// (monitor at the back, phone at the front) so the group reads as 3D when it sways.
function devices(n){
  // rounded rect from (x0,y0) bottom-left to (x1,y1) top-right; P = THREE.Shape or THREE.Path
  const rr=(P,x0,y0,x1,y1,r)=>{const s=new P();s.moveTo(x0+r,y0);s.lineTo(x1-r,y0);s.quadraticCurveTo(x1,y0,x1,y0+r);s.lineTo(x1,y1-r);s.quadraticCurveTo(x1,y1,x1-r,y1);s.lineTo(x0+r,y1);s.quadraticCurveTo(x0,y1,x0,y1-r);s.lineTo(x0,y0+r);s.quadraticCurveTo(x0,y0,x0+r,y0);return s;};
  const DEPTH=.22,BEV=.05;
  // device body = bezel with the screen cut out; returns the solid, its crisp edges and the screen-front depth
  function device(o,i,r,z){
    const s=rr(THREE.Shape,...o,r),hole=rr(THREE.Path,...i,r*.5);s.holes.push(hole);
    const g=new THREE.ExtrudeGeometry(s,{depth:DEPTH,bevelEnabled:true,bevelThickness:BEV,bevelSize:.04,bevelSegments:2,curveSegments:16});
    g.translate(0,0,z-DEPTH/2);
    const front=z+DEPTH/2+BEV,back=z-DEPTH/2-BEV,outer=s.getPoints(16),inner=hole.getPoints(16);
    const edges=mergeGeos([outline(outer,front,.035),outline(outer,back,.035),outline(inner,front,.028)]);
    return {g,edges,front};
  }
  // filled screen element (bar / card) with an outline so it stays crisp
  const tile=(x0,y0,x1,y1,r,z)=>{const s=rr(THREE.Shape,x0,y0,x1,y1,r),g=new THREE.ShapeGeometry(s,8);g.translate(0,0,z);return mergeGeos([g,outline(s.getPoints(8),z+.01,.025)]);};
  const dashes=(y,xs,z)=>mergeGeos(xs.map(x=>limb([x,y,z],[x+.12,y,z],.035,6)));
  // 4-point sparkle
  const star=(cx,cy,s,z)=>{const pts=[];for(let k=0;k<8;k++){const a=Math.PI/2+k*Math.PI/4,d=k%2?s*.28:s;pts.push(new THREE.Vector2(cx+Math.cos(a)*d,cy+Math.sin(a)*d));}
    const sh=new THREE.Shape(pts),g=new THREE.ShapeGeometry(sh);g.translate(0,0,z);return mergeGeos([g,outline(pts,z,.02)]);};
  const dot=(cx,cy,r,z)=>{const g=new THREE.CircleGeometry(r,20);g.translate(cx,cy,z);return g;};

  const mon=device([-2.46,-1.32,2.02,1.86],[-2.30,-.84,1.86,1.68],.24,0);
  const tab=device([-.42,-2.30,1.92,.96],[-.26,-2.14,1.76,.80],.24,.5);
  const pho=device([1.08,-2.30,2.50,.06],[1.22,-2.16,2.36,-.08],.22,1);
  const stand=mergeGeos([
    new THREE.ExtrudeGeometry(rr(THREE.Shape,-.80,-1.86,-.56,-1.32,.02),{depth:.14,bevelEnabled:false}),
    new THREE.ExtrudeGeometry(rr(THREE.Shape,-1.20,-2.10,.08,-1.86,.12),{depth:.18,bevelEnabled:false})
  ]);stand.translate(0,0,-.2);

  const mf=mon.front,tf=tab.front,pf=pho.front;
  const monScreen=mergeGeos([tile(-2.28,1.48,1.84,1.64,.03,mf),dashes(1.2,[-1.94,-1.60,-1.26],mf),
    tile(-2.08,-.70,-1.28,.28,.08,mf),tile(-1.08,-.70,-.28,.28,.08,mf)]);
  const tabScreen=mergeGeos([dashes(.51,[-.08,.26,.62],tf),
    tile(.04,-.46,1.28,-.02,.08,tf),tile(.04,-1.14,1.28,-.70,.08,tf),tile(.04,-1.82,1.28,-1.38,.08,tf)]);
  const phoScreen=mergeGeos([tile(1.56,-.22,2.02,-.08,.06,pf),limb([1.98,-.46,pf],[2.10,-.46,pf],.03,6),
    tile(1.44,-.98,2.16,-.72,.06,pf),tile(1.44,-1.42,2.16,-1.16,.06,pf),tile(1.44,-1.86,2.16,-1.60,.06,pf)]);
  const sparkles=mergeGeos([star(.10,2.22,.2,.4),star(2.40,.98,.2,.6),dot(-.39,2.14,.07,.4),dot(2.27,.62,.07,.6),dot(-2.07,-1.82,.07,.4),
    limb([-1.55,-1.80,.4],[-1.55,-2.12,.4],.04,6),limb([-1.71,-1.96,.4],[-1.39,-1.96,.4],.04,6)]);

  return fit(byShares([
    [mon.g,.15],[tab.g,.11],[pho.g,.08],[stand,.04],
    [mergeGeos([mon.edges,tab.edges,pho.edges]),.26],
    [monScreen,.13],[tabScreen,.11],[phoScreen,.08],[sparkles,.04]
  ],n),7.8,[.16,-.38,0]);
}

/* ---------------- shaders ---------------- */
const VERT=`
attribute float opacity;
attribute float scale;
attribute vec3 position2;
attribute vec3 position3;
attribute vec3 position4;
attribute float delay;
uniform float uTime;
uniform vec2 uCursor;
uniform vec4 uFrom;   // one-hot: which shape we are leaving
uniform vec4 uTo;     // one-hot: which shape we are forming
uniform float uMorph; // 0..1 progress between them
varying float vOpacity;
varying float vScale;
varying vec3 vPos;
varying float vWave;
void main(){
  vec3 a=position*uFrom.x+position2*uFrom.y+position3*uFrom.z+position4*uFrom.w;
  vec3 b=position*uTo.x+position2*uTo.y+position3*uTo.z+position4*uTo.w;

  // each particle starts a little later than the last, so the shape flows apart instead of popping
  float m=clamp((uMorph-delay*.3)/.7,0.,1.);
  float e=m*m*m*(m*(m*6.-15.)+10.);
  vec3 p=mix(a,b,e);

  // soft burst + gentle swirl mid-transition, then the particles settle into the next shape
  float wave=sin(m*3.14159);
  wave*=wave;
  vWave=wave;
  float ang=wave*.9,cs=cos(ang),sn=sin(ang);
  p.xz=mat2(cs,-sn,sn,cs)*p.xz;
  vec4 world=modelMatrix*vec4(p*(1.+wave*1.6),1.);
  world.xyz+=normalize(normal)*wave*2.5*scale;

  // idle drift
  float seed=scale*10.,sgn=scale*2.-1.,amp=(.15+wave*.2)*sgn;
  world.x+=sin(uTime*scale+seed)*amp;
  world.y+=cos(uTime*scale+seed)*amp;

  // cursor push
  vec2 d=world.xy-uCursor;
  float near=1.-smoothstep(0.,4.,length(d));
  world.xyz+=normalize(vec3(d,1.))*near*(.5+wave);

  gl_Position=projectionMatrix*viewMatrix*world;
  vOpacity=opacity;vScale=scale;vPos=world.xyz;
  float size=clamp(6.*scale,2.,6.);
  gl_PointSize=2.5*(size+(sin(uTime*5.+seed)*.5+.5)*1.9*sgn-1.5*wave*sgn)+near*12.;
}`;
const FRAG=`
uniform float uOpacity;
uniform float uIntro;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vOpacity;
varying float vScale;
varying vec3 vPos;
varying float vWave;
float m289(float x){return x-floor(x*(1./289.))*289.;}
vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 prm(vec4 x){return m289(((x*34.)+1.)*x);}
float noise(vec3 p){
  vec3 a=floor(p),d=p-a;d=d*d*(3.-2.*d);
  vec4 b=a.xxyy+vec4(0.,1.,0.,1.);
  vec4 k1=prm(b.xyxy),k2=prm(k1.xyxy+b.zzww);
  vec4 c=k2+a.zzzz,k3=prm(c),k4=prm(c+1.);
  vec4 o1=fract(k3*(1./41.)),o2=fract(k4*(1./41.));
  vec4 o3=o2*d.z+o1*(1.-d.z);
  vec2 o4=o3.yw*d.x+o3.xz*(1.-d.x);
  return o4.y*d.y+o4.x*(1.-d.y);
}
void main(){
  float disc=smoothstep(.7,.8,1.-distance(gl_PointCoord,vec2(.5))*2.);
  float t=noise((vPos+uTime*.5)*.5)*2.-.5;
  vec3 col=mix(uColorB,uColorA,t);
  gl_FragColor=vec4(disc*col,vScale*vOpacity*uIntro);
  gl_FragColor.a*=(1.-smoothstep(1.,-3.,vPos.z)*.8)*(1.-vWave*.3);
  gl_FragColor.a*=uOpacity;
}`;
// dotted grain shown wherever the image is dark
const POST_FRAG=`
uniform sampler2D tDiffuse;
uniform float uTime,uIntro,uSize,dpr;
uniform vec2 uResolution;
varying vec2 vUv;
float rnd(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453123);}
void main(){
  vec2 st=gl_FragCoord.xy/uResolution;
  float aspect=uResolution.y/uResolution.x;
  st.y*=aspect;
  vec2 sti=st;
  vec4 color=texture2D(tDiffuse,vUv);
  st*=uSize;
  vec2 cell=floor(st);
  vec3 dotc=vec3(1.-smoothstep(.1,.3,length(cell+.5-st)));
  dotc*=1./(dpr*dpr);
  dotc*=rnd(cell*uTime);
  float lum=max(color.r,color.g);
  vec2 center=vec2(.5,.5*aspect)*dpr;
  gl_FragColor.rgb=mix(color.rgb,dotc*.15*(dpr*dpr-length(center-sti))*uIntro,1.-smoothstep(0.,.2,lum));
  gl_FragColor.a=1.;
}`;

// objects sit toward the right of the hero (clear of the text), but never past the right edge:
// visible half-width at the resting camera distance (z 12, fov 60) minus the shape's half-size
function shipX(){
  if(isMobile)return 1.5;
  const halfW=12*Math.tan(Math.PI/6)*(size.w/size.h);
  return Math.max(3,Math.min(6.5,halfW-4.4));
}

/* ---------------- scene ---------------- */
const shared={
  uOpacity:{value:isMobile?.5:1},uIntro:{value:0},uTime:{value:0},
  uCursor:{value:new THREE.Vector2()},uColorA:{value:PALETTE[0]},uColorB:{value:PALETTE[1]},
  uFrom:{value:new THREE.Vector4(1,0,0,0)},uTo:{value:new THREE.Vector4(1,0,0,0)},uMorph:{value:0}
};
const scene=new THREE.Scene();
const size={w:1,h:1};
const camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,0,60);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:devicePixelRatio<2});}catch(e){canvas.style.display='none';return;}
renderer.setClearColor(0x000000,1);

const rtType=renderer.capabilities.isWebGL2?THREE.HalfFloatType:THREE.UnsignedByteType;
const rt=new THREE.WebGLRenderTarget(1,1,{type:rtType});
const post=new THREE.ShaderMaterial({
  uniforms:{tDiffuse:{value:rt.texture},uTime:{value:0},uIntro:{value:0},uResolution:{value:new THREE.Vector2(1,1)},uSize:{value:300},dpr:{value:Math.min(devicePixelRatio,2)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:POST_FRAG,depthTest:false,depthWrite:false
});
const postScene=new THREE.Scene(),postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),post));

// shapes: [position, position2, position3, position4] (pass the same array 4x for a static cloud)
function makePoints(shapes,scaleMax,uniforms){
  const n=shapes[0].length/3,g=new THREE.BufferGeometry(),nrm=new Float32Array(n*3),v=new V3();
  ['position','position2','position3','position4'].forEach((k,i)=>g.setAttribute(k,new THREE.BufferAttribute(shapes[i],3)));
  for(let i=0;i<n;i++){v.set(R()*2-1,R()*2-1,R()*2-1);if(!v.lengthSq())v.set(0,1,0);v.normalize();nrm.set([v.x,v.y,v.z],i*3);}
  g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
  g.setAttribute('opacity',new THREE.BufferAttribute(new Float32Array(n).fill(1),1));
  g.setAttribute('delay',new THREE.BufferAttribute(Float32Array.from({length:n},R),1));
  g.setAttribute('scale',new THREE.BufferAttribute(Float32Array.from({length:n},()=>R()*scaleMax),1));
  return new THREE.Points(g,new THREE.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,transparent:true}));
}

// ambient dust (never morphs, so it gets its own morph uniforms)
const dustPos=Float32Array.from({length:700*3},()=>R()*20-10);
const dust=makePoints([dustPos,dustPos,dustPos,dustPos],2,{...shared,uFrom:{value:new THREE.Vector4(1,0,0,0)},uTo:{value:new THREE.Vector4(1,0,0,0)},uMorph:{value:0}});
scene.add(dust);

// invisible plane the cursor ray hits (z = 1)
const CURSOR_Z=1;
const cursorPlane=new THREE.Plane(new V3(0,0,1),-CURSOR_Z);
const raycaster=new THREE.Raycaster(),hit=new V3();
const mouse=new THREE.Vector2(-.85,-.45);

// soft disc that trails the cursor (desktop)
let glow=null;
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.7,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);
}
if(!isMobile){glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),transparent:true,opacity:.15}));glow.scale.setScalar(0);scene.add(glow);}

let ship=null;
function buildRocket(){
  const n=innerWidth>768?30000:15000;
  // the rocket is shown first, so build only it now (fast first frame); the other three shapes are
  // only needed at the first word change, so they are filled in right after the first frames
  const first=rocket(n);
  ship=makePoints([first,first.slice(),first.slice(),first.slice()],1,shared);
  ship.position.set(shipX(),0,0);
  scene.add(ship);
  // same order as the rotating hero words: Smart Technology, Vehicle Tracking, Surveillance, Branding
  const later=[['position2',vehicle],['position3',cctv],['position4',devices]];
  const idle=window.requestIdleCallback||function(cb){return setTimeout(cb,60);};
  (function next(){
    const job=later.shift();if(!job)return;
    idle(function(){
      const attr=ship.geometry.getAttribute(job[0]);
      attr.array.set(job[1](n));attr.needsUpdate=true;
      next();
    },{timeout:400});
  })();
}

function resize(){
  isMobile=innerWidth<=768;size.w=hero.clientWidth||innerWidth;size.h=hero.clientHeight||innerHeight;
  camera.aspect=size.w/size.h;camera.updateProjectionMatrix();
  const dpr=Math.min(devicePixelRatio,2);
  renderer.setPixelRatio(dpr);renderer.setSize(size.w,size.h,false);
  rt.setSize(Math.floor(size.w*dpr),Math.floor(size.h*dpr));
  post.uniforms.uResolution.value.set(size.w,size.h);post.uniforms.dpr.value=dpr;
  post.uniforms.uSize.value=size.w<540?40:size.w<768?80:size.w<1020?120:size.w<1400?200:300;
  if(ship)ship.position.x=shipX();
}
addEventListener('resize',resize);if(window.ResizeObserver)new ResizeObserver(resize).observe(hero);resize();


hero.classList.add('has-rocket-animation');

/* ---------------- cursor (desktop, inside the hero only) ---------------- */
const fineHover=matchMedia('(hover: hover) and (pointer: fine)').matches;
const cursorEl=fineHover?document.createElement('div'):null;
if(cursorEl){cursorEl.className='hero-rocket-cursor';cursorEl.setAttribute('aria-hidden','true');hero.appendChild(cursorEl);}
let cursorTarget=16,cursorW=16,glowTarget=0,overHero=false;
hero.addEventListener('mouseenter',()=>{overHero=true;glowTarget=1;});
hero.addEventListener('mouseleave',()=>{overHero=false;glowTarget=0;});
hero.addEventListener('mousemove',e=>{
  const r=hero.getBoundingClientRect();
  mouse.x=2*(e.clientX-r.left)/r.width-1;mouse.y=-2*(e.clientY-r.top)/r.height+1;
  if(cursorEl){cursorEl.style.left=e.clientX+'px';cursorEl.style.top=e.clientY+'px';}
});
hero.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursorTarget=parseFloat(el.dataset.cursor)||100;glowTarget=0;});
  el.addEventListener('mouseleave',()=>{cursorTarget=16;glowTarget=overHero?1:0;});
});

/* ---------------- intro: fade the particles in while the camera flies in ---------------- */
const introStart=performance.now()/1000;
const easeOut4=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),4);
function intro(now){
  const s=now-introStart;
  // quick entrance: particles fade in and the camera flies in together, settled in ~1.6s
  shared.uIntro.value=post.uniforms.uIntro.value=easeOut4(s/1.2);
  camera.position.z=60-48*easeOut4(s/1.6);
}

/* ---------------- shape follows the rotating hero word ----------------
   The words cycle with a CSS animation (heroWordCycle); we read its clock so the
   burst-and-reform always lands on the word change, even after the tab was hidden. */
const firstWord=hero.querySelector('.hero-rotator > span');
const SHAPES=4,HOT=[new THREE.Vector4(1,0,0,0),new THREE.Vector4(0,1,0,0),new THREE.Vector4(0,0,1,0),new THREE.Vector4(0,0,0,1)];
function wordClock(){
  if(!firstWord||!firstWord.getAnimations)return null;
  const a=firstWord.getAnimations()[0],dur=parseFloat(getComputedStyle(firstWord).animationDuration);
  if(!a||a.currentTime==null||!(dur>=1))return null; // reduced motion: words don't rotate
  return {time:a.currentTime/1000,dur};
}
function syncShape(){
  const c=wordClock();let from=0,to=0,f=0;
  if(c){
    // each word holds for dur/4 and swaps ~90% into its slot; a half-slot morph centred on that swap
    const slot=c.dur/SHAPES,start=slot*.65,len=slot*.5;
    const q=((c.time-start)%c.dur+c.dur)%c.dur,k=Math.floor(q/slot),local=q-k*slot;
    if(local<len){from=k;to=(k+1)%SHAPES;f=local/len;}else{from=to=(k+1)%SHAPES;}
  }
  shared.uFrom.value.copy(HOT[from]);shared.uTo.value.copy(HOT[to]);shared.uMorph.value=f;
}

/* ---------------- render loop (paused while the hero is off-screen) ---------------- */
const clock=new THREE.Clock();let last=0,raf=0,visible=true;
const lerp=(a,b,t)=>a+(b-a)*Math.min(1,t);
function frame(){
  const t=clock.getElapsedTime(),dt=Math.min(.1,t-last);last=t;
  intro(performance.now()/1000);
  syncShape();
  shared.uTime.value=t;post.uniforms.uTime.value=t;
  camera.lookAt(0,0,0);
  renderer.setRenderTarget(rt);renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(postScene,postCam);

  raycaster.setFromCamera(mouse,camera);
  const p=raycaster.ray.intersectPlane(cursorPlane,hit)?hit:new V3();
  if(glow){glow.scale.setScalar(lerp(glow.scale.x,glowTarget,dt*10));glow.position.lerp(new V3(p.x,p.y,CURSOR_Z),Math.min(1,dt*6));}
  camera.position.x=lerp(camera.position.x,mouse.x*4,dt*4);
  camera.position.y=lerp(camera.position.y,mouse.y*4,dt*4);
  shared.uCursor.value.lerp(new THREE.Vector2(p.x,p.y),Math.min(1,dt*4));
  if(cursorEl){cursorW=lerp(cursorW,cursorTarget,dt*10);cursorEl.style.width=cursorW+'px';}
  if(ship){ship.rotation.y=Math.sin(t*.5)*.15;ship.rotation.z=Math.sin(-t*.5)*.15;}
  raf=visible?requestAnimationFrame(frame):0;
}
if(window.IntersectionObserver)new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(frame);}).observe(hero);
buildRocket();
raf=requestAnimationFrame(frame);
})();
