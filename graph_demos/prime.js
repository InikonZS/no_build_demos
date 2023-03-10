

let vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_normal;
  
  uniform mat4 u_view;
  uniform mat4 u_world;
  varying vec4 v_position;
  varying vec4 v_normal;
  void main() {
    gl_Position = u_view * u_world * a_position;
    v_position = gl_Position;
    v_normal = vec4(mat3(u_world) * vec3(a_normal), 1);
  }
`;

let fragmentShaderSource =`
  precision mediump float;
  uniform vec4 u_color;
  varying vec4 v_position;
  varying vec4 v_normal;
  void main() {
    float light = dot(normalize(v_normal.xyz),normalize(vec3(1,1,0)));
    light = light+1.0;
    gl_FragColor = vec4(light*u_color.r, light*u_color.g, light*u_color.b, 1);
  }
`;

function getShaderVariables(gl, program){
  var positionAttr = gl.getAttribLocation(program, "a_position");
  var normalAttr = gl.getAttribLocation(program, "a_normal");
  var colorUniVec4 = gl.getUniformLocation(program, "u_color");
  var viewUniMat4 = gl.getUniformLocation(program, "u_view");
  var worldUniMat4 = gl.getUniformLocation(program, "u_world");
  return {
    positionAttr,
    normalAttr,
    colorUniVec4,
    viewUniMat4,
    worldUniMat4
  }
}

function initShader(gl, shaderProgram, shaderVariables){
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(shaderProgram);
  gl.enableVertexAttribArray(shaderVariables.positionAttr);
  gl.enableVertexAttribArray(shaderVariables.normalAttr);
}


const mainNode = document.querySelector('#app-main');

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
mainNode.appendChild(canvas);

//Создадим элемент для вывода како-то информации, например FPS
const info = document.createElement('div');
mainNode.appendChild(info);

let countModels=1;
const dec = new Control(mainNode, 'div','','more models',()=>{
  countModels+=10;
})

const incx = new Control(mainNode, 'div','','less models',()=>{
  countModels-=10;
})

let ds=1;
const dec3 = new Control(mainNode, 'div','','inc dist between models',()=>{
  ds+=1;
})

const incx3 = new Control(mainNode, 'div','','dec dist between models',()=>{
  ds-=1;
})


//получаем контекст для рисования.
const gl = canvas.getContext('webgl');

let shaderProgram = createShaderFromSource(gl, vertexShaderSource, fragmentShaderSource);
let shaderVariables = getShaderVariables(gl, shaderProgram);

let modelObject = getModList(model, false , 1);
let vertexList = modelObject.triangleList;
let normalList = modelObject.normalList;

let positionBuffer = createBuffer(gl, vertexList);
let normBuffer = createBuffer(gl, normalList);

setBuffer(gl, positionBuffer, shaderVariables.positionAttr, 3);
setBuffer(gl, normBuffer, shaderVariables.normalAttr, 3); 

let aspect = canvas.width/canvas.height;
let viewMatrix = makeCameraMatrix(aspect, m4.translate(m4.identity(),0,0,-30));
initShader(gl, shaderProgram, shaderVariables);
gl.uniformMatrix4fv(shaderVariables.viewUniMat4, false, viewMatrix);
/////////

let timeCnt=0;
function timer(deltaTime, onTimer){
  timeCnt-=deltaTime;
  if (timeCnt<0){
    timeCnt=100;
    onTimer();
  }
}

let rx=0;
let ry=0; 
function renderHandler(gl){
  let matx = m4.identity();
  rx+=0.01;
  ry+=0.0144;
  matx = m4.xRotate(matx, rx);
  matx = m4.yRotate(matx, ry);

  for (let i=0; i<countModels; i++){
    let mx = m4.identity();
    mx=m4.translate(mx,-(i%10)*ds,-(i/10)*ds,0);
    gl.uniformMatrix4fv(shaderVariables.worldUniMat4, false, m4.multiply(mx, matx)); 
    let color = {r:1, g:0, b:0.5, a:1}
    gl.uniform4f(shaderVariables.colorUniVec4, color.r, color.g, color.b, color.a); 
    gl.drawArrays(gl.TRIANGLES, 0, vertexList.length/3);  
  }
}


let lastTime;
function render(time){
  if (!lastTime){
    lastTime=time;
  }
  let deltaTime = time-lastTime;
  lastTime=time;
  timer(deltaTime, ()=>{
    info.textContent='FPS: '+((1000/deltaTime).toFixed(0));  
  });
  renderHandler(gl);
  window.requestAnimationFrame((timeStamp)=>{
    render(timeStamp);
  });
}

render(0);