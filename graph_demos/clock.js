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
var pdy=20;
const inc = new Control(mainNode, 'div','','increment Y',()=>{
  cy+=10;
  console.log(py);
})

const dec = new Control(mainNode, 'div','','decrement Y',()=>{
  cy-=10;
})

const incx = new Control(mainNode, 'div','','increment x',()=>{
  cx+=10;
  console.log(py);
})

const decx = new Control(mainNode, 'div','','decrement x',()=>{
  cx-=10;
})

const inccx = new Control(mainNode, 'div','','inc center x',()=>{
  px+=10;
  cx+=10;
  console.log(py);
})

const deccx = new Control(mainNode, 'div','','dec center x',()=>{
  cx-=10;
  px-=10;
})

//получаем контекст для рисования.
const ctx = canvas.getContext('2d');


let ra1=0;
let ra2=0;

let cx=ctx.canvas.width/2;
let cy=ctx.canvas.height/2;

let imw = 36;

let px=cx-imw/2;

let py=cy+pdy;

function drawGrid(ctx){
  for (let i=0; i<ctx.canvas.width/10; i++){
    ctx.beginPath();
    ctx.moveTo(i*10, 0);
    ctx.lineTo(i*10, ctx.canvas.height);
    ctx.stroke();
  }
  for (let i=0; i<ctx.canvas.height/10; i++){
    ctx.beginPath()
    ctx.moveTo(0, i*10);
    ctx.lineTo(ctx.canvas.width, i*10);
    ctx.stroke();
  }
}

function renderHandler(ctx){
  ctx.clearRect(0,0,1000,1000);
  ra1+=0.01;
  ra2+=0.0234;
  ctx.fillStyle='#000';
  drawGrid(ctx);
  ctx.drawImage(img, 0, 0, 128, 512, px, 0, imw, py);

  ctx.translate(cx, cy);
  ctx.rotate(ra1);
  ctx.translate(-cx, -cy);
  drawGrid(ctx);
  ctx.fillRect(cx, cy,10, 10);
  ctx.drawImage(img, 0, 0, 128, 512, px, 0, imw, py);
  ctx.translate(cx, cy);
  ctx.rotate(-ra1);
  ctx.translate(-cx, -cy);

  ctx.translate(cx, cy);
  ctx.rotate(ra2);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, 128, 0, 128, 512, px, 0, imw, py); 

  ctx.fillStyle='#0f0';
  ctx.fillRect(cx-5, cy-5,10, 10);
  ctx.translate(cx, cy);
  ctx.rotate(-ra2);
  ctx.translate(-cx, -cy);
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