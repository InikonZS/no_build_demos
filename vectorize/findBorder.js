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
    for (let k = 0; k < 10000; k++) {
        let isEnd = false;
        const availableDir = forward.findIndex((it, i) => {
            const currentForward = forward[currentDirection];
            let nextPos = { x: currentPos.x + currentForward.x, y: currentPos.y + currentForward.y };
            if (checkLeftHand(img, nextPos, currentDirection) && img[nextPos.y]?.[nextPos.x] == '1') {
                currentPos = nextPos;
                if (res[nextPos.y]?.[nextPos.x] == '2') {
                    isEnd = true;
                }
                if (res[nextPos.y]?.[nextPos.x] != undefined) {
                    res[nextPos.y][nextPos.x] = '2';
                    resVect.push({ x: nextPos.x, y: nextPos.y });
                }
                return true;
            };
            currentDirection += 1;
            currentDirection = currentDirection % 4;
        });
        if (isEnd) {
            break;
        }
    }
    return resVect;
}