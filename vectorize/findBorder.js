const leftHand = [
    [
        { x: 0, y: -1 },
        { x: -1, y: -1 },
    ],
    [
        { x: -1, y: 0 },
        { x: -1, y: 1 }
    ],
    [
        { x: 1, y: 0 },
        { x: 1, y: -1 }
    ],
    [
        { x: 0, y: 1 },
        { x: 1, y: 1 }
    ],
];

const forward = [
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
];

const tryDirs = [
    [1, 2, 3],
    [3, 0, 2],    
    [0, 3, 1],
    [2, 1, 0]
]

function checkLeftHand(img, pos, direction){
    return leftHand[direction].find(it=>{
        return img[pos.y+it.y]?.[pos.x+it.x] != '1'
    })
}

/**
 * 
 * @param {Array<Array<string>>} img 
 * @param {{x: number, y: number}} startPoint
 * @returns {Array<{x: number, y: number}>}
 * @description Accept bitmap '1' and '0' signs, returns border as array of vector.
 */
export function findBorder(img, startPoint) {
    console.log(JSON.parse(JSON.stringify(img)));
    const res = JSON.parse(JSON.stringify(img));
    const resVect = [];
    //let startPoint;
    /*img.forEach((row, y)=>{
        row.forEach((val, x)=>{
            if (!startPoint && val == '1'){
                startPoint = {x, y}
            }
        })
    });*/

    let currentDirection = 0;
    let currentPos = startPoint;
    let firstTryDirection = currentDirection;
    let tries = 0;
    for (let k = 0; k < 10000; k++) {
        let isEnd = false;
        const availableDir = forward.findIndex((it, i) => {
            const currentForward = forward[currentDirection];
            let nextPos = { x: currentPos.x + currentForward.x, y: currentPos.y + currentForward.y };
            const leftHandPoint = checkLeftHand(img, nextPos, currentDirection);
            if (leftHandPoint && img[nextPos.y]?.[nextPos.x] == '1') {
                currentPos = nextPos;
                /*if (res[nextPos.y]?.[nextPos.x] == '2') {
                    isEnd = true;
                }
                if (res[nextPos.y]?.[nextPos.x] != undefined) {
                    res[nextPos.y][nextPos.x] = '2';
                    resVect.push({ x: nextPos.x, y: nextPos.y });
                }*/
                if (nextPos.x == startPoint.x && nextPos.y == startPoint.y && res[nextPos.y]?.[nextPos.x] == '2' && res[nextPos.y+leftHandPoint.y]?.[nextPos.x+leftHandPoint.x] == '3') {
                    isEnd = true;
                }
                if (res[nextPos.y]?.[nextPos.x] != undefined) {
                    res[nextPos.y][nextPos.x] = '2';
                    if (res[nextPos.y+leftHandPoint.y]){
                    res[nextPos.y+leftHandPoint.y][nextPos.x+leftHandPoint.x] = '3';
                    }
                    resVect.push({ x: nextPos.x+leftHandPoint.x, y: nextPos.y+leftHandPoint.y });
                }
                tries = 0;
                firstTryDirection = currentDirection;
                return true;
            };
            
            currentDirection = tryDirs[firstTryDirection][tries]
            tries+=1;
            if (tries == 4){
                isEnd = true;
                console.log('cycled tried');
            }
            currentDirection = (currentDirection+4) % 4
        });
        if (isEnd) {
            break;
        }
    }
    console.log('test res' ,res);
    return resVect;
}

const tst = [
    '00000000000',
    '00100000000',
    '00111111110',
    '00111000000',
    '00111111110',
    '00111111100',
    '00000010000', 
    '00111111100',
    '01111111100',
    '01111111100',
    '00111111100',
    '00000000000',
].map(it=>it.split(''));

console.log('test bord', findBorder(tst, {x:2, y:2}));