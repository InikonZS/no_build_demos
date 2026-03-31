const app = ()=>{
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = ".ttf,.otf";
    document.body.append(inp);
    inp.onchange = async (e)=>{
        const file = e.target.files[0];
        if (!file) return;

        const buffer = await file.arrayBuffer();
        const fontName = 'UserFont_' + Date.now();
        const font = new FontFace(fontName, buffer);

        await font.load();
        document.fonts.add(font);

        // ждём, пока реально станет доступен
        await document.fonts.ready;
        console.log('Font loaded:', fontName);

        //drawTest(fontName);
        drawAtlas(fontName);
        //useFont(fontName);
    }

    const viewContainer = document.createElement('div');
    viewContainer.style.border = `1px solid #000`;
    document.body.append(viewContainer);
    const canvas = document.createElement('canvas');
    canvas.width = 1856;
    canvas.height = 656;
    viewContainer.append(canvas);
    const ctx = canvas.getContext('2d');

    const drawGlyph = (fontName, char, atlasOffsetX = 0, atlasOffsetY = 0)=>{
        const size = 50;
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        // стиль
        ctx.font = `${size}px ${fontName}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        // тень / glow
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 8;

        // заливка
        const grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#aaa');
        ctx.fillStyle = grad;

        // обводка
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';

        const metric = ctx.measureText(char);
        const baseline = metric.fontBoundingBoxAscent;
        const effectPadding = ctx.lineWidth / 2 + ctx.shadowBlur + Math.max( Math.abs(ctx.shadowOffsetX), Math.abs(ctx.shadowOffsetY));
        
        // Метрики символа
        const left   = metric.actualBoundingBoxLeft;
        const right  = metric.actualBoundingBoxRight;
        const top    = metric.fontBoundingBoxAscent;
        const bottom = metric.fontBoundingBoxDescent;
        const width  = metric.width;
        const height = top + bottom;

        // Позиция glyph в atlas (левый верхний угол)
        const xAtlas = left + effectPadding; // сдвиг в + для BMFont
        const yAtlas = atlasOffsetY; // например, пока просто на одну линию, Y можно потом инкрементировать для строки

        // BMFont офсеты
        const xoffset = left + effectPadding;
        const yoffset = baseline - top + effectPadding;
        const xadvance = width; // плюс padding можно добавить, если нужно

        // Формируем объект glyph
        const glyph = {
        id: char.charCodeAt(0),   // код символа
        x: /*xAtlas +*/ atlasOffsetX, // координата в atlas
        y: yAtlas,
        width: right + left + effectPadding * 2,
        height: height + effectPadding*2, // учитываем паддинг по высоте
        xoffset: xoffset,
        yoffset: yoffset,
        xadvance: xadvance,
        baseline: baseline,
        };

        // Для визуальной проверки на canvas

        ctx.strokeText(char, xAtlas, baseline);
        ctx.fillText(char, xAtlas, baseline);

        const debug = true;
        if (debug){
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#f00';
            ctx.strokeRect(0, baseline - top, right + left + effectPadding * 2, height + effectPadding*2);

            ctx.lineWidth = 1;
            ctx.strokeStyle = '#00f';
            ctx.strokeRect(xoffset, baseline - top, width, height + effectPadding*2);
        }
        const canvasData = ctx.getImageData(0, baseline - top, right + left + effectPadding * 2, height + effectPadding*2);
        canvas.width = right + left + effectPadding * 2;
        canvas.height = height + effectPadding*2 - (baseline - top);
        ctx.putImageData(canvasData,0,0);
        return {
            glyph,
            canvas
        }
    }

    const drawAtlas = (fontName)=>{
        let atlasOffsetX = 0;
        let atlasOffsetY = 0;
        const alphabet = 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +  // верхний регистр
        'abcdefghijklmnopqrstuvwxyz' +  // нижний регистр
        '0123456789' +                  // цифры
        '.,:;!?@#$%&*+-=/\\()[]{}<>~^_' + // базовые символы и знаки
        '"\'`|';                        // кавычки, апостроф, вертикальная черта
        let atlasWidth = 0;
        let atlasHeight = 0;
        let atlasMaxOffset = 800;
        const glyphs = alphabet.split('').map(it=>{
            const glyphResult = drawGlyph(fontName, it, atlasOffsetX, atlasOffsetY);
            //ctx.drawImage(glyphResult.canvas, atlasOffsetX, glyphResult.glyph.y);
            atlasOffsetX += glyphResult.glyph.width;
            atlasWidth = Math.max(atlasOffsetX, atlasWidth)
            atlasHeight = atlasOffsetY+ glyphResult.glyph.height;
            if (atlasOffsetX > atlasMaxOffset){
                atlasOffsetY += glyphResult.glyph.height;
                atlasOffsetX = 0;
            }
            return glyphResult;
        });

        canvas.width = atlasWidth;
        canvas.height = atlasHeight;
        const bmFontData = {
            info: { /* имя шрифта, размер и т.д. */ },
            common: {
                lineHeight: glyphs[0].glyph.height, // можно взять как max(height всех glyph)
                base: glyphs[0].glyph.baseline,
                scaleW: canvas.width,
                scaleH: canvas.height,
            },
            pages: [ "atlas.png" ],
            glyphs: []
        };
        ctx.clearRect(0,0,canvas.width, canvas.height);
        glyphs.forEach(it=>{
            ctx.drawImage(it.canvas, it.glyph.x, it.glyph.y);
            const glyph = it.glyph;
            delete glyph.baseline;
            bmFontData.glyphs.push({
                ...it.glyph
            });
            //save atlas, save json
        });
        console.log(bmFontData);
    }
}

app();