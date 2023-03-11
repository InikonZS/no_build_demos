function isPossible(pos, size) {
    return !(pos.x < 0 || pos.y < 0 || pos.y >= size || pos.x >= size);
}

function cycle(a, am) {
    return a >= 0 ? a % am : am - (1 + -(a + 1) % am)
}

function swapPositions(a, b) {
    let c = { x: a.x, y: a.y }
    a.x = b.x;
    a.y = b.y;
    b.x = c.x;
    b.y = c.y;
}

/*function findDirectionN(direction, empty, cubes){
  let moves = [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
  let found = cubes.find(it=>{
    return (it.position.x==empty.x+moves[direction].x && it.position.y==empty.y+moves[direction].y);
  });
  return found;
}*/

function findDirection(direction, empty, cubes) {
    let moves = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    let found = cubes.find(it => {
        return (it.nextPosition.x == empty.x + moves[direction].x && it.nextPosition.y == empty.y + moves[direction].y);
    });
    return found;
}

function moveBlock(blockPosition, emptyPosition) {
    if (((Math.abs(blockPosition.x - emptyPosition.x) == 1) && (Math.abs(blockPosition.y - emptyPosition.y) == 0)) ||
        ((Math.abs(blockPosition.x - emptyPosition.x) == 0) && (Math.abs(blockPosition.y - emptyPosition.y) == 1))) {
        swapPositions(blockPosition, emptyPosition);
        return true;
    }
    return false;
}

function getPosition(index, fieldSize) {
    return { x: Math.trunc(index / fieldSize), y: index % fieldSize }
}


class BackField {
    constructor(fieldSize) {
        this.hashHistory = [];
        this.fieldSize = fieldSize;
        for (let i = 0; i < fieldSize ** 2 - 1; i++) {
            this.cubes = [];
            this.empty = { x: fieldSize - 1, y: fieldSize - 1 };
            for (let i = 0; i < fieldSize ** 2 - 1; i++) {
                let position = getPosition(i, fieldSize);
                this.cubes.push(position);
            }
        }
        this.winHash = this.hashField();
    }

    moveDirection(direction, test) {
        let moves = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
        let found = this.cubes.findIndex(it => {
            return (it.x == this.empty.x + moves[direction].x && it.y == this.empty.y + moves[direction].y);
        });
        if (found != -1) {
            test || swapPositions(this.empty, this.cubes[found]);
            this.hashHistory.push(this.hashField());
        }

        return found;
    }

    moveBlock(index, noHistoryWrite) {
        let res = moveBlock(this.cubes[index], this.empty);
        if (res) {
            noHistoryWrite || this.hashHistory.push(this.hashField());
        }
        return res;
    }

    hashField() {
        let res = 0n;
        this.cubes.forEach(it => {
            res = res * (BigInt(this.fieldSize) ** 2n) + BigInt(it.x) + BigInt(it.y) * BigInt(this.fieldSize);
        });
        console.log(res);
        return res;
    }

    isWin() {
        return this.winHash == this.hashField();
    }
}

class GameField extends Control {
    constructor(parentNode, className, fieldSize) {
        super(parentNode, 'div', className);
        this.backField = new BackField(fieldSize);
        this.cubes = [];
        this.movList = [];
        this.nextList = [];
        this.asyncMovList = [];
        this.fieldSize = fieldSize;

        this.history = [];

        for (let i = 0; i < fieldSize ** 2 - 1; i++) {
            let cube = new Cube(this.node, 200 / fieldSize);
            cube.sides[0].node.style["background-size"] = `calc(${Math.trunc(fieldSize)} * 100%) calc(${Math.trunc(fieldSize)} * 100%)`;
            cube.sides[0].node.style["background-position"] = `calc(${Math.trunc(i % fieldSize)} * 100% / ${Math.trunc(fieldSize - 1)}) calc(${Math.trunc(i / fieldSize)} * 100% / ${Math.trunc(fieldSize - 1)})`;

            let position = getPosition(i, fieldSize);
            let dist = 5;
            let k = (dist - 1) * ((fieldSize - 1) / 2);

            cube.position.x = (position.x) * dist - k;
            cube.position.y = (position.y) * dist - k;
            cube.startPosition.x = (position.x) * dist - k;
            cube.startPosition.y = (position.y) * dist - k;
            cube.nextPosition.x = position.x;
            cube.nextPosition.y = position.y;
            this.asyncMovList.push(cube);
            cube.sides.forEach(it => {
                it.node.textContent = i;
            });
            cube.sides.forEach(it => {
                it.node.onclick = () => {
                    this.moveBlock(i);
                    return false;
                }
            });
            this.cubes.push(cube);
        }

        let controls = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
        let keyDownHandler = ev => {
            let direction = controls.indexOf(ev.code);
            if (direction != -1) {
                this.moveDirection(direction);
            }
        }
        this.removeKeyDown = () => {
            window.removeEventListener('keydown', keyDownHandler);
        }
        window.addEventListener('keydown', keyDownHandler);

        this.emptyPosition = { x: fieldSize - 1, y: fieldSize - 1 };
        this.rx = 0;
        this.ry = 0;
        this.time = 0;
    }

    moveDirection(direction) {
        let found = this.cubes[this.backField.moveDirection(direction)];//findDirection(direction, this.emptyPosition, this.cubes);
        if (found) {
            this.nextList.push(found);
        }
    }

    moveBlock(i) {
        this.backField.moveBlock(i);
        this.nextList.push(this.cubes[i]);
    }

    randomize(count) {
        let lastDirection = -1;
        for (let i = 0; i < count; i++) {
            let direction = 0;
            do {
                direction = Math.trunc(Math.random() * 4);
                //console.log(direction)
            } while (direction == (lastDirection + 2) % 4)
            lastDirection = direction;
            this.moveDirection(direction);
        }
    }

    solve() {
        if (this.history.length) {
            let lc = this.history.pop();
            let hc = this.backField.hashHistory.pop();
            while (this.backField.hashHistory.indexOf(hc) != -1) {
                lc = this.history.pop();
                this.backField.hashHistory.pop();
            }
            moveBlock(this.emptyPosition, lc.nextPosition)
            this.backField.moveBlock(this.cubes.indexOf(lc), true);
            lc.lerpValue = 0;
            this.movList.push(lc);
        } else {
            this.solv = false;
        }
    }

    next() {
        if (this.nextList.length) {
            let lc = this.nextList.shift();
            let isMoved = moveBlock(lc.nextPosition, this.emptyPosition); //this.backField.moveBlock(this.cubes.indexOf(lc));
            if (isMoved) {
                lc.lerpValue = 0;
                this.movList.push(lc);
                this.history.push(lc);
            }
        }
    }

    slv() {
        this.solv = true;
    }

    render(deltaTime) {
        this.time += deltaTime;
        this.rx = (Math.sin(this.time) * 10) % 360;
        this.ry = (Math.sin(this.time * 0.31) * 10) % 360;//(this.ry+0.2)%360;
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                let cube = this.cubes[i * this.fieldSize + j];
                //cube && cube.animatePosition();
                let margin = 10;
                let width = 400 / this.fieldSize;
                let center = { x: (width + margin) * this.fieldSize / 2 - margin / 2, y: (width + margin) * this.fieldSize / 2 - margin / 2 }
                cube && cube.setTransform(this.rx, this.ry, cube.position.y * (width + margin) - center.x, -cube.position.x * (width + margin) + center.y, 0, 50, 50, 10);
            }
        }
        if (this.solv) {
            if (this.movList.length == 0) {
                this.solve();
            }
        }

        if (this.movList.length == 0) {
            this.next();
        }

        if (this.movList.length) {
            this.movList[0].animatePosition(10.8, deltaTime, () => {
                /* let aud = new Audio();
                 aud.play();*/
            }, () => {
                this.movList.shift();
            });
        }
        this.asyncMovList.forEach((it, i, ar) => {
            it && it.animatePosition(0.8, deltaTime, null, () => {
                ar[i] = null;
            })
        })
        this.asyncMovList = this.asyncMovList.filter(_ => _);
    }

    destroy() {
        this.removeKeyDown();
    }
}

class ClockCanvas extends Control {
    constructor(parentNode, className, width, height) {
        super(parentNode, 'canvas', className);
        this.node.width = width;
        this.node.height = height;
        this.context = this.node.getContext('2d');
        this.time = 0;
        this.onRender;
    }

    render(deltaTime) {
        let cx = this.node.width / 2;
        let cy = this.node.height / 2;
        let ctx = this.context;
        ctx.clearRect(0, 0, this.node.width, this.node.height);
        let dt = new Date();
        let sec = dt.getSeconds();
        let angle = (sec * 6) / (180 / Math.PI);
        let px = -Math.sin(angle) * cx + cx;
        let py = Math.cos(angle) * cy + cy;
        let pxc = -Math.sin(angle) * 10 + cx;
        let pyc = Math.cos(angle) * 10 + cy;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pxc, pyc);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.stroke();
        this.time += deltaTime;
        this.onRender(deltaTime, this.time);
    }
}

let mainMenu = document.querySelector('.main_menu');
let headerMenu = document.querySelector('.header');



let settingsButton = new MainMenuButton(headerMenu, "burger_group", "ico_settings burger", "burger_back")
settingsButton.node.style.zIndex = 10;
settingsButton.onClick = () => {
    if (mainMenu.className == 'main_menu') {
        mainMenu.className = 'main_menu main_menu_shown';
    } else {
        mainMenu.className = 'main_menu';
    }
}

let clockButton = new MainMenuButton(headerMenu, "burger_group", "clock", "clock_back");
clockButton.node.style.zIndex = 2;
let clock = new ClockCanvas(clockButton.frontLayer.node, 'clock_canvas', 200, 200);
clock.onRender = ((deltaTime, time) => {
    clockButton.backLayer.node.textContent = addZero(Math.trunc(time / 60)) + ' : ' + addZero(Math.trunc(time) % 60);
});

clockButton.onClick = () => {
    gameField.solv = !gameField.solv;
}

let sizeSelector = new Selector(mainMenu, 'selector', 'selector_button', 'selector_button selector_button_right', 'selector_variants', 'selector_variant');
sizeSelector.add('3');
sizeSelector.add('4');
sizeSelector.add('5');
sizeSelector.add('6');
sizeSelector.slide(1);
sizeSelector.onChange = (item, position) => {
    gameField.destroy();
    renderNode.innerHTML = '';
    gameField = new GameField(renderNode, 'scene_area', +item.node.textContent);
}

function addZero(num) {
    return num < 10 ? '0' + num : num;
}

let renderNode = document.querySelector('.scene_truncer')

let gameField = new GameField(renderNode, 'scene_area', 5);

//let gameField1 = new GameField(renderNode, 'scene_area', 3);

let lastTime = 0;
function renderFrame(timeStamp) {
    let deltaTime = 0;
    if (lastTime) {
        deltaTime = timeStamp - lastTime;
    }
    lastTime = timeStamp;
    gameField.render(deltaTime / 1000);
    //gameField1.render(deltaTime/1000)
    clock.render(deltaTime / 1000);
    requestAnimationFrame(renderFrame);
}
requestAnimationFrame(renderFrame);
