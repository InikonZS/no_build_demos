import {getAngle, isVerticalline, crossLine, lineCrossPoly, polyArea, insidePoly} from './utils.js';
import { combinePoly, combinePoly2 } from './combines.js';

function init(){
    const canvas = document.querySelector('.canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const player = {x:100, y:145};
    let speed = {x:0, y:0};

    const enemy = {x:170, y:150};
    let enemySpeed = {x:5, y:5};

    const playerPath = [{...player}];
    const disPlayerPath = [];

    const polys = [[{x:40, y:170}, {x:40, y:80}, {x:170, y:80},  {x:170, y:170}]];
    const dispolys = [[{x:70, y:120}, {x:70, y:90}, {x:130, y:90},  {x:130, y:120}], [{x:140, y:120}, {x:140, y:90}, {x:160, y:90},  {x:160, y:120}]];

    const changeDir = ()=>{
        playerPath.push({...player});
        disPlayerPath.push({...player});
    }

    window.onkeydown=(e=>{
        console.log(e.code);
        if (e.code == 'KeyA' || e.code == 'ArrowLeft'){
            if (speed.x != 1){
                speed = {x:-1, y:0};
                changeDir();
            }
        }
        if (e.code == 'KeyW' || e.code == 'ArrowUp'){
            if (speed.y != 1){
                speed = {x:0, y:-1};
                changeDir();
            }
        }
        if (e.code == 'KeyS' || e.code == 'ArrowDown'){
            if (speed.y != -1){
                speed = {x:0, y:1};
                changeDir();
            }
        }
        if (e.code == 'KeyD' || e.code == 'ArrowRight'){
            if (speed.x != -1){
                speed = {x:1, y:0};
                changeDir();
            }
        }
    });

    let lastInPoly = false;
    let lastInDispoly = false;
    let lastInDispolyIndex = -1;
    let lastPointInPoly;
    const render = ()=>{
        requestAnimationFrame(()=>{
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const sc = 2;
            if (player.x+speed.x*sc >=0  && player.x+speed.x*sc <=canvas.width){
                player.x += speed.x*sc;
            }
            if (player.y+speed.y*sc >=0  && player.y+speed.y*sc <=canvas.height){
                player.y += speed.y *sc;
            }

            polys.forEach(poly=>{
                ctx.strokeStyle = '#f90';
                ctx.fillStyle = '#c63';
                ctx.beginPath();
                poly.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

            dispolys.forEach(poly=>{
                ctx.strokeStyle = '#f90';
                ctx.fillStyle = '#222';
                ctx.beginPath();
                poly.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

            let inPoly = insidePoly(polys[0], player);// && !insidePoly(dispolys[0], player, true);
             //!insidePoly(dispolys[0], player);
            let currentDispoly = dispolys.findIndex((poly) => insidePoly(poly, player));
            let indispoly = currentDispoly == -1;
            console.log('disp', currentDispoly)
            /*let inPoly =false;
            polys.forEach(poly=>{
                let sumAng = 0;
                poly.forEach((it, i)=>{
                    sumAng += getAngle(it, poly[((i+1)) %poly.length], player);
                });
                //console.log(sumAng);
                if (Math.abs(Math.abs(sumAng) - Math.PI * 2) < 0.0000001){
                    inPoly = true;
                }
            });*/
            if (lastInPoly == true && !inPoly){
                playerPath.splice(0, playerPath.length);
                const cross = lineCrossPoly(polys[0], [{ x: player.x - speed.x*sc, y:  player.y - speed.y*sc}, {...player}]);
                if (cross){
                playerPath.push(cross)
                }
                //playerPath.push({...player/*, x: player.x - speed.x/2, y:  player.y - speed.y/2*/});
            }
            if (lastInDispoly == true && !indispoly){
                disPlayerPath.splice(0, disPlayerPath.length);
                const cross = lineCrossPoly(dispolys[currentDispoly], [{ x: player.x - speed.x*sc, y:  player.y - speed.y*sc}, {...player}]);
                if (cross){
                    disPlayerPath.push(cross)
                }
                //playerPath.push({...player/*, x: player.x - speed.x/2, y:  player.y - speed.y/2*/});
            }

            if (!inPoly){
                ctx.strokeStyle = '#999';
                ctx.beginPath();
                playerPath.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.lineTo(player.x, player.y)
                ctx.stroke();
            } else {
                if (lastInPoly == false){
                    if (playerPath.length >=1){
                        //polys.push([...playerPath, {...player}]);
                        const initial = [...polys[0]];
                        const cross = lineCrossPoly(polys[0], [{ x: player.x - speed.x*sc, y:  player.y - speed.y*sc}, {...player}]);
                        cross && playerPath.push(cross)
                        const pol0 = combinePoly(polys[0], [...playerPath]);
                        const pol1 = combinePoly2(polys[0], [...playerPath]);
                        console.log( polyArea(pol0), polyArea(pol1))
                        polys[0] = polyArea(pol0)> polyArea(pol1)? pol0 : pol1;
                        console.log('s = ', polyArea(polys[0]));
                        const _notInPoly = initial.find(p => false == insidePoly(polys[0], p));
                        _notInPoly && console.log('shit')
                    }
                    playerPath.splice(0, playerPath.length);
                }
            }

            if (!indispoly){
                ctx.strokeStyle = '#9f9';
                ctx.beginPath();
                disPlayerPath.forEach((it, i)=>{
                    ctx[i==0?'moveTo':'lineTo'](it.x, it.y);
                });
                ctx.lineTo(player.x, player.y)
                ctx.stroke();
            } else {
                if (lastInDispoly == false){
                    if (disPlayerPath.length >=1){
                        //polys.push([...playerPath, {...player}]);
                        const currentDispoly = lastInDispolyIndex;
                        const initial = [...dispolys[currentDispoly]];
                        const cross = lineCrossPoly(dispolys[currentDispoly], [{ x: player.x - speed.x*sc, y:  player.y - speed.y*sc}, {...player}]);
                        cross && disPlayerPath.push(cross)
                        const pol0 = combinePoly(dispolys[currentDispoly], [...disPlayerPath]);
                        const pol1 = combinePoly2(dispolys[currentDispoly], [...disPlayerPath]);
                        console.log( polyArea(pol0), polyArea(pol1))
                        dispolys[currentDispoly] = polyArea(pol0)> polyArea(pol1)? pol0 : pol1; //> and < for  different sides cut, check balls
                        console.log('s = ', polyArea(dispolys[currentDispoly]));
                        const _notInPoly = initial.find(p => false == insidePoly(dispolys[currentDispoly], p));
                        _notInPoly && console.log('shit')
                    }
                    disPlayerPath.splice(0, disPlayerPath.length);
                }
            }

            lastInPoly = inPoly;
            lastInDispoly = indispoly;
            lastInDispolyIndex = currentDispoly;
            lastPointInPoly = {...player};

            ctx.fillStyle = '#f00';
            ctx.fillRect(player.x-2, player.y-2, 4, 4);
    
            ctx.fillStyle = '#ff0';
            ctx.fillRect(enemy.x-2, enemy.y-2, 4, 4);
           
            polys.forEach(poly=>{
                const inPolyX = insidePoly(poly, {x: enemy.x + enemySpeed.x * 2, y: enemy.y - enemySpeed.y * 2});
                const inPolyY = insidePoly(poly, {x: enemy.x - enemySpeed.x * 2, y: enemy.y + enemySpeed.y * 2});
                if (inPolyX){
                    enemySpeed.x = -enemySpeed.x;
                }
                if (inPolyY){
                    enemySpeed.y = -enemySpeed.y;
                }
            });
            
            enemy.x += enemySpeed.x / 2;
            enemy.y += enemySpeed.y / 2;
            if (enemy.x < 0 || enemy.x>canvas.width){
                enemySpeed.x = -enemySpeed.x;
            }
            if (enemy.y < 0 || enemy.y>canvas.height){
                enemySpeed.y = -enemySpeed.y;
            }
            render();
        })
    }
    render();
}

init();