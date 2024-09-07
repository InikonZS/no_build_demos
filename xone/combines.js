import {getAngle, isVerticalline, crossLine, lineCrossPoly, polyArea, insidePoly} from './utils.js';

export function combinePoly(a, b){
    const newLine = [];
    const newLine1 = [];
    let isCrossed = false;
    let startBi;
    let endBi;
    let startAi;
    let endAi;
    a.forEach((ait, ai)=>{
        const crosses = [];
        if (!isCrossed){
            if (!newLine.find(it=>it.x == ait.x && it.y == ait.y)){
            newLine.push(ait);
            }
        }
        
        b.forEach((bit, bi)=>{
            if (bi == b.length - 1){
                return;
            }
            /*if (isCrossed){
                newLine.push(bit);
            }*/
            const aLine = [ait, a[(ai+1) % a.length]];
            const bLine = [bit, b[(bi+1) % b.length]];
            const crossPoint = crossLine(aLine, bLine);
            if (crossPoint){
                //newLine.push({...crossPoint, cross: true});
                //isCrossed = !isCrossed;
                if (crosses.length == 0 || (crosses[0] && (crosses[0].point.x != crossPoint.x || crosses[0].point.y != crossPoint.y))){
                    crosses.push({point: crossPoint, ai, bi});
                }
                if (isCrossed){
                    endBi = bi;
                } else {
                    startBi = bi;
                }
            } else {
                //newLine.push(bit);
                //isCrossed = false;
            }
        });
        if (crosses.length == 2){
            startAi = ai;
            endAi = ai;
            const isVertical = isVerticalline([ait, crosses[0].point]);
            let close =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[1]: crosses[0];
            let far =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[0]: crosses[1];
            if (!isVertical){
                close = Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[1]: crosses[0];
                far =  Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[0]: crosses[1];
            }
            if (!newLine.find(it=>it.x == close.x && it.y == close.y)){
            newLine.push(close.point);
            }
            const sub = b.slice(Math.min(close.bi, far.bi), Math.max(close.bi, far.bi)+1);
            if (close.bi>far.bi){
                sub.reverse();
            }
            sub.forEach(sb=> {
                if (!newLine.find(it=>it.x == sb.x && it.y == sb.y)){
                newLine.push(sb)
                }
            });
            if (!newLine.find(it=>it.x == far.x && it.y == far.y)){
            newLine.push(far.point);
            }
        }
        if (crosses.length == 1){
            if (!isCrossed) {
                startAi = ai;
                if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                newLine.push(crosses[0].point);
                }
            }
            if (isCrossed){
                endAi = ai;
                //newLine.push(crosses[0].point);
                const sub = b.slice(Math.min(startBi, endBi), Math.max(startBi, endBi)+1);
                if (startBi>endBi){
                    sub.reverse();
                }
                sub.forEach(sb=> {
                    if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                        newLine.push(sb)
                    }
                });
                if (!newLine.find(it=>it.x == crosses[0].point.x && it.y == crosses[0].point.y)){
                newLine.push(crosses[0].point);
                }
            }
            isCrossed = !isCrossed;
        }

    });
    return newLine;
}

export function combinePoly2(a, b){
    const newLine = [];
    const aPoints1 = [];
    const aPoints2 = [];
    let isCrossed = false;
    let startBi;
    let endBi;
    let startAi;
    let endAi;
    a.forEach((ait, ai)=>{
        const crosses = [];
        if (!isCrossed){
            aPoints1.push(ait);
        } else {
            aPoints2.push(ait);
        }
        
        b.forEach((bit, bi)=>{
            if (bi == b.length - 1){
                return;
            }
            /*if (isCrossed){
                newLine.push(bit);
            }*/
            const aLine = [ait, a[(ai+1) % a.length]];
            const bLine = [bit, b[(bi+1) % b.length]];
            const crossPoint = crossLine(aLine, bLine);
            if (crossPoint){
                //newLine.push({...crossPoint, cross: true});
                //isCrossed = !isCrossed;
                if (crosses.length == 0 || (crosses[0] && (crosses[0].point.x != crossPoint.x || crosses[0].point.y != crossPoint.y))){
                    crosses.push({point: crossPoint, ai, bi});
                }
                if (isCrossed){
                    endBi = bi;
                } else {
                    startBi = bi;
                }
            } else {
                //newLine.push(bit);
                //isCrossed = false;
            }
        });
        if (crosses.length == 2){
            startAi = ai;
            endAi = ai;
            const isVertical = isVerticalline([ait, crosses[0].point]);
            let close =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[1]: crosses[0];
            let far =  Math.abs(crosses[0].point.y - ait.y) >  Math.abs(ait.y - crosses[1].point.y) ? crosses[0]: crosses[1];
            if (!isVertical){
                close = Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[1]: crosses[0];
                far =  Math.abs(crosses[0].point.x - ait.x) >  Math.abs(ait.x - crosses[1].point.x) ? crosses[0]: crosses[1];
            }
            newLine.push(close.point);
            const sub = b.slice(Math.min(close.bi, far.bi), Math.max(close.bi, far.bi)+1);
            if (close.bi>far.bi){
                sub.reverse();
            }
            sub.forEach(sb=> newLine.push(sb));
            newLine.push(far.point);
        }
        if (crosses.length == 1){
            if (!isCrossed) {
                startAi = ai;
                newLine.push(crosses[0].point);
            }
            if (isCrossed){
                endAi = ai;
                //newLine.push(crosses[0].point);
                const sub = b.slice(Math.min(startBi, endBi), Math.max(startBi, endBi)+1);
                if (startBi>endBi){
                    sub.reverse();
                }
                sub.forEach(sb=> newLine.push(sb));
                newLine.push(crosses[0].point);
            }
            isCrossed = !isCrossed;
        }

    });
    aPoints2.reverse();
    aPoints2.forEach(sb=> newLine.push(sb));
    return newLine;
}