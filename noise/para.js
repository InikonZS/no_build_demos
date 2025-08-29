import m4 from "./m4.js";
import { getScreenVector, makeCameraMatrix } from "./utils.js";

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    var aspect = canvas.clientWidth / canvas.clientHeight;
    //const camera = makeCameraMatrix(aspect, Math.PI / 2, Math.PI / 2, 0, 0, -100 );
    const canvasSizes = {clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight};

    canvas.onmousemove = (e)=>{
        const px = Math.min(Math.max(e.offsetX, canvas.width/2 - 100), canvas.width/2 + 100);
        const py = Math.min(Math.max(e.offsetY, canvas.height/2 + 10), canvas.height/2 + 200);
        draw(px, py);
    }
    const draw = (px, py)=>{
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        const targetPoint = {x: canvas.width/2, y: canvas.height/2};
        const dist = targetPoint.y - py < 0 ? Math.hypot(targetPoint.x - px, targetPoint.y - py, 1)/ 100 : 1;
        const step = {x: (targetPoint.x - px) / dist, y: (targetPoint.y - py) / dist, z: 1 / dist }

        const power = dist / 10//Math.abs(targetPoint.y - py) / 10;
        const points = [];
        let zc = 0;
        let zv = power * 25;
            const camera = makeCameraMatrix(aspect, 0.0, 0.0 , 0, 0, -10 - power * 20 );
            //console.log(Math.PI / 2 + px / 100, Math.PI / 2 + py / 100)
        for (let i=0; i < 400; i++){
            const x = /*px +*/ step.x * power / 4 * i;
            const y = /*py +*/ -step.y * power / 4 * i;
            const z = -zc;
           // points.push({x: (x - canvas.width / 2) / z + canvas.width / 2, y: (y - canvas.height / 2) /z  + canvas.height / 2 /*+ z * 100*/});
           /*if (y > 30 && z < 0){
           points.push({x: x, y: (y - py) * Math.sin(0.6) +  z + py/*(y - py) * Math.sin(0.1) + z * 10* Math.cos(0.1) + py}*//*});
           }*/
          const sv = getScreenVector(camera, {x: x, y: -z, z: -y}, canvasSizes);
          if (sv.z > 0 && y < 100 ){
           points.push({x: sv.x, y: sv.y, z: sv.z});
          }
            zc += zv;
            zv -= 0.1;
        }

        ctx.fillStyle = '#f0f';
        ctx.fillRect(targetPoint.x, targetPoint.y, 3, 3);
        ctx.fillStyle = '#f0f';
        ctx.fillRect(targetPoint.x - 100, targetPoint.y, 3, 3);
        ctx.fillRect(targetPoint.x + 100, targetPoint.y, 3, 3);
        ctx.strokeStyle = '#90f';
        ctx.beginPath();
        ctx.moveTo(targetPoint.x - 100, targetPoint.y);
        ctx.lineTo(px, py)
        ctx.lineTo(targetPoint.x + 100, targetPoint.y)
        ctx.stroke();

        points.forEach((it, i)=>{
            ctx.fillStyle = '#f00';
            ctx.strokeStyle = '#f00';
            ctx.fillRect(it.x, it.y, 3, 3);
            if (i!=0){
                ctx.lineWidth = 100 / points[i].z;
                ctx.beginPath();
                ctx.moveTo(points[i-1].x, points[i-1].y);
                ctx.lineTo(points[i].x, points[i].y)
                ctx.stroke();
            }
        })

        const oo = getScreenVector(camera, {x: 0, y: 0, z: 0}, canvasSizes);
        const ox = getScreenVector(camera, {x: 1, y: 0, z: 0}, canvasSizes);
        const oy = getScreenVector(camera, {x: 0, y: 1, z: 0}, canvasSizes);
        const oz = getScreenVector(camera, {x: 0, y: 0, z: 1}, canvasSizes);
        ctx.strokeStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(oo.x, oo.y);
        ctx.lineTo(ox.x, ox.y);
        ctx.stroke();
        ctx.strokeStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(oo.x, oo.y);
        ctx.lineTo(oy.x, oy.y);
        ctx.stroke();
        ctx.strokeStyle = '#00f';
        ctx.beginPath();
        ctx.moveTo(oo.x, oo.y);
        ctx.lineTo(oz.x, oz.y);
        ctx.stroke();
    }
}

app();