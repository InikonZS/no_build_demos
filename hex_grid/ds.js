const field = new Array(10).fill(null).map(it=> new Array(10).fill(-1));

//const sizes = [40, 10, 10, 10, 10, 10, 6, 4];
//const sizes = [8, 8, 4, 5, 5, 5, 5, 10, 10, 10, 10, 10, 6, 4];
const words = ['Qqqqqqqq', 'Wwwwwwww', 'Eeee', 'Rrrrr', 'Ttttt', 'Yyyyy', 'Uuuuu', 'Aaaaaaaaaa', 'Ssssssssss', 'Ffffffffff', 'Gggggggggg', 'Hhhhhhhhhh', 'Kkkkkk', 'Llll'];
const sizes = words.map(it=>it.length);
const places = [];

function place(size, pos, field, ind){
    const block = [];
    
    while (size > 0){
        size -= 1;
        if (block.length){
            const lastPoint = block[block.length-1];
            const steps = [
                {x: 0, y: 1},
                {x: 0, y: -1},
                {x: 1, y: 0},
                {x: -1, y: 0},
            ].filter(step=> block.findIndex(it=> (it.x == lastPoint.x+step.x) && (it.y == lastPoint.y+step.y) ) == -1)
            .filter(step=> field[lastPoint.y+step.y]?.[lastPoint.x+step.x] != undefined && field[lastPoint.y+step.y]?.[lastPoint.x+step.x] == -1)
            /*.filter(step =>{
                const fcheck = checkField(field, [...block, {y:lastPoint.y+step.y,  x: lastPoint.x+step.x}]);
                //console.log(fcheck);
                //console.log(JSON.stringify(field));
                //const res = fcheck.find(len=> len< 10);
                return (fcheck.length == 0 || fcheck.length ==1);
                //return 
            });*/
            if (steps.length == 0){
                return null;
            }
            const step = steps[Math.floor(Math.random() * steps.length)];
            const nextPoint = {
                x: lastPoint.x + step.x,
                y: lastPoint.y + step.y
            } 
            block.push(nextPoint);
        } else {
            const lastPoint = pos;
            block.push(lastPoint);
        }
        
        
    }

    return block;
}


function placeList(list, field){
    let np = 0;
    const blocks = [];
    list.forEach((lsize, i)=>{    
        const empty = [];
        field.forEach((it, i)=> it.forEach((jt, j)=>{
            if (jt == -1){
                empty.push({
                    x: j,
                    y: i
                })
            }
        }))

        let ok = false;
        for (let k = 0; k<3000; k++){
            const point = empty[Math.floor(Math.random() * empty.length)];
            const res = place(lsize, point, field, i);
            const fcheck = checkField(field, res);
            //console.log(fcheck);
            //console.log(JSON.stringify(field));

            // 9 14 7
            // 9 4 3 7 7

            //const min = fcheck.find(len=> len % 10 !=0);
            const min = (fcheck.length == 0 || fcheck.length ==1);
            //console.log(min);
            //return !res;
            if (!res || min){
            // console.log('np');
                
            }
            if (res && min){
                res.forEach(it=> field[it.y][it.x] = i);
                blocks.push(res);
                ok = true;
                console.log('ok');
                break;
            }
        }
        if (ok ==false){
           np+=1; 
        }
    });
    return {np, blocks};
}

for (let i=0; i<50; i++){
    const field = new Array(10).fill(null).map(it=> new Array(10).fill(-1));
    const {np, blocks} = placeList(sizes, field);
    //console.log(np);
    if (np==0){
        console.log(field.map(it=> it.map(jt=> jt == -1 ? '_' : jt.toString())));
        const wf = field.map(it=> it.map(jt=> null));
        blocks.forEach((word, index)=>{
            word.forEach((letter, li)=>{
                wf[letter.y][letter.x] = words[index][li]+li;
            })
        })
        console.log(wf);
        console.log(blocks);
        break;
    } else {
        //console.log(field.map(it=> it.map(jt=> jt == -1 ? '_' : jt.toString())));
        console.log('np')
    }
}

function check(field, point){
    let size = 0;
    const f = field.map(it=> it.map(jt=> {
        return jt == -1 ? Number.MAX_SAFE_INTEGER : -1;
    }));
    //console.log(f);
    let front = [point];
    const steps = [
        {x: 0, y: 1},
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: -1, y: 0},
    ];
    for (let i= 0; i<10000; i++){
        //console.log(front);
        const nextFront = [];
        front.forEach(it=>{
            if (f[it.y][it.x] > i){
                f[it.y][it.x] = i;
                size+=1;
                steps.map(jt=>({
                    x: jt.x + it.x,
                    y: jt.y + it.y
                })).filter(step=>{
                    return f[step.y]?.[step.x] != undefined && f[step.y]?.[step.x] > i;
                }).filter(step=>{
                    return nextFront.findIndex(it=> it.x == step.x && it.y == step.y) == -1;
                }).forEach(step=>{
                    nextFront.push(step);
                });
               // console.log(nextFront);
            }
        });
        if (!nextFront.length){
            break;
        } else {
            front = nextFront;
        }
    }
    return {size, field: f};
}

const f1 = [
   [ -1, -1, -1,],
   [ -1, 0, 0,],
    [0, 0, -1],
    [-1, 0, -1],
    [-1, 0, -1]
]

function checkField(_field, block){
    const field = _field.map(it=> it.map(jt=> jt));
    block && block.forEach(it=>{
        field[it.y][it.x] = 0;
    })
    const res = [];
    for (let i=0; i< 1000; i++){
        let foundX = -1;
        let foundY = field.findIndex(row=>{
            foundX = row.findIndex(cell=> cell == -1)
            return foundX != -1;
        });
        if (foundY!=-1){
            const r = check(field, {x: foundX, y:foundY});
            r.field.forEach((row, y)=>{
                row.forEach((cell, x)=>{
                    if (cell != Number.MAX_SAFE_INTEGER) {
                        field[y][x] = 0;
                    } else {
                        field[y][x] = -1;
                    }
                })
            })
            res.push(r.size);
        } else {
            return res;
        }
    }
}

function checkBlocks(num, items){
   // blocks.sort((a, b)=> b-a);
   // console.log(blocks);
    items.sort((a, b)=> a-b);
    console.log(items);
    //blocks.forEach(bl=>{
    const ni = [];
    items.forEach(it=>{
        if (num-it>=0){
            num -= it;
        } else {
            ni.push(it);
        }
    });
    return {num, ni}
    //});
}

//console.log(checkField(field));