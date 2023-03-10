const calc = require('./calc.utils.js');

function getModList(oob, genOwnNormal, preScaler=1){
  let vreg=/[ \t]+/;
  let oreg=/[\n]+/;

  let arr = oob.split(oreg);

  let vertexList = [];
  let vertexListUV =[];
  let vertexListNorm =[];

  let texList = [];
  let triangleList =[];
  let normalList = [];

  let isNormalLoaded = false;

  for (let i=0; i< arr.length; i++){
    let spl = arr[i].split(vreg);

    switch (spl[0]){
      case 'v': 
        vertexList.push({x:spl[1], y:spl[2], z:spl[3]});
      break;

      case 'vt': 
        vertexListUV.push({u:spl[1], v:spl[2]});
      break;

      case 'vn': 
        vertexListNorm.push({x:spl[1], y:spl[2], z:spl[3]});
      break;

      case 'f':
        for (let j=1; j<4; j++){
          let spj = spl[j].split('/');
          let sp = spj[0]-1;
          triangleList.push(vertexList[sp].x/10);
          triangleList.push(vertexList[sp].y/10);
          triangleList.push(vertexList[sp].z/10);

          sp = spj[1]-1;
          if (vertexListUV[sp]){
            texList.push(vertexListUV[sp].u*preScaler);
            texList.push(1-vertexListUV[sp].v*preScaler);
          }

          if (!genOwnNormal){
            sp = spj[2]-1;
            if (vertexListNorm[sp]){
              normalList.push(vertexListNorm[sp].x);
              normalList.push(vertexListNorm[sp].y);
              normalList.push(vertexListNorm[sp].z);
              isNormalLoaded = true;
            }
          }
        }

        if (!isNormalLoaded){
          for (let j=0; j<3; j++){
            let sp1 = spl[1].split('/')[0]-1;
            let sp2 = spl[2].split('/')[0]-1;
            let sp3 = spl[3].split('/')[0]-1;
            let norm = calc.getNormal(vertexList[sp1],vertexList[sp2],vertexList[sp3]);
            normalList.push(norm.x);
            normalList.push(norm.y);
            normalList.push(norm.z);
          }
        }
      break;
    }
  }

  return {triangleList, normalList, texList};
}

module.exports = {
  getModList
}