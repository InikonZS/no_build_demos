function init(){
    const canvas= document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const _objects = [
        [
            {x: 10, y:10},
            {x: 150, y:130},
            {x: 40, y:150}
        ],
        [
            {x: 30+140, y:15},
            {x: 100+140, y:10},
            {x: 150+140, y:130},
            {x: 40+140, y:280},
            {x: 20+140, y:280}
        ],
        [
            {x: 100+340, y:10},
            {x: 100+340, y:350},
            {x: 40+340, y:380}
        ],
        new Array(11).fill(0).map((it, i)=> ({x: 100+50* Math.sin(Math.PI*2 / 11 * i), y: 100+i*10* Math.cos(Math.PI*2 / 11 * i)}))
    ];
    const objects = _objects.map(obj=>{ 
        return obj.map((it,i)=>{
            const nextPoint = obj[(i+1)%obj.length];
            return {
                pos:it,
                vel: {x: 0, y: 0},
                force: {x: 0, y: 0},
                distnext: Math.hypot(it.x - nextPoint.x, it.y - nextPoint.y),
                dists: obj.map((jt, j)=>Math.hypot(it.x - jt.x, it.y - jt.y))
            }
        });
    });

    const grav = 0.0000043;
    const kz = 1.00005;

    const calcStep =()=>{
        objects.forEach(obj=>{
            obj.forEach((it, i)=>{
                it.force.y = it.pos.y>canvas.height? (- it.pos.y + canvas.height)/1 :grav;
                //it.force.x = it.force.x *0.51;
                //it.force.y = it.force.y *0.51;
                it.vel.x = it.vel.x/kz + (it.force.x);
                it.vel.y = it.vel.y/kz + (it.force.y );
                //it.force.x = 0;
                //it.force.y = 0;
                //it.pos.x = it.pos.x + it.vel.x;
                //it.pos.y = it.pos.y + it.vel.y;
            });
            obj.forEach((it, i)=>{
                const acDists = obj.map((jt, j)=>{
                    return Math.hypot(it.pos.x - jt.pos.x, it.pos.y - jt.pos.y);
                });
                acDists.forEach((nextDist, k)=>{
                    if (k==i){
                        return;
                    }
                    const nextPoint = obj[k];
                   //const nextPoint = obj[(i+1)%obj.length];
                    //const nextDist = //Math.hypot(it.pos.x - nextPoint.pos.x, it.pos.y - nextPoint.pos.y);
                    const curDist = it.dists[k]; //it.distnext;
                    const dir = {
                        x: -(nextDist - curDist) * (it.pos.x - nextPoint.pos.x)/curDist,
                        y: -(nextDist - curDist) * (it.pos.y - nextPoint.pos.y)/curDist,
                    }
                    //it.force.x+=dir.x/ 3000;
                    //it.force.y+=dir.y/ 3000;
                    it.vel.x = it.vel.x/kz + (it.force.x + dir.x/ 30000);
                    it.vel.y = it.vel.y/kz + (it.force.y + dir.y /30000);
                    //nextPoint.vel.x = nextPoint.vel.x/1.05 + (- dir.x/ 1);
                    //nextPoint.vel.y = nextPoint.vel.y/1.05 + (- dir.y /1); 
                });
                

                //it.pos.x = it.pos.x + it.vel.x;
                //it.pos.y = it.pos.y + it.vel.y;
            });

            obj.forEach((it, i)=>{
                it.pos.x = it.pos.x + it.vel.x;
                it.pos.y = it.pos.y + it.vel.y;
            });
        }
    )};

    const clear = ()=>{
        ctx.fillStyle = '#00000020';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    }
    const draw = ()=>{
        objects.forEach(obj=>{
            obj.forEach((it, i)=>{
                ctx.strokeStyle = '#f90';
                ctx.beginPath();
                ctx.moveTo(it.pos.x, it.pos.y);
                const nextPoint = obj[(i+1)%obj.length].pos;
                ctx.lineTo(nextPoint.x, nextPoint.y);
                ctx.stroke();
            });
            obj.forEach((it, i)=>{
                ctx.fillStyle = '#f00';
                ctx.fillRect(it.pos.x, it.pos.y, 3, 3);
            });
        })
    }
    const render = ()=>{
       clear();
        //objects.forEach(obj=>{
            for (let i=0; i<40; i++){
                calcStep();
                
                draw();
            }
        //})
        requestAnimationFrame(()=>{
            render();
        });
    }

    render();
}

init();