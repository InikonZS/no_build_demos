const chunk1 = [
    '-----8-----88888---',
    '-----8-----88888---',
    '--888888-8-88888---',
    '-----88888-08888---',
    '--888888---08888---',
    '-----88----88888---',
    '-----8888--88888---',
].map(it=>it.split(''));

const chunk = new Array(40).fill(null).map(it=> new Array(40).fill(0).map(jt=>Math.random() > 0.25? '8': '-'));

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 20;
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cutted = cut(chunk);
    console.log(cutted.length, chunk.reduce((ac, it)=> ac + it.reduce((bc, jt)=> bc + (jt == '8' ? 1 : 0), 0), 0));

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
    ctx.strokeStyle = '#000';
    cutted.forEach(it=>{
        ctx.strokeRect(it.x* size, it.y* size, it.sx*size, it.sy*size);
        ctx.fillStyle = '#0903';
        ctx.fillRect(it.x* size, it.y* size, it.sx*size, it.sy*size);
    });
}

const cut = (_chunk)=>{
    const chunk = _chunk.map(it=>it.map(jt=>jt));
    const list = [];

    chunk.forEach((it, i)=>
        it.forEach((jt, j)=>{
            let sizeX = 0;
            let sizeY = 0;
            if (chunk[i]?.[j] == 8){
                sizeX = 1;
                sizeY = 1;

                for (let s =0; s<16; s++){
                let avX = true
                for (let k = 0; k<sizeX; k ++){
                    if (chunk[i +sizeY]?.[j+k] != '8'){
                        avX = false;
                    }
                }
                if (avX == true){
                    sizeY+=1;
                }
                let avY = true
                for (let k = 0; k<sizeY; k ++){
                    if (chunk[i+k]?.[j+sizeX] != '8'){
                        avY = false;
                    }
                }
                if (avY == true){
                    sizeX+=1;
                }

                for(let k =0; k< sizeY; k++){
                    for(let l =0; l< sizeX; l++){
                        chunk[i+k][j+l] = '+'
                    }
                }
            }

                list.push({y: i, x:j, sx:sizeX, sy:sizeY});
            }

            /*if (jt =='8' && it[j+1]=='8' && chunk[i+1]?.[j]=='8' && chunk[i+1]?.[j+1]=='8'){
                list.push({y: i, x:j, sx:2, sy:2});
                it[j+1]='+';
                chunk[i+1][j]='+'
                chunk[i+1][j+1]='+'
            } else
            if (jt =='8' && it[j+1]=='8'){
                list.push({y: i, x:j, sx:2, sy:1});
                it[j+1]='+'
            } else if (jt =='8' && chunk[i+1]?.[j]=='8'){
                list.push({y: i, x:j, sx:1, sy:2});
                chunk[i+1][j]='+'
            }
            else
            if (jt =='8'){
                list.push({y: i, x:j, sx:1, sy:1});
            }*/
        })
    );

    //console.log(chunk);
    return list;
}


app();