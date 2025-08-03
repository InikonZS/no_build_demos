const initRandom = (seed) => {
  let value = seed;

  return () => {
    value = value * 16807 % 2147483647;
    return value / 2147483647;
  }
}
const seedRand = Math.random() * 10000;
const random = initRandom(seedRand);

const permutationTable = new Array(1024).fill(0).map(it=>random());

const getPseudoRandomGradientVector = (x, y)=>{
    const r = (((x * 1836311903) ^ (y * 2971215073) + 4807526976) & 1023);
    //const r = (((x * 1) + (y * 1) + 4807526976) & 3);
    const v = Math.floor(permutationTable[r] * 8);
    return [
       { x: 1, y: 0 },
       { x: -1, y: 0 },
       { x: 0, y: 1 },
       { x: 0, y: -1 },
        
       { x: 1, y: 1 },
       { x: -1, y: 1 },
       { x: 1, y: -1 },
       { x: -1, y: -1 },
    ][v]
}

const qunticCurve = (t)=>{
  return t * t * t * (t * (t * 6 - 15) + 10);
}

const dot = (a, b)=>{
    return a.x * b.x + a.y * b.y;
}

const lerp = (a, b, t)=>{
  return a + (b - a) * t;
}

const noise = (fx, fy) => {
    const left = Math.floor(fx);
    const top  = Math.floor(fy);

    const pointInQuadX = fx - left;
    const pointInQuadY = fy - top;


    const topLeftGradient     = getPseudoRandomGradientVector(left,   top  );
    const topRightGradient    = getPseudoRandomGradientVector(left+1, top  );
    const bottomLeftGradient  = getPseudoRandomGradientVector(left,   top+1);
    const bottomRightGradient = getPseudoRandomGradientVector(left+1, top+1);

    // вектора от вершин квадрата до точки внутри квадрата:
    const distanceToTopLeft     = { x: pointInQuadX,   y: pointInQuadY   };
    const distanceToTopRight    = { x: pointInQuadX-1, y: pointInQuadY   };
    const distanceToBottomLeft  = { x: pointInQuadX,   y: pointInQuadY-1 };
    const distanceToBottomRight = { x: pointInQuadX-1, y: pointInQuadY-1 };

    // считаем скалярные произведения между которыми будем интерполировать
    /*
    tx1--tx2
    |    |
    bx1--bx2
    */
    const tx1 = dot(distanceToTopLeft,     topLeftGradient);
    const tx2 = dot(distanceToTopRight,    topRightGradient);
    const bx1 = dot(distanceToBottomLeft,  bottomLeftGradient);
    const bx2 = dot(distanceToBottomRight, bottomRightGradient);

    // готовим параметры интерполяции, чтобы она не была линейной:
    const resultPointInQuadX = qunticCurve(pointInQuadX);
    const resultPointInQuadY = qunticCurve(pointInQuadY);

    // собственно, интерполяция:
    const tx = lerp(tx1, tx2, resultPointInQuadX);
    const bx = lerp(bx1, bx2, resultPointInQuadX);
    const tb = lerp(tx, bx, resultPointInQuadY);

    // возвращаем результат:
    return tb;
}

const hexColor = (value)=>{
    const hexValue = Math.floor(value).toString(16)
    return hexValue.length == 1 ? '0' + hexValue : hexValue
}

const rgb = (r, g, b)=>{
    return `#${hexColor(r)}${hexColor(g)}${hexColor(b)}`
};

const grey = (c)=>{
    return `#${hexColor(c)}${hexColor(c)}${hexColor(c)}`
};

const generateChunk = (ox, oy, chunkSize)=>{
    //console.log('generating', ox, oy)
    const canvas = document.createElement('canvas');
    canvas.width = chunkSize;
    canvas.height = chunkSize;
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(canvas.width, canvas.height);
    const octas = 9;
    for (let x=0; x<canvas.width; x++){
        for (let y=0; y<canvas.height; y++){
            let noiseValue = 0;
            for (k=4; k< octas; k++){
                noiseValue = (noiseValue + (noise((x + ox) / 2 ** k, (y + oy) / 2 ** k)) /((octas-k) ** 1.2));
            }
            //ctx.fillStyle = noiseValue > 0 ? grey(0) : grey(255); 
            //ctx.fillStyle = grey(Math.max(Math.min((noiseValue + 1) / 2 * 256, 255), 100));//grey((noiseValue + 1) / 2 * 256);
            //ctx.fillRect(x, y, 1, 1);
            const dataPoint = (y*imageData.width+x) * 4;
            imageData.data[dataPoint + 0] = noiseValue > 0 ? 0 : 255;
            imageData.data[dataPoint + 1] = noiseValue > 0 ? 0 : 255;
            imageData.data[dataPoint + 2] = noiseValue > 0 ? 0 : 255;
            imageData.data[dataPoint + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

const app = ()=>{
    let offset = {x:0, y: 0};
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const chunkSize = 128;

    const chunks = {};

    const getVisibleChunks = ()=>{
        const offsetChunk = {x: Math.floor(-offset.x / chunkSize), y: Math.floor(-offset.y / chunkSize) }; 
        const chunkPositions = [];
        for (let y = 0; y< canvas.height / chunkSize; y++){
            for (let x = 0; x< canvas.width / chunkSize; x++){
                chunkPositions.push({x: x + offsetChunk.x, y: y + offsetChunk.y});
            }
        }
        return chunkPositions
    }

    const checkChunks = ()=>{
        const visible = getVisibleChunks();
           //const offsetChunk = {x: Math.floor(-offset.x / chunkSize), y: Math.floor(-offset.y / chunkSize) }; 
        visible.forEach(offsetChunk=>{

            setTimeout(()=>{
           if (!chunks[offsetChunk.x + '_' + offsetChunk.y]){
           
                const chunk = generateChunk(offsetChunk.x * chunkSize, offsetChunk.y * chunkSize, chunkSize);
                chunks[offsetChunk.x + '_' + offsetChunk.y] = {chunk, position: offsetChunk};
                render();
            
           }}, 0);
        })
               
    }

    const render = ()=>{
        checkChunks();
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        Object.values(chunks).forEach(it=>{
            ctx.strokeStyle = '#f00';
            ctx.strokeRect(it.position.x * chunkSize + offset.x, it.position.y * chunkSize +offset.y, chunkSize, chunkSize);
            ctx.drawImage(it.chunk, it.position.x * chunkSize + offset.x, it.position.y * chunkSize +offset.y);
        })   
    }
    canvas.onmousedown = ()=>{
        const handleMove = (e)=>{
            offset.x += e.movementX;
            offset.y += e.movementY;
            render();
        }
        const handleUp = (e)=>{     
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        }

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }
    render()
    /*const octas = 9;
    for (let x=0; x<canvas.width; x++){
        for (let y=0; y<canvas.height; y++){
            let noiseValue = 0;
            for (k=4; k< octas; k++){
                noiseValue = (noiseValue + (noise(x / 2 ** k, y / 2 ** k)) /((octas-k) ** 1.2));
            }
            ctx.fillStyle = noiseValue > 0 ? grey(0) : grey(255); //grey(Math.max(Math.min((noiseValue + 1) / 2 * 256, 255), 100));//grey((noiseValue + 1) / 2 * 256);
            ctx.fillRect(x, y, 1, 1);
        }
    }*/
}

app();