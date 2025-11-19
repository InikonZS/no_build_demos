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
        if (this.selected == null){
            this.selected = index;
        } else {
            if (!(this.selected == index) && (this.field[this.selected] == this.field[index] || this.field[this.selected] + this.field[index] == 10) && (this.checkVertical(this.selected, index) || this.checkHorizontal(this.selected, index))){
                this.field[this.selected] = '';
                this.field[index] = '';
                this.selected = null;
            } else {
                this.selected = null;
            }
        }
        this.field.splice(this.getLastEmpty());
        console.log(this.field, this.getLastEmpty());
        this.onUpdate?.();
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

class CellView{
    constructor(parent){
        const cell = document.createElement('div');
        parent.append(cell);
        this.node = cell;
    }

    update(value){
        const cell = this.node;
        cell.textContent = value;//gamenModel.field[i];
        if (gamenModel.selected == i){
            cell.className = 'cell cell_selected';
        } else
        if (avCells.includes(i)){
            cell.className = 'cell cell_hint';
        } else {
            cell.className = 'cell';
        }
        const betweenH = moves.find(it=>i> it[0] && i<it[1] && it[2] == 'h') != undefined
        const betweenV = moves.find(it=>i> it[0] && i<it[1] && it[2] && (it[0] % 9 == i % 9) && it[2]== 'v') != undefined;
        if (betweenV || betweenH){
            cell.classList.add('cell_between');
        }
        if (betweenV){
            cell.classList.add('cell_betweenV');
        }
        if (betweenH){
            cell.classList.add('cell_betweenH');
        }
    }
}

const app = () =>{
    const animations = [];
    let resolving = false;
    const resolveAnimations = async ()=>{
        if (resolving){
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

    const update = ()=>{
        const moves = gamenModel.findMoves();
        const avCells = [];
        //const avIntervals = [];
        const updateCell = (i)=>{
            const cell = cells[i];
            cell.textContent = gamenModel.field[i];
            if (gamenModel.selected == i){
                cell.className = 'cell cell_selected';
            } else
            if (avCells.includes(i)){
                cell.className = 'cell cell_hint';
            } else {
                cell.className = 'cell';
            }
            const betweenH = moves.find(it=>i> it[0] && i<it[1] && it[2] == 'h') != undefined
            const betweenV = moves.find(it=>i> it[0] && i<it[1] && it[2] && (it[0] % 9 == i % 9) && it[2]== 'v') != undefined;
            if (betweenV || betweenH){
                cell.classList.add('cell_between');
            }
            if (betweenV){
                cell.classList.add('cell_betweenV');
            }
            if (betweenH){
                cell.classList.add('cell_betweenH');
            }
        }
        moves.forEach(it=>it.forEach(jt=>avCells.push(jt)))
        cells.forEach((cell, cellIndex)=>{
            if (gamenModel.field.length<=cellIndex){
                cells[cellIndex] = undefined;
                cell.textContent = '';
                cell.className = 'cell';
                animations.push(
                    ()=>{
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
                animation.onfinish = ()=>{
                    cell.remove();
                }
                setTimeout(()=>{
                    resolve();
                }, 50);
                animation.play()
            });
            }
            resolveAnimations();
        });
        cells = cells.filter(it=>it)
        /*const addOrUpdate = ()=>*/ gamenModel.field.forEach((it, i)=>{
            if (cells[i]){
                updateCell(i);
            } else {
                const cell = document.createElement('div');
                fieldWrapper.append(cell);
                cell.onclick = ()=>{
                    if (it){
                        gamenModel.select(i);
                    }
                }
                cells.push(cell);
                cell.style.transform = 'scale(0)';
                updateCell(i)
                animations.push(
                    ()=>{
                        return new Promise(resolve=>{
                            console.log('ani')
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
                            animation.onfinish = ()=>{
                                cell.style.transform = 'scale(1)';
                                //resolve();
                            }
                            setTimeout(()=>{
                                resolve();
                            }, 25);
                            animation.play()
                        })
                    }
                );
            }
        });
        resolveAnimations();
    }
    update();
}

app();