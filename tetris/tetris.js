class Control{
    constructor (parentNode, className='', content=''){
      let el = document.createElement('div');
      el.className = className;
      el.textContent = content;
      parentNode.appendChild(el);  
  
      this.node = el;
    }
  }
  
  class Matrix extends Control{
    constructor(parentNode, className, rowClassName, cellClassName, activeCellClassName, inactiveCellClassName, width, height){
      super(parentNode, className);
      this.width = width;
      this.height = height;
      this._field = [];
      this._backField = [];
      this._cellClassName = cellClassName;
      this._activeCellClassName = activeCellClassName;
      this._inactiveCellClassName = inactiveCellClassName;
      for (let y = 0; y< height; y++){
        let row = new Control (this.node, rowClassName);
        let rowList = [];
        let backRow = [];
        this._field.push(rowList);
        this._backField.push(backRow);
        for (let x = 0; x< width; x++){
          let cell = new Control (row.node, cellClassName +' '+ inactiveCellClassName);
          rowList.push(cell);
          backRow.push('-');
        }
      }
    }
  
    setValue(value, x, y){
      y<this.height?this._backField[y][x] = value:false;
    }
  
    getBackStatus(x, y){
      return y<this.height?this._backField[y][x]:false;
    }
  
    setActive(x, y){
      y<this.height?this._field[y][x].node.className=this._cellClassName +' '+ this._activeCellClassName:false;
    }
  
    setInactive(x, y){
      y<this.height?this._field[y][x].node.className=this._cellClassName +' '+ this._inactiveCellClassName:false;  
    }
  
    getStatus(x, y){
      return this._field[y][x];
    }
  }
  
  class Tetrix{
    constructor(parentNode){
      this.matrix = new Matrix(parentNode, '', 'gameField_row', 'gameField_cell', 'gameField_cell__active', 'gameField_cell__inactive', 10, 15);
    }
    clear(back){
      for (let i=0; i<this.matrix.width; i++){
        for (let j=0; j<this.matrix.height; j++){
          if (back){
            this.matrix.setValue('-', i, j);
            this.matrix.setInactive(i, j);    
          } else {
            if (this.matrix.getBackStatus(i, j)!='='){
              this.matrix.setInactive(i, j);
            }
          }
        }
      }  
    }
    testLine(){
      let lines = [];
      let detected;
      for (let j=0; j<this.matrix.height; j++){
        detected = true;
        for (let i=0; i<this.matrix.width; i++){
          if (this.matrix.getBackStatus(i, j)!='='){
            detected = false;
          }
        }
        if (detected){
          lines.push(j);
        }
      }
      return lines;
    }
    deleteLines(lines){
      for (let j=0; j<this.matrix.height; j++){
        for (let i=0; i<this.matrix.width; i++){
          if (lines.includes(j)){
           // if (this.matrix.getBackStatus(i, j)!='='){
                this.matrix.setValue('-', i, j);
                this.matrix.setInactive(i, j);
           // }
          }
        }
      }    
    }
    testFigure(figure, x, y){
      let crossed = false;
      for (let i=0; i<figure.length; i++){
        for (let j=0; j<figure[0].length; j++){
          if (figure[j][i]=='+') {
            if (!this.matrix.getBackStatus(x+i, j+y) || this.matrix.getBackStatus(i+x, j+y)=='='){
              crossed=true; 
            }    
          }
        }  
      }
      return crossed;  
    }
    drawFigure(figure, x, y, back){
      //let crossed = false;
      for (let i=0; i<figure.length; i++){
        for (let j=0; j<figure[0].length; j++){
          if (figure[j][i]=='+') {
            //if (!this.matrix.getBackStatus(x+i, j+y+1) || this.matrix.getBackStatus(i+x, j+y+1)=='='){
            //  crossed=true; 
            //}
              this.matrix.setValue(back?'+':'=', x+i, j+y);
              this.matrix.setActive(x+i, j+y);
          
          }
        }  
      }
      //return crossed;
    }
    step (){
  
    }
  }
  
  const mainNode = document.querySelector('#app');
  
  const figs1 = [
    [
      '++--',
      '+---',
      '+---',
      '----',
    ],
    [
      '+---',
      '+---',
      '++--',
      '----',
    ],
    [
      '-+--',
      '++--',
      '+---',
      '----',
    ],
    [
      '+---',
      '++--',
      '-+--',
      '----',
    ],
    [
      '+---',
      '++--',
      '+---',
      '----',
    ],
    [
      '++--',
      '++--',
      '----',
      '----',
    ],
    [
      '+---',
      '+---',
      '+---',
      '+---',
    ],
  ];
  figs = [
    [
      '----',
      '+---',
      '+---',
      '++--',  
    ],
    [
      '+---',
      '+---',
      '+---',
      '+---',  
    ]
  ]
  let fig = figs[0];
  
  window.app = new Tetrix(mainNode);
  let h=0;
  let w=3;
  document.addEventListener('keydown',(e)=>{
    console.log(e.key)
    if (e.key=='ArrowLeft'){
      if(!window.app.testFigure(fig,w-1,h)){
        w--;
      }
    }
    if (e.key=='ArrowRight'){
      if(!window.app.testFigure(fig,w+1,h)){
        w++;
      }
    }
  })
  setInterval(()=>{
    window.app.clear(false);
    let res = window.app.testFigure(fig,w,h+1);
    window.app.drawFigure(fig,w,h, true);
    if (res){
      window.app.drawFigure(fig,w,h, false);
      fig=figs[Math.trunc((Math.random()*figs.length))];
      window.app.deleteLines(window.app.testLine());
      h=0;  
    }
    h++;
  }, 200);
  
  