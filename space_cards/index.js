class Element {
  constructor (parentNode, tag, className, content){
    let el=document.createElement(tag);
    this.node=el;
    parentNode.appendChild(el);
    el.className=className;
    el.innerHTML=content;  
  }
}

class Control {
  constructor (parentNode, tag, className, content, onClick){
    let el=document.createElement(tag);
    this.node=el;
    parentNode.appendChild(el);
    el.className=className;
    el.innerHTML=content;
    this.click = onClick;
    el.addEventListener('click', (e)=>{
      console.log('fsdgs', this.click);
      if (this.click){
      this.click(e);
      }
    });
  }
}

class Button extends Control {
  constructor (parentNode, tag, classUpName, classDownName, content, onClick){
    super(parentNode, tag, classUpName, content);
    this.isToggled=false;

    this.classUpName = classUpName;
    this.classDownName = classDownName;
    this.onClick = onClick;	
    this.click = (e)=>{
      this.isToggled ? this.untoggle() : this.toggle();
      if (this.onClick){
        this.onClick(e);
      }
    }
   // this.node.addEventListener('mousemove'.... //можно добавить своих обработчиков еще по желанию
  }
  
  toggle () {
    this.isToggled=true;
    this.node.className = this.classDownName;
    return this.isToggled;
  }
  
  untoggle () {
    this.isToggled=false;
    this.node.className = this.classUpName;
    return this.isToggled;
  }
}

class RadioGroup extends Element {
  constructor(parentNode, className, classButton, classButtonSelected, onChange){
    super(parentNode, 'div', className, '');
    this.onChange = onChange;
    this.classButton = classButton;
    this.classButtonSelected = classButtonSelected;
    this.buttons=[];
    this.currentButton;
  }
  
  addButton(content, onClick){
    let el = new Button(this.node,'div', this.classButton, this.classButtonSelected, content);
    el.onClick = (e)=>{
      this.buttons.forEach((it)=>{
        if (it!=el) {
          it.untoggle();
        }
      });
      this.currentButton = el;
      if (onClick) {
        onClick(e);
      }
      if (this.onChange) {
        this.onChange(e, el);
      }
    }
    this.buttons.push(el);
    return el;
  }
}

class Card extends Control{
  constructor(parentNode,color, content){
    super(parentNode, 'div', '', content);
    this.transform = {
      rx: Math.trunc(Math.random()*72-36),
      ry: Math.trunc(Math.random()*72-36),
      rz: Math.trunc(Math.random()*72-36),
      tx: Math.trunc(Math.random()*1000-500),
      ty: Math.trunc(Math.random()*1000-500),
      tz: Math.trunc(Math.random()*1000-500),
    };
    this.color = color;
    this.node.style = transformStyle(this.color, this.transform);
  }
}

class App {
  constructor (parentNode){
    this.output = new Control(parentNode, 'div', '', '');
    this.menu = new RadioGroup(parentNode, 'menu','bt_unsel', 'bt_sel');
    /*for (let i=0; i<10; i++){
      let newButton = this.menu.addButton(`item ${i}`, (e)=>{
        this.output.node.textContent = `page content ${i}`;
      });
    }*/

    this.dash = new Element(parentNode, 'div', 'dash', '');
    this.cards = [];
    for (let i=0; i<40; i++){
      let el = new Card(this.dash.node, `rgb(
        ${Math.trunc(Math.random()*155+100)},
        ${Math.trunc(Math.random()*155+100)},
        ${Math.trunc(Math.random()*155+100)}
      );` , 'ca-'+i);
      this.cards.push(el);
      
      let newButton = this.menu.addButton(`item ${i}`, (e)=>{
        this.dash.setTransform(el.transform);
      });
      el.click = ()=>{newButton.click()};
    }

    this.dash.setTransform = (t) => {
      this.cards.forEach((it) =>{
        let st=it.transform;
        let transform = {
          rx: st.rx-t.rx,
          ry: st.ry-t.ry,
          rz: st.rz-t.rz,
          tx: st.tx-t.tx,
          ty: st.ty-t.ty,
          tz: st.tz-t.tz,
        };
        it.node.style = transformStyle(it.color, transform);
      });
    }
  }
}

function transformStyle(color, transform){
  let res = `
    background-color: ${color};
    transition-duration: 5000ms;
    width:100px;
    height:100px;
    top:50%;
    left:50%;
    position:absolute;
    z-index: ${1000+transform.tz};
    transform: 
      perspective(500px)
      rotateX(${transform.rx}deg)
      rotateY(${transform.ry}deg)
      rotateZ(${transform.rz}deg)
      translate3d(
        ${transform.tx}px, 
        ${transform.ty}px, 
        ${transform.tz}px
      );
  `;
  return res;  
}

let app = new App(document.querySelector('#app-main'));
