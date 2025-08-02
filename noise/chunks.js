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
        const minLod = 8;
        for (let lod = 0; lod< 4; lod ++){
        const size = 2 ** lod * minLod;
        const count = lod > 0 ? 12 : 8;
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
        chunks = chunks.filter(it=> it.size != size || Math.hypot(it.pos.x - playerPos.x , it.pos.y - playerPos.y) < size * count *1.02);
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
       /*const ch1 = chunks.filter(it=>{
            return it.size == 8;
        });
        const ch2 = chunks.filter(it=>{
            return it.size == 16;
        });
        const ch3 = chunks.filter(it=>{
            return it.size == 32;
        });*/
        //console.l

        const splitLod = (lodSmall, lodBig)=>{
            const resultSmall = [];
            const resultBig = lodBig.filter(it=>{
                const filtered = lodSmall.filter(jt=>
                    jt.pos.x >= it.pos.x && 
                    jt.pos.y >= it.pos.y && 
                    jt.pos.x < it.pos.x + it.size && 
                    jt.pos.y < it.pos.y + it.size
                );
                if ( filtered.length == 4){
                    filtered.forEach(fi=>{
                    resultSmall.push(fi);  
                    })
                    
                }
                return filtered.length !=4;
            });
            return [resultSmall, resultBig];
        }

        const filterLods = ()=>{
            const lods = [64, 32, 16, 8].map(it=>{
                return chunks.filter(jt=>{
                    return jt.size == it;
                });
            });

            let filtered = [];
            let prevLod;
            lods.forEach((lod, i)=>{
                if (i==0){
                    return;
                }
                if (!prevLod){
                    prevLod = lods[i - 1];
                }
                const [small, big] = splitLod(lods[i], prevLod);
                prevLod = small;
                big.forEach(it=>filtered.push(it));
                if (i == lods.length -1){
                    small.forEach(it=>filtered.push(it));
                }
            });
            return filtered;
        }

        /*const chc2 =[];
        const chk = ch3.filter(it=>{
            const f = ch2.filter(jt=>jt.pos.x >= it.pos.x && jt.pos.y >= it.pos.y && jt.pos.x < it.pos.x + it.size && jt.pos.y < it.pos.y + it.size);
            if ( f.length == 4){
                f.forEach(fi=>{
                  chc2.push(fi);  
                })
                
            }
            return f.length !=4;
        });*/
        //const [_lod2, lod3] = splitLod(ch2, ch3);
        //const [lod1, lod2] = splitLod(ch1, _lod2);

        /*const chc =[];
        const ch = chc2.filter(it=>{
            const f = ch1.filter(jt=>jt.pos.x >= it.pos.x && jt.pos.y >= it.pos.y && jt.pos.x < it.pos.x + it.size && jt.pos.y < it.pos.y + it.size);
            if ( f.length == 4){
                f.forEach(fi=>{
                  chc.push(fi);  
                })
                
            }
            return f.length !=4;
        });*/
        const lodsList = filterLods();
        /*[...ch,...chc, ...chk]*//*[...lod1, ...lod2, ...lod3]*/ lodsList.forEach(chunk=>{
            ctx.strokeStyle = '#000';
            ctx.strokeRect(
                chunk.pos.x + canvas.width /2, 
                chunk.pos.y + canvas.height /2,
                chunk.size - 3,
                chunk.size - 3
            );
            ctx.fillStyle = '#000';
            ctx.font = 'normal 14px sans-serif';
            ctx.fillText('cached: ' + chunks.length + ', visible: ' + lodsList.length, 10, 10);
        })
    }
    draw();
}

app();