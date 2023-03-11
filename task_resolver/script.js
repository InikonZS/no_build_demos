class Resolver{
    constructor(){
        this.tasks = [];
        setInterval(()=>{
            this._tick();
        }, 100);
    }

    addTask(task){
        this.tasks.push(task);
    }

    _tick(){
        var isEmpty = true;
        var lastLength = this.tasks.length;
        this.tasks.forEach(task => {
            if (!task.isWaiting){
               task.tick();
               isEmpty = false;
            }
        });
        this.tasks = this.tasks.filter(task => !task.isCompleted);
        if (lastLength != this.tasks.length){
            this.onItemComplete?.();
        }
        if (isEmpty){
            const nextWaiter = this.tasks[0];
            if (nextWaiter){
                nextWaiter.isWaiting = false;
                this.onNextWaiter?.();
            }
        }
        if (this.tasks.length == 0 && lastLength!=0){
            this.onComplete?.();
        }
    }
}

class Task{
    constructor(waiting){
        this.time = 3;
        this.isCompleted = false;
        this.isWaiting = waiting;
    }

    tick(){
        if (this.onCompleted) return;
        this.time -= 0.1;
        if (this.time < 0){
            this.onComplete?.();
            this.isCompleted = true;
        }
        this.onTick?.();
    }
}


class Control{
    constructor(parentNode, tag = 'div', className = '', content = ''){
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = content;
        parentNode.append(node);
        this.node = node;
    }

    destroy(){
        this.node.remove();
    }
}

class App extends Control{
    constructor(parentNode){
        super(parentNode);
        const resolver = new Resolver();
        new GameField(this.node);
        this.resolver = resolver;
        const addButton = new Control(this.node, 'button', '', 'add task');
        addButton.node.onclick = ()=>{
           this.addTask(); 
        }

        const waiterButton = new Control(this.node, 'button', '', 'add waiter');
        waiterButton.node.onclick = ()=>{
            this.addWaiter();
        }
    }

    addTask(){
        const task = new Task(false);
        this.resolver.addTask(task);
        const taskView = new Control(this.node, 'div', '', 'task');
        task.onComplete = ()=>{
            taskView.destroy();
            if (Math.random()<0.5){
             //   this.addTask();
            }
        }
        task.onTick = ()=>{
            taskView.node.textContent = 'task '+ task.time;
        }
    }

    addWaiter(){
        const task = new Task(true);
        this.resolver.addTask(task);
        const taskView = new Control(this.node, 'div', '', 'waiter');
        task.onComplete = ()=>{
            taskView.destroy();
            if (Math.random()){
                this.addTask();
            }
        }
        task.onTick = ()=>{
            taskView.node.textContent = 'waiter '+ task.time;
        }
    }
}

class Bomb extends Control{
    constructor(parentNode, resolver, position, wait=false){
        super(parentNode, 'div', 'item');
        this.position = position;
        this.node.style.left = `${position.x - 25}px`;
        this.node.style.top = `${position.y - 25}px`;

        const task = new Task(wait);
        task.onComplete = ()=>{
            this.destroy();
            this.onDestroy?.(position);
        }
        task.onTick = ()=>{
            this.node.textContent = 'bomb '+ task.time.toFixed(1);
        }
        resolver.addTask(task);
    }
}

class Box extends Control{
    constructor(parentNode, resolver, position, name){
        super(parentNode, 'div', 'item');
        this.position = position;
        this.name = name;
        this.node.style.left = `${position.x - 25}px`;
        this.node.style.top = `${position.y - 25}px`;

        this.health = 100;
        this.node.textContent = name +' '+ this.health;
        /*const task = new Task(false);
        task.onComplete = ()=>{
            this.destroy();
        }
        task.onTick = ()=>{
            this.node.textContent = 'bomb '+ task.time.toFixed(1);
        }
        resolver.addTask(task);*/
    }

    damage(position){
        const dist = Math.hypot(position.x - this.position.x, position.y - this.position.y);
        if (dist < 30){
            this.health -= 100;
        } else
        if (dist < 100){
            this.health -= 50;
        } else
        if (dist < 300){
            this.health -= 20;
        }
        this.node.textContent = this.name+ ' '+ this.health;
        if (this.health<0){
            this.destroy();
            this.onDestroy?.();
        }
    }
}

class GameField extends Control{
    constructor(parentNode){
        super(parentNode);
        this.objects = [];
        const resolver = new Resolver();
        resolver.onComplete = ()=>{
            console.log('complete resolver');
        }
        resolver.onNextWaiter = ()=>{
            console.log('next waiter');
        }
        resolver.onItemComplete = ()=>{
            console.log('complete item');
        }
        this.resolver = resolver;
        const container = new Control(this.node, 'div', 'container');
        for (let i=0; i< 10; i++){
            const obj = new Box(container.node, resolver, {x: Math.random() * 800, y: Math.random() * 600}, 'box');
            obj.onDestroy = ()=>{
                this.objects = this.objects.filter(it=> it!==obj);
                const bomb = new Bomb(container.node, resolver, obj.position);
                bomb.onDestroy = (pos)=>{
                    this.objects.forEach(it=> it.damage(pos));
                }
            }
            this.objects.push(obj);
        }

        for (let i=0; i< 10; i++){
            const obj = new Box(container.node, resolver, {x: Math.random() * 800, y: Math.random() * 600}, 'wtf');
            obj.onDestroy = ()=>{
                this.objects = this.objects.filter(it=> it!==obj);
                const bomb = new Bomb(container.node, resolver, obj.position, true);
                bomb.onDestroy = (pos)=>{
                    this.objects.forEach(it=> it.damage(pos));
                }
            }
            this.objects.push(obj);
        }

        container.node.onmousedown = (e)=>{
            const x = e.offsetX;
            const y = e.offsetY;
            const bomb = new Bomb(container.node, resolver, {x, y});
            bomb.onDestroy = (pos)=>{
                this.objects.forEach(it=> it.damage(pos));
            }
        }
    }
}

new App(document.body);