class Control {
  constructor (parentNode, tagName='div', className='', content=''){
    let el = document.createElement(tagName);
    el.className = className;
    el.textContent = content;
    parentNode.appendChild(el);
    this.node = el;
  }
}

function intersect (a, b){
  if ((a.left+a.width > b.left && a.top+a.height > b.top)&& (b.left+b.width > a.left && b.top+b.height > a.top)){
    return true
  }
  return false;
}

class Tile extends Control {
  constructor (parentNode, className='', size){
    super(parentNode, 'div', className, '');
    this.size=size;
    this._x;
    this._y;
  }

  setPosition(x, y){
    this._x = x;
    this._y = y;
    this.node.style=`position:absolute; width: ${this.size}px; height: ${this.size}px; transform: translate(${x*this.size}px, ${y*this.size}px)`;
  }

  move(x, y, verifyFunction){
    let _verifyFunction = verifyFunction;
    if (!_verifyFunction){
      _verifyFunction=()=>true;
    }
    if (_verifyFunction(this._x+x, this._y+y)){
      this.setPosition(this._x+x, this._y+y);
      //return true;
  /*  } else if (_verifyFunction(this._x, this._y+y)){
      this.setPosition(this._x, this._y+y); 
    } else if (_verifyFunction(this._x+x, this._y)){
      this.setPosition(this._x+x, this._y); */
    } else
    { if (_verifyFunction(Math.round(this._x), this._y+y)){
        this.setPosition(Math.round(this._x),this._y+y);
       // console.log('x');
      } 
      if (_verifyFunction(this._x+x, Math.round(this._y))){
        this.setPosition(this._x+x,Math.round(this._y));
        //console.log('y')
      } else {
  
      }
      //return false;
    }
  }
}

class TileMap extends Control {
  constructor (parentNode, className, countX, countY, tileSize){
    super(parentNode, 'div', className, ''); 
    for (let i=0; i<countX; i++){
      //let row = new Control(this.node, 'div', 'row');
      for (let j=0; j<countY; j++){
        let tile = new Tile(this.node, 'tile', tileSize);
        tile.setPosition(i, j);
      }   
    } 
  }
}

let tileSize = 30;
let mainNode=document.querySelector('#app');
let map = new TileMap(mainNode, 'map', 20, 20, tileSize);

let player = new Tile(map.node, 'tile player', tileSize);
player.setPosition(4, 0);
let player2 = new Tile(map.node, 'tile player', tileSize);
player2.setPosition(5, 0);

//let box = new Tile(map.node, 'tile box', tileSize);
//box.setPosition(6, 6);

let boxList =[];
for (let i=0; i<40; i++){
  let tile = new Tile(map.node, 'tile box', tileSize);
  tile.setPosition(Math.round(Math.random()*20), Math.round(Math.random()*20)+1);
  boxList.push(tile);
}

/*document.addEventListener('keydown', (e)=>{
  if (e.key=='ArrowLeft'){
    player.move(-1,0);
  }
  if (e.key=='ArrowRight'){
    player.move(1,0);
  }
  if (e.key=='ArrowUp'){
    player.move(0,-1);
  }
  if (e.key=='ArrowDown'){
    player.move(0,1);
  }
});*/
let keyState = {};
let lastKey = '';
document.addEventListener('keydown', (e)=>{
  keyState[e.key]=true;
  lastKey=e.key;
});

document.addEventListener('keyup', (e)=>{
  keyState[e.key]=false;
  lastKey='';
});

function playerMove(x, y){
  player.move(x, y, (nx, ny)=>{
    let playerRect = {};
    //let domRect = player.node.getBoundingClientRect();
    playerRect.width = 1//domRect.width;
    playerRect.height = 1//domRect.height;
    playerRect.left = nx;//domRect.left+x;
    playerRect.top = ny;//domRect.top+y;

    
    //console.log(playerRect, enRect)
    return !boxList.some(it=>{
      let enRect = {};
      enRect.width=1;
      enRect.height=1;
      enRect.left=it._x;
      enRect.top=it._y;
      return intersect(playerRect, enRect);
    });
  });

  player2.move(-x, y, (nx, ny)=>{
    let playerRect = {};
    //let domRect = player.node.getBoundingClientRect();
    playerRect.width = 1//domRect.width;
    playerRect.height = 1//domRect.height;
    playerRect.left = nx;//domRect.left+x;
    playerRect.top = ny;//domRect.top+y;

    
    //console.log(playerRect, enRect)
    return !boxList.some(it=>{
      let enRect = {};
      enRect.width=1;
      enRect.height=1;
      enRect.left=it._x;
      enRect.top=it._y;
      return intersect(playerRect, enRect);
    });
  });
}

function onRender(deltaTime){
  let k = 5*deltaTime/1000;
  if (keyState['ArrowLeft']){
    playerMove(-1*k,0);
  }
  if (keyState['ArrowRight']){
    playerMove(1*k,0);
  }
  if (keyState['ArrowUp']){
    playerMove(0,-1*k);
  }
  if (keyState['ArrowDown']){
    playerMove(0,1*k);
  }  
}

let lastTime;
function renderCycle(timestamp) {
  if (!lastTime){lastTime=timestamp}
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  onRender(deltaTime);
  window.requestAnimationFrame(renderCycle);
}

window.requestAnimationFrame(renderCycle);