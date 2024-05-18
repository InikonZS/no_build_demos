const root = document.querySelector('.root');

class Item{
    constructor(root, top, left, size){
        const child = document.createElement('div');
        child.className = 'item';
        const randomSize = size ?? (Math.random() + 0.2) * 100;
        child.style.width = randomSize +'px';
        child.style.height = randomSize +'px';
        const randomLeft = left ?? (Math.random() + 0.2) * 600 - randomSize;
        const randomTop = top ?? (Math.random() + 0.2) * 400 - randomSize;
        child.style.left = randomLeft +'px';
        child.style.top = randomTop +'px';

        const blink = document.createElement('div');
        blink.className = 'item_blink';
        child.appendChild(blink);

        root.appendChild(child);
        this.element = child;
    }

    blink(){
        this.element.classList.add('blink');
        this.element.onanimationend = ()=>{
            this.element.classList.remove('blink');
        }
    }
}

class App{
    constructor(root){
        const inp = document.createElement('input');
        inp.type='range';
        inp.min=0;
        inp.max=90;
        inp.step=1;
        inp.value='50';
        this.angle = inp.valueAsNumber || 0;
        inp.oninput = ()=>{
            this.angle = inp.valueAsNumber || 0;
            view.style.setProperty('--angle', -this.angle+'deg');
        }
        root.appendChild(inp);

        const view = document.createElement('div');
        view.className ='items';
        root.appendChild(view);

        const items = new Array(100).fill(null).map((_, i)=>{
            return new Item(view, (i % 10) * 40, Math.floor(i / 10) * 40, 60-(Math.random()*30));
        });
        this.items = items;
        this.startBlinking();

    }

    startBlinking(){
        //this.blink();
        const angle = this.angle;
        this.blinkTrace(angle / 180 * Math.PI);
        setTimeout(()=>{
            this.startBlinking();
        }, 7000);
    }

    blink(){
        this.items.forEach(item=> item.blink());
    }

    blinkTrace(angle){
        let minDelay = 0;
        const animationParams = this.items.map(it=>{
            const bounds = it.element.getBoundingClientRect();
            const rotated = bounds.left * Math.sin(angle) + bounds.top* Math.cos(angle);
            const rotatedEnd = (bounds.left +bounds.width*4) * Math.sin(angle) + (bounds.top +bounds.height *4)* Math.cos(angle);
            //const fullBounds = it.element.parentElement.getBoundingClientRect();
            //const maxDelay =
            //console.log(40/bounds.width);
            let delay = rotated * 10 - (rotatedEnd-rotated)*10/4;
            console.log(delay);
            if (delay<minDelay){
                minDelay = delay;
            }
            //if (minDelay>)
            return {delay: delay, time: /*60/Math.hypot(bounds.height, bounds.width) * 500*/ /*1/(60/(bounds.width))* 2000*/ (rotatedEnd-rotated)*10};
        });
        this.items.forEach((it, i)=>{
            setTimeout(()=>{
                it.element.children[0].style['animation-duration'] = animationParams[i].time + 'ms'; 
                it.blink();
            }, animationParams[i].delay - minDelay);
            
        })
    }
}

const app = new App(root);