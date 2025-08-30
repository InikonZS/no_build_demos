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

// screen {x, y} → world {x, y, z}, пересечение с y = y0
export const unprojectToPlane = (viewMatrix, screen, canvas, y0 = 0) => {
  // 1) Экран → NDC
  const xNdc =  (screen.x / canvas.clientWidth)  * 2 - 1;
  const yNdc = -(screen.y / canvas.clientHeight) * 2 + 1;

  // 2) Точки на ближней и дальней плоскости в clip space
  const nearClip = [xNdc, yNdc, -1, 1];
  const farClip  = [xNdc, yNdc,  1, 1];

  // 3) Обратная матрица (из clip → world)
  const invM = m4.inverse(viewMatrix);

  // 4) Проецируем в мир
  let nearWorld = m4.transformVector(invM, nearClip);
  let farWorld  = m4.transformVector(invM, farClip);

  // делим на w
  nearWorld = nearWorld.map((v, i) => v / nearWorld[3]);
  farWorld  = farWorld.map((v, i) => v / farWorld[3]);

  const ro  = {x: nearWorld[0], y: nearWorld[1], z: nearWorld[2]};
  const dir = {
    x: farWorld[0] - nearWorld[0],
    y: farWorld[1] - nearWorld[1],
    z: farWorld[2] - nearWorld[2],
  };

  // 5) Находим пересечение с плоскостью y = y0
  if (Math.abs(dir.y) < 1e-6) {
    return null; // луч почти параллелен плоскости
  }

  const t = (y0 - ro.y) / dir.y;

  return {
    x: ro.x + dir.x * t,
    y: ro.y + dir.y * t,
    z: ro.z + dir.z * t,
  };
};

export function makeCameraMatrix(aspect, rx, ry, px, py, pz){
  let matrix = m4.perspective(1, aspect, 0.1, 20000); 
  matrix = m4.xRotate(matrix, ry);
  matrix = m4.yRotate(matrix, 0);
  matrix = m4.zRotate(matrix, rx);
  matrix = m4.scale(matrix, 1, 1, 1);
  matrix = m4.translate(matrix, px, py, pz);
  return matrix;
}

// Проверка "точка в многоугольнике" (ray casting)
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}

// Основная функция
export function trajectoryIntersection(points, polygon) {
  if (points.length < 2 || polygon.length < 3) return null;

  const z0 = polygon[0].z;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];

    // есть ли пересечение с плоскостью z=z0 ?
    if ((p1.z - z0) * (p2.z - z0) > 0) continue; // оба с одной стороны

    if (p1.z === p2.z) continue; // сегмент параллелен плоскости

    const t = (z0 - p1.z) / (p2.z - p1.z);
    if (t < 0 || t > 1) continue; // пересечение вне сегмента

    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    const intersection = {x, y, z: z0};

    if (pointInPolygon(intersection, polygon)) {
      return intersection; // нашли пересечение
    }
  }

  return null;
}