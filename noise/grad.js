const processFile=(selectedFile, onReady)=>{
    if (!selectedFile){
        return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
        console.log('loaded');
        const img = new Image();
        img.onload= ()=>{
            onReady(img);
        };
        img.src = reader.result;   
    }
    reader.onloadstart = ()=>{
        console.log('loading');
    }
    reader.onerror = ()=>{
        console.log('error');
    }
    reader.onabort = ()=>{
        console.log('abort');
    }
    reader.readAsDataURL(selectedFile);
}

function toBitmap(ctx, pos, threshold, zero = '-', one = '8') {
    const canvas = ctx.canvas;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const selectColor = []; 
    for (let k = 0; k<4; k++){
        selectColor.push(data.data[pos.y * data.width * 4 + pos.x * 4 + k]);
    }
    const arr = [];
    for (let i = 0; i < data.height; i++) {
        const row = [];
        for (let j = 0; j < data.width; j++) {
            const colors = [];
            for (let k = 0; k<4; k++){
                colors.push(data.data[i * data.width * 4 + j * 4 + k]);
            }
            const maxDiff = Math.abs(colors[3]  - selectColor[3]); //Math.max(...colors.map((cl, cli)=> Math.abs(cl  - selectColor[cli])))
            //row.push(data.data[i * data.width * 4 + j * 4] == 0 ? '1' : '0');
            row.push(maxDiff < threshold ? one : zero);
        }
        arr.push(row);
    }
    return [arr, selectColor.map(it=>(it.toString(16).length == 1? '0' : '')+it.toString(16)).join('')];
}

const getPoly = (bitmap)=>{
    const getInitialPos = ()=>{
        let index = -1;
        const rowIndex = bitmap.findIndex((row)=>{
            index = row.findIndex(cell=>{
                return cell == '8';
            })
            return index != -1;
        });
        return {x: index, y: rowIndex}
    }

    const pos = getInitialPos();
    const player = {
        x: pos.x,
        y: pos.y,
        direction: 0
    }

    const moves = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ]

    const leftHand = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
    ]

    const dirs = [
        -1,
        0,
        1,
        2
    ]

    const poly = [];

    const tryMove = () => {
        if (bitmap[player.y + moves[player.direction].y]?.[player.x + moves[player.direction].x] == '8') {
            player.x = player.x + moves[player.direction].x;
            player.y = player.y + moves[player.direction].y;
            //draw();
            return true;
        }
        //draw();
    }

    const step = () => {
        const initDir = player.direction;

        for (let rots = 0; rots < 4; rots++) {
            if ((player.direction == 1 && rots == 3) || (player.direction == 1 && rots == 2)) {
                const lastPos = { ...player }
                poly.push({ x: lastPos.x + 1, y: lastPos.y + 1 });
            }

            player.direction = (4 + initDir + dirs[rots]) % 4;

            //console.log('post', player.direction, rots)
            {
                const lastPos = { ...player }
                 if (
                       (player.direction == 3 && rots == 0)
                    || (player.direction == 2 && rots == 0)
                    || (player.direction == 1 && rots == 1)
                    || (player.direction == 2 && rots == 1)
                    || (player.direction == 3 && rots == 1) 
                    || (player.direction == 1 && rots == 2)
                    || (player.direction == 2 && rots == 2)
                    || (player.direction == 0 && rots == 3)
                    || (player.direction == 1 && rots == 3)
                    || (player.direction == 2 && rots == 3)
                    || (player.direction == 3 && rots == 3) 
                ) {
                //if (bitmap[player.y + leftHand[player.direction].y]?.[player.x + leftHand[player.direction].x] != '8') {
                    const point = { x: lastPos.x + (leftHand[lastPos.direction].x <= 0 ? 0 : 1), y: lastPos.y + (leftHand[lastPos.direction].y <= 0 ? 0 : 1) };
                    if (poly.length && (poly[0].x == point.x && poly[0].y == point.y)){
                        return true;
                    } else if (poly.length == 0 || (poly[poly.length -1].x != point.x || poly[poly.length -1].y != point.y)){
                        poly.push(point);
                    }
                }
            }

            if (tryMove()) {
                //draw()
                return;
            }
        }
    }

    for (let i=0; i<100000; i++){
        if (step()){
            break;
        }
    }
    return poly;
}

const pdist = (p0, p1, p2) =>{
    const top = (p2.y - p1.y) * p0.x - (p2.x - p1.x) * p0.y + p2.x*p1.y - p2.y*p1.x
    const down = Math.sqrt((p2.y - p1.y)**2 + (p2.x - p1.x)**2)
    return top / down;
}

const optimizePolyHard = (poly)=>{
    const polyIndexed = poly.map(it=>({...it, deleted: false}));
    const getPoint = (index)=>{
        return polyIndexed[(index + polyIndexed.length) % polyIndexed.length];
    }
    polyIndexed.forEach((it, i)=>{
        const prev = getPoint(i-1);
        const current = it;
        const next = getPoint(i+1);
        if (Math.abs(pdist(current, prev, next)) < 0.0001){
            current.deleted = true;
        }
    });
    return polyIndexed.filter(it=>!it.deleted);
}

const optimizePolySoft1 = (poly)=>{
    const polyIndexed = poly.map(it=>({...it, deleted: false}));
    const getPoint = (index)=>{
        return polyIndexed[(index + polyIndexed.length) % polyIndexed.length];
    }
    polyIndexed.forEach((it, i)=>{
        const prev = getPoint(i-2);
        const current = getPoint(i);
        const current1 = getPoint(i-1);
        const next = getPoint(i+1);
        if (Math.abs(pdist(current, prev, next) + pdist(current1, prev, next)) < 0.0001){
            current.deleted = true;
        }
    });
    return polyIndexed.filter(it=>!it.deleted);
}

const optimizePolySoft = (poly)=>{
    const polyIndexed = poly.map(it=>({...it, deleted: false}));
    const getPoint = (index)=>{
        return polyIndexed[(index + polyIndexed.length) % polyIndexed.length];
    }
    polyIndexed.forEach((it, i)=>{
        const prev = getPoint(i-4);
        const current = getPoint(i);
        const current1 = getPoint(i-1);
        const current2 = getPoint(i-2);
        const current3 = getPoint(i-3);
        const next = getPoint(i+1);
        if (Math.abs(pdist(current, prev, next) + pdist(current1, prev, next) + pdist(current2, prev, next) + pdist(current3, prev, next)) < 0.0001){
            current.deleted = true;
            current1.deleted = true;
            current2.deleted = true;
            //current3.deleted = true;
        }
    });
    return polyIndexed.filter(it=>!it.deleted);
}

const optimizePolyDynamic1 = (poly)=>{
    const polyIndexed = poly.map(it=>({...it, deleted: false, cnt:0}));
    const getPoint = (index)=>{
        return polyIndexed[(index + polyIndexed.length) % polyIndexed.length];
    }
    polyIndexed.forEach((it, i)=>{
        const prev = getPoint(i);
        for (let k = 0; k < 10; k++){
            const next = getPoint(i+k+2);
            let sumSigned = 0;
            let sumUnsigned = 0;
            for (let sk = 0; sk < k + 1; sk++){
                const current = getPoint(i+sk+1);
                const dist = pdist(current, prev, next);
                sumSigned += dist;
                sumUnsigned += Math.abs(dist);
            }
            console.log(sumSigned, k);
            //if (Math.abs(sumSigned) < 0.0001 && sumUnsigned < 10.4){
                /*for (let sk = 0; sk < k + 0; sk++){
                    const current = getPoint(i+sk+1);
                    current.deleted = true;
                    current.cnt += sumUnsigned ;
                }*/
               const current = getPoint(i);
               current.cnt += sumUnsigned ;
           // }
        }
    });
    return polyIndexed.filter(it=>it.cnt > /*180*/42)//!it.deleted);
}

const optimizePolyDynamic = (poly, val, val2)=>{
    const polyIndexed = poly.map(it=>({...it, deleted: false, cnt:0}));
    const getPoint = (index)=>{
        return polyIndexed[(index + polyIndexed.length) % polyIndexed.length];
    }
    for (let i = 0; i< polyIndexed.length; i++){
        const prev = getPoint(i);
        const sums = [];
        let len = 180;
        for (let k = 0; k < len; k++){
            const next = getPoint(i+k+2);
            let sumSigned = 0;
            let sumUnsigned = 0;
            let plist = []
            for (let sk = 0; sk < k + 1; sk++){
                const current = getPoint(i+sk+1);
                plist.push(current);
                const dist = pdist(current, prev, next);
                //sumSigned += dist / (k+1); //optional k
                //sumUnsigned += Math.abs(dist) / (k+1);
                sumSigned += dist // (k+1); //optional k q=1
                sumUnsigned += Math.abs(dist) // (k+1);
            }
            sums.push({
                sumSigned,
                sumUnsigned,
                k,
                plist
            })
            const q = val/36;//11 //0.25 * k +1;
            if ((Math.abs(sumSigned) > 8/q || sumUnsigned > 18.4/(q)) || k == (len-1)){
                let kk = 1;//k;
                for (let op = k - 1; op>=0; op--){
                    if (Math.abs(sums[op].sumSigned) < /*0.77/(k+1)*/ 0.77*(val2) ){
                        kk = op;
                        break;
                    }
                }
                console.log(sums);
                for (let sk = 0; sk < kk - 0; sk++){
                    const current = getPoint(i+sk+1);
                    current.deleted = true;
                }
                i+=kk-0;
                console.log('break')
                break;
            }
        }
    };
    return polyIndexed.filter(it=>!it.deleted)//!it.deleted);
}

const app = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = "image/*";
    document.body.append(inp);

    const inp1 = document.createElement('input');
    inp1.type = 'range';
    inp1.min = 1;
    inp1.max = 36;
    inp1.value = 18;//inp1.min;
    document.body.append(inp1);

    const inp2 = document.createElement('input');
    inp2.type = 'range';
    inp2.min = 1;
    inp2.max = 36;
    inp2.value = inp2.min;
    document.body.append(inp2);

    inp.onchange = (e)=>{
        processFile(e.target.files[0], (img)=>{
            const size = 1;
            const presize = 1;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(img, 0, 0, img.naturalWidth * size, img.naturalHeight * size);

            const hcanv = document.createElement('canvas');
            //console.log(img)
            hcanv.width = img.naturalWidth * presize;
            hcanv.height = img.naturalHeight * presize;
            const hctx = hcanv.getContext('2d');
            hctx.drawImage(img, 0, 0, img.naturalWidth * presize, img.naturalHeight * presize);
            canvas.onclick = (e)=>{
                const [btm, color] = toBitmap(hctx, {x: Math.floor(e.offsetX / size * presize), y: Math.floor(e.offsetY / size * presize)}, 60);
                const poly1 = getPoly(btm).map(it=>({x: it.x / presize, y: it.y / presize}));
                console.log(poly1);
                //const optimized = optimizePolySoft1(optimizePolyHard(poly1));
                //const optimized = optimizePolySoft(poly1);
                //const optimized = optimizePolyDynamic(optimizePolyDynamic(poly1));
                const upd = (val, val2)=>{
                const optimized = optimizePolyDynamic(poly1, val, val2);
                //const optimized = optimizePolyDynamic(optimizePolyDynamic(poly1, val, val2), val, val2);
                const hitarea = [];
                optimized.forEach(it=>{
                    hitarea.push(it.x);
                    hitarea.push(it.y);
                })
                console.log(optimized);
                console.log('hitarea', hitarea)
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(img, 0, 0, img.naturalWidth * size, img.naturalHeight * size);
                ctx.beginPath();
                ctx.strokeStyle = '#f00';
                optimized.forEach((it, i) => {
                    if (i == 0) {
                        ctx.moveTo(optimized[optimized.length-1].x * size, optimized[optimized.length-1].y * size)
                        ctx.lineTo(it.x * size, it.y * size)
                    } else {
                        ctx.lineTo(it.x * size, it.y * size)
                    }
                })
                //ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#f90';
                optimized.forEach((it, i) => {
                    ctx.fillRect(it.x * size, it.y * size, 3, 3)
                })
                }
                upd(inp1.value, inp2.value);
                inp1.oninput = ()=>{
                    upd(inp1.value, inp2.value);
                }
                inp2.oninput = ()=>{
                    upd(inp1.value, inp2.value);
                }
            }
        })
    }
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const bitmap3 = [
        '-8----888-',
        '-8----8---',
        '-88-888-8-',
        '-8----8888',
        '-888888-8-',
        '-888888-8-',
        '8888888-8-',
        '---88-----',
        '888888888-',
        '-88888888-',
        '88--8-8-8-',
    ].map(it => it.split(''));

    const bitmap2 = [
        '----8-----',
        '---888----',
        '--88888---',
        '-8888888--',
        '888888888-',
        '-8888888--',
        '--88888---',
        '---888----',
        '----8-----',
    ].map(it => it.split(''));

    const bitmap = [
        '----8-----',
        '----8-----',
        '---888----',
        '---888----',
        '--88888---',
        '--88888---',
        '-8888888--',
        '-8888888--',
        '888888888-',
        '-8888888--',
        '--88888---',
        '---888----',
        '----8-----',
    ].map(it => it.split(''));

    const poly1 = getPoly(bitmap);
    console.log(poly1);
    const optimized = optimizePolySoft(optimizePolyHard(poly1));

    const getInitialPos = ()=>{
        let index = -1;
        const rowIndex = bitmap.findIndex((row)=>{
            index = row.findIndex(cell=>{
                return cell == '8';
            })
            return index != -1;
        });
        return {x: index, y: rowIndex}
    }

    const pos = getInitialPos();
    const player = {
        x: pos.x,//0,
        y: pos.y,//6,
        direction: 0
    }

    const moves = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ]

    const leftHand = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
    ]

    const dirs = [
        -1,
        0,
        1,
        2
    ]

    const poly = [];

    const tryMove = () => {
        if (bitmap[player.y + moves[player.direction].y]?.[player.x + moves[player.direction].x] == '8') {
            player.x = player.x + moves[player.direction].x;
            player.y = player.y + moves[player.direction].y;
            draw();
            return true;
        }
        draw();
    }

    const step = () => {
        console.log('step', player.x + moves[player.direction].x, player.y + moves[player.direction].y)
        const initDir = player.direction;

        for (let rots = 0; rots < 4; rots++) {
            console.log(rots, player.direction)
            if ((player.direction == 1 && rots == 3) || (player.direction == 1 && rots == 2)) {
                const lastPos = { ...player }
                poly.push({ x: lastPos.x + 1, y: lastPos.y + 1 });
            } else {
                const lastPos = { ...player }
                if ((player.direction == 2 && rots == 1)) {
                // if (bitmap[player.y + leftHand[player.direction].y]?.[player.x + leftHand[player.direction].x] != '8' || initDir == 0) {
                   // poly.push({ x: lastPos.x + (leftHand[lastPos.direction].x <= 0 ? 0 : 1), y: lastPos.y + (leftHand[lastPos.direction].y <= 0 ? 0 : 1) });
                }
            }

            player.direction = (4 + initDir + dirs[rots]) % 4;

            console.log('post', player.direction, rots)
            {
                const lastPos = { ...player }
                 if (
                       (player.direction == 3 && rots == 0)
                    //|| (player.direction == 2 && rots == 0)
                    || (player.direction == 1 && rots == 1)
                    || (player.direction == 2 && rots == 1)
                    || (player.direction == 3 && rots == 1) 
                    || (player.direction == 1 && rots == 2)
                    || (player.direction == 2 && rots == 2)
                    || (player.direction == 0 && rots == 3)
                    || (player.direction == 1 && rots == 3)
                    || (player.direction == 2 && rots == 3)
                    || (player.direction == 3 && rots == 3) 
                ) {
                //if (bitmap[player.y + leftHand[player.direction].y]?.[player.x + leftHand[player.direction].x] != '8') {
                    const point = { x: lastPos.x + (leftHand[lastPos.direction].x <= 0 ? 0 : 1), y: lastPos.y + (leftHand[lastPos.direction].y <= 0 ? 0 : 1) };
                    if (poly.length && (poly[0].x == point.x && poly[0].y == point.y)){
                        console.log('end');
                        return;
                    } else
                    if (poly.length == 0 || (poly[poly.length -1].x != point.x || poly[poly.length -1].y != point.y)){
                        poly.push(point);
                        console.log(poly)
                    } else {
                        console.log('ex', player.direction, rots)
                    }
                }
            }

            if (tryMove()) {
                draw()
                return;
            }
        }
    }

    const size = 20;
    const draw = () => {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        bitmap.forEach((row, y) => row.forEach((cell, x) => {
            ctx.fillStyle = cell == '8' ? '#ff0' : '#000';
            ctx.fillRect(x * size, y * size, size, size);
            ctx.strokeRect(x * size, y * size, size, size);
        }));

        ctx.fillStyle = '#090';
        ctx.strokeStyle = '#000';
        ctx.fillRect(player.x * size - 3 + size / 2, player.y * size - 3 + size / 2, 6, 6);

        ctx.fillStyle = '#098';
        ctx.strokeStyle = '#000';
        ctx.fillRect((player.x + leftHand[player.direction].x) * size - 2 + size / 2, (player.y + leftHand[player.direction].y) * size - 2 + size / 2, 4, 4);
        ctx.fillStyle = '#990';
        ctx.strokeStyle = '#000';
        ctx.fillRect((player.x + moves[player.direction].x) * size - 2 + size / 2, (player.y + moves[player.direction].y) * size - 2 + size / 2, 4, 4);

        ctx.beginPath();
        ctx.strokeStyle = '#f00';
        optimized.forEach((it, i) => {
            if (i == 0) {
                ctx.moveTo(optimized[optimized.length-1].x * size, optimized[optimized.length-1].y * size)
                ctx.lineTo(it.x * size, it.y * size)
            } else {
                ctx.lineTo(it.x * size, it.y * size)
            }
        })
        ctx.stroke();
        ctx.fillStyle = '#f90';
        optimized.forEach((it, i) => {
            ctx.fillRect(it.x * size, it.y * size, 3, 3)
        })
    }

    ctx.canvas.onclick = () => {
        step();
    }

    draw();
}

app();