const canvas = document.querySelector('.canvas');
const input = document.querySelector('.input');
const button = document.querySelector('.button');
const buttonPlay = document.querySelector('.buttonPlay');

const encodeImage = (keyFrame, subFrame)=>{
  const canvas = document.createElement('canvas');
  canvas.width = keyFrame.naturalWidth;
  canvas.height = keyFrame.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(keyFrame, 0, 0);
  const keyData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(subFrame, 0, 0);
  const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < frameData.height; i++) {
    for (let j = 0; j < frameData.width; j++) {
      //const colors = [];
      for (let k = 0; k < 4; k++) {
        //colors.push(data.data[i * data.width * 4 + j * 4 + k]);
        const keyValue = keyData.data[i * keyData.width * 4 + j * 4 + k];
        const frameValue = frameData.data[i * frameData.width * 4 + j * 4 + k];
        keyData.data[i * keyData.width * 4 + j * 4 + k] = k == 3 ? frameValue : (Math.abs(keyValue - frameValue) >10 ? (keyValue - frameValue + 256) % 256 : 0);
      }
    }
  }
  ctx.putImageData(keyData, 0, 0);
  return canvas;
}

const decodeImage = (keyFrame, subFrame)=>{
  const canvas = document.createElement('canvas');
  canvas.width = keyFrame.naturalWidth;
  canvas.height = keyFrame.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(keyFrame, 0, 0);
  const keyData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(subFrame, 0, 0);
  const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < frameData.height; i++) {
    for (let j = 0; j < frameData.width; j++) {
      //const colors = [];
      for (let k = 0; k < 4; k++) {
        //colors.push(data.data[i * data.width * 4 + j * 4 + k]);
        const keyValue = keyData.data[i * keyData.width * 4 + j * 4 + k];
        const frameValue = frameData.data[i * frameData.width * 4 + j * 4 + k];
        keyData.data[i * keyData.width * 4 + j * 4 + k] = (keyValue - frameValue + 256) % 256;
      }
    }
  }
  ctx.putImageData(keyData, 0, 0);
  return canvas;
}

const decodeSheet = (sheet, frameWidth)=>{
  const canvas = document.createElement('canvas');
  canvas.width = sheet.naturalWidth || sheet.width;
  canvas.height = sheet.naturalHeight || sheet.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sheet, 0, 0);
  //const keyData = ctx.getImageData(0, 0, /*canvas.width*/ frameWidth, canvas.height);
  for (let frameIndex = 1; frameIndex < (canvas.width / frameWidth); frameIndex++){
    const keyData = ctx.getImageData((frameIndex -1) * frameWidth, 0, /*canvas.width*/ frameWidth, canvas.height);
    const frameData = ctx.getImageData(frameIndex * frameWidth, 0, /*canvas.width*/ frameWidth, canvas.height);
    for (let i = 0; i < keyData.height; i++) {
      for (let j = 0; j < keyData.width; j++) {
        //const colors = [];
        for (let k = 0; k < 4; k++) {
          //colors.push(data.data[i * data.width * 4 + j * 4 + k]);
          const keyValue = keyData.data[i * keyData.width * 4 + j * 4 + k];
          const frameValue = frameData.data[i * frameData.width * 4 + j * 4 + k];
          keyData.data[i * keyData.width * 4 + j * 4 + k] = k==3? frameValue : (keyValue - frameValue + 256) % 256;//(keyValue - frameValue + 256) % 256;
        }
      }
    }
    ctx.putImageData(keyData, frameIndex * frameWidth, 0);
  }
  return canvas;
}

button.onclick = () => {
  const images = [...input.files].map(file => {
    return new Promise(resolve => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve(img);
      }
    })   
  })
  Promise.all(images).then(imgs => {
    console.log(imgs);
    let currentPosX = 0;
    let currentPosY = 0;
    let currentSizeX = 0;
    let currentSizeY = 0;
    const context = canvas.getContext('2d');
    imgs.forEach(img => {      
      currentSizeX += img.naturalWidth;
      currentSizeY = Math.max(img.naturalHeight, currentSizeY);
      
    })
    canvas.width = currentSizeX;
    canvas.height = currentSizeY;
    imgs.forEach((img, imgInd) => {      
      context.drawImage(imgInd>0 ? encodeImage(imgs[imgInd - 1], imgs[imgInd]) : img, currentPosX, 0);
      //context.drawImage(imgInd>0 ? decodeImage(imgs[imgInd - 1], encodeImage(imgs[imgInd - 1], imgs[imgInd])) : img, currentPosX, 0);
      //context.drawImage(img, currentPosX, 0);
      currentPosX += img.naturalWidth;      
    })
    const result = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    document.body.append(link);
    console.log(result);
    link.href = result;
    link.textContent = "aaaaaaaaa";
    link.setAttribute('download', 'MintyPaper.png');
  })
}

buttonPlay.onclick = () => {
  const images = [...input.files].map(file => {
    return new Promise(resolve => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve(img);
      }
    })   
  });
  Promise.all(images).then(imgs => {
    const decoded = decodeSheet(imgs[0], 155);
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(decoded, 0, 0);
  })
/*
    const decoded = decodeSheet(/*imgs[0]*//*canvas, 155);
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(decoded, 0, 0);*/
}