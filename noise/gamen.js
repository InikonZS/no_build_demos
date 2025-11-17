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
                        moves.push([lastIndex, i]);
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
                        moves.push([lastIndex, pos]);
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

const app = () =>{
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

    const cells = [];

    const update = ()=>{
        const moves = gamenModel.findMoves();
        const avCells = [];
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
        }
        moves.forEach(it=>it.forEach(jt=>avCells.push(jt)))
        gamenModel.field.forEach((it, i)=>{
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
                updateCell(i)
            }
        });
    }
    update();
}

app();