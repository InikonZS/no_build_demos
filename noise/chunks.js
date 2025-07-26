const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    let chunks = [];
    const playerPos = {x: 0, y: 0};

    /*const updateChunks = (playerPos)=>{
        console.log(playerPos);
        chunks = [];
        const count = 4;
        const lodCound = 3;
        for (let lod =0; lod< lodCound; lod++){
            for (let y = 0; y<count; y++){
                for (let x = 0; x<count; x++){
                    if ((x == 0 || y==0 || x==count-1 || y==count-1) || lod == 0){
                    const size = 16 * 2 ** lod;
                        chunks.push({
                            size: size,
                           // pos: {x: (x - count /2) * size + Math.floor((playerPos.x - canvas.width/ 2 + 16) / 32)* 32 , y: (y-count/2) * size + Math.floor((playerPos.y - canvas.height/2 + 16) / 32)* 32}
                            pos: {x: (x - count /2) * size + Math.floor((playerPos.x - canvas.width/ 2 + 2 ** lod *16) / (2 ** lod * 32))* 2**lod * 32 , 
                                y: (y-count/2) * size + Math.floor((playerPos.y - canvas.height/2 + 2 ** lod *16) / (2** lod * 32))* 2**lod * 32}
                        });
                    }
                }
            }
        }
    }*/

    const updateChunks = (playerPos)=>{
        //chunks = [];
        for (let lod = 0; lod< 3; lod ++){
        const size = 2 ** lod * 8;
        const count = lod > 0 ? 8 : 6;
        for (let y = 0; y<count; y++){
            for (let x = 0; x<count; x++){
                const newPos ={
                        x: Math.floor((playerPos.x) / size + x - count /2 + 0.5) * size,
                        y: Math.floor((playerPos.y) / size + y - count /2 + 0.5) * size
                    };
                const isEx = chunks.find(it=>it.pos.x == newPos.x && it.pos.y == newPos.y && it.size == size);
                if (!isEx){
                    chunks.push({
                        size: size,
                        pos: newPos
                    });
                }
            }
        }
        chunks = chunks.filter(it=> it.size != size || Math.hypot(it.pos.x - playerPos.x , it.pos.y - playerPos.y) < size * count *1.4);
        }
        /*
         {const size = 16;
        const count = 6;
        for (let y = 0; y<count; y++){
            for (let x = 0; x<count; x++){
                const newPos ={
                        x: Math.floor((playerPos.x) / size + x - count /2 + 0.5) * size,
                        y: Math.floor((playerPos.y) / size + y - count /2 + 0.5) * size
                    };
                const isEx = chunks.find(it=>it.pos.x == newPos.x && it.pos.y == newPos.y && it.size == size);
                if (!isEx){
                    chunks.push({
                        size: size,
                        pos: newPos
                    });
                }
            }
        }
        }
        chunks = chunks.filter(it=> it.size == 16 || Math.hypot(it.pos.x - playerPos.x , it.pos.y - playerPos.y) < 64);
        */
    }

    updateChunks({x: 0, y: 0});
    canvas.onmousemove = (e)=>{
        updateChunks({x: e.offsetX - canvas.width /2, y: e.offsetY - canvas.height /2}); 
        draw();
    }
    const draw = ()=>{
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const ch1 = chunks.filter(it=>{
            return it.size == 8;
        });
        const ch2 = chunks.filter(it=>{
            return it.size == 16;
        });
        const ch3 = chunks.filter(it=>{
            return it.size == 32;
        });
        //console.l

        const chc2 =[];
        const chk = ch3.filter(it=>{
            const f = ch2.filter(jt=>jt.pos.x >= it.pos.x && jt.pos.y >= it.pos.y && jt.pos.x < it.pos.x + it.size && jt.pos.y < it.pos.y + it.size);
            if ( f.length == 4){
                f.forEach(fi=>{
                  chc2.push(fi);  
                })
                
            }
            return f.length !=4;
        });

        const chc =[];
        const ch = chc2.filter(it=>{
            const f = ch1.filter(jt=>jt.pos.x >= it.pos.x && jt.pos.y >= it.pos.y && jt.pos.x < it.pos.x + it.size && jt.pos.y < it.pos.y + it.size);
            if ( f.length == 4){
                f.forEach(fi=>{
                  chc.push(fi);  
                })
                
            }
            return f.length !=4;
        });
        [...ch,...chc, ...chk].forEach(chunk=>{
            ctx.strokeStyle = '#000';
            ctx.strokeRect(
                chunk.pos.x + canvas.width /2, 
                chunk.pos.y + canvas.height /2,
                chunk.size - 3,
                chunk.size - 3
            );
        })
    }
    draw();
}

app();