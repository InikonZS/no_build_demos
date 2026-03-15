function longestRepeat(s) {

    const suffixes = []

    for (let i = 0; i < s.length; i++) {
        suffixes.push({
            index: i,
            suf: s.slice(i)
        })
    }

    suffixes.sort((a, b) => a.suf.localeCompare(b.suf))

    let bestLen = 0
    let bestStr = ""

    const lcp = (a, b) => {
        let i = 0
        while (i < a.length && i < b.length && a[i] === b[i]) i++
        return i
    }

    for (let i = 1; i < suffixes.length; i++) {

        const len = lcp(suffixes[i].suf, suffixes[i - 1].suf)

        if (len > bestLen) {
            bestLen = len
            bestStr = suffixes[i].suf.slice(0, len)
        }

    }

    console.log(suffixes);

    return bestStr
}

const trivialMatch = (arr) => {
    const dictionaryCountMap = {};
    arr.forEach((it, i) => {
        let id = it;
        if (!dictionaryCountMap[id]) {
            dictionaryCountMap[id] = {
                key: id,
                count: 0,
                len: 1,
                positions: []
            }
        }
        dictionaryCountMap[id].count++;
        dictionaryCountMap[id].positions.push(i);
    });
    const dictionaryList = [];
    Object.entries(dictionaryCountMap).sort((a, b) => b[1].count - a[1].count).forEach((it) => {
        if (it[1].count <= 1) {
            return;
        }
        dictionaryList.push(it[1]);
    });
    return dictionaryList;
}

const findRepeatLevel = (arr, matched) => {
    if (!matched) {
        matched = trivialMatch(arr);
    }

    const nextList = [];

    for (let i = 0; i < matched.length; i++) {
        const dictionaryCountMap = {};
        const current = matched[i];
        //current.len
        //current.positions

        for (let j = 0; j < current.positions.length; j++) {
            const positionStart = current.positions[j];
            const positionAdd = positionStart + current.len;
            if (positionAdd >= arr.length) {
                continue;
            }
            const id = arr[positionAdd];
            if (!dictionaryCountMap[id]) {
                dictionaryCountMap[id] = {
                    key: id,
                    _debug: arr.slice(positionStart, positionAdd + 1).join(''),
                    count: 0,
                    len: current.len + 1,
                    positions: []
                }
            }
            dictionaryCountMap[id].count++;
            dictionaryCountMap[id].positions.push(positionStart);
        }
        const dictionaryList = [];
        Object.entries(dictionaryCountMap).sort((a, b) => b[1].count - a[1].count).forEach((it) => {
            if (it[1].count <= 1) {
                return;
            }
            dictionaryList.push(it[1]);
        });
        dictionaryList.forEach(it => {
            nextList.push(it);
        })

    }

    return nextList;
}

function findRepeatsRec(s, iter=1){
    let next = s;
    let pref = '';
    for (let i=0; i< iter; i++){
        pref+='0';
        next = findRepeats(next, pref)
    }
    return next
}


function findRepeats(s, linkPref='0') {
    const levels = [];
    const arr = s//.split('');
    for (let i = 0; i < 1000000; i++) {
        const level = findRepeatLevel(arr, levels[i - 1]);
        if (level.length == 0) {
            console.log('end')
            break;
        }
        const filtered = removeAffected(arr, level)
        levels.push(filtered);
    }
    console.log(levels);

    levels.reverse()

    const accepted = removeAffectedAll(arr, levels)
    const {result, next} = applyReplacements(arr, accepted, linkPref);
    console.log(result);
    return next;
}

function removeAffectedAll (arr, levels){
const occupied = new Array(arr.length).fill(false)
    const accepted = []

    levels.forEach(level => {
        level.forEach(block => {

            const goodPositions = []

            block.positions.forEach(pos => {

                let affected = false

                for (let i = 0; i < block.len; i++) {
                    if (occupied[pos + i]) {
                        affected = true
                        break
                    }
                }

                if (!affected) {
                    goodPositions.push(pos)

                    for (let i = 0; i < block.len; i++) {
                        occupied[pos + i] = true
                    }
                }

            })

            if (goodPositions.length > 1) {
                accepted.push({
                    len: block.len,
                    positions: goodPositions,
                    //count: block.count,
                    _debug: block._debug
                })
            }

        })
    })
    console.log(accepted)
    return accepted
}

function removeAffected (arr, level){
const occupied = new Array(arr.length).fill(false)
    const accepted = []

    //levels.forEach(level => {
        level.forEach(block => {

            const goodPositions = []

            block.positions.forEach(pos => {

                let affected = false

                for (let i = 0; i < block.len; i++) {
                    if (occupied[pos + i]) {
                        affected = true
                        break
                    }
                }

                if (!affected) {
                    goodPositions.push(pos)

                    for (let i = 0; i < block.len; i++) {
                        occupied[pos + i] = true
                    }
                }

            })

            if (goodPositions.length > 1) {
                accepted.push({
                    len: block.len,
                    positions: goodPositions,
                    //count: block.count,
                    _debug: block._debug
                })
            }

        })
    //})
    //console.log(accepted)
    return accepted
}

function applyReplacements(arr, _accepted, linkPref = '0'){

    const startMap = {}
    const accepted = _accepted//_accepted.filter(it=>it.positions.length > 10 || it.len > 10)
    accepted.forEach((block, blockId)=>{

        block.positions.forEach(pos=>{
            startMap[pos] = {
                len: block.len,
                id: blockId
            }
        })

    })

    const contentLen = accepted.map(it=>it.len);
    const contents = accepted.map(it=>arr.slice(it.positions[0], it.positions[0] + it.len)).flat();
    console.log(contentLen, contents)

    const result = []
    
    for(let i=0;i<arr.length;i++){

        const block = startMap[i]

        if(block){
            const token =  linkPref+block.id//arr.slice(i, i + block.len)//.join('')

            result.push(token)

            i += block.len - 1
            continue
        }

        result.push(arr[i])

    }
    const next =  encodeRepeats(result, contents, contentLen, linkPref)//[...result, ...contents, ...contentLen, contentLen.length, linkPref];
    console.log('enc',next)
    return {result, next}
}

function encodeRepeats(result, contents, contentLen, linkPref){
    if (linkPref == '0'){
        return [...result, '0-0', ...contents, ...contentLen, contentLen.length, linkPref];
    } else {
        return [...result, ...contents, ...contentLen, contentLen.length, linkPref];
    }
}

function decodeRepeats(data){
    const linkPref = data.pop().toString();
    console.log(linkPref);
    if (linkPref == '0-0'){
        return [data, true];
    };
    const contentLenlength = data.pop();
    const contentLen = data.splice(data.length - contentLenlength, contentLenlength).reverse();

    const contents = [];
    contentLen.forEach(it=>{
        contents.push(data.splice(data.length - it, it));
    })
    contents.reverse();
    console.log(contents, contentLenlength, contentLen)
    const result = [];
    console.log(data)
    data.forEach(it=>{
        const stringed = it.toString();
        if (stringed.startsWith(linkPref) && !stringed.includes('.') && stringed.length > linkPref.length && (stringed != '0-0')){
            const linkNum = stringed.slice(linkPref.length);
            const linkData = contents[Number.parseInt(linkNum)];
            if (linkData==undefined){
                throw new Error(linkNum, stringed)
            }
            linkData.forEach(jt=>result.push(jt))
        } else {
            /*if (typeof it == 'string'){
                console.log(it, stringed.startsWith(linkPref), !stringed.includes('.'), stringed.length > linkPref.length, (stringed != '0-0'));
            }*/
            result.push(it)
        }
    })
    return [result, false]
}

function decodeRepeatsRec(data){
    let stepData = data;
    for (let i=0; i<1000; i++){
        const [res, fin] = decodeRepeats(stepData);
        stepData = res;
        if (fin){
            return res;
        }
    }
}

const t1 = [121, 222, 333, 121, 121, 222, 333, 125, 999, 32, 24, 18, 55, 32, 24, 888, 121, 222, 333, 125, 999, 32, 24, 18, 55, 121, 222, 333, 125, 999, 32, 24, 18, 55, 121, 222, 333, 125, 999, 32, 24, 18, 55]
///['00', 121, '00', 125, 999, '01', 18, 55, '01', 888, 121, 222, 333, 32, 24, 3, 2, 2, '0']