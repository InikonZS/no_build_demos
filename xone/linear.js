import { getAngle } from "./utils.js";

export function getEquation(v1, v2){
    let v = {x: v2.x - v1.x, y: v2.y - v1.y};
    let k = v.y/v.x;
    let b = -(v1.x*k-v1.y);
    return {k, b}
}
function inBox(x1, y1, x2, y2, x3, y3) {
    let n = 0;
    var bou = ((x3 <= x1 + n) && (x3 > x2 - n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 <= x1 + n) && (x3 > x2 - n) && (y3 > y1 - n) && (y3 <= y2 + n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 > y1 - n) && (y3 <= y2 + n));
    return bou;
}

function inBoxLine(v1,v2, nv){
    return inBox(v1.x, v1.y, v2.x, v2.y, nv.x, nv.y)
}

function rotate(v, ang){
    return {x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: v.y * Math.cos(ang) - v.x * Math.sin(ang)}
}

function mod(a, b){
    if (b< 0){
        return;
    }
    let br = 0;
    while (a>b){
        br+=1;
        if (br >100){
            console.log('breaked');
            return;
        }
        a = a - b
    }
    return a;
}

export function solveCutted(v1, v2, v3, v4){
    const ang1 = getAngle(v1, v2, {...v2, x: v2.x +1});
    const ang2 = getAngle(v3, v4, {...v4, x: v4.x +1});
    const med = Math.abs(mod((ang1 + Math.PI *2),(Math.PI /2)) - mod((ang2 + Math.PI *2), (Math.PI /2))) /2;
    const rv1 = rotate(v1, med);
    const rv2 = rotate(v2, med);
    const rv3 = rotate(v3, med);
    const rv4 = rotate(v4, med);

    let e1 = getEquation(rv1,rv2);
    let e2 = getEquation(rv3,rv4);
    let nv = solveEquation(e1,e2);
    let res = false;
    if (inBoxLine(rv1,rv2, nv)&& inBoxLine(rv3, rv4, nv)){
        res = rotate(nv, -med);
    }
    return res;
}
  
function solveEquation(e1, e2){
    let cx = -(e1.b-e2.b)/ (e1.k-e2.k);
    let cy = cx*e2.k+e2.b;
    return {x:cx, y: cy};
}

function test(){
    console.log('test linear')
    console.log(solveCutted({x:0, y: 10}, {x:0, y: 100}, {x:-10, y: 20}, {x:10, y: 20}));
    console.log('end test linear')
}
test();