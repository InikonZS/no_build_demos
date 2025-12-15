const field = [
    'Aaaaaaa',
    'CbbbbBa',
    'cbDEeea',
    'cbdddec',
    'ccccccc'
].map(row=>row.split(''));

const steps = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];

const findLine = (field, headPosition, sym) => {
    const line = [headPosition];
    field[headPosition.y][headPosition.x] = '_';
    let currentPosition = headPosition;
    for (let i = 0; i<1000; i++){
        const found = steps.find(it=>{
            const nextPosition = {
                x: currentPosition.x + it.x,
                y: currentPosition.y + it.y
            }
            if (field[nextPosition.y]?.[nextPosition.x] == sym){
                field[nextPosition.y][nextPosition.x] = '_';
                line.push({x: nextPosition.x, y: nextPosition.y});
                currentPosition = nextPosition;
                return true;
            }
        });
        if (!found){
            break;
        }
    }
    return line;
}

const findHead = (field) => {
    let result;
    const found = -1 != field.findIndex((row, y)=>{
        return -1 != row.findIndex((cell, x)=>{
            if (cell != '_' && cell.toUpperCase() == cell){
                result = {pos: {x, y}, sym: cell};
                return true;
            }
        })
    });
    return found ? result : null;
}

const readField = (textField) => {
    const splitted = textField.map(it=>it.map(jt=>jt));//textField.map(row=>row.split(''));
    const arrows = [];
    for (let i=0; i<1000; i++){
        const head = findHead(splitted);
        if (!head){
            //console.log(arrows);
            break;
        }
        const line = findLine(splitted, head.pos, head.sym.toLowerCase());
        arrows.push({points: line, sym: head.sym});
    }
    return arrows;
}

 const rect = [
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 0, y: 1},
];

function smoothPolyline(points, iterations = 1) {
  let pts = points.map(p => ({ ...p }));

  for (let it = 0; it < iterations; it++) {
    const next = [pts[0]];

    for (let i = 1; i < pts.length - 1; i++) {
      next.push({
        x: (pts[i - 1].x + pts[i].x + pts[i + 1].x) / 3,
        y: (pts[i - 1].y + pts[i].y + pts[i + 1].y) / 3
      });
    }

    next.push(pts[pts.length - 1]);
    pts = next;
  }

  return pts;
}

function polylineLengths(points) {
  const lengths = [0];
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.hypot(dx, dy);
    lengths.push(total);
  }

  return { lengths, total };
}

function pointAtPercent(polyline, percent) {
  if (polyline.length === 0) return null;
  if (polyline.length === 1) return { ...polyline[0] };

  const { lengths, total } = polylineLengths(polyline);
  const target = percent * total;

  // найти сегмент
  let i = 1;
  while (i < lengths.length && lengths[i] < target) i++;

  if (i === lengths.length) {
    return { ...polyline[polyline.length - 1] };
  }

  const prevLen = lengths[i - 1];
  const segLen = lengths[i] - prevLen;
  const t = segLen === 0 ? 0 : (target - prevLen) / segLen;

  const p0 = polyline[i - 1];
  const p1 = polyline[i];

  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t
  };
}

function segmentQuad(p0, p1, width) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy);

  if (len === 0) return null;

  const angle = Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = width / 2;

  const local = [
    { x: 0,   y: -hw },
    { x: len, y: -hw },
    { x: len, y:  hw },
    { x: 0,   y:  hw }
  ];

  return local.map(p => ({
    x: p0.x + p.x * cos - p.y * sin,
    y: p0.y + p.x * sin + p.y * cos
  }));
}

function solveLines2(p11, p12, p21, p22) {
  const x1 = p11.x, y1 = p11.y;
  const x2 = p12.x, y2 = p12.y;
  const x3 = p21.x, y3 = p21.y;
  const x4 = p22.x, y4 = p22.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-6) return null; // параллельны

  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) -
     (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) -
     (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  return { x: px, y: py };
}

function joinQuads(q0, q1) {
  // q0 = [A, B, C, D]
  // q1 = [A', B', C', D']

  const B = q0[1];
  const C = q0[2];

  const A1 = q1[0];
  const D1 = q1[3];

  const top = solveLines2(
    q0[0], q0[1],   // A → B
    q1[0], q1[1]    // A' → B'
  );

  const bottom = solveLines2(
    q0[3], q0[2],   // D → C
    q1[3], q1[2]    // D' → C'
  );

  if (top && bottom) {
    // передняя грань первого
    q0[1] = top;
    q0[2] = bottom;

    // задняя грань второго
    q1[0] = top;
    q1[3] = bottom;
  }
}

function getEquation(v1, v2){
    let v = {x: v2.x - v1.x, y: v2.y - v1.y};
    let k = v.y/v.x;
    let b = -(v1.x*k-v1.y);
    return {k, b}
}

function solveEquation(e1, e2){
    let cx = -(e1.b-e2.b)/ (e1.k-e2.k);
    let cy = cx*e2.k+e2.b;
    return {x:cx, y: cy};
}

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


function rotate(v, ang){
    return {x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: v.y * Math.cos(ang) - v.x * Math.sin(ang)}
}

export function solveLines(v1, v2, v3, v4){
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
    //if (inBoxLine(rv1,rv2, nv)&& inBoxLine(rv3, rv4, nv)){
        res = rotate(nv, -med);
    //}
    return res;
}

function resamplePolyline(polyline, segments) {
  const result = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    result.push(pointAtPercent(polyline, t));
  }

  return result;
}

const getPolyRope = (_polyLine) => {
    const polyLine = smoothPolyline(resamplePolyline(_polyLine, 100), 3);
    const mesh = [];
    const count = 59;
    for (let i = 0; i < count; i++){
        /*const segment = rect.map(point=>{
            const polyPoint = pointAtPercent(polyLine, i * 1 / 30);
            //console.log(polyPoint);
            return {x: point.x - 0.5 + polyPoint.x, y: point.y - 0.5 + polyPoint.y}
        });*/
        const polyPoint = pointAtPercent(polyLine, i * 1 / (count));
        const polyPointNext = pointAtPercent(polyLine, (i + 1) * 1 / (count));
        const segment = segmentQuad(polyPoint, polyPointNext, 8);
        mesh.push(segment);
    }

    for (let i = 0; i < mesh.length - 1; i++) {
        joinQuads(mesh[i], mesh[i + 1]);
    }
    console.log(mesh);
    return mesh;
}

class ArrowsModel{
    constructor(){

    }
}

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const cellSize = 20;
    const center = {
        x: 10,
        y: 10
    }
    let cellSym;
    let arrows; 

    const drawScene = ()=>{
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        arrows = readField(field.map(row=>row));
        arrows.forEach(arrow => {
            ctx.beginPath();
            arrow.points.forEach((point, i)=>{           
                if (i == 0){
                    ctx.fillStyle = '#000';
                    ctx.fillRect(point.x * cellSize - 3 + center.x, point.y * cellSize - 3 + center.y, 6, 6)
                    ctx.moveTo(point.x * cellSize + center.x, point.y * cellSize + center.y);
                } else {
                    ctx.lineTo(point.x * cellSize + center.x, point.y * cellSize + center.y);
                }
            });
            ctx.strokeStyle = (cellSym && arrow.sym == cellSym.toUpperCase()) ? '#090' : '#000';
            ctx.stroke();
        });

        const rope = [
            {x: 100, y: 100},
            {x: 120, y: 110},
            {x: 130, y: 160},
            {x: 120, y: 170},
            {x: 100, y: 180},
            {x: 90, y: 120},
            {x: 40, y: 120},
            {x: 40, y: 30},
            {x: 140, y: 30},
            {x: 140, y: 70},
        ]
        const mesh = getPolyRope(rope);
        const size = 1;
        mesh.forEach(rect=>{
            ctx.beginPath();
            rect.forEach((it, i)=>{
                if (i == 0){
                    ctx.moveTo(rect[rect.length -1].x * size + center.x, rect[rect.length -1].y * size + center.y);
                }
                ctx.lineTo(it.x * size + center.x, it.y * size + center.y);
            });
            ctx.stroke();
        });
        ctx.beginPath();
        rope.forEach((it, i)=>{
            
            if (i == 0){
                ctx.moveTo(it.x + center.x, it.y + center.y);
            } else {
                ctx.lineTo(it.x + center.x, it.y + center.y);
            }
        });
        ctx.stroke();
    }
    drawScene();

    canvas.onmousemove = (e)=>{
        const cursorCell = {
            x: Math.floor((e.offsetX - center.x) / cellSize + 0.5),
            y: Math.floor((e.offsetY - center.y) / cellSize + 0.5),
        }

        cellSym = field[cursorCell.y]?.[cursorCell.x];
        drawScene();
    }

    canvas.onclick = (e)=>{
        console.log(cellSym);
        if (!cellSym){
            return;
        }
        const arrow = arrows.find(it=>{
            return it.sym == cellSym.toUpperCase()
        });
        if (!arrow){
            return;
        }
        const pa = arrow.points[0];
        const pb = arrow.points[1];
        const direction = steps.find(it=>{
            return it.x == pa.x - pb.x &&
            it.y == pa.y - pb.y;
        });
        let allowed = true;
        let currentPos = pa;
        for (let i=0; i< 100; i++){
            currentPos = {
                x: currentPos.x + direction.x,
                y: currentPos.y + direction.y
            }
            if (field[currentPos.y]?.[currentPos.x] && field[currentPos.y]?.[currentPos.x] != '_'){
                allowed = false;
                break;
            }
        }
        if (allowed == true){
            arrow.points.forEach(point=>{
                field[point.y][point.x] = '_';
            });
            arrows.splice(arrows.indexOf(arrow), 1);
            drawScene();
        }
        console.log(allowed);
    }
}

app();