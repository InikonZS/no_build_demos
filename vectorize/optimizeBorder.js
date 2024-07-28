
function getLinePointDistance(a, b, c){
    const y0 = c.y;
    const x0 = c.x;
    const y1 = a.y;
    const x1 = a.x;
    const y2 = b.y;
    const x2 = b.x;
    const upper = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
    const lower = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return upper / lower;
}

export function optimizeByDistances(border){
    let optimized = border;
    for (let optIt = 0; optIt < 15; optIt++) {
        optimized = optimized.filter((vect, i, arr) => {
            const dist = getLinePointDistance(arr[i - 1 >= 0 ? i - 1 : arr.length - i - 1], arr[(i + 1) % arr.length], arr[i]);
            if (dist < (1 * 1.1 ** optIt) / 2) {
                return i % 2;
            }
            return true;
        })
    }
    return optimized;
}