const wr = document.querySelector('.wrapper');

const resize = ()=>{
  const width = window.innerWidth;
  const height = window.innerHeight;
  let w = 300;
  let h = 400;
    if (matchMedia('(min-aspect-ratio: 1/1)').matches){
        w = 600;
        h = 400;
    }
  const aspect = h/w;//100/80;
  const size = Math.min(height / aspect, width);
  /*wr.style.width = size + 'px';
  wr.style.height = size * aspect + 'px';*/
  wr.style.setProperty('--base', size / w);
}

window.onresize = resize;
resize();