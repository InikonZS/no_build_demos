class GamenModel {
    field;
    fieldLength;

    constructor(){
        this.fieldLength = 9;
        this.start();
    }

    start(){
        this.removedLines = [];
        this.lastMove = undefined;
        this.score = 0;
        this.isWin = false;
        this.isFailed = false;
        const field = [];
        for (let i = 0; i<20; i++){
            const splittedNum = i.toString().split('').map(it=>Number.parseInt(it));
            if (splittedNum.includes(0)){
                continue;
            }
            splittedNum.forEach(it=>{
                field.push(it); 
            })
        }
        this.field = field;
    }

    restart(){
        this.start();
        this.onUpdate();
    }

    select(index){
        if (this.isFailed){
            return;
        }
        this.removedLines = [];
        console.log(this.selected, index)
        //let result;
        if (this.selected == null){
            this.selected = index;
            this.lastMove = undefined;
        } else {
            if (!(this.selected == index) && (this.field[this.selected] == this.field[index] || this.field[this.selected] + this.field[index] == 10) && (this.checkVertical(this.selected, index) || this.checkHorizontal(this.selected, index))){
                //const lastSelected = this.selected;
                let moveScore = 0;
                if (this.field[index] == this.field[this.selected]){
                    moveScore = this.field[index] == 5 ? 3 : 2;
                } else {
                    moveScore = 1;
                }
                this.score+=moveScore;
                this.lastMove = [index, this.selected, this.field[index], this.field[this.selected], moveScore];
                this.field[this.selected] = '';
                this.field[index] = '';
                this.selected = null;
                //result = [index, lastSelected];
            } else {
                this.lastMove = undefined;
                this.selected = null;
            }
        }
        this.field.splice(this.getLastEmpty());
        this.removeEmptyLines();
        console.log(this.field, this.getLastEmpty(), this.field.length, Math.floor(this.field.length / this.fieldLength));
        this.checkWin();
        this.onUpdate?.();
        //return result;
    }

    checkWin(){
        if (this.field.length == 0){
            this.isWin = true;
            console.log('win');
        }
        if (Math.floor(this.field.length / this.fieldLength)>50){
            this.isFailed = true;
            console.log('failed');
        }
    }

    checkCells(a, b){
        return (this.field[a] && this.field[b] && a!=b && (this.field[a] == this.field[b] || this.field[a] + this.field[b] == 10))
    }

    checkVertical(a, b){
        if (a % this.fieldLength == b % this.fieldLength){
            const x = a % this.fieldLength;
            const ay = Math.floor(a / this.fieldLength);
            const by = Math.floor(b / this.fieldLength);
            for (let i = Math.min(ay, by) + 1; i<= Math.max(ay, by) - 1; i++){
                if (this.field[x + i * 9]){
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    checkHorizontal(a, b){
        for (let i = Math.min(a, b) + 1; i<= Math.max(a, b) - 1; i++){
            if (this.field[i]){
                return false;
            }
        }
        return true;
    }

    getLastEmpty(){
        for (let i = this.field.length-1; i>=0; i--){
            if (this.field[i]){
                return i+1;
            }
        }
        return 0;
    }

    getFieldNums(){
        return this.field.filter(it=> it);
    }

    addNums(){
        if (this.isFailed){
            return;
        }
        this.removedLines = [];
        this.lastMove = undefined;
        this.selected = null;
        const lastEmpty = this.getLastEmpty();
        console.log(lastEmpty)
        const nums = this.getFieldNums();
        nums.forEach((it, i)=>{
            this.field[i+lastEmpty] = it;
        });
        this.checkWin();
        this.onUpdate?.();
    }

    removeEmptyLines(){
        const lines = [];
        for (let i = 0; i<Math.floor(this.field.length / 9); i++){
            let isEmpty = true;
            for (let j=0; j< this.fieldLength; j++){
                if (this.field[i*9+j] || i*9+j >= this.field.length){
                    isEmpty = false;
                    //return;
                }
            }
            if (isEmpty){
                lines.push(i);
            }
        }
        console.log('empty lines', lines);
        this.removedLines = lines.reverse();
        this.removedLines.forEach(line=>{
            //this.field.splice(line*9, 9)
            for (let j=0; j<9; j++){
                this.field[line*9 + j] = 'deleted';
            }
        })
        this.field = this.field.filter(it=>it !== 'deleted')
    }

    findMoves(){
        const moves = [];
        let lastIndex = 0;
        this.field.forEach((it, i)=>{
            if (lastIndex == i){
                return;
            }
            if(it){
                if (lastIndex != null){
                    if (this.checkCells(lastIndex, i)){
                        moves.push([lastIndex, i, 'h']);
                        lastIndex = i;
                    } else {
                        lastIndex = i;
                    }
                }
            }
        });

        for (let i =0; i< this.fieldLength; i++){
            let pos = i;
            let lastIndex = i;
            while (pos<this.field.length){
                pos += 9;
                if  (this.field[pos]){
                    if (this.checkCells(lastIndex, pos)){
                        moves.push([lastIndex, pos, 'v']);
                        lastIndex = pos;
                    } else {
                        lastIndex = pos;
                    }
                }
            }
        }
        console.log(moves);
        return moves;
    }
}

class GhostCell {
    onAnimate;

    constructor(parent) {
        const cell = document.createElement('div');
        cell.className = 'ghostCell'
        parent.append(cell);
        this.node = cell;

        const cellInner = document.createElement('div');
        cellInner.className = 'ghostCellInner'
        cell.append(cellInner);
        this.cellInner = cellInner;

        const cellItem = document.createElement('div');
        cellItem.className = 'cell ghostCellItem'
        cellInner.append(cellItem);
        this.cellItemA = cellItem;

        const cellItem2 = document.createElement('div');
        cellItem2.className = 'cell ghostCellItem'
        cellInner.append(cellItem2);
        this.cellItemB = cellItem2;

        const cellBorder = document.createElement('div');
        cellBorder.className = 'ghostCellBorder'
        cellInner.append(cellBorder);
        //this.setPositions(5, 5 +  18, true);
    }

    setPositions(a, b, aValue, bValue, isVertical, side){
        const cell = this.node;
        if (side == 'left'){
            cell.className = 'ghostCell ghostCellLeft'
            if (a>b){
                this.cellItemB.style.display = 'none'
            } else {
                this.cellItemA.style.display = 'none'
            }
        }
        if (side == 'right'){
            cell.className = 'ghostCell ghostCellRight'
            if (a<b){
                this.cellItemB.style.display = 'none'
            } else {
                this.cellItemA.style.display = 'none'
            }
        }
        this.isVertical = isVertical;
        console.log('val', aValue, bValue)
        /*const start = Math.min(a, b);
        const end = Math.max(a, b);
        cell.style.setProperty('--colsSelect', end - start + 1);
        cell.style.setProperty('--colsOffset', start % 9);
        cell.style.setProperty('--rowsSelect', 1);
        cell.style.setProperty('--rowsOffset', Math.floor(start / 9));*/
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        if (start!=a){
            this.cellItemA.textContent = bValue;
            this.cellItemB.textContent = aValue;
        } else {
            this.cellItemA.textContent = aValue;
            this.cellItemB.textContent = bValue;
        }
        if (isVertical){
            this.cellInner.className = 'ghostCellInner ghostCellInnerVertical'
            cell.style.setProperty('--colsSelect', 1);
            cell.style.setProperty('--colsOffset', start % 9);
            cell.style.setProperty('--rowsSelect', Math.floor(end / 9) - Math.floor(start / 9) + 1);
            cell.style.setProperty('--rowsOffset', Math.floor(start / 9));
        } else {
            this.cellInner.className = 'ghostCellInner ghostCellInnerHorizontal'
            cell.style.setProperty('--colsSelect', end - start + 1);
            cell.style.setProperty('--colsOffset', start % 9);
            cell.style.setProperty('--rowsSelect', 1);
            cell.style.setProperty('--rowsOffset', Math.floor(start / 9));
        }

        //cell.style.width = '10px';
        //cell.style.height = (10+3) * 3 + 'px'
    }

    animateFade() {
        return new Promise(resolve => {
            const cell = this.cellInner;
            const prop = this.isVertical ? 'height' : 'width';
            const animation = cell.animate([
                {
                    [prop]: '100%',
                    offset: 0
                },
                {
                    [prop]: '120%',
                    offset: 0.5
                },
                {
                    [prop]: '0%',
                    opacity: 1,
                    offset: 0.8
                },
                {
                    [prop]: '0%',
                    opacity: 0,
                    offset: 1
                },
            ], {
                duration: 400,
                iterations: 1,
            });
            animation.onfinish = () => {
                resolve();
                this.node.remove();
            }
            animation.play()
        })
    }

    fadeOut() {
        const fadeProcess = () => this.animateFade();
        this.onAnimate(fadeProcess);
        return fadeProcess;
    }
}

class CellView {
    constructor(parent, onAnimate) {
        const cell = document.createElement('div');
        cell.className = 'cellWrap';
        //cell.style.transform = 'scale(0)';
        this.onAnimate = onAnimate;
        parent.append(cell);

        const cellInner = document.createElement('div');
        cellInner.style.transform = 'scale(0)';
        this.onAnimate = onAnimate;
        this.cellInner = cellInner;
        cell.append(cellInner);

        this.node = cell;
        this.node.onclick = ()=>{
            this.onClick()
        };
    }

    update(value, isSelected, isAvailable, betweenH, betweenV) {
        const cell = this.cellInner;
        cell.textContent = value;
        if (isSelected) {
            cell.className = 'cell cell_selected';
        } else if (isAvailable) {
            cell.className = 'cell cell_hint';
        } else {
            cell.className = 'cell';
        }

        if (betweenV || betweenH) {
            cell.classList.add('cell_between');
        }

        if (betweenV) {
            cell.classList.add('cell_betweenV');
        }
        if (betweenH) {
            cell.classList.add('cell_betweenH');
        }
    }

    animateFade(){
        console.log('empty fade')
        return new Promise(resolve => {
            console.log('empty prom')
            const cell = this.cellInner;
            const animation = cell.animate([
                {
                    transform: 'scale(1)',
                    offset: 0
                },
                {
                    transform: 'scale(1.2)',
                    offset: 0.2
                },
                {
                    transform: 'scale(0)',
                    offset: 1
                },
            ], {
                duration: 400,
                iterations: 1,
            });
            animation.onfinish = () => {
                cell.style.transform = 'scale(0)';
                resolve();
            };
            animation.play()
        })
    }

    fadeOut(force = false) {
        const cell = this.cellInner;
        cell.className = 'cell';
        cell.textContent = '';
        const fadeProcess = () => new Promise(resolve => {
            this.animateFade().then(()=>this.node.remove());
            if (force){
                resolve()
            } else {
                setTimeout(() => {
                    resolve();
                }, 50);
            }
        });
        this.onAnimate(fadeProcess);
    }

    fadeIn() {
        const cell = this.cellInner;
        const fadeProcess = () => {
            return new Promise(resolve => {
                const animation = cell.animate([
                    {
                        transform: 'scale(0)',
                        offset: 0
                    },
                    {
                        transform: 'scale(1.2)',
                        offset: 0.5
                    },
                    {
                        transform: 'scale(1.0)',
                        offset: 1
                    },
                ], {
                    duration: 200,
                    iterations: 1,
                });
                animation.onfinish = () => {
                    cell.style.transform = 'scale(1)';
                    //resolve();
                }
                setTimeout(() => {
                    resolve();
                }, 25);
                animation.play()
            })
        }
        this.onAnimate(fadeProcess);
    }
}

class ScoreView {
    constructor(parent){
        this.value = 0;
        const scoreWrap = document.createElement('div');
        scoreWrap.className = 'scoreWrap';
        parent.append(scoreWrap);
        this.node = scoreWrap;
        
        const scoreCount = document.createElement('div');
        scoreCount.className = 'scoreCount';
        scoreCount.textContent = this.value;
        scoreWrap.append(scoreCount);
        this.scoreCount = scoreCount;

        const scoreTitle = document.createElement('div');
        scoreTitle.className = 'scoreTitle';
        scoreTitle.textContent = 'Score';
        scoreWrap.append(scoreTitle);
    }

    animateApply(){
        return new Promise(resolve => {
            const animation = this.scoreCount.animate([
                {
                    transform: `scale(1)`,
                    offset: 0
                },
                {
                    transform: `scale(0.8)`,
                    offset: 0.25
                },
                {
                    transform: `scale(1.2)`,
                    offset: 0.5
                },
                {
                    transform: `scale(1)`,
                    offset: 1
                },
            ], {
                duration: 300,
                iterations: 1,
            });
            animation.onfinish = () => {
                resolve();
            }
            animation.play()
        })
    }

    applyScore(value){
        this.value = value;
        this.scoreCount.textContent = this.value;
        this.animateApply();
    }
}

class ScoreGhost {
    constructor(parent){
        this.value = 0;
        const score = document.createElement('div');
        score.className = 'scoreGhost';
        parent.append(score);
        this.node = score;
    }

    fly(value, from, to){
        this.node.textContent = `+${value}`;
        const fromBounds = from.getBoundingClientRect();
        const toBounds = to.getBoundingClientRect();
        const parentBounds = this.node.parentElement.getBoundingClientRect();
        const fromPos = {
            x: fromBounds.x - parentBounds.x,
            y: fromBounds.y - parentBounds.y,
        }
        const toPos = {
            x: toBounds.x - parentBounds.x - 10,
            y: toBounds.y - parentBounds.y,
        }
        return new Promise(resolve => {
            const animation = this.node.animate([
                {
                    transform: `translate(${fromPos.x}px, ${fromPos.y}px)`,
                    offset: 0
                },
                {
                    transform: `translate(${(fromPos.x + toPos.x) /2 + Math.random() * 15}px, ${(fromPos.y + toPos.y) /2 + Math.random() * 15}px) scale(1)`,
                    offset: 0.4
                },
                {
                    transform: `translate(${toPos.x}px, ${toPos.y}px) scale(1.5)`,
                    opacity: 1,
                    offset: 0.8
                },
                {
                    transform: `translate(${toPos.x}px, ${toPos.y}px) scale(0.3)`,
                    opacity: 0,
                    offset: 1
                },
            ], {
                duration: 700,
                iterations: 1,
            });
            animation.onfinish = () => {
                //this.node.style.transform = 'scale(1)';
                this.node.remove();
                resolve();
            }
            animation.play()
        })
    }
}

class GamePopup {
    constructor(parent){
        const popup = document.createElement('div');
        popup.className = 'popup';
        parent.append(popup);
        this.node = popup;

        const status = document.createElement('div');
        status.className = 'popupStatus';
        popup.append(status);
        this.status = status;

        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'popupScore';
        popup.append(scoreContainer);

        const scoreLabel = document.createElement('div');
        scoreLabel.textContent = 'Score:'
        scoreLabel.className = 'popupScoreLabel';
        scoreContainer.append(scoreLabel);

        const scoreValue = document.createElement('div');
        scoreValue.className = 'popupScoreValue';
        scoreContainer.append(scoreValue);
        this.score = scoreValue;
    
        const buttons = document.createElement('div');
        buttons.className = 'popupButtons';
        popup.append(buttons);

        const buttonPlay = document.createElement('div');
        buttonPlay.className = 'popupButtonPlay';
        this.buttonPlay = buttonPlay;
        popup.append(buttonPlay);
        buttonPlay.onclick = ()=>{
            this.onPlayClick?.();
        }
    }

    hide(){
        this.node.remove();
    }

    show(){

    }
}

class WinPopup extends GamePopup{
    constructor(parent){
        super(parent);
        this.status.textContent = 'Win';
        this.buttonPlay.textContent = 'Play again'
    }
}

class FailPopup extends GamePopup{
    constructor(parent){
        super(parent);
        this.status.textContent = 'Fail';
        this.buttonPlay.textContent = 'Try again'
    }
}

const app = () =>{
    window.rt = ()=>gamenModel.restart();
    const animations = [];
    let resolving = false;
    const resolveAnimations = async ()=>{
        if (resolving || animations.length == 0){
            return;
        }
        //console.log('start resolving')
        while (animations[0]){
            const animation = animations.shift();
            await animation();
            //console.log('resolve', animations.length)
        }
        resolving = false;
        //console.log('stop resolving')
        return true;
    }
    const gamenModel = new GamenModel();
    gamenModel.onUpdate = ()=>{
        console.log(gamenModel);
        update()
    }

    const appWrapper = document.createElement('div');
    appWrapper.className = 'appWrapper';
    document.body.append(appWrapper);

    const centerContainer = document.createElement('div');
    centerContainer.className = 'centerContainer';
    appWrapper.append(centerContainer);

    const topButtons = document.createElement('div');
    topButtons.className = 'topButtons';
    centerContainer.append(topButtons);

    const addbutton = document.createElement('div');
    addbutton.className = 'addButton';
    addbutton.textContent = 'Add'
    topButtons.append(addbutton);
    addbutton.onclick = ()=>{
        gamenModel.addNums();
    }

    this.scoreView = new ScoreView(topButtons);

    const fieldScroll = document.createElement('div');
    fieldScroll.className = 'fieldScroll';
    centerContainer.append(fieldScroll);

    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'fieldWrapper';
    fieldScroll.append(fieldWrapper);

    let cells = [];

    /*const gc = new GhostCell(fieldWrapper);
    gc.setPositions(0, 5, 1, 1, false, 'left')
    const gc1 = new GhostCell(fieldWrapper);
    gc1.setPositions(2 + 9, 9 + 9 -1, 1, 1, false, 'right')*/
    const update = ()=>{

        if (gamenModel.lastMove){
            const moveScore = gamenModel.lastMove[4];
            if (((gamenModel.lastMove[0] % 9) != (gamenModel.lastMove[1] % 9)) && (Math.floor(gamenModel.lastMove[0] / 9) != Math.floor(gamenModel.lastMove[1] / 9))){
                const ghostLeft = new GhostCell(fieldWrapper);
                const start = Math.min(gamenModel.lastMove[0], gamenModel.lastMove[1])
                const end = Math.max(gamenModel.lastMove[0], gamenModel.lastMove[1])
                let startVal = gamenModel.lastMove[2];
                let endVal = gamenModel.lastMove[3];
                if (start != gamenModel.lastMove[0]){
                    startVal = gamenModel.lastMove[3];
                    endVal = gamenModel.lastMove[2];
                }
                console.log(Math.floor(start / 9) * 9, start)
                ghostLeft.setPositions(
                    (Math.floor(start / 9) + 1) * 9 - 1,
                    start,
                    startVal,
                    startVal,
                    false,
                    'right'
                );
                ghostLeft.onAnimate = animation=>{
                    animations.push(animation);
                    //animation();
                };
                ghostLeft.fadeOut();
                const ghostRight = new GhostCell(fieldWrapper);
                ghostRight.setPositions(
                    Math.floor(end / 9) * 9,
                    end,
                    endVal,
                    endVal,
                    false,
                    'left'
                );
                ghostRight.onAnimate = animation=>{
                    animations.push(animation);
                    //animation();
                };
                ghostRight.fadeOut();
                const scoreGhost = new ScoreGhost(appWrapper);
                scoreGhost.fly(moveScore, ghostRight.node, scoreView.scoreCount).then(()=>{
                    scoreView.applyScore(gamenModel.score)
                });
            } else {
                const ghost = new GhostCell(fieldWrapper);
                ghost.setPositions(
                    gamenModel.lastMove[0],
                    gamenModel.lastMove[1],
                    gamenModel.lastMove[2],
                    gamenModel.lastMove[3],
                    (gamenModel.lastMove[0] % 9) == (gamenModel.lastMove[1] % 9)
                );
                ghost.onAnimate = animation=>{
                    animations.push(animation);
                    //animation();
                };
                ghost.fadeOut();
                const scoreGhost = new ScoreGhost(appWrapper);
                scoreGhost.fly(moveScore, ghost.node, scoreView.scoreCount).then(()=>{
                    scoreView.applyScore(gamenModel.score)
                });
            }
        }
        const moves = gamenModel.findMoves();
        const avCells = [];
        moves.forEach(it=>it.forEach(jt=>avCells.push(jt)));

        gamenModel.removedLines?.forEach((line)=>{
            const lineAnimations = [];
            const prevCells = [...cells];
            for (let i=0; i< gamenModel.fieldLength; i++){
                prevCells[line*gamenModel.fieldLength + i].update('', false, false, false, false);
                const fadeAnimation = ()=>prevCells[line*gamenModel.fieldLength + i].animateFade().then(()=>{console.log('empty animated' + i)});
                cells[line*gamenModel.fieldLength + i] = undefined;
                const timer = ()=> new Promise(resolve=>{
                    setTimeout(()=>{
                        //console.log('empty timer ' + i)
                        resolve()
                    }, 50);
                })
                const animation = //()=>Promise.resolve().then(()=>{console.log('empty test', i, line)});
                (i == gamenModel.fieldLength - 1) ? fadeAnimation : ()=>Promise.race([fadeAnimation(), timer()])
                lineAnimations.push(animation);
            }
            
            console.log('empty handle')
            const resolveLine = async ()=>{
                console.log('empty resolve')
                for (const lineAnimation of lineAnimations){
                    await lineAnimation();
                }
                for (let i=0; i< gamenModel.fieldLength; i++) {
                    prevCells[line*gamenModel.fieldLength + i].node.remove();
                }
                console.log('empty resolve end')
            }
            animations.push(resolveLine);
        });

        cells = cells.filter(it=>it);

        const forRemove = [];
        cells.forEach((cell, cellIndex)=>{
            if (gamenModel.field.length<=cellIndex){
                forRemove.push(cellIndex)
            }
            //resolveAnimations();
        });
        console.log(forRemove);
        forRemove.reverse().forEach((cellIndex, countIndex)=>{
            cells[cellIndex].fadeOut(forRemove.length - countIndex>30);
            cells[cellIndex] = undefined;
        });

        cells = cells.filter(it=>it);

        const cellUpdate = (i)=>{
            const cell = cells[i];
            const betweenH = moves.find(it=>i> it[0] && i<it[1] && it[2] == 'h') != undefined
            const betweenV = moves.find(it=>i> it[0] && i<it[1] && it[2] && (it[0] % 9 == i % 9) && it[2]== 'v') != undefined;
            cell.update(gamenModel.field[i], i == gamenModel.selected, avCells.includes(i), betweenH, betweenV)
            cell.onClick = ()=>{
                gamenModel.select(i);
            }
        }
        
        gamenModel.field.forEach((it, i)=>{
            if (cells[i]){
                cellUpdate(i);
            } else {
                const cell = new CellView(fieldWrapper);
                cell.onAnimate = (animation)=>{
                    console.log('onAni')
                    animations.push(animation)
                }
                cell.onClick = ()=>{
                    gamenModel.select(i);
                }
                cells.push(cell);
                cellUpdate(i);
                cell.fadeIn();
            }
        });
        console.log('check fail popup')
        if (gamenModel.isFailed){
            console.log('fail popup')
            const failPopup = new FailPopup(appWrapper);
            failPopup.onPlayClick = ()=>{
                scoreView.applyScore(0);
                failPopup.hide();   
                gamenModel.restart();
            }
            failPopup.score.textContent = gamenModel.score;
            failPopup.show();
        }
        if (gamenModel.isWin){
            const winPopup = new WinPopup(appWrapper);
            winPopup.onPlayClick = ()=>{
                scoreView.applyScore(0);
                winPopup.hide()
                gamenModel.restart();
            }
            winPopup.score.textContent = gamenModel.score;
            winPopup.show();
        }
        resolveAnimations();
    }
    update();
}

app();