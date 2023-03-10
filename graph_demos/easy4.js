/*сравним рисование 3d модели на 2d контексте канваса с рисованием на webGL.
Для загрузки моделей используются аналогичная библиотека obj-loader.
Так же используются библиотеки работы с векторами и матрицами.
*/
//Для начала создается canvas элемент
const mainNode = document.querySelector('#app-main');

const img = new Image();
img.src = 'clock.png';

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
mainNode.appendChild(canvas);

//Создадим элемент для вывода како-то информации, например FPS
const info = document.createElement('div');
mainNode.appendChild(info);

//получаем контекст для рисования.
const ctx = canvas.getContext('2d');

let rect = [
  new Vector3d(0, 0, 0),
  new Vector3d(0, 1, 0),
  new Vector3d(1, 1, 0),
  new Vector3d(1, 0, 0),
  new Vector3d(0, 0, 1),
  new Vector3d(0, 1, 1),
  new Vector3d(1, 1, 1),
  new Vector3d(1, 0, 1),
];

let idx = [
  0,1,
  1,2,
  2,3,
  3,0,

  4,5,
  5,6,
  6,7,
  7,4,

  0,4,
  1,5,
  2,6,
  3,7
]

function transformArray(arr, mtx){
  return arr.map(it=>it.transform(mtx)); 
}

function moveArray(arr, vec){
  return arr.map(it=>it.addVector(vec));
}

function scaleArray(arr, x, y, z){
  return arr.map(it=>{return new Vector3d(it.x*x, it.y*y, it.z*z)});
}

function rotateArrayZ(arr, ang){
  // matrix2d [[cos, sin],[-sin, cos]]
  return arr.map(it=>{return new Vector3d(
    it.x*Math.cos(ang) + it.y*Math.sin(ang), 
    -it.x*Math.sin(ang) + it.y*Math.cos(ang), 
    it.z)});
}

function drawArray2d(arr, idx){
  ctx.lineWidth=3;
  ctx.fillStyle='#f0f';
  
  for (let i=0; i<idx.length/2; i++){
    ctx.beginPath();
    ctx.moveTo(arr[idx[i*2]].x, arr[idx[i*2]].y);
    ctx.lineTo(arr[idx[i*2+1]].x, arr[idx[i*2+1]].y); 
    ctx.stroke(); 
  }
  
}

function drawGrid(ctx, sz){
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;

  for (let i=0; i<ctx.canvas.width/sz; i++){
    ctx.fillStyle="#f00";
    ctx.fillText(i.toFixed(0)*sz, i*sz, 10);
    ctx.beginPath();
    ctx.moveTo(i*sz, 0);
    ctx.lineTo(i*sz, ctx.canvas.height);
    ctx.stroke();
  }

  for (let i=0; i<ctx.canvas.height/sz; i++){
    ctx.fillStyle="#f00";
    ctx.fillText(i.toFixed(0)*sz, 0, i*sz+10);
    ctx.beginPath()
    ctx.moveTo(-ctx.canvas.width, i*sz);
    ctx.lineTo(ctx.canvas.width, i*sz);
    ctx.stroke();
  }
  ctx.strokeStyle = '#0F0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, ctx.canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ctx.canvas.width, 0);
  ctx.stroke();
}

let ang=0;
function renderHandler(ctx){
  ctx.clearRect(0,0,1000,1000);
  drawGrid(ctx, 50);
  ang+=0.1;
  if (ang>20){
    ang=0;
  }
  let mt = m4.identity();
  //mt = m4.translate(mt, 350, 350, 350); 
  mt = m4.zRotate(mt, degToRad(-ang));
  mt = m4.yRotate(mt, degToRad(-ang*0.33));
  mt = m4.xRotate(mt, degToRad(-ang*0.33));
  mt = m4.translate(mt, 300, 300, 300); 
  mt = m4.scale(mt, 100, 100, 100);
  //mt = m4.translate(mt, -0.5, -0.5, -0.5);
 
  let rectTransformedA = transformArray(rect, mt);

  let rectTransformed = rect;
  rectTransformed = moveArray(rectTransformed, new Vector3d(-0.5, -0.5, 0));
  rectTransformed = moveArray(rectTransformed, new Vector3d(3.5, 3.5, 0));
  rectTransformed = rotateArrayZ(rectTransformed, degToRad(ang));
  rectTransformed = scaleArray(rectTransformed, 100, 100, 100);

  let point = [new Vector3d(0.5, 0.5, 0.5)];
  point = moveArray(point, new Vector3d(-0.5, -0.5, 0));
  point = moveArray(point, new Vector3d(3.5, 3.5, 0));
  point = rotateArrayZ(point, degToRad(ang));
  point = scaleArray(point, 100, 100, 100);
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(point[0].x,point[0].y);
  ctx.stroke();

  let point2 = [new Vector3d(0.5, 0.5, 0.5)];
  point2 = transformArray(point2, mt);
  ctx.beginPath();
  ctx.moveTo(point2[0].x,point2[0].y);
  ctx.lineTo(0,0);
  ctx.stroke();

  drawArray2d(rectTransformedA, idx);
  drawArray2d(rectTransformed, idx);
}

let timeCnt=0;
function timer(deltaTime, onTimer){
  timeCnt-=deltaTime;
  if (timeCnt<0){
    timeCnt=100;
    onTimer();
  }
}


//функция рендеринга через requestAnimationFrame позволяет синхронизировать анимацию по времени
//через параметр timeStamp
//функция асинхронная, поэтому позволяет вызывать себя рекурсивно без опасности переполнения стека.
//функция лимитирует частоту кадров в соответствие с частотой обновления монитора, обычно 60 герц.
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
    renderHandler(ctx);
  window.requestAnimationFrame((timeStamp)=>{
    render(timeStamp);
  });
}

render(0);


/*
Предисловие. данная статья не является пересказом каких либо мануалов по канвасу и вебгл.
В ней рассмотрены отдельные детали математики, ее применения для программирования графики и игр а так же
некоторые варианты оптимизиций и архитектурных вариантов реализации движков.

1. 3д математика, сравнение сложности 2д и 3д математики, сходства и различия
Понятия вектор, матрица, индексирование вершин, примитивы.


2. Сравнение рендер функций и реализация 2д и 3д графики на канвас и вебгл, производительность

3. Общие принципы построения игровых движков, взаимодействие обьектов, оптимизация
*/