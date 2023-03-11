const canvas = document.querySelector(".canvas1");
canvas.width = 420;
canvas.height = 420;
let v ={x:0, y:0};
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  scale(scaler) {
    this.x *= scaler;
    this.y *= scaler;
    return this;
  }

  normalize() {
    let abs = this.abs();
    if (!Number.isNaN(abs) && abs != 0) {
      this.scale(1 / abs);
    }
    return this;
  }

  abs() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }
}

let t = 0;
let a = canvas.getContext("2d");
function rect(a, v) {
  a.clearRect(0, 0, a.canvas.width, a.canvas.height);

  for (let x = 0; x < a.canvas.width / 20; x++) {
    for (let y = 0; y < a.canvas.height / 20; y++) {
        const p = new Vector(x*20, y*20);
        const k = p.clone().sub(v).abs();
        const r = p.clone().sub(v).normalize().scale(0.2* t).add(p);

        a.fillRect(r.x,r.y, 10, 10);

    }
  }
}

let stop = setInterval((e)=>{
    rect(a, v);
    t-=5;
    if(t < 0){
        t = 0;
    }
}, 30)

let m = { x: 0, y: 0 };
a.beginPath();
canvas.addEventListener("mousemove", (e) => {
    m.x = e.clientX - canvas.offsetLeft;
    m.y = e.pageY - canvas.offsetTop;
   v = new Vector(m.x, m.y);
    rect(a,v, 1000);
    t+=Math.hypot(e.movementX, e.movementY);
    if (t>200){t=200}
    a.lineTo(m.x, m.y);
    //a.stroke();
});
