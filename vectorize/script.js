import { initUI } from "./ui.js";
import { toSvgPath } from "./toSvgPath.js";

initUI();

const tst1 = [
    '00000010000',
    '00110111100',
    '01111111111',
    '00011111111',
    '01111111111',
    '00000011100',
    '00001111000',
].map(it=>it.split(''));
const tst = [
    '00000000000',
    '00111111100',
    '00111111110',
    '00111111110',
    '00111111110',
    '00111111100',
    '00001110000', 
    '00111111100',
    '01111111100',
    '01111111100',
    '00111111100',
    '00000000000',
].map(it=>it.split(''));

const leftHand = [
[
    {x:0, y:-1},
    {x:-1, y:-1},
],
[
    {x:-1, y:0},
    {x:-1, y:1}
],
[
    {x:1, y:0},
    {x:1, y:-1}
],
[
    {x:0, y:1},
    {x:1, y:1}
],
];

const forward = [
    {x:1, y:0},
    {x:0, y:-1},
    {x:0, y:1},
    {x:-1, y:0}
];

function getLinePointDistance(a, b, c){
    const y0 = c.y;
    const x0 = c.x;
    const y1 = a.y;
    const x1 = a.x;
    const y2 = b.y;
    const x2 = b.x;
    const upper = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
    const lower = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return upper / lower;
}

function getAngle(_a, _b, c){
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    if ((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)) <-1){
       return Math.acos(-1);
    }
    return Math.acos((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)))
}

function getPointWeight(arr, i){
    const angles = [];
    for (let k = 1; k<25; k++){
        const a = arr[i-k>=0 ? (i-k) : (arr.length-i-k)];
        const b = arr[(i+k) % arr.length];
        const c = arr[i];
        const ang = getAngle(a, b, c);
        if (Number.isNaN(ang)){
            console.log('nan', a, b, c);
            //angles.push(Math.PI );
        } else {
            angles.push(ang);
        }
    }
    const average = angles.reduce((ac, a)=>ac + a, 0) / angles.length;
    const min = angles.sort((a, b)=>a-b)[0];
    const max = angles.sort((a, b)=>b-a)[0];
    //console.log('av', angles, average, min, max);
    return [average, max, min];
}

function getVectDist(_a, _b, c){
    //console.log(_a, _b, c);
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    return (Math.hypot(a.x, a.y)+ Math.hypot(b.x,b.y));
}
function getVectDistA(_a, _b, c){
    //console.log(_a, _b, c);
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    return ((Math.abs(a.x - b.x)) ==1) || (Math.abs(a.y - b.y) ==1)
}


function checkLeftHand(img, pos, direction){
    return leftHand[direction].find(it=>{
        return img[pos.y+it.y]?.[pos.x+it.x] != '1'
    })
}

function findBorder(img){
    console.log(JSON.parse(JSON.stringify(img)));
    const res = JSON.parse(JSON.stringify(img));
    const resVect = [];
    let startPoint;
    img.forEach((row, y)=>{
        row.forEach((val, x)=>{
            if (!startPoint && val == '1'){
                startPoint = {x, y}
            }
        })
    });

    let currentDirection = 0;
    let currentPos = startPoint;
    for (let k=0; k< 10000; k++){
    let isEnd = false;
    const availableDir = forward.findIndex((it, i )=>{
        const currentForward = forward[currentDirection]; 
        let nextPos = {x: currentPos.x + currentForward.x, y: currentPos.y + currentForward.y};
        //console.log(currentDirection, JSON.stringify(currentPos), img[nextPos.y]?.[nextPos.x]);
        if (checkLeftHand(img, nextPos, currentDirection) && img[nextPos.y]?.[nextPos.x] == '1' /*&& res[nextPos.y]?.[nextPos.x] != '2'*/){
            currentPos = nextPos;
            if (res[nextPos.y]?.[nextPos.x] == '2'){
                isEnd = true;
            }
            if (res[nextPos.y]?.[nextPos.x] != undefined){
            res[nextPos.y][nextPos.x] = '2';
            resVect.push({x: nextPos.x, y: nextPos.y});
            }
            return true;
        };
        currentDirection+=1;
        currentDirection = currentDirection % 4;
    });
    if (isEnd){
        //console.log('break', k);
        break;
    }
    }
    //console.log(res);
    return resVect;
}

findBorder(tst);

function runDemo(){
    const img = document.createElement('img');
    img.src = './test5.png';
    img.onload = ()=>{
        const canvas = document.createElement('canvas');
        document.body.append(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        let isDraw= false;
        let last = {x:0, y:0}
        canvas.onmousedown = (e)=>{
            isDraw = true;
            last.x = e.offsetX;
            last.y = e.offsetY;
            ctx.drawImage(img, 0, 0);
        }
        canvas.onmouseup =()=>{
            isDraw = false;
            vectorize();
        }
        canvas.onmousemove = (e)=>{
            if (isDraw){
                ctx.strokeStyle = '#000';
                ctx.lineCap = 'round';
                ctx.lineWidth = 20;
                ctx.beginPath();
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(e.offsetX, e.offsetY);
                last.x = e.offsetX;
                last.y = e.offsetY;
                ctx.stroke();
            }
        }
        ctx.drawImage(img, 0, 0);
        const vectorize = ()=>{
        const data = ctx.getImageData(0,0, canvas.width, canvas.height);
        console.log(data);
        const arr = [];
        for (let i = 0; i < data.height; i++){
            const row = [];
            for (let j = 0; j < data.width; j++){
                row.push(data.data[i*data.width*4+j*4] ==0 ? '1':'0');
            } 
            arr.push(row);
        }
        const res = findBorder(arr);
        ctx.fillStyle='#f90';
        ctx.strokeStyle='#f00';
        ctx.lineWidth=1;
       /* res.forEach((row,  y)=>row.forEach((val, x)=>{
            if (val == '2'){
                ctx.fillRect(x, y, 2, 2);
            }
        }))*/
        let lastAng = NaN;
        let optimized = res;
        let  lastSk =false;
        let skipNext = false;
        const weights = [];
        for (let optIt = 0; optIt<14; optIt++){
        
        optimized = optimized.filter((vect, i, arr)=>{
            if (skipNext){
                skipNext =false;
                return false;
            }
            /*const ang = getAngle(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i]);
            const dist = getVectDist(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i]);
            const ang2 = getAngle(arr[i-15>=0?i-15: arr.length-i-15], arr[(i+15)%arr.length],arr[i]);
            const ang21 = getAngle(arr[i-5>=0?i-5: arr.length-i-5], arr[(i+5)%arr.length],arr[i]);
            const ang3 = getAngle(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+2)%arr.length],arr[i]);
            const ang4 = getAngle(arr[i-2>=0?i-2: arr.length-i-2], arr[(i+1)%arr.length],arr[i]);
            //if (i % 15 != 0) return;
            //console.log(ang, getPointWeight(arr, i));
            //const [average, max, min] = getPointWeight(arr, i);*/
            const dist2 = getLinePointDistance(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i]);
            const dist3 = getLinePointDistance(arr[i-2>=0?i-2: arr.length-i-2], arr[(i+2)%arr.length],arr[i]);
            console.log(dist3);
            if (dist3<500 &&  dist2 <(1 * 1.1 ** optIt)/2){
                return i % 2;
            }
            //const [average1, max1, min1] = getPointWeight(arr, (i+1)%arr.length);
            
            //if (average>Math.PI -0.51 && max> Math.PI -0.02){
                //return false;
                //weights.push(5* (average< Math.PI -0.5));
                //weights.push(3* (max< Math.PI -0.1));
                //weights.push(5* (min< Math.PI -1.51));
                //weights.push(5* (max / min > 1));
            //}
           /* if (optIt ==2 && dist<3){
                return false;
            }
            if ( ((max< Math.PI -0.25) || (max1< Math.PI -0.25))){
                return true;
            }
            if (optIt ==0 && i % 12 !=0){
                return false;
            }
            if (optIt ==1 &&(Math.abs(ang2) > Math.PI - 0.08)){
                return false;
            }
            if(optIt ==0 && getVectDistA(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i])){
                //return false;
            }
            if ((max< Math.PI -0.05) || (max1< Math.PI -0.05)){
                return true;
            }*/
            /*if (max1>max){
                //return false;
            } else {
                //skipNext= true;
            }
            if ((max> Math.PI -0.05)){
                //return {max, vect}//false;
            }
            if ( (average> Math.PI -0.22)){
                //return false;
            }*/
            //weights.push(3* (max< Math.PI -0.1));
           // if (/*optIt==0 &&*/ 
           // (Math.abs(ang21) > Math.PI - 0.21) || (Math.abs(ang2) > Math.PI - 0.21) || (Math.abs(ang3) > Math.PI - 0.01) || (Math.abs(ang4) > Math.PI - 0.01)|| (Math.abs(ang) > Math.PI - 0.01)) {
                //return false;
           // }
           /* if(!lastSk && optIt>=1 && dist<7){
                lastSk = true;
              //  return false;
            }
            lastSk = false;*/
            //if (Math.abs(ang - ang2) <0.11) return false;
           // lastAng = ang;
            return true;
        });
        }
        ctx.beginPath();
        ctx.moveTo(res[0].x, res[0].y);
        console.log(optimized);
        optimized.forEach((vect, i)=>{
            const ang = getAngle(res[i-1>=0?i-1: res.length-i-1], res[(i+1)%res.length], res[i]);
            //if (i % 15 != 0) return;
            //console.log(ang);
            //if (ang == lastAng) return;
            //lastAng = ang;
            //if (ang >= (Math.PI) || ang <= Math.PI /2) {
            ctx.lineTo(vect.x, vect.y);
            ctx.fillRect(vect.x-2, vect.y-2,4, 4);
            //}
            //ctx.fillRect(vect.x-1, vect.y-1, 4, 4);
        });
        ctx.closePath();
        ctx.stroke();

        const svg = document.querySelector('.dest-svg');
        svg.innerHTML = toSvgPath(optimized);
    }
    vectorize();
    }

   
}


runDemo();
console.log('test ang' ,getAngle({x:10, y:10}, {x:11, y:11}, {x:0,y:0}));
console.log('test ang' ,getAngle({x:10, y:0}, {x:15, y:15}, {x:0,y:0}));