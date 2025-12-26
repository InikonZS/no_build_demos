let audioCtx = new AudioContext();
// Стерео
var channels = 2;

// Создает пустой двухсекундный стерео-буфер
// с частотой звука AudioContext (sample rate)
var frameCount = audioCtx.sampleRate * 1.4;
//var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);

var lerp = function(a, b, amount){
  return (b - a) * amount + a;
}

var ease = function(x){
  let m = 100;
  if (x< 1/m){
    return lerp(0, 0.5*m, x);
  } else {
    return lerp(0.5, 0, x-(1/m))/(x);
  }
}

function triangle(i){
  let ph = ((i+Math.PI) % 2*Math.PI);
  //return lerp(-1, 1, (ph - Math.PI)/ Math.PI);
  return lerp(-1, 1, (ph)/ (2 * Math.PI));
}

let snd = (freq, oberK, amsrFunction)=>{
    snd1(freq, 1, amsrFunction);
    setTimeout(()=>{
        snd1(freq / 2, 0.25, amsrFunction);
        setTimeout(()=>{
            snd1(freq / 4, 0.25, amsrFunction);
        }, 1)
    }, 1)
}

let snd1 = function(freq, oberK, amsrFunction) {
    var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
  console.log('df');
  // Заполняет буфер белыми шумами;
  // просто случайные значения от -1.0 до 1.0
  for (var channel = 0; channel < channels; channel++) {
    // Получаем массив данных канала
    var nowBuffering = myArrayBuffer.getChannelData(channel);
    for (var i = 0; i < frameCount; i++) {
      // Math.random() находится в [0; 1.0]
      // аудио должно быть в интервале [-1.0; 1.0]
     
     /* let obertoned = (Math.sin((i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) ));
      for (let ob = 0; ob<18; ob++){
        let mul = 1/(oberK**(ob+2));
        
        let cleanSinValue = (Math.sin(((ob+2)*i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) ));
        obertoned=(obertoned+cleanSinValue*mul)/(1+mul);
      }*/
      let obertoned = (triangle((i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) ));
      //let clean = (Math.sin((i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) ));
      //let cleanSinValue2 = (Math.sin((2*i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) ));
      //let val = ((/*obertoned + */clean*3)/3);//*amsrFunction(i);
      let val = Math.tanh((i / frameCount * 2000)  * obertoned) *amsrFunction(i) * oberK;
      //let val = 6*(Math.sin((i* freq*360 / audioCtx.sampleRate ) / (180/Math.PI) )) /(i/500+1)//* ease(i/frameCount);
     /* if (val>0.15) {
        val =0.15;
      }
      if (val<-0.15) {
        val =-0.15;
      }*/
      nowBuffering[i] = 1* val;
    }
  }

  // Получает AudioBufferSourceNode.
  // AudioNode для проигрывания из AudioBuffer
  var source = audioCtx.createBufferSource();

  // устанавливает буфер в AudioBufferSourceNode
  source.buffer = myArrayBuffer;

  // присоединяет AudioBufferSourceNode к
  // destination, чтобы мы могли слышать звук
  //var sine = audioCtx.createOscillator();
  //sine.
  source.connect(audioCtx.destination);
  
  // Начать воспроизведение с источника
  source.start();

}

function makeBuffer(freq, oberK, amsrFunction){

}

/*for (let i=0; i< 10; i++){
  let el = document.createElement('div');
  el.textContent = '------'+i;
  document.body.appendChild(el);
  let notes = [
  147.83,
138.59,
130.82,
123.48,
116.54,
110.00,
103.80,
98.00,
92.50,
87.31,
  ];
  el.onclick = ()=> {snd(notes[i]*2);}
}*/
