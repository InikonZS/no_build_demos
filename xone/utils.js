export function getAngle(_a, _b, c){
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

export function isVerticalline(a){
    if (a[0].x == a[1].x) {
        return true
    } else
    if (a[0].y == a[1].y) {
        return false
    } else {
        console.log('shit line');
    }
}

export function crossLine(a, b){
    const aDir = isVerticalline(a);
    const bDir = isVerticalline(b);
    if (aDir == true && bDir == false && Math.min(a[0].y, a[1].y) <= b[0].y && Math.max(a[0].y, a[1].y) >= b[0].y && Math.min(b[0].x, b[1].x) <= a[0].x && Math.max(b[0].x, b[1].x) >= a[0].x){
        return {x: a[0].x, y: b[0].y}
    } else
    if (aDir == false && bDir == true  && Math.min(a[0].x, a[1].x) <= b[0].x && Math.max(a[0].x, a[1].x) >= b[0].x && Math.min(b[0].y, b[1].y) <= a[0].y && Math.max(b[0].y, b[1].y) >= a[0].y){
        return {x: b[0].x, y: a[0].y}
    }
}

export function lineCrossPoly(poly, a){
    const crosses = [];
    poly.forEach((it, i)=>{
        const cross = crossLine([it, poly[(i+1) %poly.length]], a);
        if (cross){
            crosses.push(cross);
        }
    });
    return crosses[0];
}

export function polyArea(poly){
    const a = poly.reduce((ac, it, i, arr)=> ac + (it.x * arr[(i+1) % arr.length].y), 0);
    const b = poly.reduce((ac, it, i, arr)=> ac + (it.y * arr[(i+1) % arr.length].x), 0);
    return Math.abs(a - b) / 2;
}

export function insidePoly(poly, a, ib){
    let inPoly = false;
        let sumAng = 0;
        poly.forEach((it, i)=>{
            const newAng = getAngle(it, poly[((i+1)) %poly.length], a)
            sumAng += Number.isNaN(newAng) ? 0: newAng;
        });
        if (ib &&Math.abs(Math.abs(sumAng) - Math.PI * 2) < 0.0000001){
            inPoly =true;
        }
        if (!ib &&Math.abs(Math.abs(sumAng)) > 0.0000001){
            inPoly = true;
        }

    return inPoly;
}