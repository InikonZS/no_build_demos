const processFile=(selectedFile, onReady)=>{
    if (!selectedFile){
        return;
    }
    //console.log(selectedFile.name);
    const reader = new FileReader();
    reader.onload = ()=>{
        console.log('loaded');
        const img = new Image();
        img.onload= ()=>{
            onReady(img, selectedFile);
        };
        img.src = reader.result;   
    }
    reader.onloadstart = ()=>{
        console.log('loading');
    }
    reader.onerror = ()=>{
        console.log('error');
    }
    reader.onabort = ()=>{
        console.log('abort');
    }
    reader.readAsDataURL(selectedFile);
}

const processFiles = async(files, onFile)=>{
    for (const file of files){
        const fileImg = await new Promise((resolve)=>processFile(file, (img)=>{
            resolve(img)
        }));
        onFile(fileImg, file);
    }
    return true;
}

const app = ()=>{
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = "image/*";
    inp.multiple = true;
    document.body.append(inp);

    const canvas = document.createElement('canvas');
    canvas.width = 856;
    canvas.height = 656;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    inp.onchange = async (e)=>{
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const imgs = [];
        await processFiles(e.target.files, (img, file)=>{
            imgs.push({
                img,
                file
            })
            if (img.naturalWidth > ctx.canvas.width || img.naturalHeight > ctx.canvas.height){
                ctx.canvas.width = img.naturalWidth;
                ctx.canvas.height = img.naturalHeight;
                console.log(ctx.canvas.width, ctx.canvas.height)                
            }
            ctx.drawImage(img, 0, 0);
        })
        const data = ctx.getImageData(0,0,ctx.canvas.width, ctx.canvas.height);

        let min = data.width;
        let max = 0;
        let hmin = data.height;
        let hmax = 0;
        let hminbegin = false;
        for (let i = 0; i < data.height; i++) {
            let vminbegin = false;
            //let hmaxbegin = false;
            for (let j = 0; j < data.width; j++) {
                const colors = [];
                for (let k = 0; k<4; k++){
                    colors.push(data.data[i * data.width * 4 + j * 4 + k]);
                }
                if (colors[3] > 10){
                    if (min > j && vminbegin == false){
                        min = j;
                    }
                    if (max < j && vminbegin == true){
                        max = j;
                    }
                    vminbegin = true;
                }
            }
            console.log(vminbegin)
            if (vminbegin == true){
                if (hmin > i && hminbegin == false){
                    hmin = i;
                }
                if (hmax < i && hminbegin == true){
                    hmax = i;
                }
                hminbegin = true;
            }
        }
        console.log(min, max, hmin, hmax);
        ctx.beginPath();
        //ctx.rect(hmax, max, hmax - hmin, max - min);
        ctx.rect(max, hmax, -max + min, -hmax + hmin);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        for (const imgData of imgs){
            const canvas = document.createElement('canvas');
            const scaler = 3;
            canvas.width = (max - min) / scaler;
            canvas.height = (hmax - hmin) / scaler;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgData.img, min, hmin, max - min, hmax - hmin, 0, 0, canvas.width, canvas.height);
            //document.body.append(canvas);
            const url = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = url;
            link.download = imgData.file.name;
            await new Promise(res=> setTimeout(()=>res(), 1000));
            link.click()
        }
    }
}

app();