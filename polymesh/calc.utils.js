//const Vector3d = require('./vector3d.dev.js');

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

function rand(lim){
  return Math.trunc(Math.random()*lim);
}

function makeCameraMatrix1(aspect, rx, ry, rz, px, py, pz){
  let matrix = m4.perspective(1, aspect, 0.1, 2000); 
  matrix = m4.xRotate(matrix, ry);
  matrix = m4.yRotate(matrix, rz);
  matrix = m4.zRotate(matrix, rx);
  matrix = m4.scale(matrix, 1, 1, 1);
  matrix = m4.translate(matrix, px, py, pz);
  return matrix;
}

function makeCameraMatrix(aspect, mv){
  let matrix = m4.perspective(1, aspect, 0.1, 2000); 
  return m4.multiply(matrix, mv);
}

function getNormal(u, v, w){
  let nv = {x: v.x-u.x, y: v.y-u.y, z: v.z-u.z}  
  let nw = {x: w.x-u.x, y: w.y-u.y, z: w.z-u.z}  
  let n = {x: nv.y*nw.z - nv.z*nw.y, y: nv.z * nw.x - nv.x * nw.z, z: nv.x * nw.y - nv.y * nw.x}
  let d = Math.hypot(n.x, n.y, n.z);
  return {x: n.x/d, y: n.y/d, z: n.z/d}
}

function getValueD(v, n){
  let d = -(v.x*n.x + v.y*n.y + v.z*n.z);
  return d;
}

function solveLinear(v1, v2, u, v, w){
  let n = getNormal (u, v, w);
  let d = getValueD(u, n);
  let nv = {x: v1.x-v2.x, y: v1.y-v2.y, z: v1.z-v2.z};
  let h = (n.x*v1.x + n.y*v1.y + n.z*v1.z +d) / (-(n.x*nv.x + n.y*nv.y + n.z*nv.z));
  return {x: v1.x + h*nv.x, y: v1.y + h*nv.y, z: v1.z + h*nv.z}
}

function getMatrixProduct(m1, m2) {
  const res = [];
  const resl = m1.length;
  for (let i = 0; i < m1.length; i += 1) {
    const rw = [];
    for (let j = 0; j < m2[0].length; j += 1) {
      let rws = 0;
      for (let k = 0; k < m2.length; k += 1) {
        rws += m1[i][k] * m2[k][j];
      }
      rw.push(rws);
    }
    res.push(rw);
  }
  return res;
}

function vecMul(a, b){
  let vm = (a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
  return vm;
}

function inTriangle(a, b, c, p){
  let al = a.subVector(b).abs();
  let bl = b.subVector(c).abs();
  let cl = c.subVector(a).abs();
  let ap = a.subVector(p).abs();
  let bp = b.subVector(p).abs();
  let cp = c.subVector(p).abs();
  let pa = (ap+bp+al)/2;
  let pb = (bp+cp+bl)/2;
  let pc = (cp+ap+cl)/2;
  let sa = Math.sqrt(pa*(pa-ap)*(pa-bp)*(pa-al));
  let sb = Math.sqrt(pb*(pb-bp)*(pb-cp)*(pb-bl));
  let sc = Math.sqrt(pc*(pc-cp)*(pc-ap)*(pc-cl));

  let pr = (al+bl+cl)/2;
  let s = Math.sqrt(pr*(pr-al)*(pr-bl)*(pr-cl));

  return (sa+sb+sc)<=(s+0.00001);
}

function onLine(a, b, p){
  let al = a.subVector(b).abs();
  let ap = a.subVector(p).abs();  
  let bp = b.subVector(p).abs();
  return (ap+bp)<=(al+0.00001);
}

function lineCrossTriangle(a, b, u, v, w){
  let res;
  let dv = solveLinear(a, b, u, v, w);
  let dVector = new Vector3d(dv.x, dv.y, dv.z);
  if (inTriangle(u, v, w, dVector)){
    if (onLine(a, b, dVector)){
      res = dVector;
    }
  }
  return res;
}

function transformVertexList(vertexList, matrix){
  let ot =[];
  let mtx = matFromM4(matrix);
  for (let i=0; i<vertexList.length/3; i++){
    let v =[[vertexList[i*3+0]],[vertexList[i*3+1]],[vertexList[i*3+2]], [1]];
    let res = getMatrixProduct(mtx,v);
    ot.push(res[0][0]);
    ot.push(res[1][0]);
    ot.push(res[2][0]);
  }
  return ot;  
}

function crossMeshByLine(vertexList, lineVectorA, lineVectorB){
  let res =[];
  for (let i=0; i<vertexList.length; i+=9){
    let v=[];
    for (let j=0; j<3; j+=1){
      v[j] = new Vector3d(vertexList[i+j*3+0], vertexList[i+j*3+1], vertexList[i+j*3+2]);
    }
    let dv = lineCrossTriangle(lineVectorA, lineVectorB, v[0], v[1], v[2]); 
    if (dv){
      res.push(dv)
    }
  }
  return res;
}

function crossMeshByLineT(vertexList, lineVectorA, lineVectorB){
  let res =[];
  for (let i=0; i<vertexList.length; i+=9){
    let v=[];
    for (let j=0; j<3; j+=1){
      v[j] = new Vector3d(vertexList[i+j*3+0], vertexList[i+j*3+1], vertexList[i+j*3+2]);
    }
    let dv = lineCrossTriangle(lineVectorA, lineVectorB, v[0], v[1], v[2]); 
    if (dv){
      res.push({dv:dv, triangle:[v[0], v[1], v[2]]});
    }
  }
  return res;
}

function mirrorVectorFromMesh(vertexList, p, v){ //abs of result differents
  let b = p.addVector(v);
  let cpl = crossMeshByLineT(vertexList,p,b);
  if (cpl.length){///reflection
    let tr = getNearest(p, cpl).triangle;
    let nor = getNormal(tr[0], tr[1], tr[2]);
    let norm = new Vector3d(nor.x, nor.y, nor.z);
    let dtt = v.subVector(norm.mul(2*v.dot(norm)));
    return dtt;
  }
  return false;
}

function getNearest(point, list){
  let minit;
  let minlen = 999999;
  let p = new Vector3d(point.x, point.y, point.z);
  list.forEach(it=>{
    let v = new Vector3d(it.dv.x, it.dv.y, it.dv.z);
    let dist = p.subVector(v).abs();
    if (dist<minlen){
      dist = minlen;
      minit = it;
    }
  });
  return minit;
}

function hitMeshPoint(vertexList, p, v){
  let b = p.addVector(v);
  let cpl = crossMeshByLineT(vertexList,p,b);
  if (cpl.length){
    let cp = getNearest(p, cpl);
    return cp.dv;
  }
  return false;
}

function isCrossedMeshByLine(vertexList, lineVectorA, lineVectorB){
  let res =[];
  for (let i=0; i<vertexList.length; i+=9){
    let v=[];
    for (let j=0; j<3; j+=1){
      v[j] = new Vector3d(vertexList[i+j*3+0], vertexList[i+j*3+1], vertexList[i+j*3+2]);
    }
    let dv = lineCrossTriangle(lineVectorA, lineVectorB, v[0], v[1], v[2]); 
    if (dv) {return true;}
  }
  return false;
}

function isCrossedSimple(pos, a, v, d){
  if (!v){return false;}
  return (pos.subVector(a).abs()<(v.abs()+d));
}

function matFromM4(m){
  let res = [];
  for (let i=0; i<4; i++){
    //res.push([m[i*4+0],m[i*4+1],m[i*4+2],m[i*4+3]]);
    res.push([m[0*4+i],m[1*4+i],m[2*4+i],m[3*4+i]]);
  }
  return res;
}

function makeRGBA(color){
  let result = {r:rand(255), g:rand(255), b: rand(255), a:255};
  if (color!==undefined){
    let num = Number.parseInt('0x'+color);
    if (!Number.isNaN(num)){
      if (color.length==3){
        result.r = Number.parseInt('0x'+color[0]+'0');
        result.g = Number.parseInt('0x'+color[1]+'0');
        result.b = Number.parseInt('0x'+color[2]+'0');
      }

      if (color.length==4){
        result.r = Number.parseInt('0x'+color[0]+'0');
        result.g = Number.parseInt('0x'+color[1]+'0');
        result.b = Number.parseInt('0x'+color[2]+'0');
        result.a = Number.parseInt('0x'+color[3]+'0');
      }

      if (color.length==6){
        result.r = Number.parseInt('0x'+color[0]+color[1]);
        result.g = Number.parseInt('0x'+color[2]+color[3]);
        result.b = Number.parseInt('0x'+color[4]+color[5]);
      }

      if (color.length==8){
        result.r = Number.parseInt('0x'+color[0]+color[1]);
        result.g = Number.parseInt('0x'+color[2]+color[3]);
        result.b = Number.parseInt('0x'+color[4]+color[5]);
        result.a = Number.parseInt('0x'+color[6]+color[7]);
      }
    }
  return result;
  }
  return result;
}

function makeNormRGBA(color){
  let res = makeRGBA(color);
  return {r:res.r/255, g:res.g/255, b:res.b/255, a:res.a/255}
}

function getMaxDistance(vertexList){
  let max = 0;
  for (let i=0; i<vertexList.length; i+=3){
    let v = new Vector3d(vertexList[i+0], vertexList[i+1], vertexList[i+2]);
    let dist = v.abs();
    if (dist>max){
      max = dist;
    }
  }
  return max;
}

function getPosFromMatrix(matrix){
  return new Vector3d(matrix[12], matrix[13], matrix[14]);
}

function isTimeout(time){
  return (time<0 || time>1000); 
}

function matrixFromPos(pos, scale=1, azi=0, theta=0){
  let mt = m4.identity();
  mt = m4.translate(mt, pos.x, pos.y, pos.z);
  mt = m4.scale(mt, scale, scale, scale);
  mt = m4.zRotate(mt, azi);
  mt = m4.xRotate(mt, theta);
  return mt;
}

/*module.exports = {
  makeCameraMatrix,
  getNormal,
  getValueD,
  solveLinear,
  getMatrixProduct,
  vecMul,
  inTriangle,
  onLine,
  lineCrossTriangle,
  transformVertexList,
  crossMeshByLine,
  isCrossedMeshByLine,
  crossMeshByLineT,
  getNearest,
  mirrorVectorFromMesh,
  radToDeg,
  degToRad,
  rand,
  makeRGBA,
  makeNormRGBA,
  getMaxDistance,
  getPosFromMatrix,
  hitMeshPoint,
  isCrossedSimple,
  isTimeout,
  matrixFromPos
}*/