const canvas = document.querySelector('.canvas');
const input = document.querySelector('.input');
const button = document.querySelector('.button');

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
    imgs.forEach(img => {      
      context.drawImage(img, currentPosX, 0);
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