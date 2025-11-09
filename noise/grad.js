const app = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');

    const bitmap = [
        '-8----888-',
        '-8----8---',
        '-88-888-8-',
        '-8----8888',
        '-888888-8-',
        '-888888-8-',
        '8888888-8-',
        '---88-----',
        '888888888-',
        '-88888888-',
        '88--8-8-8-',
    ].map(it => it.split(''))

    const player = {
        x: 0,
        y: 6,
        direction: 0
    }

    const moves = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ]

    const leftHand = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
    ]

    const dirs = [
        -1,
        0,
        1,
        2
    ]

    const poly = [];

    const tryMove = () => {
        if (bitmap[player.y + moves[player.direction].y]?.[player.x + moves[player.direction].x] == '8') {
            player.x = player.x + moves[player.direction].x;
            player.y = player.y + moves[player.direction].y;
            draw();
            return true;
        }
        draw();
    }

    const step = () => {
        console.log('step', player.x + moves[player.direction].x, player.y + moves[player.direction].y)
        const initDir = player.direction;

        for (let rots = 0; rots < 4; rots++) {
            console.log(rots, player.direction)
            if ((player.direction == 1 && rots == 3) || (player.direction == 1 && rots == 2)) {
                const lastPos = { ...player }
                poly.push({ x: lastPos.x + 1, y: lastPos.y + 1 });
            } else {
                const lastPos = { ...player }
                if ((player.direction == 2 && rots == 1)) {
                // if (bitmap[player.y + leftHand[player.direction].y]?.[player.x + leftHand[player.direction].x] != '8' || initDir == 0) {
                   // poly.push({ x: lastPos.x + (leftHand[lastPos.direction].x <= 0 ? 0 : 1), y: lastPos.y + (leftHand[lastPos.direction].y <= 0 ? 0 : 1) });
                }
            }

            player.direction = (4 + initDir + dirs[rots]) % 4;

            console.log('post', player.direction, rots)
            {
                const lastPos = { ...player }
                 if (
                       (player.direction == 3 && rots == 0)
                    //|| (player.direction == 2 && rots == 0)
                    || (player.direction == 1 && rots == 1)
                    || (player.direction == 2 && rots == 1)
                    || (player.direction == 3 && rots == 1) 
                    || (player.direction == 1 && rots == 2)
                    || (player.direction == 2 && rots == 2)
                    || (player.direction == 0 && rots == 3)
                    || (player.direction == 1 && rots == 3)
                    || (player.direction == 2 && rots == 3)
                    || (player.direction == 3 && rots == 3) 
                ) {
                //if (bitmap[player.y + leftHand[player.direction].y]?.[player.x + leftHand[player.direction].x] != '8') {
                    const point = { x: lastPos.x + (leftHand[lastPos.direction].x <= 0 ? 0 : 1), y: lastPos.y + (leftHand[lastPos.direction].y <= 0 ? 0 : 1) };
                    if (poly.length == 0 || (poly[poly.length -1].x != point.x || poly[poly.length -1].y != point.y)){
                        poly.push(point);
                        console.log(poly)
                    } else {
                        console.log('ex', player.direction, rots)
                    }
                }
            }

            if (tryMove()) {
                draw()
                return;
            }
        }
    }

    const size = 20;
    const draw = () => {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        bitmap.forEach((row, y) => row.forEach((cell, x) => {
            ctx.fillStyle = cell == '8' ? '#ff0' : '#000';
            ctx.fillRect(x * size, y * size, size, size);
            ctx.strokeRect(x * size, y * size, size, size);
        }));

        ctx.fillStyle = '#090';
        ctx.strokeStyle = '#000';
        ctx.fillRect(player.x * size - 3 + size / 2, player.y * size - 3 + size / 2, 6, 6);

        ctx.fillStyle = '#098';
        ctx.strokeStyle = '#000';
        ctx.fillRect((player.x + leftHand[player.direction].x) * size - 2 + size / 2, (player.y + leftHand[player.direction].y) * size - 2 + size / 2, 4, 4);
        ctx.fillStyle = '#990';
        ctx.strokeStyle = '#000';
        ctx.fillRect((player.x + moves[player.direction].x) * size - 2 + size / 2, (player.y + moves[player.direction].y) * size - 2 + size / 2, 4, 4);

        ctx.beginPath();
        ctx.strokeStyle = '#f00';
        poly.forEach((it, i) => {
            if (i == 0) {
                ctx.moveTo(it.x * size, it.y * size)
            } else {
                ctx.lineTo(it.x * size, it.y * size)
            }
        })
        ctx.stroke();
        ctx.fillStyle = '#f90';
        poly.forEach((it, i) => {
            ctx.fillRect(it.x * size, it.y * size, 3, 3)
        })
    }

    ctx.canvas.onclick = () => {
        step();
    }

    draw();
}

app();