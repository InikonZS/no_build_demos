import { solveCutted } from "../xone/linear.js";

function rotate(v, ang){
    return {x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: v.y * Math.cos(ang) - v.x * Math.sin(ang)}
}

const getNormal = (v1, v2)=>{
    const len = Math.hypot(v1.x - v2.x, v1.y - v2.y)
    const v = {
        x: (v1.x - v2.x) / len,
        y: (v1.y - v2.y) / len
    };
    return rotate(v, Math.PI / 2);
}

class SolidPoint{
    constructor(){
        this.pos = {x: 0, y: 0}
    }

    step(){

    }

    render(ctx){
        ctx.fillStyle = '#f0f';
        ctx.fillRect(this.pos.x-3, this.pos.y-3, 6, 6);
    }
}

class SolidLine{
    constructor(){
        this.a;
        this.b;
        this.sects = [];
    }

    step(lines){
        this.normal = getNormal(this.a.pos, this.b.pos);
        this.sects = [];
        lines.forEach(other =>{
            if (other == this) {
                return;
            }
            const pos = solveCutted(this.a.pos, this.b.pos, other.a.pos, other.b.pos);
            if (pos){
                this.sects.push({
                    pos,
                    obj: other
                });
            }
        });
    }

    render(ctx){
        ctx.strokeStyle = '#9f0';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();

        this.sects.forEach(_it=>{
            const it = _it.pos;
            ctx.strokeStyle = '#f0f';
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.ellipse(it.x, it.y, 4, 4, 0 ,0, Math.PI*2);
            ctx.stroke();
            ctx.fillRect(it.x-1, it.y-1, 2, 2);
        });

        const centerPoint = {
            x: (this.a.pos.x + this.b.pos.x) / 2,
            y: (this.a.pos.y + this.b.pos.y) / 2,
        }
        ctx.strokeStyle = '#407';
        ctx.beginPath();
        ctx.moveTo(centerPoint.x, centerPoint.y);
        ctx.lineTo(centerPoint.x + this.normal.x * 10, centerPoint.y + this.normal.y * 10);
        ctx.stroke();
    }
}

function init(){
    const canvas= document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    let downPoint = null;
    canvas.onmousedown = (e)=>{
        downPoint = new SolidPoint();
        downPoint.pos.x = e.offsetX;
        downPoint.pos.y = e.offsetY;
    }

    canvas.onmouseup = (e)=>{
        const upPoint = new SolidPoint();
        upPoint.pos.x = e.offsetX;
        upPoint.pos.y = e.offsetY;
        const line = new SolidLine();
        line.a = downPoint;
        line.b = upPoint;
        lines.push(line);
    }

    const player = new SolidLine();
    player.a = new SolidPoint();
    player.b = new SolidPoint();
    player.a.pos = {x: 30, y:30};
    player.b.pos = {x: 80, y:80};

    let speed = {x: 0, y: 0}

    window.onkeydown=(e=>{
        console.log(e.code);
        if (e.code == 'KeyA' || e.code == 'ArrowLeft'){
           // if (speed.x != 1){
                speed = {x:-1, y:0};
            //}
        }
        if (e.code == 'KeyW' || e.code == 'ArrowUp'){
           // if (speed.y != 1){
                speed = {x:0, y:-1};
           // }
        }
        if (e.code == 'KeyS' || e.code == 'ArrowDown'){
           // if (speed.y != -1){
                speed = {x:0, y:1};
            //    changeDir();
            //}
        }
        if (e.code == 'KeyD' || e.code == 'ArrowRight'){
           // if (speed.x != -1){
                speed = {x:1, y:0};
            //    changeDir();
            //}
        }
    });

    const lines = [
        
    ];

    const calcStep =()=>{
        lines.forEach(it=>{
            it.step(lines);
        });
        const k = 0.05;
        player.a.pos.x +=speed.x*k;
        player.a.pos.y +=speed.y*k;
        player.b.pos.x +=speed.x*k;
        player.b.pos.y +=speed.y*k;
        player.step(lines);
        if (player.sects.length){
            const mnorm = player.sects.reduce((acc, sc)=>{
                const nn = {
                    x: (acc.x + sc.obj.normal.x) /2, 
                    y: (acc.y + sc.obj.normal.y) /2, 
                }
                const len = Math.hypot(nn.x, nn.y);
               // (len <1) && console.log({x:nn.x/len, y: nn.y/len}, len,  Math.hypot(nn.x/len, nn.y/len));
                //(len ==1) && console.log('shit');
                return {x:nn.x/len, y: nn.y/len}
            }, player.sects[0].obj.normal);
            const norm = mnorm// rotate(mnorm, Math.PI /2);
            //const norm = player.sects[0].obj.normal
            const dot = norm.x*speed.x + norm.y*speed.y;
            const reflected = {
                x: speed.x - (norm.x * 2 * dot),
                y: speed.y - (norm.y * 2 * dot),
            }
            speed = reflected;
            //speed.x = speed.x * norm.x + speed.y * norm.y;
            //speed.y = -speed.x * norm.y + speed.y * norm.x;
        }
    };

    const clear = ()=>{
        ctx.fillStyle = '#00000020';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    }

    const draw = ()=>{
        lines.forEach(it=>it.render(ctx));
        player.render(ctx);
    }

    const render = ()=>{
        clear();
        for (let i=0; i<40; i++){
            calcStep();
            
            draw();
        }
        requestAnimationFrame(()=>{
            render();
        });
    }

    render();
}

init();