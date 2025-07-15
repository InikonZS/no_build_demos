const chunk = [
    '-----8-----88888--------8-----88888---',
    '--t--------88888--------8-----88888---',
    '--888888-8-88888--------8-----88888---',
    '-----88888----88--------8-----88888---',
    '--888888-----888--------8-----88888---',
    '-----88----88888--------8-----88888---',
    '-----8888--88888--------8-----88888---',
    '-----8-----88888--------8-----88888---',
    '--t---------------------8------t888---',
    '--888888-8-88888--------8-----88888---',
    '-----88888----88--------8-----88888---',
    '--888888-----888--------8-----88888---',
    '-----88----88888--------8-----88888---',
    '-----8888--88888--------------88888---',
    '-----88----88888--------8-----88888---',
    '-----8888--88888--------8-------------',
    '-----8-----88888----t---8-----88888---',
    '--t--------88888--------8-----88888---',
    '--888888-8-88888--------8-------------',
    '-----88888----88--------8-----88888---',
    '--888888-----888--------8-----88888---',
    '-----88----88888--------8-----88888---',
    '-----8888--88888--------8-----88888---',
].map(it=>it.split(''));

const hexColor = (value)=>{
    const hexValue = Math.floor(value).toString(16)
    return hexValue.length == 1 ? '0' + hexValue : hexValue
}

const grey = (c)=>{
    return `#${hexColor(c)}${hexColor(c)}${hexColor(c)}`
};

const steps = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 20;
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let cursorPos = null;
    let traced = raytrace(chunk);
    canvas.onmousemove = (e)=>{
        //console.log(e.offsetX)
        cursorPos = {
            x: Math.floor(e.offsetX / size), 
            y: Math.floor(e.offsetY / size)
        };

        if (!(cursorPos.x>=0 && cursorPos.x < chunk[0].length && cursorPos.y>=0 && cursorPos.y < chunk.length)){
            cursorPos = null;
        }
        draw();
    }

    canvas.onclick = ()=>{
        if (cursorPos){
            console.log(chunk[cursorPos.y][cursorPos.x]);
            if (chunk[cursorPos.y][cursorPos.x] == '8'){
                chunk[cursorPos.y][cursorPos.x] = '-'
            } else if (chunk[cursorPos.y][cursorPos.x] == '-'){
                chunk[cursorPos.y][cursorPos.x] = 't'
            } else if (chunk[cursorPos.y][cursorPos.x] == 't'){
                chunk[cursorPos.y][cursorPos.x] = '8'
            };
            traced = raytrace(chunk);
        }
        draw();
    }


    const draw = ()=>{
        chunk.forEach((it, i)=>
            it.forEach((jt, j)=>{
                if (jt == '8'){
                    ctx.strokeStyle = '#f002';
                } else {
                    ctx.strokeStyle = '#0002';
                }
                ctx.strokeRect(j* size, i* size, size, size);
            })
        );
        ctx.lineWidth = 1;
        traced.forEach(it=>{
            if (it.level == -1){
                ctx.strokeStyle = '#090';
                ctx.fillStyle = '#050'
            } else if (it.level == 15){
                ctx.strokeStyle = '#000';
                ctx.fillStyle = '#ff0';
                ctx.fillRect(it.x* size, it.y* size, size, size);
            } else {
                ctx.strokeStyle = '#000';
                ctx.fillStyle = grey(it.level * 16);
                ctx.fillRect(it.x* size, it.y* size, size, size);
            }
            ctx.fillRect(it.x* size, it.y* size, size, size);
            ctx.strokeRect(it.x* size, it.y* size, size, size);
            ctx.strokeStyle = '#099';
            ctx.strokeText(it.level, it.x* size +4, (it.y +1)* size -4);
        });
        ctx.fillStyle = '#f007';
        if (cursorPos){
            ctx.fillRect(cursorPos.x* size,cursorPos.y* size, size, size);
        }
    }
    draw();
}

const raytrace = (_chunk)=>{
    const chunk = _chunk.map(it=>it.map(jt=>{
        if (jt == '-'){
            return 0;
        } else
        if (jt == '8'){
            return -1;
        } else {
            return 15;
        }
    }));
    const list = [];

    for (let k = 0; k< 16; k++){
    chunk.forEach((it, i)=>
        it.forEach((jt, j)=>{
            if (jt>0){
                steps.forEach(step=>{
                    if (chunk[i+step.y] && chunk[i+step.y][j+step.x] != null && chunk[i+step.y][j+step.x] >= 0 && chunk[i+step.y][j+step.x]<jt){
                        chunk[i+step.y][j+step.x] = jt -1;
                    }
                })
            }
    }));
}

    chunk.forEach((it, i)=>
        it.forEach((jt, j)=>{
            list.push({
                x: j, 
                y: i,
                level: jt
            })
    }));
    console.log(chunk);
    return list;
}


app();