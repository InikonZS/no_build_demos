const moves = [
    {x: 0, y: -1},
    {x: -1, y: 0},
    {x: 0, y: 1},
    {x: 1, y: -1},
    {x: 1, y: 0},
    {x: 1, y: 1},
]
/*const movesOdd = [
    {x: -1, y: -1},
    {x: -1, y: 0},
    {x: -1, y: 1},
    {x: 0, y: -1},
    {x: 1, y: 0},
    {x: 0, y: 1},
],*/
class Hexa{
    field;

    constructor(){
        this.field = new Array(10).fill(null).map(_=> new Array(10).fill(0));
    }

    getClosest(x, y){
        const signX = y % 2 == 0 ? -1 : 1;
        return moves.map(step => ({y: step.y+y, x: signX * step.x+x}));//this.field[step.y+y]?.[signX * step.x+x]).filter(it=>it);
    }
}

class Control{
    node;
    constructor(parent, tag='div', className='', content=''){
        this.node = document.createElement(tag);
        parent.appendChild(this.node);
        this.node.className = className;
        this.node.textContent = content;
    }
}

const hexa = new Hexa();
const views = [];
hexa.field.map((it, i)=>{
    const rowEl = new Control(document.body, 'div', 'row');
    //rowEl.node.style.setProperty(--rowIndex, i);
    const row = [];
    views.push(row);
    it.map((jt, j)=>{
        const cell = new Control(rowEl.node, 'div', 'hex', `${j}, ${i}`);
        row.push(cell);
        cell.node.onmouseenter = ()=>{
            const cells = hexa.getClosest(j, i);
            cells.forEach(it=>{
                views[it.y]?.[it.x]?.node.classList.add('over');
            })
        }
        cell.node.onmouseleave = ()=>{
            views.map(row=> row.map(it=>{
                it.node.classList.remove('over');
            }))
        }
    })
})