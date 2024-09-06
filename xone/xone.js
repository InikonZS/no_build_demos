function getAngle(_a, _b, c){
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    if ((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)) <-1){
       return Math.acos(-1);
    }
    if ((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)) >1){
        return Math.acos(1);
     }
    const det = Math.sign(a.x*b.y - b.x*a.y); //z-coordinate of vector product
    return det* Math.acos((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)))
}

function isVerticalline(a){
    if (a[0].x == a[1].x) {
        return true
    } else
    if (a[0].y == a[1].y) {
        return false
    } else {
        console.log('shit line');
    }
}

function crossLine(a, b){
    const aDir = isVerticalline(a);
    const bDir = isVerticalline(b);
    if (aDir == true && bDir == false && Math.min(a[0].y, a[1].y) <= b[0].y && Math.max(a[0].y, a[1].y) >= b[0].y && Math.min(b[0].x, b[1].x) <= a[0].x && Math.max(b[0].x, b[1].x) >= a[0].x){
        return {x: a[0].x, y: b[0].y}
    } else
    if (aDir == false && bDir == true  && Math.min(a[0].x, a[1].x) <= b[0].x && Math.max(a[0].x, a[1].x) >= b[0].x && Math.min(b[0].y, b[1].y) <= a[0].y && Math.max(b[0].y, b[1].y) >= a[0].y){
        return {x: b[0].x, y: a[0].y}
    }
}

function polyArea(poly){
    const a = poly.reduce((ac, it, i, arr)=> ac + (it.x * arr[(i+1) % arr.length].y), 0);
    const b = poly.reduce((ac, it, i, arr)=> ac + (it.y * arr[(i+1) % arr.length].x), 0);
    return Math.abs(a - b) / 2;
}

function combinePoly(a, b){
    const newLine = [];
    const newLine1 = [];
    let isCrossed = false;
    let startBi;
    let endBi;
    let startAi;
    let endAi;
    a.forEach((ait, ai)=>{
        const crosses = [];
        if (!isCrossed){
            if (!newLine.find(it=>it.x == ait.x && it.y == ait.y)){
            newLine.push(ait);
            }
        }
        
        b.forEach((bit, bi)=>{
            if (bi == b.length - 1){
                return;
            }
            /*if (isCrossed){
                newLine.push(bit);
            }*/
            const aLine = [ait, a[(ai+1) % a.length]];
            const bLine = [bit, b[(bi+1) % b.length]];
            const crossPoint = crossLine(aLine, bLine);
            if (crossPoint){
                //newLine.push({...crossPoint, cross: true});
                //isCrossed = !isCrossed;
                if (crosses.length == 0 || (crosses[0] && (crosses[0].point.x != crossPoint.x || crosses[0].point.y != crossPoint.y))){
                    crosses.push({point: crossPoint, ai, bi});
                }
                if (isCrossed){
                    endBi = bi;
                } else {
                    startBi = bi;
                }
            } else {
                //newLine.push(bit);
                //isCrossed = false;
            }
        });
        if (crosses.length == 2){
            startAi = ai;
            endAi = ai;
            const isVertical = isVerticalline([ait, crosses[0].point]);
            let close =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[1]: crosses[0];
            let far =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[0]: crosses[1];
            if (!isVertical){
                close = Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[1]: crosses[0];
                far =  Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[0]: crosses[1];
            }
            if (!newLine.find(it=>it.x == close.x && it.y == close.y)){
            newLine.push(close.point);
            }
            const sub = b.slice(Math.min(close.bi, far.bi), Math.max(close.bi, far.bi)+1);
            if (close.bi>far.bi){
                sub.reverse();
            }
            sub.forEach(sb=> {
                if (!newLine.find(it=>it.x == sb.x && it.y == sb.y)){
                newLine.push(sb)
                }
            });
            if (!newLine.find(it=>it.x == far.x && it.y == far.y)){
            newLine.push(far.point);
            }
        }
        if (crosses.length == 1){
            if (!isCrossed) {
                startAi = ai;
                if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                newLine.push(crosses[0].point);
                }
            }
            if (isCrossed){
                endAi = ai;
                //newLine.push(crosses[0].point);
                const sub = b.slice(Math.min(startBi, endBi), Math.max(startBi, endBi)+1);
                if (startBi>endBi){
                    sub.reverse();
                }
                sub.forEach(sb=> {
                    if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                        newLine.push(sb)
                    }
                });
                if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                newLine.push(crosses[0].point);
                }
            }
            isCrossed = !isCrossed;
        }

    });
    return newLine;
}

function combinePoly2(a, b){
    const newLine = [];
    const aPoints1 = [];
    const aPoints2 = [];
    let isCrossed = false;
    let startBi;
    let endBi;
    let startAi;
    let endAi;
    a.forEach((ait, ai)=>{
        const crosses = [];
        if (!isCrossed){
            aPoints1.push(ait);
        } else {
            aPoints2.push(ait);
        }
        
        b.forEach((bit, bi)=>{
            if (bi == b.length - 1){
                return;
            }
            /*if (isCrossed){
                newLine.push(bit);
            }*/
            const aLine = [ait, a[(ai+1) % a.length]];
            const bLine = [bit, b[(bi+1) % b.length]];
            const crossPoint = crossLine(aLine, bLine);
            if (crossPoint){
                //newLine.push({...crossPoint, cross: true});
                //isCrossed = !isCrossed;
                if (crosses.length == 0 || (crosses[0] && (crosses[0].point.x != crossPoint.x || crosses[0].point.y != crossPoint.y))){
                    crosses.push({point: crossPoint, ai, bi});
                }
                if (isCrossed){
                    endBi = bi;
                } else {
                    startBi = bi;
                }
            } else {
                //newLine.push(bit);
                //isCrossed = false;
            }
        });
        if (crosses.length == 2){
            startAi = ai;
            endAi = ai;
            const isVertical = isVerticalline([ait, crosses[0].point]);
            let close =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[1]: crosses[0];
            let far =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[0]: crosses[1];
            if (!isVertical){
                close = Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[1]: crosses[0];
                far =  Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[0]: crosses[1];
            }
            newLine.push(close.point);
            const sub = b.slice(Math.min(close.bi, far.bi), Math.max(close.bi, far.bi)+1);
            if (close.bi>far.bi){
                sub.reverse();
            }
            sub.forEach(sb=> newLine.push(sb));
            newLine.push(far.point);
        }
        if (crosses.length == 1){
            if (!isCrossed) {
                startAi = ai;
                newLine.push(crosses[0].point);
            }
            if (isCrossed){
                endAi = ai;
                //newLine.push(crosses[0].point);
                const sub = b.slice(Math.min(startBi, endBi), Math.max(startBi, endBi)+1);
                if (startBi>endBi){
                    sub.reverse();
                }
                sub.forEach(sb=> newLine.push(sb));
                newLine.push(crosses[0].point);
            }
            isCrossed = !isCrossed;
        }

    });
    aPoints2.reverse();
    aPoints2.forEach(sb=> newLine.push(sb));
    return newLine;
}

function insidePoly(poly, a){
    let inPoly = false;
        let sumAng = 0;
        poly.forEach((it, i)=>{
            const newAng = getAngle(it, poly[((i+1)) %poly.length], a)
            sumAng += Number.isNaN(newAng) ? 0: newAng;
        });
        //if (Math.abs(Math.abs(sumAng) - Math.PI * 2) < 0.0000001){
        if (Math.abs(Math.abs(sumAng)) > 0.0000001){
            inPoly = true;
        }
       // console.log(sumAng);
    if (inPoly == false){
       //console.log('shit1');
    }
    return inPoly;
}

function init(){
    const canvas = document.querySelector('.canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const player = {x:100, y:100};
    let speed = {x:0, y:0};

    const enemy = {x:160, y:150};
    let enemySpeed = {x:5, y:5};

    const playerPath = [{...player}];

    const polys = [[{x:70, y:120}, {x:70, y:80}, {x:130, y:80},  {x:130, y:120}]];

    const changeDir = ()=>{
        playerPath.push({...player});
    }

    window.onkeydown=(e=>{
        console.log(e.code);
        if (e.code == 'KeyA'){
            speed = {x:-1, y:0};
            changeDir();
        }
        if (e.code == 'KeyW'){
            speed = {x:0, y:-1};
            changeDir();
        }
        if (e.code == 'KeyS'){
            speed = {x:0, y:1};
            changeDir();
        }
        if (e.code == 'KeyD'){
            speed = {x:1, y:0};
            changeDir();
        }
    });

    let lastInPoly = false;
    const render = ()=>{
        requestAnimationFrame(()=>{
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const sc = 2;
            if (player.x+speed.x*sc >=0  && player.x+speed.x*sc <=canvas.width){
                player.x += speed.x*sc;
            }
            if (player.y+speed.y*sc >=0  && player.y+speed.y*sc <=canvas.height){
                player.y += speed.y *sc;
            }

            polys.forEach(poly=>{
                ctx.strokeStyle = '#f90';
                ctx.fillStyle = '#c63';
                ctx.beginPath();
                poly.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

            //let inPoly = insidePoly(polys[0], player);
            let inPoly =false;
            polys.forEach(poly=>{
                let sumAng = 0;
                poly.forEach((it, i)=>{
                    sumAng += getAngle(it, poly[((i+1)) %poly.length], player);
                });
                //console.log(sumAng);
                if (Math.abs(Math.abs(sumAng) - Math.PI * 2) < 0.0000001){
                    inPoly = true;
                }
            });
            if (lastInPoly == true && !inPoly){
                playerPath.splice(0, playerPath.length);
                playerPath.push({...player/*, x: player.x - speed.x/2, y:  player.y - speed.y/2*/});
            }

            if (!inPoly){
                ctx.strokeStyle = '#999';
                ctx.beginPath();
                playerPath.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.lineTo(player.x, player.y)
                ctx.stroke();
            } else {
                if (lastInPoly == false){
                    if (playerPath.length >=1){
                        //polys.push([...playerPath, {...player}]);
                        const initial = [...polys[0]];
                        const pol0 = combinePoly(polys[0], [...playerPath, {...player, x: player.x - speed.x/2, y:  player.y - speed.y/2}]);
                        const pol1 = combinePoly2(polys[0], [...playerPath, {...player, x: player.x - speed.x/2, y:  player.y - speed.y/2}]);
                        console.log( polyArea(pol0), polyArea(pol1))
                        polys[0] = polyArea(pol0)> polyArea(pol1)? pol0 : pol1;
                        console.log('s = ', polyArea(polys[0]));
                        const _notInPoly = initial.find(p => false == insidePoly(polys[0], p));
                        _notInPoly && console.log('shit')
                    }
                    playerPath.splice(0, playerPath.length);
                }
            }

            lastInPoly = inPoly;

            ctx.fillStyle = '#f00';
            ctx.fillRect(player.x-2, player.y-2, 4, 4);
    
            ctx.fillStyle = '#ff0';
            ctx.fillRect(enemy.x-2, enemy.y-2, 4, 4);
           
            polys.forEach(poly=>{
                const inPolyX = insidePoly(poly, {x: enemy.x + enemySpeed.x * 2, y: enemy.y - enemySpeed.y * 2});
                const inPolyY = insidePoly(poly, {x: enemy.x - enemySpeed.x * 2, y: enemy.y + enemySpeed.y * 2});
                if (inPolyX){
                    enemySpeed.x = -enemySpeed.x;
                }
                if (inPolyY){
                    enemySpeed.y = -enemySpeed.y;
                }
            });
            enemy.x += enemySpeed.x / 2;
            enemy.y += enemySpeed.y / 2;
            if (enemy.x < 0 || enemy.x>canvas.width){
                enemySpeed.x = -enemySpeed.x;
            }
            if (enemy.y < 0 || enemy.y>canvas.height){
                enemySpeed.y = -enemySpeed.y;
            }
            render();
        })
    }
    render();
}

init();