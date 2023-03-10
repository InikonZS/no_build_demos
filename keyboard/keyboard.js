
function keyOnDown(event){
	var targ=document.querySelector('#'+event.code);
	if (targ.dt && targ.dt.length==1) {
		insertString(el,targ.dt);
	} else {
		keyDoDown(event.code, false, keyboard)
	}
	if(targ) {
		targ.className='key-button key-button-active';	
	}
}

function keyOnUp(event){
	//console.log(event);
	//el.innerText+=event.keyCode;
	var targ=document.querySelector('#'+event.code);
	if (targ) {
		targ.className='key-button';
	}
	keyDoUp(event.code, false, keyboard);
}

function stateButtonProc(event){
	if (event.target.dt == 'Alt') {
		altState ? 
		event.target.className='key-button' :
		event.target.className='key-button key-button-active';
	}
	if (event.target.dt == 'Shift') {
		shiftState ? 
		event.target.className='key-button' :
		event.target.className='key-button key-button-active';
	}
	if (event.target.dt == 'Ctrl') {
		controlState ? 
		event.target.className='key-button' :
		event.target.className='key-button key-button-active';
	}
}

function buttonOnDown(event){
	//el.focus();
	event.preventDefault();
	if (event.target.dt.length==1) {
		insertString(el,event.target.dt);
	} else {
		keyDoDown(event.target.id, true, keyboard);
	}
	stateButtonProc(event);
	event.target.className='key-button key-button-active';
	
	el.focus();
	//return false;
}
function buttonOnUp(event){
	//el.focus();
	keyDoUp(event.target.id, true, keyboard);
	event.target.className='key-button';
	stateButtonProc(event)
}

function buttonOnLeave(event){
	event.target.className='key-button';
	stateButtonProc(event);
	//return false;
}

function keyDoUp(code, virtual, keyboard){
	//let sls=el.selectionStart;
	switch(code){
		case 'ShiftLeft': 
			if (!altState){
				currentLang = (currentLang+1) % 2;
				localStorage.setItem('lang', currentLang); 
				change_(cur, keyboard); 
				shiftState = true;
				if (virtual) {break;}
			}
			if (virtual) {
				(shiftState == false) ? change_(down, keyboard) : change_(sh, keyboard); 
				shiftState = !shiftState;
			} else {
				shiftState = true;
				change_(down, keyboard)
			}; 
			break;

		case 'AltLeft':
				if (!shiftState){
					currentLang = (currentLang+1) % 2;
					localStorage.setItem('lang', currentLang); 
					change_(cur, keyboard); 
					altState = true;
					if (virtual) {break;}
				}

				if (virtual) {
					altState = !altState;  
				} else {
					altState = true;
				}
				break;

		case 'ControlLeft':
				if (virtual) {
					controlState = !controlState;  
				} else {
					controlState = true;
				}
				break;
		
		case 'CapsLock': 
			capsLockState = (capsLockState+1) % 2; 
			(capsLockState == 0) ? change_(down, keyboard) : change_(up, keyboard); 
			break;

		case 'App': 
			currentLang = (currentLang+1) % 2;
			localStorage.setItem('lang', currentLang); 
			change_(cur, keyboard); 
			break;

		default:;
	}
	el.focus();
}
function keyDoDown(code, virtual, keyboard){
	switch(code){
		case 'Backspace': backSpaceString(el); break;
		case 'ShiftLeft': 
			if (!virtual) {
				shiftState=false;  
				change_(sh, keyboard);
			} 
			break;
		case 'AltLeft':
			if (!virtual) {
				altState=false;  
			} 
			break;
		case 'ControlLeft':
			if (!virtual) {
				controlState=false;  
			} 
			break;
		case 'Enter': insertString(el, '\n'); break;
		case 'Space': insertString(el, ' '); break;
		case 'Tab': insertString(el, '\t'); break;
		case 'ArrowLeft': moveCursor(el, -1); break;
		case 'ArrowRight': moveCursor(el, 1); break;
		default:;
	}
	el.focus();
}


function getCurrentLang(){
	let langValue = localStorage.getItem('lang');
	if ( langValue === null){
		localStorage.setItem('lang', 0);
		langValue = 0;
	}
	return langValue;
}

/// Application Start Point =>

var shiftState = true;
var altState = true;
var controlState = true;
var capsLockState = 0;
var currentLang = +getCurrentLang();

var mainWindow=document.querySelector('#wnd');
var el = makeElement (mainWindow, 'textarea', 'output');
el.onkeydown = () => false;

var keyboard = makeKeyboard(mainWindow);
var hint = makeElement(mainWindow, 'div', 'hint');
hint.textContent = `Use left Alt + Shift or left Shift + Alt or virtual App button for change language.`;

document.addEventListener('keydown',keyOnDown);
document.addEventListener('keyup',keyOnUp);



rows.forEach((it, i)=>{
	var row=makeRow(keyboard,'row'+i);
	it.split(' ').forEach((jt,j)=>{
		makeButton(row, jt, chars[i][j]);
	});
});

//change(chars_en_down, keyboard);
change_(cur, keyboard);




