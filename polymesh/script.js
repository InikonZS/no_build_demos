let rootNode = document.querySelector('#app-main');
let canvasElement = new Control(rootNode, 'canvas');
let canvas = canvasElement.node;
canvas.width=640;
canvas.height=480;
let ctx = canvas.getContext('2d');

let lines = [];
let grid = [];

let gsz = 50;
/*for (let i =0; i<30; i++){
  let line = [new Vector3d(i*gsz,0,0),new Vector3d(1+i*gsz,1000,0)];
  grid.push(line);
}

for (let i =0; i<30; i++){
  let line = [new Vector3d(0,i*gsz,0),new Vector3d(1000,1+i*gsz,0)];
  grid.push(line);
}

for (let i =-30; i<30; i++){
  let line = [new Vector3d(0,0+i*gsz,0),new Vector3d(1000,1000+i*gsz,0)];
  grid.push(line);
}*/
let tri =[];
for (let i =0; i<30; i++){
  for (let j =0; j<30; j++){
  tri.push([new Vector3d(i*gsz,j*gsz-1,0),new Vector3d((i+1)*gsz-1,j*gsz,0),new Vector3d((i+1)*gsz+1,(j+1)*gsz+1,0)]); 
  tri.push([new Vector3d(i*gsz-1,j*gsz-1,0),new Vector3d((i)*gsz+1,(j+1)*gsz+1,0),new Vector3d((i+1)*gsz,(j+1)*gsz,0)]); 
  }
}

//tri.push([new Vector3d(30,30,0),new Vector3d(100,33, 0),new Vector3d(36,200,0)]); 
//tri.push([new Vector3d(230,230,0),new Vector3d(300,233, 0),new Vector3d(236,400,0)]); 


  

  tri.forEach(it=>{
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(it[0].x, it[0].y);
    ctx.lineTo(it[1].x, it[1].y);
    ctx.lineTo(it[2].x, it[2].y);
    ctx.lineTo(it[0].x, it[0].y);
    ctx.stroke();  
  })

grid.forEach(it=>{
  ctx.beginPath();
  ctx.moveTo(it[0].x, it[0].y);
  ctx.lineTo(it[1].x, it[1].y);
  ctx.stroke();
});

let cv = new Vector3d(0,0,0);
let lv = new Vector3d(0,0,0);
canvas.addEventListener('mousedown',(e)=>{
  //console.log('dw');
  let b = canvas.getBoundingClientRect();
  cv.x=e.clientX-b.left;
  cv.y=e.clientY-b.top;
  lv=cv.add(0,0,0);
});

canvas.addEventListener('mousemove',(e)=>{
  let b = canvas.getBoundingClientRect();
  cv.x=e.clientX-b.left;
  cv.y=e.clientY-b.top;
});

canvas.addEventListener('mouseup',(e)=>{
  //console.log('mu');
  let b = canvas.getBoundingClientRect();
  cv.x=e.clientX-b.left;
  cv.y=e.clientY-b.top;
  if (cv.subVector(lv).abq()>1){
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(lv.x, lv.y);
    ctx.lineTo(cv.x, cv.y);
    ctx.stroke();


    let line = [lv.add(0,0,0), cv.add(0,0,0)];
    let e1 = getEquation(lv, cv);
    let normal = getNormal(lv,cv).mul(10).addVector(lv);

    ctx.beginPath();
    ctx.moveTo(lv.x, lv.y);
    ctx.lineTo(normal.x, normal.y);
    ctx.stroke();

    let rh =drawDist(ctx, lv, cv, 20);
    let lh =drawDist(ctx, lv, cv, -20);

    sectLineT(rh[0], rh[1], tri, -1);
  //  tri=tri.filter(it=>it)
    sectLineT(lh[0], lh[1], tri);
    tri=tri.filter(it=>!it.del)
    ctx.clearRect(0,0,1000,1000);
    triRender(ctx, tri);
  /*  console.log(e1.k, e1.b);
    grid.forEach(it=>{
      let e2 =getEquation(it[0], it[1]); 
      let nv = solveEquation(e1, e2);
      ctx.fillStyle='#0f0';
      //console.log(nv);
      let sz =3;
      if (onLine(it[0],it[1], nv)&& onLine(lv, cv, nv)){
        ctx.fillRect(nv.x-sz, nv.y-sz, sz*2, sz*2);
      }
    });*/

    
 /*   tri.forEach(it=>{
      
      let pol = divTriangle(lv,cv, it[0],it[1],it[2]); 
      if (pol){
        ctx.lineWidth=3;
        ctx.strokeStyle='#f00';
        console.log('tri');
        ctx.beginPath();
        ctx.moveTo(pol[pol.length-1].x, pol[pol.length-1].y);
        pol.forEach(jt=>{
          ctx.lineTo(jt.x, jt.y);
        })
        ctx.stroke();
        ctx.lineWidth=1;
      }
    });
*/
    lines.push(line);
  }
});


//k(v.x)-v.y = -b
//b=-kx

//kx+b = y
//kx = y-b
//kx-y = -b
//k1x+b1 - k2x- b2 = (k1-k2)x  + (b1-b2)=0
function triangulePoly(pol, tri){
  let fs = pol[0];
  for (let i=1; i<pol.length-1; i++){
    let tr=[fs, pol[i], pol[i+1]];
    tri.push(tr);
  }
}

function sectLine(lv, cv, tri, nx=1){
  tri.forEach(it=>{
      
    let pol = divTriangle(lv,cv, it[0],it[1],it[2], nx); 
    if (pol){
      ctx.lineWidth=3;
      ctx.strokeStyle='#f00';
      console.log('tri');
      ctx.beginPath();
      ctx.moveTo(pol[pol.length-1].x, pol[pol.length-1].y);
      pol.forEach(jt=>{
        ctx.lineTo(jt.x, jt.y);
      })
      ctx.stroke();
      ctx.lineWidth=1;
    }
  });
}

function triRender(ctx, tri){
  tri.forEach(it=>{
    if (it){
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(it[0].x, it[0].y);
      ctx.lineTo(it[1].x, it[1].y);
      ctx.lineTo(it[2].x, it[2].y);
      ctx.lineTo(it[0].x, it[0].y);
      ctx.stroke(); 
    } 
  })
}

function sectLineT(lv, cv, tri, nx=1){
  tri.forEach((it, i, arr)=>{
    let pol = divTriangle(lv,cv, it[0],it[1],it[2], nx); 
    if (pol){
      arr[i].del=true;
      triangulePoly(pol, tri);
    }
  });
  //tri=tri.filter(it=>!it)
}

function drawDist(ctx, lv, cv, dist){
  ctx.beginPath();
  let norm = getNormal(lv,cv).mul(dist);
  let dv = lv.addVector(norm);
  let gv = cv.addVector(norm);
  ctx.moveTo(dv.x, dv.y);
  ctx.lineTo(gv.x, gv.y);
  ctx.stroke();
  return [dv, gv];
}

function getEquation(v1, v2){
  let v = v2.subVector(v1);
  let k = v.y/v.x;
  let b = -(v1.x*k-v1.y);
  return {k, b}
}

function solveCutted(v1, v2, v3, v4){
  let e1 = getEquation(v1,v2);
  let e2 = getEquation(v3,v4);
  let nv = solveEquation(e1,e2);
  let res = false;
  if (onLine(v1,v2, nv)&& onLine(v3, v4, nv)){
    res = nv;
  }
  return res;
}

function getNormal(v1, v2, nx=1){
  let v = v2.subVector(v1);
  return new Vector3d(nx*v.y/v.x, -1*nx, 0).normalize();
  //return new Vector3d(-v.y/v.x, 1, 0).normalize();
}

function solveEquation(e1, e2){
  let cx = -(e1.b-e2.b)/ (e1.k-e2.k);
  let cy = cx*e2.k+e2.b;
  return new Vector3d(cx, cy, 0);
}

function isCrossPoly(v1,v2,pol){
  for (let i=0; i<pol.length-1; i++){
    if (solveCutted(v1,v2, pol[i], pol[i+1])){
      return true;
    };
  }
  if (solveCutted(v1,v2, pol[pol.length-1], pol[0])){
    return true;
  };
  return false;
}

function polMove(v, pol){
  return pol.map(it=>it.addVector(v));
}

function divTriangle(v1, v2, a, b, c, nx=1){
  let norm = getNormal(v2, v1, nx);

  let p1 = solveCutted(v1, v2, a, b);
  let p2 = solveCutted(v1, v2, b, c);
  let p3 = solveCutted(v1, v2, c, a);
  let pol;
  let pol1;
  console.log(p1,p2,p3);
  if (p1 && p2){
    pol = [a,p1,p2,c];
    pol1 = [p1,p2,b];
  }
  if (p2 && p3){
    pol = [a,b,p2,p3];
    pol1 = [p2,p3,c];
    
  }
  if (p3 && p1){
    pol = [p3,p1,b,c];
    pol1 = [p3,p1,a];
  }
  if (pol){
    if  (isCrossPoly(v1,v2,polMove(norm, pol))){
      return pol;
    } else {
      return pol1;
    }
  }
}