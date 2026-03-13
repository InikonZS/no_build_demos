const processFile=(selectedFile, onReady)=>{
    if (!selectedFile){
        return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
        console.log('loaded');
        onReady(reader.result);
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
    reader.readAsText(selectedFile);
}

const inp = document.createElement('input');
inp.type = 'file';
//inp.accept = "image/*";
document.body.append(inp);
inp.onchange = ()=>{
    processFile(inp.files[0], (text)=>{
        const obj = JSON.parse(text);
        const encoded = convert(obj);
        const dicted = compressDictionary(encoded);
        const packed = packBase(dicted);
        console.log(packed)
    })
}

const convert = (obj)=>{
    const structure = [];
    const strings = [];
    const numbers = [];

    const iterateObject = (obj, parentKey)=>{
        if (parentKey){
            strings.push(parentKey);
            structure.push('s');
        }
        if (obj && typeof obj == 'object' && !Array.isArray(obj)){
            structure.push('{')
            Object.keys(obj).forEach((childKey)=>{
                iterateObject(obj[childKey], childKey);
            })
            structure.push('}')
        }

        if (obj && Array.isArray(obj)){
            structure.push('[')
            obj.forEach((child)=>{
                iterateObject(child);
            });
            structure.push(']')
        }

        if (typeof obj == 'string'){
            structure.push('s');
            strings.push(obj);
        }
        
        if (typeof obj == 'number'){
            structure.push('d'),
            numbers.push(obj);
        }

        if (obj == null){
            structure.push('n')
        }
    }
    iterateObject(obj);
    return {
        structure,
        strings: strings.reverse(),
        numbers: numbers.reverse()
    }
}

const unconvert = (_encoded)=>{
    let result = null;
    let key = '';
    let currentParent = null;
    let parentStack = [];
    const encoded = {
        strings: [..._encoded.strings],
        numbers: [..._encoded.numbers],
        structure: [..._encoded.structure],
    }
    encoded.structure.forEach(it=>{
        if (it == '{'){
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                if (key){
                    const obj = {};
                    currentParent[key] = obj;
                    parentStack.push(obj);
                    currentParent = parentStack[parentStack.length - 1];
                    key = '';
                }
            } else

            if (currentParent && Array.isArray(currentParent)){
                const obj = {};
                currentParent.push(obj);
                parentStack.push(obj);
                currentParent = parentStack[parentStack.length - 1];
            } else

            if (!result){
                result = {};
                parentStack.push(result);
                currentParent = parentStack[parentStack.length - 1];
            }        
        }
        if (it == '}'){
            parentStack.pop();
            currentParent = parentStack[parentStack.length - 1];
        }
        if (it == '['){
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                if (key){
                    const obj = [];
                    currentParent[key] = obj;
                    parentStack.push(obj);
                    currentParent = parentStack[parentStack.length - 1];
                    key = '';
                }
            } else

            if (currentParent && Array.isArray(currentParent)){
                const obj = [];
                currentParent.push(obj);
                parentStack.push(obj);
                currentParent = parentStack[parentStack.length - 1];
            } else

            if (!result){
                result = [];
                parentStack.push(result);
                currentParent = parentStack[parentStack.length - 1];
            }    
        }
        if (it == ']'){
            parentStack.pop();
            currentParent = parentStack[parentStack.length - 1];
        }
        if (it == 's'){
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                if (!key){
                    key = encoded.strings.pop();
                } else {
                    currentParent[key] = encoded.strings.pop();
                    key = '';
                }
            }

            if (currentParent && Array.isArray(currentParent)){
                currentParent.push(encoded.strings.pop());
            }
        }
        if (it == 'd'){
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                    currentParent[key] = encoded.numbers.pop();
                    key = '';
                //}
            }
            if (currentParent && Array.isArray(currentParent)){
                currentParent.push(encoded.numbers.pop());
            }
        }
        if (it == 'n'){
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                    currentParent[key] = null;
                    key = '';
                //}
            }
            if (currentParent && Array.isArray(currentParent)){
                currentParent.push(null);
            }
        }
    })

    return result;
}

const compressDictionary = (encoded)=>{
    const dictionaryCountMap = {};
    encoded.strings.forEach(it=>{
        if (dictionaryCountMap[it] == undefined){
            dictionaryCountMap[it] = 0;
        }
        dictionaryCountMap[it]++;
    });
    const dictionaryIdMap = [];
    const dictionaryList = [];
    Object.entries(dictionaryCountMap).sort((a, b)=>b[1] - a[1]).map((it)=>{
        dictionaryIdMap[it[0]] = dictionaryList.length;
        dictionaryList.push(it[0]);
    });
    const compressedStrings = encoded.strings.map(it=>{
        return dictionaryIdMap[it];
    })

    console.log(dictionaryCountMap, dictionaryList, compressedStrings);

    return {
        dictionary: dictionaryList,
        strings: compressedStrings,
        numbers: encoded.numbers,
        structure: encoded.structure
    }
}

const decompressDictionary = (compressed)=>{
    const strings = compressed.strings.map(it=>{
        return compressed.dictionary[it]
    });
    return {
        strings,
        numbers: compressed.numbers,
        structure: compressed.structure
    }
}

const packBase = (compressed)=>{
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const structureBase64 = [];
    let chunk = 0;
    const structure = [...compressed.structure];
    if (structure.length % 2 == 1){
        structure.push('=')
    }
    compressed.structure.forEach((it, i)=>{
        chunk = chunk << 3 | {
            "{": 0b000,
            "}": 0b001,
            "[": 0b010,
            "]": 0b011,
            "s": 0b100,
            "d": 0b101,
            "n": 0b110,
            "=": 0b111
        }[it];
        if (i % 2){
            structureBase64.push(B64[chunk]); 
            chunk = 0;
        }
    })
    const result = {
        dictionary: compressed.dictionary.join(','),
        strings: uint16ToBase64(compressed.strings),
        numbers: float32ToBase64(compressed.numbers),
        structure: structureBase64.join('')
    }
    return result;
}

function float32FromBase64(str){
    const bytes = Uint8Array.fromBase64(str)

    return new Float32Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength / 4
    )
}

function float32ToBase64(_arr){
    const arr = new Float32Array(_arr);
    const bytes = new Uint8Array(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength
    )

    return bytes.toBase64()
}


function uint16FromBase64(str){
    const bytes = Uint8Array.fromBase64(str)

    return new Uint16Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength / 2
    )
}

function uint16ToBase64(_arr){
    const arr = new Uint16Array(_arr);
    const bytes = new Uint8Array(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength
    )

    return bytes.toBase64()
}

console.log(uint16FromBase64(uint16ToBase64([1,2,3,4,5])))

const unpackBase = (packed)=>{
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const structureBase64 = packed.structure.split('');

    const structure = [];
    const unChunk = [
            "{",
            "}",
            "[",
            "]",
            "s",
            "d",
            "n",
            "="
    ]
    structureBase64.forEach(it=>{
        const chunk = B64.indexOf(it);
        const a = chunk >> 3;
        const b = chunk & 0b000111;
        structure.push(unChunk[a], unChunk[b]);
    })
    if (structure[structure.length - 1] == '='){
        structure.pop();
    }
    const result = {
        dictionary: packed.dictionary.split(','),
        strings: [...uint16FromBase64(packed.strings)],
        numbers: [...float32FromBase64(packed.numbers)],
        structure: structure
    }
    return result;
}

const cv = convert({
    a: 1,
    bbbb: 'str',
    c: [ 2, 3, 4, 5, 'stra', 6],
    d: {
        e: 4,
        f: 6,
        bbbb: 345
    },
    nl: null
});

const compressed = compressDictionary(cv);
console.log(compressed)
const decompressed = decompressDictionary(compressed);
console.log(decompressed)
const packed = packBase(compressed);
console.log(packed)

const unpacked = unpackBase(packed);
console.log(unpacked)

console.log(unconvert(decompressDictionary(unpacked)))

console.log(unconvert( convert({
    a: 1,
    b: 'str',
    c: [ 2, 3, 4, 5, 'stra', 6],
    d: {
        e: 4,
        f: 6
    },
    nl: null
})))

