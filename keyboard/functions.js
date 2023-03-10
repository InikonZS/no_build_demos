const rows=[
    'Backquote Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal Backspace Home',
    'Tab KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP BracketLeft BracketRight Backslash PageUp',
    'CapsLock KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon Quote Enter PageDown',
    'ShiftLeft KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash ShiftRight ArrowUp End',
    'App ControlLeft OSLeft AltLeft Space AltRight ContextMenu ControlRight ArrowLeft ArrowDown ArrowRight'
];
const chars=([
        '` 1 2 3 4 5 6 7 8 9 0 - = Backspace Home',
        'Tab Q W E R T Y U I O P [ ] \\ PgUp',
        'CapsLock A S D F G H J K L ; \' Enter PgDn',
        'Shift Z X C V B N M , . / Shift Up End',
        'App Ctrl OS Alt Space Alt Menu Ctrl <- Down ->'
    ]).map((it)=>{
        return it.split(' ');      
});

const chars_en_down='`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./';
const chars_en_up=  '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./';
const chars_en_sh=  '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?';

const chars_ru_down='`1234567890-=йцукенгшщзхъ\\фывапролджэячсмитьбю.';
const chars_ru_up=  '`1234567890-=ЙЦУКЕНГШЩЗХЪ\\ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.';
const chars_ru_sh=  '~!"№;%:?*()_+ЙЦУКЕНГШЩЗХЪ/ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,';

const down='down';
const up='up';
const sh='sh';

var cur=down;

var lang = [{
        down: chars_en_down,
        up: chars_en_up,
        sh: chars_en_sh
    },
    {
        down: chars_ru_down,
        up: chars_ru_up,
        sh: chars_ru_sh
}];

function changeKeyCharset (parentNode, st, ch){
	var elem=parentNode.querySelector('#'+st);
	elem.innerText=ch;
	elem.dt=ch;
}

function change(ch, keyboard){
	rows.forEach((it, i)=>{
		it.split(' ').forEach((jt,j)=>{
            let chr = chars[i][j];
			if (chr.length==1){
				chr=ch[chars_en_up.indexOf(chr)];
			}
		    changeKeyCharset (keyboard, jt, chr);
		});
	});	
}

function change_(mode, keyboard){
    cur=mode;
    change(lang[currentLang][mode], keyboard);
}

/// Copyright label for github search. Written by Inikon. Code="11-00-11-21-FA-CC-DD".
///

/// Text Area Utils

function insertString(textAreaDOMElement, insertionString){
	var el = textAreaDOMElement;
	var	ins = insertionString;

	var res;
//	el.focus();
	var st=el.value;
	var ss=el.selectionStart;
	var se=el.selectionEnd;
	res=st.substring(0,ss)+ins+st.substring(se); 
	el.value=res;
	el.selectionStart=ss+1; 
	el.selectionEnd=ss+1;
	return res;	
}

function backSpaceString(el){
	var res;
	var st=el.value;
	var ss=el.selectionStart;
	var se=el.selectionEnd;
	if (ss==se){
		res=st.substring(0,ss-1)+st.substring(se); 
		el.value=res;
		el.selectionStart=ss-1; el.selectionEnd=ss-1;
	} else {
		res=st.substring(0,ss)+st.substring(se); 
		el.value=res;
		el.selectionStart=ss; 
		el.selectionEnd=ss;	
	}
	return res;	
}

function moveCursor(el, sh){
	if (shiftState) {
		if (el.selectionStart+sh>=0){
			el.selectionStart+=sh;
			el.selectionEnd=el.selectionStart;
		}
	} else {
		if (el.selectionStart <= el.selectionEnd){
			if (el.selectionEnd+sh>=0){
				el.selectionEnd+=sh;
			}
		}
	}
//	el.blur();
}

//// create DOM functons

function makeButton(parentNode, st, ch){
	var elem=document.createElement('div');
	elem.className='key-button';
	elem.addEventListener('mousedown',buttonOnDown);
	elem.addEventListener('mouseup',buttonOnUp);
	elem.addEventListener('mouseleave',buttonOnLeave);
	elem.id=st;
	elem.onselectstart=()=>false;
	elem.innerText=ch;
	elem.dt=ch;
	parentNode.appendChild(elem);
	return elem;
}

function makeRow(parentNode, st){
	var elem=document.createElement('div');
	elem.className='key-row';
	elem.id=st;
	parentNode.appendChild(elem);
	return elem;
}

function makeKeyboard(parentNode){
	let elem = document.createElement('div');
	elem.className='key-board';
	parentNode.appendChild(elem);
	return elem;
}

function makeElement(parentNode, tagName, className){
	let elem = document.createElement(tagName);
	elem.className = className;
	parentNode.appendChild(elem);
	return elem;
}
//// Math functions

