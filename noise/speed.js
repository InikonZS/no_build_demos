import { solveCutted } from "../xone/linear.js";

const measure = (f)=>{
    const start = performance.now();
    const result = f();
    const end = performance.now();
    console.log('calculated: ', result, 'time: ', end - start + 'ms');
    return result;
}

class Wfcore {
    closeMap = {
        0: [1, 0],
        1: [2, 1],
        2: [1, 2]
    };

    constructor(){

    }

    learn(image){
        
    };

    generate(){
        const result = new Array(128).fill(null).map(it=>new Array(128).fill(0).map(jt=>[0, 1, 2]));
        let min = 10;
        result.forEach(it=>it.forEach(jt=>{
            if (it.length < min){
                
            }
        }));
        return result;
    }
}

function distancePointToSegment(point, a, b) {
    const { x: px, y: py } = point;
    const { x: ax, y: ay } = a;
    const { x: bx, y: by } = b;

    const dx = bx - ax;
    const dy = by - ay;

    // Если отрезок вырожден в точку
    if (dx === 0 && dy === 0) {
        return Math.hypot(px - ax, py - ay);
    }

    // Проекция точки на линию в параметрическом виде
    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);

    // Ограничиваем t отрезком [0, 1]
    const clampedT = Math.max(0, Math.min(1, t));

    // Находим координаты ближайшей точки на отрезке
    const closestX = ax + clampedT * dx;
    const closestY = ay + clampedT * dy;

    // Вычисляем расстояние
    return Math.hypot(px - closestX, py - closestY);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i
      [arr[i], arr[j]] = [arr[j], arr[i]]; // обмен значениями
    }
    return arr;
  }

const greedy = (points)=>{
    
    const pdist = (a, b)=>{
        return Math.hypot(a.x - b.x, a.y -b.y);
    }

    let currentPoint = points[0];
    let iconnect = [];
    let pointMap = {0: true};
    let cpIndex = 0;
    points.forEach((it, i)=>{
        let min = Number.MAX_SAFE_INTEGER;
        let minIndex = -1;
        points.forEach((jt, j)=>{
            if (pointMap[j]){
                return;
            }
            if (pdist(currentPoint, jt)< min){
                min = pdist(currentPoint, jt);
                minIndex = j;
            }
        });
        if (minIndex == -1){
            return;
        }
        iconnect.push({index: cpIndex, next: minIndex});
        currentPoint = points[minIndex];
        pointMap[minIndex] = true;
        cpIndex = minIndex;
    });
    iconnect.push({index: iconnect[iconnect.length -1].next, next: 0});
    return iconnect;
}

const app = ()=>{
    const _points = new Array(300).fill(null).map(it=> ({x: Math.random()* 800, y: Math.random()* 600}));
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 20;
    let minLen = Number.MAX_SAFE_INTEGER;
    let maxLen = Number.MIN_SAFE_INTEGER;
    let average = 0;
    (async ()=>{
        const _indexes = new Array(_points.length).fill(0).map((it, i)=>i);
        for (let v = 0; v<1; v++){
            const indexes = shuffleArray(_indexes);//_indexes.sort(it=>(Math.sign(Math.random() - 0.5)));
            const iconnect = indexes.map((it, i)=>{
                const a1i = indexes[(i + 0) % indexes.length];
                const b1i = indexes[(i + 1) % indexes.length];
                return {
                    index: a1i,
                    next: b1i
                }
            });
            const points = shuffleArray(_points);
            const iconnectGreedy = greedy(points);
            console.log(iconnectGreedy);
            const len = await draw(ctx, points, iconnectGreedy);
            if (len< minLen){
                minLen = len;
            }
            if (average == 0){
                average = len;
            } else {
                average = (average + len)/2;
            }
            if (len> maxLen){
                maxLen = len;
            }
        }
        console.log('MIN:', minLen, 'MAX:', maxLen, 'AV: ', Math.floor(average));
    })();
}

const draw = (ctx, points, iconnect)=>{

    const swapIndexes = ()=>{
        return -1 != iconnect.findIndex((it, i)=>{
            return iconnect.findIndex((jt, j)=>{
                if (it.index != jt.index && it.next != jt.next && it.index != jt.next && it.next != jt.index){
                    //console.log('test ', a1i, b1i, a2i, b2i);
                    const res = solveCutted(points[it.index], points[it.next], points[jt.index], points[jt.next]);
                    //console.log(res, it, jt, iconnect);
                    if (res){
                      //  const mi = iconnect.find(ci=>ci.index == it.next);
                      //  const mj = iconnect.find(ci=>ci.index == jt.next);
                        const sp = {...jt};
                        const ep = {...it};
                        //let t = m1.index;
                        //m2.next = sp.index;
                        /*it.next = sp.index;
                        jt.next = ep.next;
                        mi.next = sp.next;*/

                        /*it.next = sp.index;
                        jt.next = mi.index;
                        mi.next = sp.next*/

                        //it.next = sp.index;
                        //mi.next = mj.index;
                        //console.log(JSON.parse(JSON.stringify(iconnect)));
                        let si = ep;
                        const invlist = [];
                        const invMap = {};
                        for (let c=0; c<3000; c++){
                            if (si.index == sp.next){break}
                            let tsi = iconnect.find(ci=>ci.next == si.index);
                            //tsi.next = si.index;
                            //si.index = tsi.next;
                            si = tsi;
                            invlist.push(si);
                            invMap[si.index] = si;
                            //console.log('t ',c , si);
                        }
                        //console.log(invlist);
                        //const fsw = iconnect.filter(it=>invlist.find(pt=>it.index == pt.index ) == undefined
                        const fsw = iconnect.filter(it=>invMap[it.index] == undefined
                        && (!(it.index == ep.index && it.next == ep.next)) 
                        && (!(it.index == sp.index && it.next == sp.next)));
                        //console.log(JSON.parse(JSON.stringify({fsw, sp, ep})));
                        let t = it.next;
                        it.next = jt.index;
                        jt.index = t;
                        fsw.forEach((it, i)=>{
                            /*if (i == fsw.length-1){
                                return
                            }
                            if (i == 0){
                                if ( it.next != fsw[fsw.length -1].index){
                                    let t = it.next;
                                    it.next = fsw[fsw.length -1].index;
                                    fsw[fsw.length -1].index = t;
                                } else {
                                    
                                    console.log('warn')
                                }
                                return
                            }*/

                            let t = it.next;
                            it.next = it.index;
                            it.index = t;
                        })
                        //let t = it.next;
                        //it.next = jt.next;
                        //jt.next = t;
                        //let t = indexes[a1i];
                        //indexes[a1i] = indexes[b2i];
                        //indexes[b2i] = t;
                        /*t = indexes[b2i];
                        indexes[b2i] = indexes[b1i];
                        indexes[b1i] = t;*/
                        //console.log('swap ', a1i, a2i, indexes);
                        updMap = true;
                        return true;
                    }
                }
            }) != -1;
        });
    }

    const pdist = (a, b)=>{
        return Math.hypot(a.x - b.x, a.y -b.y);
    }

    let updMap = true;
    let iconnectMap = {};
    const optIndexes = (temp = 0)=>{
        if (updMap){
        iconnectMap = {};
        iconnect.forEach(it=>{iconnectMap[it.next] = it});
        updMap = false;
        }
        return -1 != iconnect.findIndex((it, i)=>{
            return iconnect.findIndex((jt, j)=>{
                if (it.index != jt.index && it.next != jt.next && it.index != jt.next && it.next != jt.index){
                    const prev = iconnectMap[it.index];//iconnect.find(p=> p.next == it.index);
                    //if (distancePointToSegment(points[it.index], points[jt.index], points[jt.next])< distancePointToSegment(points[it.index], points[prev.index], points[it.next])){
                    if (pdist(points[prev.index], points[it.index]) + pdist(points[it.index], points[it.next]) - pdist(points[prev.index], points[it.next]) >
                    pdist(points[jt.index], points[it.index]) + pdist(points[jt.next], points[it.index]) - pdist(points[jt.index], points[jt.next]) - temp
                ){
                    //if (it.next == jt.next || it.next == prev.next || jt.next == prev.next){
                      //  return;
                    //}
                        /*iconnectMap[it.next] = null;
                        iconnectMap[jt.next] = null;
                        iconnectMap[prev.next] = null*/
                        prev.next = it.next;
                        let t = jt.next;
                        jt.next = it.index;
                        it.next = t;
                        
                        iconnectMap[it.next] = it;
                        iconnectMap[jt.next] = jt;
                        iconnectMap[prev.next] = prev;
                        //console.log(JSON.parse(JSON.stringify(iconnectMap)), it.next, jt.next, prev.next, it.index)
                        //updMap = true;
                        return true;

                    }
                }
            }) != -1;
        })  
    }

    const optIndexes2 = (temp)=>{
        return -1 != iconnect.findIndex((it, i)=>{
            return iconnect.findIndex((jt, j)=>{
                if (it.index != jt.index 
                    && it.next != jt.next 
                    && it.index != jt.next 
                    && it.next != jt.index){
                    const prev = iconnect.find(p=> p.next == it.index);
                    const prev2 = iconnect.find(p=> p.next == prev.index);
                    if (!(prev.index != jt.index 
                        && prev.next != jt.next 
                        && prev.index != jt.next 
                        && prev.next != jt.index)){
                            return false;
                        }
                    //if (distancePointToSegment(points[it.index], points[jt.index], points[jt.next])< distancePointToSegment(points[it.index], points[prev.index], points[it.next])){
                    const currentDist = pdist(points[prev2.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[it.next])
                    - pdist(points[prev2.index], points[it.next]);

                    const v1Dist = pdist(points[jt.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    const v2Dist = pdist(points[jt.index], points[it.index]) 
                    + pdist(points[it.index], points[prev.index])
                    + pdist(points[prev.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    //console.log(v1Dist, v2Dist);
                    if ( currentDist > v1Dist || currentDist > v2Dist){
                        if (v1Dist < v2Dist){
                            prev2.next = it.next;
                            let t = jt.next;
                            jt.next = prev.index;
                            prev.next = it.index;
                            it.next = t;
                            //it.next = t;
                            updMap = true;
                            return true;
                        } else {
                            prev2.next = it.next;
                            let t = jt.next;
                            jt.next = it.index;

                            it.next = prev.index;
                            prev.next = t;
                            //it.next = t;
                            //it.next = t;
                            
                            updMap = true;
                            return true;
                        }
                    }
                }
            }) != -1;
        })  
    }

    const optIndexes3 = (temp)=>{
        return -1 != iconnect.findIndex((it, i)=>{
            return iconnect.findIndex((jt, j)=>{
                if (it.index != jt.index 
                    && it.next != jt.next 
                    && it.index != jt.next 
                    && it.next != jt.index){
                    const prev = iconnect.find(p=> p.next == it.index);
                    const prev2 = iconnect.find(p=> p.next == prev.index);
                    const prev3 = iconnect.find(p=> p.next == prev2.index);
                    if (!(prev.index != jt.index 
                        && prev.next != jt.next 
                        && prev.index != jt.next 
                        && prev.next != jt.index)){
                            return false;
                        }
                    if (!(prev2.index != jt.index 
                        && prev2.next != jt.next 
                        && prev2.index != jt.next 
                        && prev2.next != jt.index)){
                            return false;
                        }
                      /*  if (!(prev3.index != jt.index 
                            && prev3.next != jt.next 
                            && prev3.index != jt.next 
                            && prev3.next != jt.index)){
                                return false;
                            }*/
                    //if (distancePointToSegment(points[it.index], points[jt.index], points[jt.next])< distancePointToSegment(points[it.index], points[prev.index], points[it.next])){
                    const currentDist = pdist(points[prev3.index], points[prev2.index]) 
                    + pdist(points[prev2.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[it.next])
                    - pdist(points[prev3.index], points[it.next]);

                    const v1Dist = pdist(points[jt.index], points[prev2.index]) 
                    + pdist(points[prev2.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    const v2Dist = pdist(points[jt.index], points[it.index]) 
                    + pdist(points[it.index], points[prev.index])
                    + pdist(points[prev.index], points[prev2.index])
                    + pdist(points[prev2.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    //console.log(currentDist, v1Dist, v2Dist);
                    if ( currentDist > v1Dist /*- Math.random() * 500*/ || currentDist > v2Dist /*- Math.random() * 500*/){
                        if (v1Dist < v2Dist){
                            prev3.next = it.next;
                            let t = jt.next;
                            jt.next = prev2.index;
                            prev2.next = prev.index;
                            prev.next = it.index;
                            it.next = t;
                            //it.next = t;
                            updMap = true;
                            return true;
                            console.log('v1')
                        } else {
                            prev3.next = it.next;
                            let t = jt.next;
                            jt.next = it.index;

                            it.next = prev.index;
                            prev.next = prev2.index;
                            prev2.next = t;
                            //it.next = t;
                            //it.next = t;
                            
                            updMap = true;
                            return true;
                        }
                    }
                }
            }) != -1;
        })  
    }

    const optIndexes4 = ()=>{
        return -1 != iconnect.findIndex((it, i)=>{
            return iconnect.findIndex((jt, j)=>{
                if (it.index != jt.index 
                    && it.next != jt.next 
                    && it.index != jt.next 
                    && it.next != jt.index){
                    const prev = iconnect.find(p=> p.next == it.index);
                    const prev2 = iconnect.find(p=> p.next == prev.index);
                    const prev3 = iconnect.find(p=> p.next == prev2.index);
                    const prev4 = iconnect.find(p=> p.next == prev3.index);
                    if (!(prev.index != jt.index 
                        && prev.next != jt.next 
                        && prev.index != jt.next 
                        && prev.next != jt.index)){
                            return false;
                        }
                    if (!(prev2.index != jt.index 
                        && prev2.next != jt.next 
                        && prev2.index != jt.next 
                        && prev2.next != jt.index)){
                            return false;
                        }
                        if (!(prev3.index != jt.index 
                            && prev3.next != jt.next 
                            && prev3.index != jt.next 
                            && prev3.next != jt.index)){
                                return false;
                            }
                    //if (distancePointToSegment(points[it.index], points[jt.index], points[jt.next])< distancePointToSegment(points[it.index], points[prev.index], points[it.next])){
                    const currentDist = pdist(points[prev4.index], points[prev3.index])
                    + pdist(points[prev3.index], points[prev2.index]) 
                    + pdist(points[prev2.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[it.next])
                    - pdist(points[prev4.index], points[it.next]);

                    const v1Dist = pdist(points[jt.index], points[prev3.index]) 
                    + pdist(points[prev3.index], points[prev2.index]) 
                    + pdist(points[prev2.index], points[prev.index]) 
                    + pdist(points[prev.index], points[it.index])
                    + pdist(points[it.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    const v2Dist = pdist(points[jt.index], points[it.index]) 
                    + pdist(points[it.index], points[prev.index])
                    + pdist(points[prev.index], points[prev2.index])
                    + pdist(points[prev2.index], points[prev3.index])
                    + pdist(points[prev3.index], points[jt.next])
                    - pdist(points[jt.index], points[jt.next]);

                    //console.log(currentDist, v1Dist, v2Dist);
                    if ( currentDist > v1Dist || currentDist > v2Dist){
                        if (v1Dist < v2Dist){
                            prev4.next = it.next;
                            let t = jt.next;
                            jt.next = prev3.index;
                            prev3.next = prev2.index;
                            prev2.next = prev.index;
                            prev.next = it.index;
                            it.next = t;
                            //it.next = t;
                            updMap = true;
                            return true;
                            console.log('v1')
                        } else {
                            prev4.next = it.next;
                            let t = jt.next;
                            jt.next = it.index;

                            it.next = prev.index;
                            prev.next = prev2.index;
                            prev2.next = prev3.index;
                            prev3.next = t;
                            //it.next = t;
                            //it.next = t;
                            
                            updMap = true;
                            return true;
                        }
                    }
                }
            }) != -1;
        })  
    }


    const render = ()=>{
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        iconnect.forEach((it, i)=>{
            ctx.beginPath();
            ctx.strokeStyle = '#00f';
            ctx.moveTo(points[it.index].x, points[it.index].y);
            ctx.strokeStyle = '#00f';
            ctx.lineTo(points[it.next].x, points[it.next].y);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.fillText(it.index, points[it.index].x, points[it.index].y);
        });
        points.forEach(it=>{
            ctx.fillStyle = '#f00';
            ctx.font = "16px";
            ctx.fillRect(it.x, it.y, 4,4);  
        });
    }

    const asc = async()=>{
        console.log('uncross');
        for (let k=0; k<3300; k++){
            const r = await new Promise (res=>setTimeout(()=>{
                    const found = swapIndexes();
                    render();
                    res(found);
                }, 10)
            );
            if (!r){
                console.log('iterations: ', k);
                break;
            }
        }
        console.log('optimize');
        for (let k=0; k<1300; k++){
            const nstop = await new Promise (res=>setTimeout(()=>{
                const optFound = optIndexes(/*Math.max((100 - k) / 10, 0)*/0);
                /*const optFound2 = optIndexes2();
                if(optFound2){
                    console.log('o2');
                }*/
                const found = swapIndexes();
                render();
                res(optFound || found );
            }, 10));
            if (!nstop){
                break;
            }
        }
        console.log('stopped');
        {let len = 0;
        iconnect.forEach(ind=>{
            len+=pdist(points[ind.index], points[ind.next]);
        });
        console.log('len', len);}

        for (let k=0; k<1300; k++){
            const nstop = await new Promise (res=>setTimeout(()=>{
                const optFound = optIndexes();
                const optFound2 = optIndexes2();
                if(optFound2){
                    console.log('o2');
                }
                const found = swapIndexes();
                render();
                res(optFound || found || optFound2);
            }, 10));
            if (!nstop){
                break;
            }
        }

        {let len = 0;
            iconnect.forEach(ind=>{
                len+=pdist(points[ind.index], points[ind.next]);
            });
            console.log('len', len);}

        for (let k=0; k<1300; k++){
            const nstop = await new Promise (res=>setTimeout(()=>{
                const optFound = optIndexes();
                const optFound2 = optIndexes2();
                if(optFound2){
                    console.log('o2');
                }
                let optFound3 = false;
                if (!optFound2){
                    optFound3 = optIndexes3();
                    if(optFound3){
                        console.log('o3');
                    }
                }
                let optFound4 = false;
                if (!optFound3){
                    optFound4 = optIndexes4();
                    if(optFound4){
                        console.log('o4');
                    }
                }
                const found = swapIndexes();
                render();
                res(optFound || found || optFound2 || optFound3 || optFound4);
            }, 10));
            if (!nstop){
                break;
            }
        }
        {let len = 0;
            iconnect.forEach(ind=>{
                len+=pdist(points[ind.index], points[ind.next]);
            });
            console.log('len', len);
            return len;
        }
        
    }
    return asc();
}

app();