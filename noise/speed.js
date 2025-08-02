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

const app = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const size = 20;
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

app();