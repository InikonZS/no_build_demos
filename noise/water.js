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

function toBitmap(img, pos, threshold, zero = '-', one = '8') {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0,0);
    //const canvas = ctx.canvas;
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

const getPoly = (spos, bitmap)=>{
    if (bitmap[spos.y]?.[spos.x] !== '8') {
        //console.log('emp')
        return;
    }
    /*const getInitialPos = ()=>{
        let index = -1;
        const rowIndex = bitmap.findIndex((row)=>{
            index = row.findIndex(cell=>{
                return cell == '8';
            })
            return index != -1;
        });
        return {x: index, y: rowIndex}
    }*/
    const getInitialPos = ()=>{
        let index = spos.x;
        const rowIndex = spos.y;
        while(bitmap[rowIndex]?.[index - 1] == '8'){
            index--;
        }
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

const floodFill = (map, startX, startY, onRemove) => {
    //const H = map.length;
    //const W = map[0].length;

    const moves = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ];

    // если старт не пустой — ничего не делаем
    if (map[startY]?.[startX] !== '8') {
        //console.log('emp')
        return;
    }

    //console.log('ne')
    const stack = [{ x: startX, y: startY }];

    while (stack.length) {
        const { x, y } = stack.pop();

        // проверка границ и типа
        if (map[y]?.[x] !== '8') continue;

        // заливаем
        map[y][x] = '-'; // или null, или '8' если хочешь "стереть"
        onRemove?.({x, y});

        // добавляем соседей
        for (const m of moves) {
            stack.push({ x: x + m.x, y: y + m.y });
        }
    }
};

const bitmapTemplate = [
    '----8-------8888---',
    '----88-----88888---',
    '--88888--8-88888---',
    '-----88888--8888---',
    '--888888------88---',
    '-----88--888--88---',
    '-----888---8---8---',
    '-----888---888-8---',
    '-----88------888---',
    '-----8888--88888---',
    '-----88----88888---',
    '-----88888888888---',
].map(it=>it.split(''));

const smooth = (arr)=>{
    const val = (v)=>v=='-'? 0 : 1;
    const valArr = new Array(arr.length).fill(null).map(row=>new Array(arr[0].length).fill(0));
    arr.forEach((row, y)=>{
        row.forEach((cell,x)=>{
            valArr[y][x] = val(cell);
        })
    })
    valArr.forEach((row, y)=>{
        row.forEach((cell,x)=>{
            if (valArr[y+1]?.[x+1]!=undefined && valArr[y]?.[x+1]!=undefined && valArr[y+1]?.[x]!=undefined){
                valArr[y][x] = (valArr[y][x] + valArr[y+1]?.[x+1] + valArr[y]?.[x+1] + valArr[y+1]?.[x]) / 4
            }
        })
    });
    const res = (v)=>v<0.25? '-' : '8';
    const resArr = new Array(arr.length).fill(null).map(row=>new Array(arr[0].length).fill(0));
        valArr.forEach((row, y)=>{
        row.forEach((cell,x)=>{
            resArr[y][x] = res(cell)
        })
    })
    return resArr;
}

const app = ()=>{
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = "image/*";
    document.body.append(inp);
    let bitmap = bitmapTemplate;

    inp.onchange = (e)=>{
        processFile(e.target.files[0], (img)=>{
            const [bmp] = toBitmap(img, {x:0, y:0}, 10, '8', '-');
            console.log(bmp);
            bitmap = bmp;
            render(true);
        })
    }

    const loop = ()=>{
        for (let i = 0; i< 1; i++){
            render()
        }
        requestAnimationFrame(()=>{
           loop(); 
        })
    }


    const canvas = document.createElement('canvas');
    canvas.onclick = (e)=>{
        console.log('rend');
        if (e.ctrlKey == false) {
        //render();
        for(let i = 0; i<200; i++){
        particles.push({
            x: Math.floor(e.offsetX / size),
            y: Math.floor(e.offsetY / size),
            dir: 0,
            pressure: 0,
            vdir: 0
        })
        } 
    }else {
            for(let i = -4; i<4; i++){
                for(let j = -4; j<4; j++){
                bitmap[Math.floor(e.offsetY / size)+i][Math.floor(e.offsetX / size)+j] = '-'
            }
            }
            render(true)
        }
    }
    //loop();
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const particles = [];

    for(let i = 0; i<20; i++){
        particles.push({
            x: 7,
            y: 0,
            dir: 0,
            pressure: 0,
            vdir: 0
        })
    }

    let globalWave = 0;

    const process = ()=>{
        //globalWave = (globalWave + 1) % 10;
        const tempmap = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill(0));
        
        particles.forEach(particle=>{
            tempmap[particle.y][particle.x]++;
            particle.move = false;
        });

        ///hudrostatic, disable for sand simulation
        const watermap = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill('-'));
        particles.forEach(particle=>{
            watermap[particle.y][particle.x] = '8';
        });
        const indexedParticles = {};
            particles.forEach(particle=>{
            indexedParticles[`${particle.x}_${particle.y}`] = particle;
        });
        //const chunks = [];
        watermap.forEach((row, y)=>{
            row.forEach((cell,x)=>{
                const chunk = [];
                let top = 10000;
                floodFill(watermap, x, y, (pos)=>{
                    top = Math.min(pos.y, top);
                    chunk.push(indexedParticles[`${pos.x}_${pos.y}`]);
                });
                chunk.forEach(particle=>{
                    particle.pressure = particle.y - top;//(particle.pressure *31 + ( particle.y - top ))/32;
                });
                const tops = chunk.filter(it=>it.pressure == 0);
                const topsPressed = chunk.filter(it=>it.pressure > 1 && tempmap[it.y-1]?.[it.x] == 0 && ![undefined, '8'].includes(bitmap[it.y-1]?.[it.x]));
                topsPressed.sort((a, b)=>{
                    return b.pressure - a.pressure;
                });
                if (topsPressed[0] && tops[0]){
                    tempmap[tops[0].y][tops[0].x]--;
                    tops[0].y = topsPressed[0].y-1;
                    tops[0].x = topsPressed[0].x;
                    tempmap[tops[0].y][tops[0].x]++;
                    tops[0].pressure = topsPressed[0].pressure - 1;
                }
                //chunks.push(chunk);
            })
        });
        ///end hydrostatic
        /*particles.sort((a, b)=>{
            return -b.pressure + a.pressure;
        });
        particles.forEach(particle=>{
            //tempmap[particle.y][particle.x]++;
            if (![undefined, '8'].includes(bitmap[particle.y-1]?.[particle.x]) && tempmap[particle.y-1]?.[particle.x] == 0 && tempmap[particle.y+1]?.[particle.x] != 0 && particle.pressure>2){
                tempmap[particle.y][particle.x]--;
                particle.y -=1;
                tempmap[particle.y][particle.x]++;
                particle.pressure--;
                //particle.dir = 0;
                particle.vdir-=1;
                //particle.move = true;
            } else {
                particle.vdir = Math.min(0, particle.vdir + 1);
            }
        })*/

        /*particles.sort((a, b)=>{
            if (![undefined, '8'].includes(bitmap[a.y+1]?.[a.x]) && tempmap[a.y+1]?.[a.x] == 0 && ![undefined, '8'].includes(bitmap[b.y+1]?.[b.x]) && tempmap[b.y+1]?.[b.x] != 0){
                return -1;
            }
            if (![undefined, '8'].includes(bitmap[b.y+1]?.[b.x]) && tempmap[b.y+1]?.[b.x] == 0 && ![undefined, '8'].includes(bitmap[a.y+1]?.[a.x]) && tempmap[a.y+1]?.[a.x] != 0){
                return 1;
            }
            return 0;
        });*/
        particles.sort((a, b)=>{
            if (a.y !== b.y) return b.y - a.y;
            if (a.dir < 0 && b.dir < 0) return a.x - b.x;
            if (a.dir > 0 && b.dir > 0) return b.x - a.x;
            return 0
        });
        particles.forEach(particle=>{
            if (particle.move){
                return;
            }
            //tempmap[particle.y][particle.x]++;
            if (![undefined, '8'].includes(bitmap[particle.y+1]?.[particle.x]) && tempmap[particle.y+1]?.[particle.x] == 0){
                tempmap[particle.y][particle.x]--;
                particle.y +=1;
                tempmap[particle.y][particle.x]++;
                //particle.dir = 0;
                particle.move = true; //setting
            }
        })
        particles.forEach(particle=>{
            if (particle.move){
                return;
            }
            //tempmap[particle.y][particle.x]++;
            if (![undefined, '8'].includes(bitmap[particle.y+1]?.[particle.x]) && tempmap[particle.y+1]?.[particle.x] == 0 /*&& particle.vdir == 0*/){
               /* tempmap[particle.y][particle.x]--;
                particle.y +=1;
                tempmap[particle.y][particle.x]++;
                particle.dir = 0;*/
                //try change upper
            } else {
                if (particle.dir == 0){
                    particle.dir = Math.random()<0.5? 1 : -1;
                }
                let move = false;
                if (![undefined, '8'].includes(bitmap[particle.y]?.[particle.x+1]) && tempmap[particle.y]?.[particle.x+1] == 0 && particle.dir == -1){
                    /*if (['8'].includes(bitmap[particle.y+1]?.[particle.x+1]) && Math.random()>0.1){
                        return;
                    }*/
                    tempmap[particle.y][particle.x]--;
                    particle.x +=1;
                    tempmap[particle.y][particle.x]++;
                    move = true;
                }

                if (![undefined, '8'].includes(bitmap[particle.y]?.[particle.x-1]) && tempmap[particle.y]?.[particle.x-1] == 0 && particle.dir == 1){
                    /*if (['8'].includes(bitmap[particle.y+1]?.[particle.x-1]) && Math.random()>0.1){
                        return;
                    }*/
                    tempmap[particle.y][particle.x]--;
                    particle.x -=1;
                    tempmap[particle.y][particle.x]++;
                    move = true;
                } 
                if (move==false){
                    particle.dir = 0;
                }
            }
        })
    }

    const cacheBg = document.createElement('canvas');   
    cacheBg.width = 856;
    cacheBg.height = 656;
    const bgCtx = cacheBg.getContext('2d');

    const size = 5;
    
    const renderBg = ()=>{
        const ctx = bgCtx;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#000';
        bitmap.forEach((row, y)=>{
            row.forEach((cell, x)=>{
                ctx.strokeStyle = '#0003';
                ctx.strokeRect(x* size, y* size, size, size);
                ctx.fillStyle = cell == '8' ? '#090' : '#990';
                ctx.fillRect(x* size, y* size, size, size);
            })
        });
    }

    const cacheFg = document.createElement('canvas');   
    cacheFg.width = 856;
    cacheFg.height = 656;
    const fgCtx = cacheFg.getContext('2d');

    //const size = 5;
    
    const renderFg = ()=>{
        const ctx = fgCtx;
        //ctx.fillStyle = '#ccc';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#000';
        bitmap.forEach((row, y)=>{
            row.forEach((cell, x)=>{
                ctx.strokeStyle = cell == '8'?'#0003':'#0000';
                ctx.strokeRect(x* size, y* size, size, size);
                ctx.fillStyle = cell == '8' ? '#090' : '#9900';
                ctx.fillRect(x* size, y* size, size, size);
            })
        });
    }

    const render1 = (hard = false)=>{
        process();
        if (hard){
            renderBg();
        }
        ctx.fillStyle = '#ccc';
        ctx.drawImage(cacheBg, 0, 0);
        particles.forEach(particle=>{
            const {x, y} = particle;
            ctx.strokeRect(x* size, y* size, size, size);
            ctx.fillStyle = '#0094';
            ctx.fillRect(x* size, y* size, size, size);
        })
    }

    const render/*Poly*/ = (hard = false)=>{
        process();
        if (hard){
            renderBg();
            renderFg();
        }
        ctx.fillStyle = '#ccc';
        ctx.drawImage(cacheBg, 0, 0);

        const renderPolys = (pmap, tempmap, color, border)=>{
            pmap.forEach(particle=>{
                const poly = getPoly(particle, tempmap);
                if (!poly || poly.length < 4){
                    return;
                }
                floodFill(tempmap, particle.x, particle.y);
            
                ctx.beginPath();
                ctx.moveTo(poly[poly.length -1].x* size, poly[poly.length -1].y* size, size, size);
                poly.forEach((it, i)=>{
                    const {x,y}=it;
                    //if (i==0){
                        //ctx.moveTo(x* size, y* size, size, size);
                    //} else {
                        ctx.lineTo(x* size, y* size, size, size);
                    //}
                });
                //ctx.closePath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = border || '#909';
                ctx.fillStyle = color || '#0094';
                ctx.fill();
                ctx.stroke();
                ctx.lineWidth = 1;

                if (!particle.used){

                }
                /*const {x, y} = particle;
                ctx.strokeRect(x* size, y* size, size, size);
                ctx.fillStyle = '#0094';
                ctx.fillRect(x* size, y* size, size, size);*/
            })
        }

        const tempmap = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill('-'));
        particles.forEach(particle=>{
            tempmap[particle.y][particle.x] = '8';
        });

        const pmap = particles.filter(it=>!(tempmap[it.y - 1]?.[it.x] != '8' && bitmap[it.y - 1]?.[it.x] != '8')).map(it=>{
            return {...it, used: false};
        })

        const tempmapNoTop = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill('-'));
        pmap.forEach(particle=>{
            tempmapNoTop[particle.y][particle.x] = '8';
        });

        const pmapTop = particles.filter(it=>tempmap[it.y - 1]?.[it.x] != '8' && bitmap[it.y - 1]?.[it.x] != '8').map(it=>{
            return {...it, used: false};
        });
        //console.log(pmapTop.length)

        const tempmapTop = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill('-'));
        pmapTop.forEach(particle=>{
            tempmapTop[particle.y][particle.x] = '8';
        });

        renderPolys(pmapTop, tempmapTop, '#ccf', '#0000');
        renderPolys(pmap, tempmapNoTop, '#99f', '#0000');
        //renderPolys(pmap, tempmap);
        ctx.drawImage(cacheFg, 0, 0);
    }
    
    render(true);
    loop();
}

app();