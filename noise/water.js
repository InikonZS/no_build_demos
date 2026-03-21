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
        render()
        requestAnimationFrame(()=>{
           loop(); 
        })
    }


    const canvas = document.createElement('canvas');
    canvas.onclick = ()=>{
        console.log('rend');
        loop();
        //render();
    }
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const particles = [];

    for(let i = 0; i<1220; i++){
        particles.push({
            x: 7,
            y: 0,
            dir: 0
        })
    }

    let globalWave = 0;

    const process = ()=>{
        //globalWave = (globalWave + 1) % 10;
        const tempmap = new Array(bitmap.length).fill(null).map(row=>new Array(bitmap[0].length).fill(0));
        particles.forEach(particle=>{
            tempmap[particle.y][particle.x]++;
        });
        particles.forEach(particle=>{
            //tempmap[particle.y][particle.x]++;
            if (![undefined, '8'].includes(bitmap[particle.y+1]?.[particle.x]) && tempmap[particle.y+1]?.[particle.x] == 0){
                tempmap[particle.y][particle.x]--;
                particle.y +=1;
                tempmap[particle.y][particle.x]++;
                particle.dir = 0;
            } else {
                if (particle.dir == 0){
                    particle.dir = Math.random()<0.5? 1 : -1;
                }
                let move = false;
                if (![undefined, '8'].includes(bitmap[particle.y]?.[particle.x+1]) && tempmap[particle.y]?.[particle.x+1] == 0 && particle.dir == -1){
                    tempmap[particle.y][particle.x]--;
                    particle.x +=1;
                    tempmap[particle.y][particle.x]++;
                    move = true;
                }

                if (![undefined, '8'].includes(bitmap[particle.y]?.[particle.x-1]) && tempmap[particle.y]?.[particle.x-1] == 0 && particle.dir == 1){
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
                ctx.strokeRect(x* size, y* size, size, size);
                ctx.fillStyle = cell == '8' ? '#090' : '#990';
                ctx.fillRect(x* size, y* size, size, size);
            })
        });
    }

    const render = (hard = false)=>{
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
    
    render(true);
}

app();