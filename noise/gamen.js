class GamenModel {
    field;
    fieldLength;

    constructor(){
        const field = [];
        this.fieldLength = 9;
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

    select(index){
        console.log(this.selected, index)
        //let result;
        if (this.selected == null){
            this.selected = index;
            this.lastMove = undefined;
        } else {
            if (!(this.selected == index) && (this.field[this.selected] == this.field[index] || this.field[this.selected] + this.field[index] == 10) && (this.checkVertical(this.selected, index) || this.checkHorizontal(this.selected, index))){
                //const lastSelected = this.selected;
                this.lastMove = [index, this.selected, this.field[index], this.field[this.selected]];
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
        console.log(this.field, this.getLastEmpty());
        this.onUpdate?.();
        //return result;
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
        this.lastMove = undefined;
        this.selected = null;
        const lastEmpty = this.getLastEmpty();
        console.log(lastEmpty)
        const nums = this.getFieldNums();
        nums.forEach((it, i)=>{
            this.field[i+lastEmpty] = it;
        });
        this.onUpdate?.();
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

    fadeOut() {
        const cell = this.cellInner;
        const fadeProcess = () => new Promise(resolve => {
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
        });
        this.onAnimate(fadeProcess);
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

    fadeOut() {
        const cell = this.cellInner;
        cell.className = 'cell';
        cell.textContent = '';
        const fadeProcess = () => new Promise(resolve => {
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
                this.node.remove();
            }
            setTimeout(() => {
                resolve();
            }, 50);
            animation.play()
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

const app = () =>{
    const animations = [];
    let resolving = false;
    const resolveAnimations = async ()=>{
        if (resolving || animations.length == 0){
            return;
        }
        console.log('start resolving')
        while (animations[0]){
            const animation = animations.shift();
            await animation();
            console.log('resolve', animations.length)
        }
        resolving = false;
        console.log('stop resolving')
        return true;
    }
    const gamenModel = new GamenModel();
    gamenModel.onUpdate = ()=>{
        console.log(gamenModel);
        update()
    }
    const addbutton = document.createElement('div');
    addbutton.className = 'addbutton';
    addbutton.textContent = 'add'
    document.body.append(addbutton);
    addbutton.onclick = ()=>{
        gamenModel.addNums();
    }

    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'fieldWrapper';
    document.body.append(fieldWrapper);

    let cells = [];

    /*const gc = new GhostCell(fieldWrapper);
    gc.setPositions(0, 5, 1, 1, false, 'left')
    const gc1 = new GhostCell(fieldWrapper);
    gc1.setPositions(2 + 9, 9 + 9 -1, 1, 1, false, 'right')*/
    const update = ()=>{

        if (gamenModel.lastMove){
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
            }
        }
        const moves = gamenModel.findMoves();
        const avCells = [];
        moves.forEach(it=>it.forEach(jt=>avCells.push(jt)));

        const forRemove = [];
        cells.forEach((cell, cellIndex)=>{
            if (gamenModel.field.length<=cellIndex){
                forRemove.push(cellIndex)
            }
            //resolveAnimations();
        });
        console.log(forRemove);
        forRemove.reverse().forEach(cellIndex=>{
            cells[cellIndex].fadeOut();
            cells[cellIndex] = undefined;
        });

        cells = cells.filter(it=>it);

        const cellUpdate = (i)=>{
            const cell = cells[i];
            const betweenH = moves.find(it=>i> it[0] && i<it[1] && it[2] == 'h') != undefined
            const betweenV = moves.find(it=>i> it[0] && i<it[1] && it[2] && (it[0] % 9 == i % 9) && it[2]== 'v') != undefined;
            cell.update(gamenModel.field[i], i == gamenModel.selected, avCells.includes(i), betweenH, betweenV)
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
        resolveAnimations();
    }
    update();
}

app();