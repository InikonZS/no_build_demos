let slides = document.querySelectorAll('.slider_slide');

let leftButton = document.querySelector('.slider_button__left');
let rightButton = document.querySelector('.slider_button__right');

let shift = 0;
let move = 0;

function cycleArr(a,am){
  return a>=0?am[a%am.length]:am[am.length-(1+ -(a+1)%(am.length))]
}

function cycle(a,am){
  return a>=0?a%am:am-(1+ -(a+1)%am)
}

let sliderContainer = document.querySelector('.slider_slides');

let isDrag = false;
let startX = 0;

sliderContainer.addEventListener('mousedown', (ev)=>{
  isDrag = true;  
  startX = ev.pageX;
});

sliderContainer.addEventListener('mousemove', (ev)=>{
  if (isDrag){
    move = -(ev.pageX-startX);
    let width = slides[0].getBoundingClientRect().width;
    let slideShift = -move/width;
    slideHandler(slideShift, false, true);
  }
});

sliderContainer.addEventListener('mouseup', (ev)=>{
  if (isDrag){
    isDrag = false; 
      let width = slides[0].getBoundingClientRect().width;
      let slideShift = -move/width;
      move = 0;
      slideHandler(slideShift, true);
  } 
});

function slideHandler(shiftValue, animate, unfixed){
  slideShift = unfixed?shiftValue:Math.round(shiftValue);
  slides.forEach((it, i)=>{
    let pos = cycle(shift+slideShift+i+1, slides.length);
    let duration = Math.abs(it.pos-pos)>1? 0 :400;
    it.style = `
      transition-duration: ${animate?duration:0}ms; 
      transform: translate(calc(${(pos-1)*100}% - ${0}px));
      `
    it.pos = pos;
  });
  if (!unfixed){
    shift+=slideShift;
  }
}

leftButton.onclick = ()=>{slideHandler(1, true)}
rightButton.onclick = ()=>{slideHandler(-1, true)};

slideHandler(0, false, true);
sync(()=>{slideHandler(0, true, true)});

function sync(callback){
  requestAnimationFrame(()=>requestAnimationFrame(()=>callback()));
}