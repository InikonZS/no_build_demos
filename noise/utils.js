import m4 from "./m4.js";

export const getScreenVector = (viewMatrix, vector, canvas)=>{
  var point = [vector.x, vector.y, vector.z, 1];  
  // это верхний правый угол фронтальной части
  // вычисляем координаты пространства отсечения,
  // используя матрицу, которую мы вычисляли для F
  var clipspace = m4.transformVector(viewMatrix, point, undefined);
  // делим X и Y на W аналогично видеокарте
  clipspace[0] /= clipspace[3];
  clipspace[1] /= clipspace[3];
  //dont use real clientWidthgetter 10-100 times worse, never use getBoundingClientRect 1000 times worse
  var pixelX = (clipspace[0] *  0.5 + 0.5) * canvas.clientWidth //* canvas.width;
  var pixelY = (clipspace[1] * -0.5 + 0.5) * canvas.clientHeight //* canvas.height;
  return {x: pixelX, y: pixelY, z: clipspace[3]};
}

export function makeCameraMatrix(aspect, rx, ry, px, py, pz){
  let matrix = m4.perspective(1, aspect, 0.1, 20000); 
  matrix = m4.xRotate(matrix, ry);
  matrix = m4.yRotate(matrix, 0);
  matrix = m4.zRotate(matrix, rx);
  matrix = m4.scale(matrix, 1, 1, 1);
  matrix = m4.translate(matrix, px, py, pz);
  return matrix;
}