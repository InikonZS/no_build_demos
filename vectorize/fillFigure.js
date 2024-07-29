export function checkFigure(cells, initialPoint){
    console.log(cells[initialPoint.y][initialPoint.x].value);
    if (cells[initialPoint.y][initialPoint.x].value !== "1"){
      return [];
    }
    const waveField = cells.map(it=>{
      return it.map(jt=>{
        return {value: jt.value, generation:jt.isLocked ? -1 :Number.MAX_SAFE_INTEGER}
      })
    });

    const moves = [{x:0, y:1},{x:1, y:0}, {x:-1, y:0}, {x:0, y:-1},
      {x:1, y:1},{x:1, y:-1}, {x:-1, y:1}, {x:-1, y:-1}];

    const trace = (points, currentGen, figPoints) =>{
      let nextGen = [];
      points.forEach(point=>{
        moves.forEach(move=>{
          let moved = {x:point.x + move.x, y: point.y + move.y};
          if (moved.y>=0 && moved.x>=0 && moved.y<waveField.length && moved.x<waveField[0].length){
            let cell = waveField[moved.y][moved.x];
            if (cell && cell.generation > currentGen && cell.value == "1"){
              nextGen.push(moved); 
              cell.generation = currentGen;
              figPoints.push(cells[moved.y][moved.x]);
              //this.cells[moved.y][moved.x].animateOpen();
              //count+=1;
            } else {
              if (cell && cell.generation > currentGen && cell.value !="1"){
                cell.generation = currentGen;
                figPoints.push(cells[moved.y][moved.x]);
                //this.cells[moved.y][moved.x].animateOpen();
              }
            }
          }
        });
      });
      if (nextGen.length){
        return trace(nextGen, currentGen+1, figPoints);
      } else {
        return figPoints;
      }
    }
    
    return trace([initialPoint], 0, []);
  }