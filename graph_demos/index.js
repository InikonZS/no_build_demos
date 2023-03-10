/*сравним рисование 3d модели на 2d контексте канваса с рисованием на webGL.
Для загрузки моделей используются аналогичная библиотека obj-loader.
Так же используются библиотеки работы с векторами и матрицами.
*/
//Для начала создается canvas элемент
const mainNode = document.querySelector('#app-main');

const canvas = document.createElement('canvas');
canvas.width = 640;
canvas.height = 480;
mainNode.appendChild(canvas);

//Создадим элемент для вывода како-то информации, например FPS
const info = document.createElement('div');
mainNode.appendChild(info);

//получаем контекст для рисования.
const ctx = canvas.getContext('2d');

//загружаем модель
let modObject = getModList(model, false, 1);

//аналогично вебгл задаем матрицу проекции
let aspect = canvas.width/canvas.height;
let matrixDist = -10;
let viewMatrix = makeCameraMatrix(aspect, m4.translate(m4.identity(),0,0,-matrixDist));
//let viewMatrix = makeCameraMatrix(aspect, m4.identity());

// здесь приводим координаты курсора к координатам канваса, для webgl координаты будет выглядеть чуть по другому
let cx=0;
let cy=0;
canvas.addEventListener('mousemove', (e)=>{
  let rect = canvas.getBoundingClientRect();
  cx=e.clientX-rect.left;
  cy=e.clientY-rect.top;
});


//в случае с canvas выполняем трансформацию матрицей вручную
let vertsTransformed = modObject.triangleList;
let normsTransformed = modObject.normalList;

let rx=0;
let ry=0;

function getScreenVector(viewMatrix, vector, canvas){
  var point = [vector.x, vector.y, vector.z, 1];  
  // это верхний правый угол фронтальной части
  // вычисляем координаты пространства отсечения,
  // используя матрицу, которую мы вычисляли для F
  var clipspace = m4.transformVector(viewMatrix, point);
  // делим X и Y на W аналогично видеокарте
  clipspace[0] /= clipspace[3];
  clipspace[1] /= clipspace[3];
  var pixelX = (clipspace[0] *  0.5 + 0.5) * canvas.width;
  var pixelY = (clipspace[1] * -0.5 + 0.5) * canvas.height;
  return new Vector3d(pixelX, pixelY, 0);
}

function getScreenModel(vertexList, matrix, canvas){
  let nwList=[];
  for (let i=0; i<vertexList.length / 3; i++){
    let nw = getScreenVector(matrix, new Vector3d(vertexList[i*3+0], vertexList[i*3+1], vertexList[i*3+2]), canvas);
    nwList.push(nw.x);
    nwList.push(nw.y);
    nwList.push(nw.z);
  } 
  return nwList;
}

const dec = new Control(mainNode, 'div','','more models',()=>{
  countModels+=10;
})

const incx = new Control(mainNode, 'div','','less models',()=>{
  countModels-=10;
})
const decfd = new Control(mainNode, 'div','','move Z forward',()=>{
  matrixDist+=1;
  viewMatrix = makeCameraMatrix(aspect, m4.translate(m4.identity(),0,0,-matrixDist));
})

const incxfd = new Control(mainNode, 'div','','move Z backward',()=>{
  matrixDist-=1;
  viewMatrix = makeCameraMatrix(aspect, m4.translate(m4.identity(),0,0,-matrixDist));
})

let useSync = false;
let useFill = false;

const sh = new Control(mainNode, 'div','','use sync',()=>{
  useSync=!useSync;
})

const sh1 = new Control(mainNode, 'div','','use fill',()=>{
  useFill=!useFill;
})

let countModels = 1;

function renderHandler(ctx, vertsTransformed_, normsTransformed_, time){
  //собственно трансформация, такая же матрица, те же вращения
  let matx = m4.identity();
  if (useSync){
    rx+=0.01 *time/10;
    ry+=0.0144 *time/10;
  } else {
    rx+=0.01;
    ry+=0.0144;  
  }
  matx = m4.xRotate(matx, rx);
  matx = m4.yRotate(matx, ry);
  matx = m4.scale(matx, 0.2, 0.2, 0.2);
  ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  for (let ii=0; ii<countModels; ii++){
    let mx = m4.identity();
    mx=m4.translate(mx,-ii%10,-ii/10,0);

    let vertsTransformed= transformVertexList(vertsTransformed_,  m4.multiply(mx, matx));
    vertsTransformed= getScreenModel(vertsTransformed, viewMatrix, ctx.canvas);

    /*let cent = m4.identity();
    cent = m4.translate(cent, canvas.width/2, canvas.height/2, 0);
    vertsTransformed= transformVertexList(vertsTransformed, cent);*/

    //а здесь добавим функцию hover мыши для трехмерного обьекта, это вебгл не позволит сделать
    let strokeColor = '#f99';
    for (let i=0; i<vertsTransformed.length / 9; i++){
      if (inTriangle(new Vector3d(vertsTransformed[i*9+0], vertsTransformed[i*9+1], 0), 
      new Vector3d(vertsTransformed[i*9+3], vertsTransformed[i*9+4], 0),
      new Vector3d(vertsTransformed[i*9+6], vertsTransformed[i*9+7], 0),
      new Vector3d(cx, cy, 0)
      )){
        strokeColor ='#f00';
      };
    }

   
    ctx.fillRect(cx-5,cy-5,5,5);

    //а это цикл вывода полигонов уже в экранных координатах, по сути это выполнение пиксельного шейдера,
    // хотя канвас выводит полигоны быстрее, чем если это сделать попиксельно,
    //гл дает больше контроля над рисуемыми пикселями при меньших затратах.
    for (let i=0; i<vertsTransformed.length / 9; i++){
      //console.log(vertsTransformed[i*9]);
      
      let light =normsTransformed_[i*9]*255;
      if (light<0){light=0;}
      ctx.fillStyle = `rgb(${light},${light},${light})`;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(vertsTransformed[i*9+0], vertsTransformed[i*9+1]);
      ctx.lineTo(vertsTransformed[i*9+3], vertsTransformed[i*9+4]);
      ctx.lineTo(vertsTransformed[i*9+6], vertsTransformed[i*9+7]);
      ctx.lineTo(vertsTransformed[i*9+0], vertsTransformed[i*9+1]);
      if (useFill){
        ctx.fill();
      }
      ctx.stroke();
    }
  }
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
    renderHandler(ctx, vertsTransformed, normsTransformed, deltaTime);
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