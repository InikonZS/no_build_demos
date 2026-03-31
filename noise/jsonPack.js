const processFile=(selectedFile, onReady)=>{
    if (!selectedFile){
        return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
        console.log('loaded');
        window.tst = reader.result;
        //console.log(reader.result);
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
        const tunk = unconvert(encoded);
        console.log('TEST', text == JSON.stringify(tunk), text.length, JSON.stringify(tunk).length, obj, tunk, encoded);
        const dicted = compressDictionary(encoded);
        console.log(dicted)
        const packed = packBase(dicted);
        console.log('tes pack', packed)
        const unpacked = decompressDictionary(unpackBase(packed));//JSON.stringify(unconvert(decompressDictionary(unpackBase(packed))));
        console.log(unpacked, encoded)
    })
}

const convert = (obj)=>{
    const structure = [];
    const strings = [];
    const numbers = [];
    const debug = [];
    const debCount ={ar:0, ob:0, obc:0, arc:0, prim:0};

    const iterateObject = (obj, parentKey)=>{
        if (parentKey != undefined){
            if (typeof parentKey !='string'){
                console.log('tes', 'very bad')
            }
            strings.push(parentKey);
            debug.push(parentKey);
            //structure.push('s');
        }
        if (obj && typeof obj == 'object' && !Array.isArray(obj)){
            structure.push('{')
            debCount.obc++;
            Object.keys(obj).forEach((childKey)=>{
                debCount.ob++;
                //console.log(childKey);
                iterateObject(obj[childKey], childKey);
            })
            structure.push('}')
        }

        if (obj && Array.isArray(obj)){
            structure.push('[')
            debCount.arc++;
            obj.forEach((child)=>{
                debCount.ar++;
                iterateObject(child);
            });
            //structure.push(']')
            structure.push(']')
        }

        if (typeof obj == 'string'){
            debCount.prim++;
            structure.push('s');
            strings.push(obj);
        }
        
        if (typeof obj == 'number'){
            debCount.prim++;
            structure.push('d');
            numbers.push(obj);
        }

        if (obj === true){
            debCount.prim++;
            structure.push('t');
        }

        if (obj === false){
            debCount.prim++;
            structure.push('f');
        }

        if (obj == null){
            debCount.prim++;
            structure.push('n')
        }
    }
    iterateObject(obj);
    return {
        structure,
        strings: strings.reverse(),
        numbers: numbers.reverse(),
        debug,
        debCount
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
        debug: {s: 0, ss: 0, sss: 0, ar: 0, obc:0,arc:0,prim:0}
    }
    encoded.structure.forEach(it=>{
        const stepLenSum = encoded.strings.length + '_' + encoded.numbers.length;
        const lp = currentParent;

        if (it == '{'){
                encoded.debug.obc++;
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                encoded.debug.sss++;
                const key = encoded.strings.pop();
                    const obj = {};
                    currentParent[key] = obj;
                    parentStack.push(obj);
                    currentParent = parentStack[parentStack.length - 1];
                    //key = '';
                //}
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
        }else
        if (it == '}'){
            parentStack.pop();
            currentParent = parentStack[parentStack.length - 1];
        }else
        if (it == '['){
            encoded.debug.arc++;
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                encoded.debug.sss++;
                    const key = encoded.strings.pop();
                    const obj = [];
                    currentParent[key] = obj;
                    parentStack.push(obj);
                    currentParent = parentStack[parentStack.length - 1];
                    //key = '';
                //}
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
        }else
        if (it == ']'){
            parentStack.pop();
            currentParent = parentStack[parentStack.length - 1];
        }else
        if (it == 's'){
            encoded.debug.prim++;
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (!key){
                    //key = encoded.strings.pop();
                //} else {
                    encoded.debug.sss++;
                    const key = encoded.strings.pop();
                    currentParent[key] = encoded.strings.pop();
                    encoded.debug.s++;
                   // key = '';
                //}
            }

            if (currentParent && Array.isArray(currentParent)){
                currentParent.push(encoded.strings.pop());
                encoded.debug.s++;
            }
        }else
        if (it == 'd'){
            encoded.debug.prim++;
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                encoded.debug.sss++;
                const key = encoded.strings.pop();
                    currentParent[key] = encoded.numbers.pop();
                    if (currentParent[key] == undefined){
                        console.log('tes wrong')
                    }
                   // key = '';
                //}
            }
            if (currentParent && Array.isArray(currentParent)){
                currentParent.push(encoded.numbers.pop());
            }
        }else
        if (it == 'n' || it=='t' || it=='f'){
            encoded.debug.prim++;
            if (currentParent && typeof currentParent == 'object' && !Array.isArray(currentParent)){
                //if (key){
                encoded.debug.sss++;
                const key = encoded.strings.pop();
                    currentParent[key] = {'n':null,'t':true, 'f':false}[it];
                
                    //key = '';
                //}
            }
            if (currentParent && Array.isArray(currentParent)){
                currentParent.push({'n':null,'t':true, 'f':false}[it]);
            }
        }else {
            console.log('tes', 'sheeet')
        }
        const stepLenSumE = encoded.strings.length + '_' + encoded.numbers.length;
        if (stepLenSum == stepLenSumE && !['}',']'].includes(it) && lp && typeof lp == 'object' && !Array.isArray(lp) ){
            console.log('tes shit')
        } else {
            if (!['}',']'].includes(it) && lp && typeof lp == 'object' && !Array.isArray(lp)){
            encoded.debug.ss++;
            }else
            if (!['}',']'].includes(it) && lp && Array.isArray(lp)){
            encoded.debug.ar++;
            }else if(!['}',']'].includes(it)) {
                console.log('tes', 'wtf')
            }
        }
    })
    console.log('tes deb', encoded, parentStack);

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
    let k = 8;
    const result = {
        //dictionary: huffmanFinal(packPairIterated(JSON.stringify(compressed.dictionary).split(''), [22, 25, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10])),//compressed.dictionary.join(','),
        dictionary: compressed.dictionary.join(','),
        strings: huffmanFinal(/*JSON.stringify(compressed.strings)*/ findRepeatsRec(compressed.strings, 10).join(',').split('')),
        //10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10
        numbers: huffmanFinal(packPairIterated(findRepeatsRec(compressed.numbers, 10).join(',').split('')/*numCountMap(compressed.numbers, 2).toString().split('')*//*compressed.numbers.toString().split('')*/, [800, 125,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k,k])),
        structure: huffmanFinal(packPairIterated(compressed.structure, [22, 25, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]))
        //strings: uint16ToBase64(compressed.strings),
        //numbers: float32ToBase64(compressed.numbers),
        //structure: structureBase64.join('')
    }
    console.log('final',JSON.stringify(result).length);
    return result;//huffmanFinal(packPairIterated(JSON.stringify(result).split(''), [22, 25, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]));
}

const huffmanFinal = (arr, cnt=0)=>{
    const res = huffmanEncode(arr);
    return {
        correction: res.correction,
        hcodes: {
            codes: cnt >= 2 ? Object.keys(res.hcodes).join(',') : huffmanFinal(Object.keys(res.hcodes).join(',').split(''), cnt+1),
            value: cnt >= 2 ? JSON.stringify(Object.values(res.hcodes)) : huffmanFinal(packPairIterated(JSON.stringify(Object.values(res.hcodes)).split(''), [22, 25, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]), cnt+1),
        },//cnt >= 2 ?JSON.stringify(res.hcodes) : huffmanFinal(packPairIterated(JSON.stringify(res.hcodes).split(''), [22, 25, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]), cnt+1),
        result: res.result.join('')
    }
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
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const unpackBase = (packed)=>{
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const structureBase64 = (typeof packed.structure == 'string') ? packed.structure.split(''): huffmanDecodeRecursive(packed.structure).split('');

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
        strings: decodeRepeatsRec(huffmanDecodeRecursive(packed.strings).split(',')).map(it=>parseInt(it)),//[...uint16FromBase64(packed.strings)],
        numbers: decodeRepeatsRec(huffmanDecodeRecursive(packed.numbers).split(',')).map(it=>parseFloat(it)),//[...float32FromBase64(packed.numbers)],
        structure: structureBase64//structure
    }
    return result;
}

const packPair = (arr, limit = 1, iteration = 1)=>{
    const dictionaryCountMap = {};
    for (let i = 0; i< arr.length - 1; i++){
        if (arr[i].length < iteration && arr[i].length < iteration){
            continue;
        }
        const pair = arr[i] + arr[i+1];
        if (!dictionaryCountMap[pair]){
            dictionaryCountMap[pair] = {
                key: pair,
                count: 0,
                positions: []
            }
        }
        if (dictionaryCountMap[pair].positions[dictionaryCountMap[pair].positions.length-1] == i-1){
            //self affected
        } else {
            dictionaryCountMap[pair].count++;
            dictionaryCountMap[pair].positions.push(i);
        }
    }

    const dictionaryList = [];
    Object.entries(dictionaryCountMap).sort((a, b)=>b[1].count - a[1].count).forEach((it)=>{
        if (it[1].count <= limit){
            return;
        }
        dictionaryList.push(it[1]);
    });

    console.log(dictionaryList)

    const resultArr = [...arr];
    const affectedArr = arr.map(()=>false);
    dictionaryList.forEach(it=>{
        //dry
        let discount = 0;
        it.positions.forEach(jt=>{
            if (affectedArr[jt] || affectedArr[jt + 1]){
                discount++;
                return;
            }
        })
        //replace
        it.positions.forEach(jt=>{
            if ((it.count - discount)<=limit){
                return;
            }
            if (affectedArr[jt] || affectedArr[jt + 1]){
                return;
            }
            resultArr[jt] = it.key;
            resultArr[jt + 1] = undefined;
            affectedArr[jt] = true;
            affectedArr[jt + 1] = true;
            //resultArr.splice(jt, 2, it.key)
        });
    });
    return resultArr.filter(it=>it!=undefined);
}

const packPairIterated = (arr, limits=[1])=>{
    let result = arr;
    limits.forEach((limit, i)=>{
        result = packPair(result, limit, i+1)
    });
    return result;
}

const numCountMap = (arr, limit=1)=>{
    const dictionaryCountMap = {};
    arr.forEach(it=>{
        if (dictionaryCountMap[it] == undefined){
            dictionaryCountMap[it] = 0;
        }
        dictionaryCountMap[it]++;
    });

    const dictionaryIdMap = {};
    const dictionaryList = [];
    Object.entries(dictionaryCountMap).sort((a, b)=>b[1] - a[1]).forEach((it)=>{
        dictionaryIdMap[it[0]] = dictionaryList.length;
        dictionaryList.push({
            key: it[0],
            count: it[1]
        });
    });
    
    const fixedList = dictionaryList.filter(it=>dictionaryCountMap[it.key]>limit);
    const result = arr.map(it=>dictionaryCountMap[it] > limit ? dictionaryIdMap[it]: '_'+it);
    console.log(dictionaryList, result, [...result, ...fixedList.map(it=>Number.parseFloat(it.key))], fixedList)
    return [...result, ...fixedList.map(it=>Number.parseFloat(it.key))];
}

const huffman = (str)=>{
    const dictionaryCountMap = {};
    const buf = typeof str == 'string' ? str.split('') : str; 
    buf.forEach(it=>{
        if (dictionaryCountMap[it] == undefined){
            dictionaryCountMap[it] = 0;
        }
        dictionaryCountMap[it]++;
    });
    
    const hnodes = [];
    const hlinks = [];
    Object.entries(dictionaryCountMap).forEach(it=>{
        const hnode = {
            key: it[0],
            count: it[1],
            value: undefined,
            children: undefined,
            parent: undefined
        };
        hlinks.push(hnode);
        hnodes.push(hnode);
    })
    
    const groupHNode = (hnodes) => {
        if (hnodes.length < 2) return true;
        hnodes.sort((a, b)=>b.count - a.count);
        const min1 = hnodes.pop();
        min1.value = 1;
        const min2 = hnodes.pop();
        min2.value = 0;
        const hnode = {
            key: undefined,
            count: min1.count + min2.count,
            value: undefined,
            children: [
                min1,
                min2
            ]
        };
        min1.parent = hnode;
        min2.parent = hnode;
        hnodes.push(
            hnode
        )
    }

    for(i=0; i<10000; i++){
        if (groupHNode(hnodes)){
            break;
        }
    }

    const hcodes = {};
    hlinks.forEach(it=>{
        let current = it;
        const code = [];
        while(current){
            if (current.value != undefined){
                code.push(current.value);
            }
            current = current.parent;
        };
        hcodes[code.reverse().join('')] = it.key;

    });

    console.log(hnodes, hcodes);
    return hcodes
}

const huffmanEncode = (str)=>{
    const hcodes = huffman(str);
    const result = [];
    const enccodes = {};
    Object.keys(hcodes).forEach(it=>{
        enccodes[hcodes[it]]=it;
    })
    const bitbuf = [];
    const buf = typeof str == 'string' ? str.split('') : str; 
    buf.forEach(it=>{
        bitbuf.push(...enccodes[it].split(''));
    });

    for (let i = 0; i < Math.floor(bitbuf.length / 6) * 6; i+=6){
        const val = Number.parseInt(bitbuf.slice(i, i+6).join(''), 2);
        result.push(B64[val]);
    }

    const lastSym = bitbuf.slice(Math.floor(bitbuf.length / 6) * 6, bitbuf.length);
    let correction = 0;
    if (lastSym.length){
        while(lastSym.length<6){
            lastSym.push(0);
            correction += 1;
        }
        result.push(B64[Number.parseInt(lastSym.join(''), 2)]);
    }
    const tableLen = JSON.stringify(hcodes).length;
    const huffLen = result.join('').length;
    const total = tableLen + huffLen;
    const source = buf.join('').length;
    const compressed = (total / source * 100).toFixed(4);
    console.log('eff:', 't:'+tableLen,'+ d:'+ huffLen +'='+(huffLen+tableLen), source, compressed+'%')
    return {result, correction, hcodes};
}

const huffmanDecode = ({result, correction, hcodes: _hcodes})=>{
    const hcodes = _hcodes;//JSON.parse(_hcodes);
    const unB64 = {};
    B64.split('').forEach((it,i)=>{
        unB64[it] = i.toString(2);
        while(unB64[it].length<6){
            unB64[it] = '0'+unB64[it];
        }
    })
    const bitbuf = [];
    result.split('').forEach(it=>{
        const word = unB64[it].toString();
        bitbuf.push(word);
    })
    let bitstr = bitbuf.join('');
    bitstr = bitstr.slice(0, bitstr.length - correction);
    
    const uncoded = [];
    let candidate = '';
    bitstr.split('').forEach(it=>{
        candidate+=it;
        if (hcodes[candidate]){
            uncoded.push(hcodes[candidate]);
            candidate = '';
        }
    });
    return uncoded.join('');
}

const huffmanDecodeRecursive = ({result, correction, hcodes: _hcodes})=>{
    const restoreCodes = (codes)=>{
        const res = {};
        let ucodes = (typeof codes.codes == 'string') ? codes.codes.split(','): huffmanDecodeRecursive(codes.codes);
        let uvals = (typeof codes.value == 'string') ? JSON.parse(codes.value) : huffmanDecodeRecursive(codes.value);
        
        ucodes = (typeof ucodes == 'string') ? ucodes.split(',') : ucodes;
        uvals =( typeof uvals == 'string') ? JSON.parse(uvals) : uvals;
        ucodes.forEach((it,i)=>{
            res[it]=uvals[i];
        })
        return res;
    }
    let hcodes = (typeof _hcodes == 'string') ? JSON.parse(_hcodes) : _hcodes;
    if (hcodes.codes){
        hcodes = restoreCodes(hcodes)//huffmanDecodeRecursive(hcodes);
    }
    return huffmanDecode({result, correction, hcodes});
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
/*
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
*/
