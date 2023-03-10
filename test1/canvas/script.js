
let canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.append(canvas);

let context = canvas.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0 , context.canvas.width, context.canvas.height);

let lastTime;
function render(deltaTime = 0){
  requestAnimationFrame((time)=>{
    if (lastTime == undefined){ lastTime = time }
    render(time - lastTime);
    onRender(deltaTime);
  });
}



let ang = 0;
function onRender(deltaTime){
//console.log(deltaTime)
 // context.strokeStyle = '#fff';
  //context.beginPath();
  //for (let i = 0; i< 10; i++){
 
    /* let lx = Math.sin(ang);
    let ly = Math.cos(ang);

    ang += deltaTime/1000;

    let x = Math.sin(ang);
    let y = Math.cos(ang);
    //context.lineTo();
    context.moveTo(lx * 200 + context.canvas.width/2, ly * 200 + context.canvas.height/2);
    context.lineTo(x * 200 + context.canvas.width/2, y * 200 + context.canvas.height/2);*/
    
  //} 
  context.fillStyle = '#00000015';
  context.fillRect(0, 0 , context.canvas.width, context.canvas.height);
  renderCube(context, deltaTime, transform);
  renderCube(context, deltaTime, (vertex, dt)=>{
    return vertex.add(new Vector(2,2,1)).scale(new Vector(100,100,100)).rotateY(dt / 1200).rotateX(dt / 3400).add(new Vector(200, 200, 0));
  });
  //context.stroke();
  //context.closePath();
 
}

render(0);

class Vector{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  scale(v){
    return new Vector(this.x * v.x, this.y * v.y, this.z * v.z)
  }

  add(v){
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z)
  }

  rotateZ(ang){
    // v * m
    // cos sin
    // -sin cos
    return new Vector(
      this.x * Math.sin(ang) + this.y * Math.cos(ang), 
      this.x * Math.cos(ang) - this.y * Math.sin(ang),  
      this.z)
  }

  rotateY(ang){
    // v * m
    // cos sin
    // -sin cos
    return new Vector(
      this.x * Math.sin(ang) + this.z * Math.cos(ang),
      this.y, 
      this.x * Math.cos(ang) - this.z * Math.sin(ang))
  }

  rotateX(ang){
    // v * m
    // cos sin
    // -sin cos
    return new Vector(
      this.x,
      this.y * Math.sin(ang) + this.z * Math.cos(ang),
      this.y * Math.cos(ang) - this.z * Math.sin(ang))
  }
}

function renderCube(context, deltaTime, transform){
  const vertexList = [
    new Vector(0,0,0),
    new Vector(0,1,0),
    new Vector(1,1,0),
    new Vector(1,0,0),
  
    new Vector(0,0,1),
    new Vector(0,1,1),
    new Vector(1,1,1),
    new Vector(1,0,1),
  ]

  const indexList = [
    0, 1,
    1, 2,
    2, 3,
    3, 0,

    4, 5,
    5, 6,
    6, 7,
    7, 4,

    0, 4,
    1, 5,
    2, 6,
    3, 7,
  ]

  //primotive format - line 2

  let transformed = vertexList.map(vertex => {
    return transform(vertex, deltaTime);
  });

  transformed.forEach(it=>{
    let sz = 10;
    context.fillStyle = '#fff';
    context.fillRect(it.x-sz, it.y-sz, sz*2, sz*2);
  });

  indexList.forEach((ind, i, ar)=>{
    if (i % 2 == 0){
      
    let va = [transformed[ar[i]], transformed[ar[i+1]]];
    context.beginPath();
    context.strokeStyle = '#f00';
    context.lineWidht = 3;
    context.moveTo(va[0].x, va[0].y);
    context.lineTo(va[1].x, va[1].y);
    context.stroke();
    context.closePath();
    //let it = transformed[ind];
    //let sz = 10;
    //context.fillStyle = '#fff';
    //context.fillRect(it.x-sz, it.y-sz, sz*2, sz*2);
    }
  });
}

function transform(vertex, dt){
  return vertex.scale(new Vector(100,100,100)).rotateY(dt / 1000).rotateX(dt / 3000).add(new Vector(200, 200, 0));
}