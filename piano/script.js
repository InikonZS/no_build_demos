class Control {
  constructor(parentNode, tagName = 'div', className = '', content = '') {
    const el = document.createElement(tagName);
    el.className = className;
    el.innerHTML = content;
    parentNode.appendChild(el);
    this.node = el;
  }
}

class Piano extends Control{
  constructor(parentNode){
    super(parentNode, 'div', 'piano_wrapper');
    this.pianoKeys = [];
    this.node.setAttribute('tabindex', 1);
    this.node.onkeydown = (e)=>{
      if(!e.repeat){
        let currentKey = this.pianoKeys.find(it=>it.hotKey==e.code);
        if (currentKey) {
          currentKey.play();
        }
      }
    }

    this.node.onselectstart = (e)=>{
      e.preventDefault();
    }

    this.node.ondragstart = (e)=>{
      e.preventDefault();
    }

    this.node.onkeyup = (e)=>{
      if(!e.repeat){
        let currentKey = this.pianoKeys.find(it=>it.hotKey==e.code);
        if (currentKey) {
          currentKey.stop();
        }
      }
    }
  }

  addKey(key){
    this.pianoKeys.push(key);
  }
}

class PianoKey extends Control{
  constructor(parentNode, isSharp, frequency, hotKey){
    super(parentNode, 'div', isSharp?'piano-button_sharp-wrapper':'piano-button_white-wrapper');
    this.keyElement = new Control(this.node, 'div', isSharp?"piano-button_sharp":"piano-button_white");
    this.frequency = frequency;
    this.hotKey = hotKey;
    this.keyElement.node.onmousedown = ()=>{
      this.play();  
    }

    this.keyElement.node.onmouseup = ()=>{
      this.stop();  
    }

    this.keyElement.node.onmouseleave = ()=>{
      this.stop();  
    }

    this.keyElement.node.onmouseover = (e)=>{
      if(e.buttons == 1){
        this.play();  
      }
    }
  }
  /*
  200 - 1
  20 - 0.1
  */
  stop(){
    this.keyElement.node.classList.remove('piano-button__active');
  }

  play(){
    this.keyElement.node.classList.add('piano-button__active');
    /*let val = 6*(Math.sin((i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) )) /(i/500+1)*/
    //snd(this.frequency, 8, (i)=>limit(1/((1+i)/1000),1)* 0.5);
    snd(this.frequency, 8.5, (i)=>limit(AMSRLerp(editor.points, i)/200), 0.5);
    /*for (let i=0; i<100000; i+=1000){
      console.log(Math.log(1/((1+i)/4000)));  
    }*/
    
    //snd(this.frequency, (i)=>limit(1/((1+i)/(1000*(AMSRLerp(editor.points, i)))),1)* 0.5);
    //snd(this.frequency, (i)=>limit(10**(AMSRLerp(editor.points, i)/20)/(10**10), 1/20)*10);
    //snd(this.frequency, (i)=>limit(10**(0.10*((AMSRLerp(editor.points, i)/2)-80)), 0.5));
  }
}

function limit(value, threshold){
  if (value<=-threshold){
    return -threshold;
  }
  if (value>=threshold){
    return threshold;
  }
  return value;
}

class Point{
  constructor (x, y){
    this.x = x;
    this.y = y;
    this.isHover = false;
    this.xScale = 130;
  }

  checkHover(mousePoint){
    return (Math.hypot(((mousePoint.x- this.x)/this.xScale), (mousePoint.y- this.y))< 10)
  }

  handleHover(e){
    let mousePoint = new Point(e.offsetX*this.xScale, e.offsetY);
    if (this.checkHover(mousePoint)){
      if (this.isHover==false){
        this.onHover && this.onHover(e);
      }
      this.isHover = true;   
    } else {
      if (this.isHover==true){
        this.onOver && this.onOver(e);
      }
      this.isHover = false;
    }
  }

  handleDown(e){
    let mousePoint = new Point(e.offsetX*this.xScale, e.offsetY);
    if (this.checkHover(mousePoint)){
        this.isSelected = true;
        this.onMouseDown && this.onMouseDown(e);
    }    
  }  

  handleMove(e){
    if (this.isSelected){
      this.x = e.offsetX * this.xScale;
      this.y = e.offsetY;
    }  
  }

  render(context, size = 6){
    //let size = 6;
    context.fillStyle = !this.isHover? '#f00' : '#0f0';
    context.fillStyle = this.isSelected? '#ff0' : context.fillStyle;
    context.fillRect(this.x/this.xScale - size/2, this.y- size/2, size, size);
  }
}

class AMSREditor extends Control{
  constructor(parentNode){
    super(parentNode, 'canvas');
    this.context = this.node.getContext('2d');
    this.node.width = 480;
    this.node.height = 320;
    this.points = [
      new Point(-2500000, 0),
      new Point(0, 0),
      new Point(0, 200),
      new Point(2500, 200),
      new Point(5500, 50),
      new Point(7500, 10),
      new Point(25000, 0),
      new Point(2500000, 0),
    ];
    this.node.onmousemove = (e)=>{
      this.points.forEach(point=>{
        point.handleHover(e);
      });
      this.points.forEach(point=>{
        point.handleMove(e);
      });
      this.render();
    }

    this.node.onmousedown = (e)=>{
      this.points.forEach(point=>{
        point.handleDown(e);
      });
      this.render();
    }

    this.node.onmouseup = (e)=>{
      this.points.forEach(point=>{
        point.isSelected = false;
      });
      this.render();
    }

  }

  render(){
    this.context.fillStyle = '#000';
    this.context.fillRect(0,0, this.context.canvas.width, this.context.canvas.height);
    for (let i = 0; i<100000; i+=100){
      new Point(i, AMSRLerp(this.points, i)).render(this.context,3);
    }
    this.points.forEach(point=>{
      point.render(this.context,8);
    });

    
  }
}

function AMSRLerp(points, xValue){
  let aIndex = 0;
  let nearA = points.find((it, i)=>{
    aIndex = i;
    return it.x>=xValue;
  });
  let nearB = points[aIndex-1];
  return lerp(nearB.y, nearA.y, (xValue-nearB.x)/(nearA.x-nearB.x));
}



/*let codes = [];
document.onkeydown= (e)=>{
  codes.push(e.code);
}
console.log(codes);*/

let hots = [
  "KeyA",
  "KeyW",
  "KeyS",
  "KeyE",
  "KeyD",
  "KeyF",
  "KeyT",
  "KeyG",
  "KeyY",
  "KeyH",
  "KeyU",
  "KeyJ",
  "KeyK",
  "KeyI",
  "KeyL",
  "KeyO",
  "Semicolon",
  "KeyP",
  "Quote"
]

let piano = new Piano(document.querySelector('.page_main'));
let editorWrapper = new Control(document.querySelector('.page_main'), 'div', 'editor_wrapper');
let editor = new AMSREditor(editorWrapper.node);
editor.render();
let octa = '010100101010';

for (let i=0; i<53; i++){
  let key = new PianoKey(piano.node, octa[i % octa.length]=='1' ? true : false, 82 * (2 ** (i/12)), hots[i]);
  piano.addKey(key);
}