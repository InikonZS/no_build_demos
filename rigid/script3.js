import { solveCutted } from "../xone/linear.js";

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
        this.sects = [];
        lines.forEach(other =>{
            if (other == this) {
                return;
            }
            const pos = solveCutted(this.a.pos, this.b.pos, other.a.pos, other.b.pos);
            if (pos){
                this.sects.push(pos);
            }
        });
    }

    render(ctx){
        ctx.strokeStyle = '#9f0';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();

        this.sects.forEach(it=>{
            ctx.strokeStyle = '#f0f';
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.ellipse(it.x, it.y, 4, 4, 0 ,0, Math.PI*2);
            ctx.stroke();
            ctx.fillRect(it.x-1, it.y-1, 2, 2);
        })
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

    const lines = [
        
    ];

    const calcStep =()=>{
        lines.forEach(it=>{
            it.step(lines);
        });
    };

    const clear = ()=>{
        ctx.fillStyle = '#00000020';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    }

    const draw = ()=>{
        lines.forEach(it=>it.render(ctx));
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