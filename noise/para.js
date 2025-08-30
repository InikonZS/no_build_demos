import m4 from "./m4.js";
import { getScreenVector, makeCameraMatrix, trajectoryIntersection, unprojectToPlane } from "./utils.js";

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    var aspect = canvas.clientWidth / canvas.clientHeight;
    //const camera = makeCameraMatrix(aspect, Math.PI / 2, Math.PI / 2, 0, 0, -100 );
    const canvasSizes = {clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight};

    let px;
    let py;
    canvas.onmousemove = (e)=>{
        /*const*/ px = Math.min(Math.max(e.offsetX, canvas.width/2 - 100), canvas.width/2 + 100);
        /*const*/ py = Math.min(Math.max(e.offsetY, canvas.height/2 + 10), canvas.height/2 + 200);
        draw(px, py);
    }
    let trajectory = [];
    canvas.onclick = (e)=>{
        const aniSeg = (pIndex)=>{
            if (pIndex< trajectory.length -2){
                requestAnimationFrame(()=>{
                    setTimeout(()=>{ aniSeg(pIndex+1);
                    draw(px, py, trajectory[pIndex]);}, 100);
                   
                });
            }
        }
        aniSeg(0)
    }
    const draw = (px, py, ap)=>{
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        const targetPoint = {x: canvas.width/2, y: canvas.height/2 + 120};
        const limy = targetPoint.y - py < -10 ? targetPoint.y - py : -10;
        const dist = Math.hypot(targetPoint.x - px, limy, 1)/ 100;
        const step = {x: (targetPoint.x - px) / dist, y: (limy) / dist, z: 1 / dist }

        const power = dist / 10//Math.abs(targetPoint.y - py) / 10;
        const points = [];
        if (!ap){
        trajectory = [];
        }
        let zc = 0;
        let zv = power * 25;

        let camera = ap ? makeCameraMatrix(aspect, 0.0, 0.0 , 0 - ap.x , -3 - ap.y, -10 - power * 20 -ap.z ): makeCameraMatrix(aspect, 0.0, 0.0 , 0, -3, -10 - power * 20 );
            //console.log(Math.PI / 2 + px / 100, Math.PI / 2 + py / 100)
        const wc = unprojectToPlane(camera, {x: px, y: py}, canvasSizes, 1);
        for (let i=0; i < 40; i++){
            const x = /*px +*/ step.x * power / 4 * i ;
            const y = /*py +*/ -step.y * power / 4 * i;
            const z = -zc;
           // points.push({x: (x - canvas.width / 2) / z + canvas.width / 2, y: (y - canvas.height / 2) /z  + canvas.height / 2 /*+ z * 100*/});
           /*if (y > 30 && z < 0){
           points.push({x: x, y: (y - py) * Math.sin(0.6) +  z + py/*(y - py) * Math.sin(0.1) + z * 10* Math.cos(0.1) + py}*//*});
           }*/
          const point = {x: x + wc.x, y: -z + wc.y, z: -y + wc.z };
          if (!ap){
          trajectory.push(point);
          }
          const sv = getScreenVector(camera, point, canvasSizes);
          //if (sv.z > 0 && (-y + wc.z > -40 || x + wc.x < 0) && +z - wc.y<=0){
           points.push({x: sv.x /*+ px - targetPoint.x*/, y: sv.y /*+ py - targetPoint.y*/, z: sv.z});
          //}
            zc += zv;
            zv -= 0.1;
        }

        const polygon = [
            {x: 0, y: 0, z: -40},
            {x: 0, y: 20, z: -40},
            {x: 20, y: 20, z: -40}
        ];
        const intPoint = trajectoryIntersection(trajectory, polygon);

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
                if (trajectory[i].z < -40){
                    ctx.strokeStyle = '#0f0';
                }
                if (!(intPoint && trajectory[i].z < -40)){
                    ctx.lineWidth = 100 / points[i].z;
                    ctx.beginPath();
                    ctx.moveTo(points[i-1].x, points[i-1].y);
                    ctx.lineTo(points[i].x, points[i].y)
                    ctx.stroke();
                }
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

        const floorPoints = new Array(30 * 30).fill(null).map((it, i)=>{
            return getScreenVector(camera, {x: Math.floor((i) / 30)- 15, y: 0, z: (i) % 30- 15}, canvasSizes);
        })
        floorPoints.forEach(it=>{
            if (it.z > 10){
            ctx.fillRect(it.x, it.y,  100 / it.z, 100 / it.z);
            }
        })

        const roo = getScreenVector(camera, {x: 0, y: 0, z: 0}, canvasSizes);
        const ro1 = getScreenVector(camera, {x: 2, y: 1, z: 0}, canvasSizes);
        const ro2 = getScreenVector(camera, {x: -2, y: 1, z: 0}, canvasSizes);
        ctx.fillStyle = '#f0f';
        ctx.fillRect(ro1.x, ro1.y,  100 / ro1.z, 100 / ro1.z);
        ctx.fillRect(ro2.x, ro2.y,  100 / ro2.z, 100 / ro2.z);
        ctx.fillRect(roo.x, roo.y,  100 / roo.z, 100 / roo.z);

        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ro1.x, ro1.y);
        ctx.lineTo(px, py);
        ctx.lineTo(ro2.x, ro2.y);
        ctx.stroke();

        const wcr = getScreenVector(camera, wc, canvasSizes);
        ctx.fillRect(wcr.x, wcr.y,  100 / wcr.z, 100 / wcr.z);

        const scPolygon = polygon.map(it=>getScreenVector(camera, it, canvasSizes));
        ctx.strokeStyle = '#f00';
        ctx.fillStyle = '#f006';
        ctx.beginPath();
        ctx.moveTo(scPolygon[scPolygon.length-1].x, scPolygon[scPolygon.length-1].y);
        scPolygon.forEach(it=>{
            ctx.lineTo(it.x, it.y);
        });
        ctx.stroke();
        ctx.fill();

        if (intPoint) {
            ctx.fillStyle = '#0f0';

            const scIntPoint = getScreenVector(camera, intPoint, canvasSizes);
            ctx.fillRect(scIntPoint.x, scIntPoint.y, 300 / scIntPoint.z, 300 / scIntPoint.z);
        }
    }
}

app();