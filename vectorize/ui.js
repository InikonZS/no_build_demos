import { processFile } from './processFile.js';
import { findBorder } from './findBorder.js';
import { optimizeByDistances } from './optimizeBorder.js';
import { toSvgPath } from './toSvgPath.js';
import { checkFigure } from './fillFigure.js';

const svg = document.querySelector('.dest-svg');
const canvas = document.querySelector('.source-canvas');
const input = document.querySelector('.file-input');
const threshold = document.querySelector('.threshold-input');

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
            row.push(maxDiff < threshold.value ? '1' : '0');
        }
        arr.push(row);
    }
    return [arr, selectColor.map(it=>(it.toString(16).length == 1? '0' : '')+it.toString(16)).join('')];
}

export function initUI() {
    const ctx = canvas.getContext('2d');
    let img;
    input.onchange = () => {
        processFile(input.files[0], (image) => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            img = image;
            ctx.drawImage(image, 0, 0);
        });
    };
    threshold.onchange = ()=>{
        canvas.onclick();
    }
    let clickPoint;
    canvas.onclick = (e) => {
        console.log('1234');
        const bounds = canvas.getBoundingClientRect();
        const scale = {x: bounds.width / canvas.width, y: bounds.height / canvas.height};
        const clickPos = {x: Math.floor(e.offsetX / scale.x), y: Math.floor(e.offsetY / scale.y)};
        console.log(clickPos);
        ctx.drawImage(img, 0, 0);
            //const clickPoint = { x: e.offsetX, y: e.offsetY }; 
        //}
        clickPoint = e ?{ x: clickPos.x, y: clickPos.y } : clickPoint;
        if (!clickPoint){
            return;
        }
        //ctx.fillRect(clickPoint.x, clickPoint.y, 5, 5);
        const [bitmap, color] = toBitmap(ctx, clickPoint);
        const figPoints = checkFigure(bitmap.map((row, y)=>row.map((cell, x)=>({value: cell, isLocked: cell == '0', x, y}))), clickPoint);
        const clearBitmap = new Array(bitmap.length).fill(null).map(it=>new Array(bitmap[0].length).fill('0'));
        figPoints.forEach(it=> {
            clearBitmap[it.y][it.x] = '1';
            //ctx.fillRect(it.x, it.y, 1,1);
        });
        const clickVal = clearBitmap[clickPoint.y][clickPoint.x];
        let point; //= {...clickPoint};

        /*while (clearBitmap[clickPoint.y][point.x+1] == clickVal){
            point.x+=1;
        }*/
        clearBitmap.forEach((row, y) => {
            row.forEach((val, x) => {
                if (!point && val == '1') {
                    point = { x, y }
                }
            })
        });

        const border = findBorder(clearBitmap, point);
        console.log('border', border);
        const optimized = optimizeByDistances(border);
        svg.innerHTML += toSvgPath(optimized, color);
    }
}