const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext("2d");

const colors = ['#f99', '#ff9', '#9f9', '#99f', '#9ff'];

const vertexBuffer = [
  [1, 1, 1],
  [-1, 1, 1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, -1],
  [1, -1, -1],
];

const indexBuffer = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 0],
  [5, 1],
  [6, 2],
  [7, 3],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
];

const indexBufferTriangles = [
    [0, 1, 2],
    [0, 2, 3],
    [4, 5, 6],
    [4, 6, 7],

    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],

    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],

  ];

document.body.append(canvas);
const getDist = (point)=>{
    const a = new DOMPoint(-player.position.x, -player.position.y, -player.position.z);
    const b = point;//{x: point[0], y: point[1], z: point[2]}
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }

const renderAnimation = (matrix, view, projection) => {
  const resultMatrix = projection.multiply(view.multiply(matrix));
  const transformedBuffer = vertexBuffer.map((vertex, i) => {
    const point = new DOMPoint(...vertex, 1);
    const worldPoint = point.matrixTransform(matrix);///
    const cPoint = point.matrixTransform(view.multiply(matrix));
    const transformedPoint = point.matrixTransform(resultMatrix);
    const pixelX =
      ((transformedPoint.x / transformedPoint.w) * 0.5 + 0.5) * canvas.width;
    const pixelY =
      ((transformedPoint.y / transformedPoint.w) * -0.5 + 0.5) * canvas.height;
    
    return [pixelX, pixelY, transformedPoint.z, getDist(worldPoint), i];///
  });
 /* indexBuffer.forEach((item) => {
    const vertex1 = transformedBuffer[item[0]];
    const vertex2 = transformedBuffer[item[1]];
    if (vertex1[2]>0 && vertex2[2]>0){
        context.beginPath();
        context.moveTo(vertex1[0], vertex1[1]);
        context.lineTo(vertex2[0], vertex2[1]);
        context.stroke();
    }
  });*/
  let primitives = [];
  indexBufferTriangles.forEach((item, i) => {
    const vertex1 = transformedBuffer[item[0]];
    const vertex2 = transformedBuffer[item[1]];
    const vertex3 = transformedBuffer[item[2]];
    primitives.push([vertex1, vertex2, vertex3]);
    
  });



  //console.log(JSON.stringify(primitives));
  primitives = primitives.sort((a, b)=>{
   // return (b[0][2] - a[0][2] + b[1][2] - a[1][2] + b[2][2] - a[2][2]);//getDist(a) - getDist(b);
   return ((b[0][2]  + b[1][2] + b[2][2]) - (a[0][2] + a[1][2] + a[2][2])  );
  });
  //console.log(JSON.stringify(primitives));
  primitives.forEach(([vertex1, vertex2, vertex3], i)=>{
    if (vertex1[2]>0 && vertex2[2]>0 && vertex3[2]>0){
        const color = colors[vertex1[4]]//colors[i % colors.length];
        context.fillStyle = color;
        context.strokeStyle = "#fff";
        context.beginPath();
        context.moveTo(vertex1[0], vertex1[1]);
        context.lineTo(vertex2[0], vertex2[1]);
        context.lineTo(vertex3[0], vertex3[1]);
        context.closePath();
        context.fill();
        context.stroke();
        context.fillStyle = "#f00";
        context.fillText(vertex1[2].toFixed(2) +'-' +i, vertex1[0], vertex1[1]);
    } else {
        return;
    }
  })
};
const player = {
  position: new DOMPoint(0,0,0,1),
  speed: new DOMPoint(0,0,0,1),
  rotX: 0,
  rotY: 0,
};

let isJumpStart = false;
let isJumpProgress = false;

const renderFrame = () => {
  requestAnimationFrame((time) => {

    if (isJumpStart){
        isJumpProgress = true;
        isJumpStart = false;
        player.speed.y = -1;
        player.position.y += player.speed.y;
    }

    if (isJumpProgress){
        if (player.position.y < 0){
            player.speed.y += 0.05;
            
            player.position.y += player.speed.y;
            if (player.position.y > 0){
                player.position.y = 0;
            }
        } else {
            player.position.y = 0;
            player.speed.y = 0;
            isJumpProgress = false;
        }
    }

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
//console.log(player.rotX);
    if (keyMap["KeyW"] === true) {
      player.position.z -= 0.1 * Math.cos(player.rotX / 180 * Math.PI);
      player.position.x += 0.1 * Math.sin(player.rotX / 180 * Math.PI);
      //player.position.z += 0.91;
    }
    if (keyMap["KeyS"] === true) {
        player.position.z += 0.1 * Math.cos(player.rotX / 180 * Math.PI);
        player.position.x -= 0.1 * Math.sin(player.rotX / 180 * Math.PI);
    }
    if (keyMap["KeyA"] === true) {
        player.position.x += 0.1 * Math.cos(player.rotX / 180 * Math.PI);
        player.position.z += 0.1 * Math.sin(player.rotX / 180 * Math.PI);
    }
    if (keyMap["KeyD"] === true) {
        player.position.x -= 0.1 * Math.cos(player.rotX / 180 * Math.PI);
        player.position.z -= 0.1 * Math.sin(player.rotX / 180 * Math.PI);
    }

    if (keyMap["Space"] === true) {
        if (!isJumpProgress){
            isJumpStart = true;
        }
    }

    const aspectRatio = (canvas.width / canvas.height);
    const viewAngle = Math.tan(Math.PI / 8);
    const nearZ = 0.01;
    const farZ = 500;
    // pretier-ignore
    const projection = new DOMMatrix([
      1 / (viewAngle * aspectRatio),
      0,
      0,
      0,
      0,
      1 / viewAngle,
      0,
      0,
      0,
      0,
      (-nearZ - farZ) / (nearZ - farZ),
      1,
      0,
      0,
      (2 * farZ * nearZ) / (nearZ - farZ),
      0,
    ]);


    const viewMatrix = new DOMMatrix().rotate(
        player.rotY,0,0
    ).rotate(
        0,player.rotX,
        0
    ).translate(
        player.position.x,
        player.position.y,
        player.position.z
    );
    
    const matrix = new DOMMatrix()
      .translate(0, 0, 10)
      //.rotate(time / 133, time / 100, 20)
      .scale(1, 1, 1);
    //const resultMatrix = projection.multiply(viewMatrix.multiply(matrix));
    renderAnimation(matrix, viewMatrix, projection);

    const matrix1 = new DOMMatrix()
      .translate(0, 0, 20)
      .scale(1, 1, 1);
    //const resultMatrix1 = projection.multiply(viewMatrix.multiply(matrix1));
    renderAnimation(matrix1, viewMatrix, projection);

    const matrix2 = new DOMMatrix()
      .translate(10, 0, 20)
      .scale(1, 1, 1);
    //const resultMatrix2 = projection.multiply(viewMatrix.multiply(matrix2));
    renderAnimation(matrix2, viewMatrix, projection);
    renderFrame();
  });
};
renderFrame();
const keyMap = {};
canvas.onmousemove = (event) => {
  player.rotX -= event.movementX / 10;
  player.rotY -= event.movementY / 10;
  if (player.rotY >90) {
    player.rotY =90;
  }
  if (player.rotY <-90) {
    player.rotY =-90;
  }
};
canvas.onclick = () => {
  canvas.requestPointerLock();
};

document.body.onkeydown = (event) => {
  keyMap[event.code] = true;
};
document.body.onkeyup = (event) => {
  keyMap[event.code] = undefined;
};