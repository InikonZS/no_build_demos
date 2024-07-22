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
]

function getAngle(_a, _b, c){
    //console.log(_a, _b, c);
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    return Math.acos((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)))
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
    return (Math.abs(a.x - b.x)) == 1 || Math.abs(a.y - b.y) == 1;
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
        console.log(currentDirection, JSON.stringify(currentPos), img[nextPos.y]?.[nextPos.x]);
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
        console.log('break', k);
        break;
    }
    }
    console.log(res);
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
        ctx.drawImage(img, 0, 0);
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
        for (let optIt = 0; optIt<1; optIt++){
        optimized = optimized.filter((vect, i, arr)=>{
            const ang = getAngle(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i]);
            const dist = getVectDist(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+1)%arr.length],arr[i]);
            const ang2 = getAngle(arr[i-15>=0?i-15: arr.length-i-15], arr[(i+15)%arr.length],arr[i]);
            const ang21 = getAngle(arr[i-5>=0?i-5: arr.length-i-5], arr[(i+5)%arr.length],arr[i]);
            const ang3 = getAngle(arr[i-1>=0?i-1: arr.length-i-1], arr[(i+2)%arr.length],arr[i]);
            const ang4 = getAngle(arr[i-2>=0?i-2: arr.length-i-2], arr[(i+1)%arr.length],arr[i]);
            //if (i % 15 != 0) return;
            console.log(ang);
            if (/*optIt==0 &&*/ (Math.abs(ang21) > Math.PI - 0.21) || (Math.abs(ang2) > Math.PI - 0.21) || (Math.abs(ang3) > Math.PI - 0.01) || (Math.abs(ang4) > Math.PI - 0.01)|| (Math.abs(ang) > Math.PI - 0.01)) {
                return false;
            }
            if(!lastSk && optIt>=1 && dist<7){
                lastSk = true;
              //  return false;
            }
            lastSk = false;
            //if (Math.abs(ang - ang2) <0.11) return false;
            lastAng = ang;
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
            ctx.fillRect(vect.x-1, vect.y-1, 3, 3);
            //}
            //ctx.fillRect(vect.x-1, vect.y-1, 4, 4);
        });
        ctx.closePath();
        ctx.stroke();
    }
   
}


runDemo();
console.log('test ang' ,getAngle({x:10, y:10}, {x:11, y:11}, {x:0,y:0}));
console.log('test ang' ,getAngle({x:10, y:0}, {x:15, y:15}, {x:0,y:0}));