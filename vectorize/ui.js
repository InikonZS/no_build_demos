import { processFile } from './processFile.js';
import { findBorder } from './findBorder.js';
import { optimizeByDistances } from './optimizeBorder.js';
import { toSvgPath } from './toSvgPath.js';

const svg = document.querySelector('.dest-svg');
const canvas = document.querySelector('.source-canvas');
const input = document.querySelector('.file-input');

function toBitmap(ctx, pos) {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const selectColor = []; 
    for (let k = 0; k<3; k++){
        selectColor.push(data.data[pos.y * data.width * 4 + pos.x * 4 + k]);
    }
    const arr = [];
    for (let i = 0; i < data.height; i++) {
        const row = [];
        for (let j = 0; j < data.width; j++) {
            const colors = [];
            for (let k = 0; k<3; k++){
                colors.push(data.data[i * data.width * 4 + j * 4 + k]);
            }
            const maxDiff = Math.max(...colors.map((cl, cli)=> Math.abs(cl  - selectColor[cli])))
            //row.push(data.data[i * data.width * 4 + j * 4] == 0 ? '1' : '0');
            row.push(maxDiff < 10 ? '1' : '0');
        }
        arr.push(row);
    }
    return [arr, selectColor.map(it=>(it.toString(16).length == 1? '0' : '')+it.toString(16)).join('')];
}

export function initUI() {
    const ctx = canvas.getContext('2d');
    input.onchange = () => {
        processFile(input.files[0], (image) => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
        });
    };
    canvas.onclick = (e) => {
        const clickPoint = { x: e.offsetX, y: e.offsetY }; 
        //ctx.fillRect(clickPoint.x, clickPoint.y, 5, 5);
        const [bitmap, color] = toBitmap(ctx, clickPoint);
        const clickVal = bitmap[clickPoint.y][clickPoint.x];
        let point = {...clickPoint};

        while (bitmap[clickPoint.y][point.x+1] == clickVal){
            point.x+=1;
        }
        /*bitmap.forEach((row, y) => {
            row.forEach((val, x) => {
                if (!point && val == '1') {
                    point = { x, y }
                }
            })
        });*/

        const border = findBorder(bitmap, point);
        const optimized = optimizeByDistances(border);
        svg.innerHTML += toSvgPath(optimized, color);
    }
}