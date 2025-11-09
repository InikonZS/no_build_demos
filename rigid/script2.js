class PhysPoint{
    constructor(){
        this.pos = {x: 0, y:0};
        this.vel = {x: 0, y:0};
        this.acc = {x: 0, y:0};
        this.mass = 1;
    }

    step(){
        this.pos.x = this.pos.x + this.vel.x;
        this.pos.y = this.pos.y + this.vel.y;
        if (this.pos.y> 800){
            this.pos.y = 800;
            this.vel.y = -this.vel.y * 0.99995;
        }
    }

    render(ctx){
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.pos.x-3, this.pos.y-3, 6, 6);
    }
}

class PhysJoint{
    constructor(){
        this.a;
        this.b;
        this.targetLength = 150;
        this.strength = 1;
        this.friction = 0.9999;
    }

    step(){
        const nextDist = Math.hypot(this.a.pos.x - this.b.pos.x, this.a.pos.y - this.b.pos.y);
        const nextPoint = this.b;
        const curDist = this.targetLength
        const dir = {
            x: -(nextDist - curDist) * (this.a.pos.x - nextPoint.pos.x)/curDist,
            y: -(nextDist - curDist) * (this.a.pos.y - nextPoint.pos.y)/curDist,
        }
        //const p = (this.a.mass + this.b.mass) * 
        //it.force.x+=dir.x/ 3000;
        //it.force.y+=dir.y/ 3000;
        const strength = this.strength*1000;
        this.a.vel.x = this.a.vel.x *this.friction + (dir.x/ strength)*this.b.mass / (this.a.mass + this.b.mass);
        this.a.vel.y = this.a.vel.y *this.friction + (dir.y /strength)*this.b.mass / (this.a.mass + this.b.mass); 

        this.b.vel.x = this.b.vel.x *this.friction - (dir.x/ strength)*this.a.mass / (this.a.mass + this.b.mass);
        this.b.vel.y = this.b.vel.y *this.friction - (dir.y /strength)*this.a.mass / (this.a.mass + this.b.mass); 
    }

    render(ctx){
        ctx.strokeStyle = '#f90';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();
    }
}

class PhysBlock{
    constructor(pos, pw, ph, dw, dh, strength){
        this.points = new Array(pw * ph).fill(0).map((it,i)=>{
            const point = new PhysPoint();
            point.pos = {
                x: Math.floor(i % pw) * dw + pos.x,
                y: Math.floor(i / pw) * dh + pos.y /*+ i*8*/,
            }
            return point;
        });

        this.joints = [];
        this.points.forEach((it, i)=>{
            const pos = {
                x: Math.floor(i % pw),
                y: Math.floor(i / pw),
            };

            const closeList = [
                pos.y!==(ph-1) && this.points[(pos.y+1) * pw + pos.x],
                pos.x!==(pw-1) && this.points[(pos.y) * pw + pos.x+1],
                pos.x!==(pw-1) && pos.y!==(ph-1) &&this.points[(pos.y+1) * pw + pos.x+1],
                pos.x!==0 && pos.y!==(ph-1) && this.points[(pos.y+1) * pw + pos.x-1],
            ].filter(it=>it);

            closeList.forEach(close=>{
                const joint = new PhysJoint();
                joint.strength = strength;
                joint.a = it;
                joint.b = close;
                joint.targetLength = Math.hypot(it.pos.x - close.pos.x, it.pos.y - close.pos.y);
                this.joints.push(joint);
            })
        });
    }

    step(){
        this.points.forEach(it=>{
            it.vel.y+=0.0001;
        });
        this.joints.forEach(it=>it.step());
        this.points.forEach(it=>it.step());
    }

    render(ctx){
        this.joints.forEach(it=>it.render(ctx));
        this.points.forEach(it=>it.render(ctx));
    }
}

class PhysRope{
    constructor(startPos, length, count){
        this.points = new Array(count).fill(0).map((it,i)=>{
            const point = new PhysPoint();
            point.pos = {
                x: startPos.x,
                y: startPos.y + i * length,
            }
            return point;
        });
        this.points[0].mass =9999999;

        this.joints = [];
        this.points.forEach((it, i)=>{
            const close = this.points[i+1];
            if (!close){
                return;
            }
            const joint = new PhysJoint();
            joint.strength = 1;
            joint.a = it;
            joint.b = close;
            joint.targetLength = Math.hypot(it.pos.x - close.pos.x, it.pos.y - close.pos.y);
            this.joints.push(joint);
    
        });
    }

    step(){
        this.points.forEach((it, i)=>{
            if (i!=0){
            it.vel.y+=0.0001;
            }
        });
        this.joints.forEach(it=>it.step());
        this.points.forEach(it=>it.step());
    }

    render(ctx){
        this.joints.forEach(it=>it.render(ctx));
        this.points.forEach(it=>it.render(ctx));
    }
}

function init(){
    const canvas= document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 1400;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    canvas.onclick = (e)=>{
        a.pos.x+=10;
        a.pos.y = Math.random()*60 + 10;
    }

    canvas.onmousemove = (e)=>{
        //a.pos.x+=10;
        //a.pos.y = Math.random()*60 + 10;
        sl.points.forEach(it=>{
            const dist = Math.hypot(it.pos.x - e.offsetX, it.pos.y - e.offsetY);
            it.vel.x+=Math.sign(it.pos.x - e.offsetX)*Math.min(10/(dist*dist), 0.1);
            it.vel.y+=Math.sign(it.pos.y - e.offsetY)*Math.min(10/(dist*dist), 0.1);
        });
        ms.points.forEach(it=>{
            const dist = Math.hypot(it.pos.x - e.offsetX, it.pos.y - e.offsetY);
            it.vel.x+=Math.sign(it.pos.x - e.offsetX)*Math.min(10/(dist*dist), 0.1);
            it.vel.y+=Math.sign(it.pos.y - e.offsetY)*Math.min(10/(dist*dist), 0.1);
        });
        rp.points.forEach((it, i)=>{
            if (i==0){
                return;
            }
            const dist = Math.hypot(it.pos.x - e.offsetX, it.pos.y - e.offsetY);
            it.vel.x+=Math.sign(it.pos.x - e.offsetX)*Math.min(10/(dist*dist), 0.1);
            it.vel.y+=Math.sign(it.pos.y - e.offsetY)*Math.min(10/(dist*dist), 0.1);
        });
    }

    const a = new PhysPoint();
    a.pos = {x: 100, y:100};
    a.mass = 9999999;
    const b = new PhysPoint();
    b.pos = {x: 100, y:200};
    const c = new PhysPoint();
    c.pos = {x: 100, y:250};
    const d = new PhysPoint();
    d.pos = {x: 100, y:300};

    const joint = new PhysJoint();
    joint.a = a;
    joint.b = b;
    joint.strength = 10;

    const joint1 = new PhysJoint();
    joint1.a = b;
    joint1.b = c;
    joint1.targetLength = 55;
    joint1.strength = 10;
    const joint2 = new PhysJoint();
    joint2.a = c;
    joint2.b = d;
    joint2.targetLength = 55;

    const ms = new PhysBlock({x: 100, y: 300},7, 8, 35, 35, 10);
    const rp = new PhysRope({x:300, y: 20}, 10, 30);

    const sl = new PhysBlock({x: 400, y: 200}, 5, 6, 25, 25, 1);

    const joint3 = new PhysJoint();
    
    joint3.a = d;
    joint3.b = ms.points[0];
    joint3.targetLength = 55;

    const joint4 = new PhysJoint();
    
    joint4.a = rp.points[rp.points.length-1];
    joint4.b = ms.points[4];
    joint4.targetLength = 15;


    const calcStep =()=>{
        joint.step();
        joint1.step();
        joint2.step();
        joint3.step();
        joint4.step();
        a.step();
        b.step();
        c.step();
        d.step();
        b.vel.y+=0.0001;
        c.vel.y+=0.0001;
        d.vel.y+=0.0001;
        ms.step();
        rp.step();
        sl.step();
    };

    const clear = ()=>{
        ctx.fillStyle = '#00000090';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    }

    const draw = ()=>{
        a.render(ctx);
        b.render(ctx);
        c.render(ctx);
        d.render(ctx);
        joint.render(ctx);
        joint1.render(ctx);
        joint2.render(ctx);
        joint3.render(ctx);
        joint4.render(ctx);
        ms.render(ctx);
        rp.render(ctx);
        sl.render(ctx);
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

//init();

