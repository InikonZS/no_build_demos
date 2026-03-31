const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 1;

    let path = [];
    let topPoint;
    canvas.onmousemove = (e)=>{
        cursorPos = {
            x: Math.floor(e.offsetX / size), 
            y: Math.floor(e.offsetY / size)
        };
        topPoint = cursorPos;
        const lastPoint = path[path.length-1];
        /*const rotFactor = path.reduce((acc, it)=>{
            return acc + Math.hypot(topPoint.x - it.x, topPoint.y - it.y);
        }, 0);*/
        //console.log(rotFactor);
        if (!lastPoint || (lastPoint && Math.hypot(lastPoint.x - cursorPos.x, lastPoint.y - cursorPos.y)>=10)){
            path.push(cursorPos);
        }
        //const resampled = resamplePath(path);
        //path = corrected;
        //path = resampled;//resamplePath(path);//.reverse();
        path.reverse();
        while (sumLength()>100){
            path.pop();
        }
        path.reverse();
        draw();
    }

    const sumLength = ()=>{
        return path.reduce((ac, it, i, arr)=>{
            if (i==0){
                return 0;
            }
            return ac + Math.hypot(it.x - arr[i-1].x, it.y - arr[i-1].y)
        }, 0)
    }

    const resamplePath = (path)=>{
        const result = [];
        const currentPath = [...path].reverse(); 
        const threshold = 10;
        let keyPoint = currentPath[0];
        result.push(keyPoint);
        for (let i=0; i< currentPath.length; i++){
            const point = currentPath[i];
            if (Math.hypot(keyPoint.x - point.x, keyPoint.y - point.y)>=threshold){
                result.push(point);
                keyPoint = point;
            }
        }
        return result.reverse()
    }

    const resampleSmart = (path) => {
    const result = [];
    const pts = [...path].reverse();

    const target = 10;   // желаемая дистанция
    const delta = 5;     // допуск

    let i = 0;
    let prevDir = null;

    result.push(pts[0]);

    while (i < pts.length - 1) {
        let bestIndex = i + 1;
        let bestScore = Infinity;

        for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[j].x - pts[i].x;
            const dy = pts[j].y - pts[i].y;
            const dist = Math.hypot(dx, dy);

            if (dist > target + delta) break;
            if (dist < target - delta) continue;

            // нормализованное направление
            const dir = { x: dx / dist, y: dy / dist };

            // угол с предыдущим сегментом
            let anglePenalty = 0;
            if (prevDir) {
                const dot = dir.x * prevDir.x + dir.y * prevDir.y;
                anglePenalty = 1 - dot; // 0 = идеально, 2 = противоположно
            }

            // штраф за отклонение дистанции
            const distPenalty = Math.abs(dist - target) / target;

            const score = distPenalty + anglePenalty * 2;

            if (score < bestScore) {
                bestScore = score;
                bestIndex = j;
            }
        }

        const next = pts[bestIndex];

        const dx = next.x - pts[i].x;
        const dy = next.y - pts[i].y;
        const len = Math.hypot(dx, dy);

        prevDir = { x: dx / len, y: dy / len };

        result.push(next);
        i = bestIndex;
    }

    return result.reverse();
};

    const draw = ()=>{
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        let lastResample = [...path, topPoint];
        lastResample.forEach((it, i)=>{
            if (i==0){
                ctx.moveTo(it.x, it.y)
            } else {
                ctx.lineTo(it.x, it.y)
            }
        });
        //console.log(resamplePath(path))
        /*path.forEach((it, i)=>{
            if (i==0){
                ctx.moveTo(it.x, it.y)
            } else {
                ctx.lineTo(it.x, it.y)
            }
        });*/
        ctx.stroke();
    }
}

app();