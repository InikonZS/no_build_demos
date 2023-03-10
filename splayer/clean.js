document.addEventListener('DOMContentLoaded', onReady);
document.addEventListener('mousemove', onMove);
document.addEventListener('mousedown', onDown);
document.addEventListener('mouseup', onUp);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

var app;

function onReady() {
    app = new App(document);
    app.render();
}

function onMove(e) {
    var cx = (e.pageX - app.canvasDOM.offsetLeft) + app.scrollDOM.scrollLeft;
    var cy = (e.pageY - app.canvasDOM.offsetTop) + app.scrollDOM.scrollTop;
    app.setCursorPosition(cx, cy);

    if (app.tool == 0) {
        if (e.buttons == 1) {
            let hov = app.selection.selPoints.wasPointHover(app.scale, app.cursor);//app.selPoints.wasPointHover(app.scale,app.cursor);
            if (hov) {
                app.selection.selPoints.move(app.cursor);
                app.cursor.cloud = false;
            } else {

                if (app.selection.wasHover(app.scale, app.cursor)) {
                    app.selection.move(app.cursor);
                    //app.selection.entries.forEach((it)=>{
                    //    it.move(app.cursor);
                    app.cursor.cloud = false;
                    //});       
                }
            }
        }
    }
    if (app.tool == 1) {
        app.ghostSpline.ghostPoint.setPosition(app.cursor.gridPosition.x, app.cursor.gridPosition.y);
    }

    app.render();
}

function onDown(e) {
    var cx = (e.pageX - app.canvasDOM.offsetLeft) + app.scrollDOM.scrollLeft;
    var cy = (e.pageY - app.canvasDOM.offsetTop) + app.scrollDOM.scrollTop;
    var dx = (e.pageX - app.canvasDOM.offsetLeft);
    var dy = (e.pageY - app.canvasDOM.offsetTop);
    if ((dx < 0) || (dy < 0) || (((e.pageX - app.canvasDOM.offsetLeft)) > app.scrollDOM.clientWidth) || (((e.pageY - app.canvasDOM.offsetTop)) > app.scrollDOM.clientHeight)) { return false; }
    //console.log("mousedown");
    if (app.tool == 0) {
        if (e.buttons == 1) {
            //console.log("cpgcp");
            var sel = app.selection.isPointHover(app.scale, app.cursor);
            if (sel) {
                if (!sel.selected) {
                    app.selection.selectHoveredPoints(); //обновляем выделение
                    sel.selected = true;
                }
            } else {
                var sl = app.selection.isMidle(app.scale, app.cursor);
                if (sl) {
                    sele = sl.split();
                    app.selection.selectHoveredPoints(); //обновляем выделение
                    app.selection.selPoints.points.push(sele);
                    sele.selected = true;

                } else {
                    var selc = app.board.isHover(app.scale, app.cursor)
                    //console.log("cpgc");
                    if (selc) {
                        if (!selc.selected) {
                            app.board.selectHovered();
                            app.selection.entries = app.board.selection;
                            //app.selection.push(selc);
                            selc.selected = true;
                        }//console.log("cpg");
                        if (app.ctr == true) {

                            //var gr=new Group(app.ctx);
                            app.selection.entries.forEach((it) => {
                                console.log("cp");
                                //gr.entries.add(it.dublicate());
                                app.board.entries.push(it.dublicate());
                            })
                            //app.selection=gr;
                        }

                    }
                }
            }
            app.startCursorCloud(cx, cy);
        }
    }

    if (app.tool == 1) {
        if (e.buttons == 1) {
            app.ghostSpline.add();
        }
        if (e.buttons == 2) {
            if (app.ghostSpline.points.length == 0) {
                app.selTool(0);
            }
            if (app.ghostSpline.points.length > 1) {
                app.board.entries.push(app.ghostSpline);
            } else {
                app.ghostSpline.pad = true;
                app.board.entries.push(app.ghostSpline);
            }
            app.ghostSpline = new Spline(app.ctx);
            app.ghostSpline.ghostPoint.setPosition(app.cursor.gridPosition.x, app.cursor.gridPosition.y);


        }
    }
    app.render();
}

function onUp(e) {
    var cx = (e.pageX - app.canvasDOM.offsetLeft) + app.scrollDOM.scrollLeft;
    var cy = (e.pageY - app.canvasDOM.offsetTop) + app.scrollDOM.scrollTop;
    var dx = (e.pageX - app.canvasDOM.offsetLeft);
    var dy = (e.pageY - app.canvasDOM.offsetTop);
    if ((dx < 0) || (dy < 0) || (((e.pageX - app.canvasDOM.offsetLeft)) > app.scrollDOM.clientWidth) || (((e.pageY - app.canvasDOM.offsetTop)) > app.scrollDOM.clientHeight)) { return false; }

    if (app.tool == 0) {
        //не убираем выделение если переместили группу линий
        if (!app.selection.wasHover(app.scale, app.cursor)) {
            app.board.selectHovered();
            app.selection.entries = app.board.selection;
        }
        //не убираем выделение если перместили группу точек
        let hov = app.selection.selPoints.wasPointHover(app.scale, app.cursor);
        if (!hov) {
            app.selection.selectHoveredPoints();
        }
        //применяем перемещение
        app.selection.selPoints.applyMove();
        app.selection.applyMove();

    }
    //app.cursor.hidden=false;
    app.endCursorCloud();
    app.render();
}

function onKeyDown(e) {
    if (e.key == "Control") {
        app.ctr = true;
    }
}

function onKeyUp(e) {
    console.log(e.key);
    if (e.key == "Control") {
        app.ctr = false;
    }
    if (e.key == "Delete") {

        app.board.delete();
    }
}

class Base {
    constructor(wn) {
        this.items = [];
        this.wn = wn;
        this.selection;
        this.selIndex;
    }

    add(name, group) {
        var ni = new BaseItem;
        ni.name = name;
        ni.model = group.dublicate();
        this.items.push(ni);
    }
    select(index) {
        this.selIndex = index;
        this.selection = this.items[index];
    }
    render() {
        var ht = "";
        this.items.forEach((it, i) => {
            let st = "";
            if (i == this.selIndex) { st = ' style="background-color:rgb(80,80,80)" '; }

            ht += ('<p onclick="app.base.select(' + i + ')" ' + st + '>' + it.name + '</p>');
        });
        this.wn.innerHTML = ht;
    }
}

class BaseItem {
    constructor() {
        this.name;
        this.model;
    }
    pushBoard() {
        //app.board.entries.push(app.base.items[0].model.dublicate())
    }
}

class App {
    constructor(doc) {
        this.canvasDOM = doc.getElementById("wnd");
        this.scrollDOM = doc.querySelector(".main");
        this.ctx = this.canvasDOM.getContext('2d');
        let wn = doc.querySelector(".basebar");
        this.base = new Base(wn);
        this.selection = new Group();
        this.selPoints = new Spline();
        this.selectionPoints = [];
        this.board = new Group();
        this.board.main = true;
        this.ghostSpline = new Spline(this.ctx);
        this.grid = new Grid(this.ctx, 8);
        this.cursor = new Cursor(this.ctx);
        this.scale = 2;
        this.tool = 0;
        this.state = 0;
    }

    download() {
        downloadImage(this.ctx.canvas.toDataURL(), "filename.png");
    }

    setScale(scn) {
        scn = Math.trunc(scn);
        if (scn >= 1) {
            var k = scn / this.scale;
            this.scale = scn;
            this.canvasDOM.width = this.canvasDOM.width * k;
            this.canvasDOM.height = this.canvasDOM.height * k;
            this.render();
        }
    }

    setCursorPosition(x, y) {
        this.cursor.setPosition(x, y, this.grid.step, this.scale);
    }

    startCursorCloud(x, y) {
        this.cursor.startCloud(x, y, this.grid.step, this.scale);
    }

    endCursorCloud() {
        this.cursor.endCloud();
    }

    selTool(tool) {
        this.tool = tool;
    }


    render() {
        this.base.render();
        var curToolIco = document.getElementById("tool" + this.tool);
        var lineWidthOut = document.getElementById("wid");
        if (this.selection.entries[0]) {
            lineWidthOut.innerHTML = this.selection.getWidth();
        }
        //
        var toolIcons = document.querySelectorAll(".sidebar_item");
        toolIcons.forEach((it) => it.style = "");
        curToolIco.style = "background-color:rgb(80,80,80)";

        this.ctx.fillStyle = 'rgb(50, 50, 50)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.grid.render(this.scale);
        this.cursor.render(this.scale);
        this.ghostSpline.render(this.scale, true, false, false);
        //this.board.entries.forEach((it)=>{it.hover=it.isHover(this.scale, this.cursor.realPosition.x,this.cursor.realPosition.y)});
        this.board.entries.forEach((it) => { if (it.type != "sple") { it.select(this.scale, this.cursor) } });
        this.board.entries.forEach((it) => { if (it.type == "spline") { if (it.selected) { it.selectMarker(this.scale, this.cursor) } } });
        this.board.render(this.scale);
    }
}

class Grid {
    constructor(ctx, step) {
        this.step = step;
        this.ctx = ctx;
    }

    render(sc) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgb(90,90,90)";
        for (let i = 0; i < this.ctx.canvas.width; i += this.step * sc) {
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.ctx.canvas.height);
        }
        for (let i = 0; i < this.ctx.canvas.height; i += this.step * sc) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.ctx.canvas.width, i);
        }
        this.ctx.stroke();
    }

}

class Cursor {
    constructor(ctx) {
        this.realPosition = new Vertex(0, 0);
        this.gridPosition = new Vertex(0, 0);
        this.startPos = new Vertex(0, 0);
        this.gridStartPos = new Vertex(0, 0);
        //this.endPos = new Vertex (0, 0);
        this.hidden = false;
        this.cloud = false;
        this.ctx = ctx;
    }

    setPosition(x, y, step, sc) {
        this.realPosition.setPosition(x / sc, y / sc);
        this.gridPosition.setPosition(roundToStep(x / sc, step), roundToStep(y / sc, step));
    }

    startCloud(x, y, step, sc) {
        this.cloud = true;
        this.startPos.setPosition(x / sc, y / sc);
        this.gridStartPos.setPosition(roundToStep(x / sc, step), roundToStep(y / sc, step));
    }

    endCloud() {
        this.cloud = false;
    }

    render(sc) {
        //this.realPosition.render(this.ctx, sc);
        //this.gridPosition.render(this.ctx, sc);
        if (this.cloud && (!this.hidden)) {
            let xs = this.startPos.x * sc;
            let ys = this.startPos.y * sc;
            let xe = this.realPosition.x * sc;
            let ye = this.realPosition.y * sc;
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgb(255,0,0)";
            this.ctx.moveTo(xs, ys);
            this.ctx.lineTo(xs, ye);
            this.ctx.lineTo(xe, ye);
            this.ctx.lineTo(xe, ys);
            this.ctx.lineTo(xs, ys);
            this.ctx.stroke();
        }
    }
}

class Group {
    constructor(ctx) {
        this.entries = [];
        this.type = "group";
        this.main = false;
        this.ctx = ctx;
        this.de = true;
        //this.selectionPoints;
        this.selPoints = new Spline(this.ctx);
        this.selection = [];
    }
    delete() {
        var res = [];
        for (let i = 0; i < this.selection.length; i++) {
            this.selection[i].de = false;

        }
        this.selection = [];
        for (let i = 0; i < this.entries.length; i++) {
            (this.entries[i].de != false) ? res.push(this.entries[i]) : this.entries[i].de = true;

        }
        this.entries = res;
        app.render();
    }

    groupe() {
        var res = [];
        var gr = new Group(this.ctx);
        for (let i = 0; i < this.selection.length; i++) {
            this.selection[i].de = false;

        }
        this.selection = [];
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].de != false) { res.push(this.entries[i]) } else {
            this.entries[i].de = true;
                this.entries[i].selected = false;
                this.entries[i].hover = false;
                gr.entries.push(this.entries[i])
            }

        }
        this.entries = res;
        this.entries.push(gr);
        app.render();
    }

    unGroupe() {
        var res = [];
        this.selection.forEach((it) => {
            if (it.type == "group") {
                it.de = false;
                it.entries.forEach((jt) => {
                    jt.de = true;
                    this.entries.push(jt);
                })
            } else { it.de = true; }
        });
        this.entries.forEach((it) => {
            if (it.de != false) {
                res.push(it);
            }
        });
        this.selection = [];
        this.entries = res;
    }

    setHover(hover) {
        this.hover = hover;
        this.entries.forEach((it) => {
            if (it.type == "group") { it.setHover(hover); }
            else {
                it.hover = hover;
            }
        });
    }

    /*   setSelect(hover){
           this.selected=hover;
           this.entries.forEach((it)=>{
               if (it.type=="group"){it.setHover(hover);}
               else{
                   it.selected=hover;
               }
           });    
       }*/

    select(sc, cursor) {
        res = false;
        //this.hover=false;
        this.setHover(false)
        this.entries.forEach((it) => {
            res |= it.select(sc, cursor);
        });
        if (res) {
            this.setHover(true);
            //this.entries.forEach((it)=>{
            //    it.hover=true;
            //});
            //this.hover=true;
        }
        return res;
    }

    move(cursor) {
        this.entries.forEach((it) => {
            it.move(cursor);
        });
    }

    applyMove() {
        this.entries.forEach((it) => {
            it.applyMove();
        });
    }

    dublicate() {
        var res = new Group(this.ctx);
        this.entries.forEach((it) => {
            res.entries.push(it.dublicate());
        })
        return res;
    }

    selectHovered() {
        this.selection = []
        this.selected = this.hover;
        this.entries.forEach((it) => {
            if (it.type == "group") { it.selectHovered() } else {
                it.selected = it.hover;
            }
            if (it.selected) { this.selection.push(it) };
        });
    }

    selectHoveredPoints() {
        //this.selectionPoints=[];
        this.selPoints = new Spline(this.ctx);
        this.entries.forEach((it) => {
            if (it.type == "spline") {
                it.points.forEach((jt) => {
                    jt.selected = jt.hover;
                    if (jt.selected) {
                        //this.selectionPoints.push(jt); 
                        this.selPoints.points.push(jt)
                    };
                })
            }
        });
    }


    isMidle(sc, cursor) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].type == "spline") {
                var index = this.entries[i].isMidle(sc, cursor);
                if (index) { return this.entries[i]; }
            }
        }
        return false;
    }

    isPointHover(sc, cursor) {
        for (let i = 0; i < this.entries.length; i++) {
            var point = this.entries[i].isPointHover(sc, cursor);
            //return point;
            if (point) { return point; }
        }
        return false;
    }

    isHover(sc, cursor) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].isHover(sc, cursor)) { return this.entries[i]; }
        }
        return false;
    }

    wasHover(sc, cursor) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].wasHover(sc, cursor)) { return this.entries[i]; }
        }
        return false;
    }
    setWidth(wdt) {
        this.entries.forEach((it) => {
            it.setWidth(wdt);
        })
    }
    getWidth() {
        var res;
        for (let i = 0; i < this.entries.length; i++) {
            var it = this.entries[i];
            if (it.type == "spline") { res = it.width } else { res = it.getWidth(); }
            if (res) { return res; }
        }
    }

    /*dublicate(){
        var res=new Spline(this.ctx);
        this.points.forEach((it)=>{
            res.points.push(it.dublicate());
        })
        return res;
    }*/

    render(sc) {
        this.entries.forEach((it) => it.render(sc, false, it.hover, this.selected, !this.main));
    }
}

class Spline {
    constructor(ctx) {
        this.ctx = ctx;
        this.hovered = [];
        this.points = [];
        this.midIndex = 0;
        this.width = 4;
        this.pad = false;
        this.de = true;
        //this.midPoints=[];
        this.ghostPoint = new Vertex(0, 0);
        this.hover = false;
        this.selected = false;
        this.type = "spline";

    }

    setWidth(wdt) {
        this.width = wdt;
    }

    move(cursor) {
        this.points.forEach((it) => {
            it.move(cursor)
        });
    }

    applyMove() {
        this.points.forEach((it) => {
            it.applyMove()
        });
    }

    add() {
        let lx = this.ghostPoint.x;
        let ly = this.ghostPoint.y;

        if (this.points.length > 0) {
            let pu = this.calcBi(1);
            let px1 = pu[0];
            let py1 = pu[1];
            let np = new Vertex(px1, py1);
            if (!((px1 == lx) && (py1 == ly))) {
                this.points.push(np);
            }
        }

        this.points.push(this.ghostPoint);
        this.ghostPoint = new Vertex(lx, ly);

    }

    isPointHover(sc, cursor) { // возвращаем первую точку под курсором
        let x = cursor.realPosition.x;
        let y = cursor.realPosition.y;
        for (let i = 0; i < this.points.length; i++) {
            let px = this.points[i].x;
            let py = this.points[i].y;
            if (getSelMark(px, py, x, y, sc)) { return this.points[i] };
        }
        return false;
    }

    wasPointHover(sc, cursor) { // возвращаем первую точку до перемещения под курсором
        let x = cursor.startPos.x;
        let y = cursor.startPos.y;
        for (let i = 0; i < this.points.length; i++) {
            let px = this.points[i].x;
            let py = this.points[i].y;
            if (getSelMark(px, py, x, y, sc)) { return this.points[i] };
        }
        return false;
    }

    _hover(sc, x, y) {
        /* for (let i=1; i<this.points.length; i++){
             let px=this.points[i].x;
             let py=this.points[i].y;
             let ex=this.points[i-1].x;
             let ey=this.points[i-1].y;
             if (getSel(px,py,ex,ey,x,y,sc)) {return true};
         }
         return false;    */
        let cs = false;
        for (let i = 0; i < this.points.length; i++) {

            let px = this.points[i].x;
            let py = this.points[i].y;
            if (i > 0) {
                let ex = this.points[i - 1].x;
                let ey = this.points[i - 1].y;
                cs |= getSel(px, py, ex, ey, x, y, sc);
            } else {
                cs |= getSelMark(px, py, x, y, sc);
            }
        }
        return cs;
    }

    isHover(sc, cursor) {
        let x = cursor.realPosition.x;
        let y = cursor.realPosition.y;
        return this._hover(sc, x, y);
    }

    wasHover(sc, cursor) {
        let x = cursor.startPos.x;
        let y = cursor.startPos.y;
        return this._hover(sc, x, y);
    }

    select(sc, cursor) {
        let x = cursor.realPosition.x;
        let y = cursor.realPosition.y;
        let xx = cursor.startPos.x;
        let yy = cursor.startPos.y;
        let cs = false;
        let bx = false;
        for (let i = 0; i < this.points.length; i++) {

            let px = this.points[i].x;
            let py = this.points[i].y;
            if (i > 0) {
                let ex = this.points[i - 1].x;
                let ey = this.points[i - 1].y;
                cs |= getSel(px, py, ex, ey, x, y, sc);
            } else {
                cs |= getSelMark(px, py, x, y, sc);
            }

            if (cursor.cloud) {
                bx |= inBox(x, y, xx, yy, px, py, sc);
            }
            this.hover = cs || bx;
        }
        return this.hover;
    }

    selectMarker(sc, cursor) {
        this.hovered = [];
        for (let i = 0; i < this.points.length; i++) {
            let px = this.points[i].x;
            let py = this.points[i].y;
            let x = cursor.realPosition.x;
            let y = cursor.realPosition.y;
            let xx = cursor.startPos.x;
            let yy = cursor.startPos.y;
            let hov = getSelMark(px, py, x, y, sc) || (inBox(x, y, xx, yy, px, py, sc) && cursor.cloud);
            this.points[i].hover = hov;
            if (hov) { this.hovered.push(this.points[i]); }
        }
    }

    split() {
        var res = []
        for (let i = 0; i < this.points.length; i++) {
            res.push(this.points[i]);
            if ((i == this.midIndex - 1)) {
                var nd = this.getMidle(this.midIndex);
                nd.x = roundToStep(nd.x, app.grid.step);
                nd.y = roundToStep(nd.y, app.grid.step);
                res.push(nd);
            }
        }
        this.points = res;
        return nd;
    }
    isMidle(sc, cursor) {
        for (let i = 1; i < this.points.length; i++) {
            let gm = this.getMidle(i);
            let px = roundToStep(gm.x, app.grid.step)
            let py = roundToStep(gm.y, app.grid.step);
            let x = cursor.realPosition.x;
            let y = cursor.realPosition.y;
            let hov = getSelMark(px, py, x, y, sc)
            if (hov) { this.midIndex = i; return i; }

        }
        return false;
    }

    getMidle(i) {
        //var res=new Spline(this.ctx);

        //(let i=1; i<this.points.length; i++){
        let px = (this.points[i].x + this.points[i].mx);
        let py = (this.points[i].y + this.points[i].my);
        let px1 = (this.points[i - 1].x + this.points[i - 1].mx);
        let py1 = (this.points[i - 1].y + this.points[i - 1].my);
        var vert = new Vertex((px + px1) / 2, (py + py1) / 2);

        return vert;
        //}
        // return res;  
    }

    dublicate() {
        var res = new Spline(this.ctx);
        res.pad = this.pad;
        res.width = this.width;
        this.points.forEach((it) => {
            res.points.push(it.dublicate());
        })
        return res;
    }

    render(sc, gh, hover, selected, noMark) {
        //this.getMidles();
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        var sll = this.selected;
        this.selected |= selected;
        this.ctx.beginPath();
        this.ctx.lineWidth = this.width * sc;
        this.ctx.strokeStyle = "rgb(0,0,0)";
        if (hover) {
            this.ctx.strokeStyle = "rgb(80,0,0)";
        }
        if (this.selected) {
            this.ctx.strokeStyle = "rgb(255,0,0)";
        }
        //to do draw pads upper 
        if (this.pad && this.points[0]) {
            //this.ctx.lineWidth=1;
            this.ctx.beginPath();
            this.ctx.arc((this.points[0].x + this.points[0].mx) * sc, (this.points[0].y + this.points[0].my) * sc, 5 * sc, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(50,100,0)";
            this.ctx.fill();
            // this.ctx.stroke();
            this.ctx.closePath();
            //this.ctx.stroke
            this.ctx.beginPath();
            this.ctx.arc((this.points[0].x + this.points[0].mx) * sc, (this.points[0].y + this.points[0].my) * sc, 1 * sc, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgb(0,0,0)";
            this.ctx.fill();
            //this.ctx.stroke();
            this.ctx.closePath();
            //this.ctx.lineWidth=this.width*sc;
        }
        // if (this.selected){
        //var mids=this.getMidles();
        // this.midPoints.forEach((it)=>{it.render(this.ctx,sc)})
        // }
        for (let i = 0; i < this.points.length; i++) {
            let px = (this.points[i].x + this.points[i].mx) * sc;
            let py = (this.points[i].y + this.points[i].my) * sc;
            //let px=(this.points[i].x)*sc;
            //let py=(this.points[i].y)*sc;
            i == 0 ? this.ctx.moveTo(px, py) : this.ctx.lineTo(px, py);
            /*  if (this.selected&&(!noMark)){
                  this.points[i].render(this.ctx, sc);
                  if (i>0) {
  
                      let a=this.getMidle(i);
                      let nd=this.getMidle(i);
                      nd.x=roundToStep(nd.x,app.grid.step);
                      nd.y=roundToStep(nd.y,app.grid.step);
                      a.hover=nd.isHover(sc,app.cursor);
                      a.render(this.ctx,sc);}
              }*/
        }
        if (gh) {
            if (this.points.length > 0) {
                // let lx=this.points[this.points.length-1].x*sc;
                //let ly=this.points[this.points.length-1].y*sc;
                let px = this.ghostPoint.x * sc;
                let py = this.ghostPoint.y * sc;
                let pu = this.calcBi(sc);
                let px1 = pu[0];
                let py1 = pu[1];
                /*  if ((py-ly)*(px-lx)>0){
                      if (Math.abs(py-ly)<Math.abs(px-lx)){
                          px1=(px)-((py-ly));
                          py1=ly;
                      }else{
                          py1=(py)-((px-lx));
                          px1=lx;   
                      }
                  }else{
                      if (Math.abs(py-ly)<Math.abs(px-lx)){
                          px1=(px)+((py-ly));
                          py1=ly;
                      }else{
                          py1=(py)+((px-lx));
                          px1=lx;   
                      }    
                  }
                  */
                this.ctx.lineTo(px1, py1);
                this.ctx.lineTo(px, py);
            }

        }
        this.ctx.stroke();
        for (let i = 0; i < this.points.length; i++) {
            if (this.selected && (!noMark)) {
                this.points[i].render(this.ctx, sc);
                if (i > 0) {

                    let a = this.getMidle(i);
                    let nd = this.getMidle(i);
                    nd.x = roundToStep(nd.x, app.grid.step);
                    nd.y = roundToStep(nd.y, app.grid.step);
                    a.hover = nd.isHover(sc, app.cursor);
                    a.render(this.ctx, sc, true);
                }
            }
        }

        this.selected = sll;
        this.ctx.lineWidth = 1;
    }

    calcBi(sc) {
        let px = this.ghostPoint.x * sc;
        let py = this.ghostPoint.y * sc;
        let lx = this.points[this.points.length - 1].x * sc;
        let ly = this.points[this.points.length - 1].y * sc;
        let px1;
        let py1;
        if ((py - ly) * (px - lx) > 0) {
            if (Math.abs(py - ly) < Math.abs(px - lx)) {
                px1 = (px) - ((py - ly));
                py1 = ly;
            } else {
                py1 = (py) - ((px - lx));
                px1 = lx;
            }
        } else {
            if (Math.abs(py - ly) < Math.abs(px - lx)) {
                px1 = (px) + ((py - ly));
                py1 = ly;
            } else {
                py1 = (py) + ((px - lx));
                px1 = lx;
            }
        }
        return [px1, py1];
    }

}

class Sprite {
    constructor() {
        this.point = new Vertex();
        this.type = "sprite";
    }
}

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.mx = 0;
        this.my = 0;
        this.hover = false;
        this.selected = false;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.mx = 0;
        this.my = 0;
    }

    move(cursor) {
        this.mx = cursor.gridPosition.x - cursor.gridStartPos.x;
        this.my = cursor.gridPosition.y - cursor.gridStartPos.y;
    }

    applyMove() {
        this.x += this.mx;
        this.y += this.my;
        this.my = 0;
        this.mx = 0;
    }

    isHover(sc, cursor) {
        let x = cursor.realPosition.x;
        let y = cursor.realPosition.y;
        return getSelMark(this.x, this.y, x, y, sc);
    }

    wasHover(sc, cursor) {
        let x = cursor.startPos.x;
        let y = cursor.startPos.y;
        return getSelMark(this.x, this.y, x, y, sc);
    }

    dublicate() {
        var res = new Vertex(this.x, this.y);
        return res;
    }

    render(ctx, sc, rd) {
        ctx.fillStyle = "rgb(0,0,0)";
        if (this.hover) {
            ctx.fillStyle = "rgb(200,150,0)";
        }
        if (this.selected) {
            ctx.fillStyle = "rgb(0,255,0)";
        }
        //ctx.fillRect(this.x*sc-5,this.y*sc-5,5,5);
        if (!rd) {
            ctx.fillRect((this.mx + this.x) * sc - 3, (this.my + this.y) * sc - 3, 6, 6);
        }
        else {
            if (this.hover) {
                ctx.fillStyle = "rgb(0,0,150)";
            } else { ctx.fillStyle = "rgb(0,0,80)"; }
            ctx.beginPath();
            ctx.arc(this.x * sc, this.y * sc, 3, 0, Math.PI * 2);

            ctx.fill();
            //this.ctx.stroke();
            ctx.closePath();
        }
    }

}



////////////UTILS//////////////
function roundToStep(x, step) {
    return ((x % step) < step / 2) ? x - x % step : (x + step) - (x + step) % step;
}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function getEq(x1, y1, x2, y2) {
    res = [0, 0];
    res[0] = (y1 - y2) / (x1 - x2);
    res[1] = y1 - res[0] * x1;
    return res;
}

function getSel(x1, y1, x2, y2, x3, y3, sc) {
    var kx = getEq(x1, y1, x2, y2);
    var a = kx[0];
    var b = -1;
    var c = kx[1];
    var dist = Math.abs(a * x3 + b * y3 + c) / (Math.sqrt(a * a + b * b));
    if (Math.abs(a) > 100000) { dist = 0; }
    let n = 5 / sc;
    var bou = ((x3 <= x1 + n) && (x3 > x2 - n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 <= x1 + n) && (x3 > x2 - n) && (y3 > y1 - n) && (y3 <= y2 + n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 > y1 - n) && (y3 <= y2 + n));
    return (((dist < (10 / sc)) && bou) || getSelMark(x1, y1, x3, y3, sc) || getSelMark(x2, y2, x3, y3, sc));
}

function inBox(x1, y1, x2, y2, x3, y3) {
    let n = 0;
    var bou = ((x3 <= x1 + n) && (x3 > x2 - n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 <= x1 + n) && (x3 > x2 - n) && (y3 > y1 - n) && (y3 <= y2 + n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 > y1 - n) && (y3 <= y2 + n));
    return bou;
}

function solveLines(x1, y1, x2, y2, x3, y3, x4, y4, sc) {
    var kx = getEq(x1, y1, x2, y2);
    var k1 = kx[0];
    var b1 = kx[1];
    var kx = getEq(x3, y3, x4, y4);
    var k2 = kx[0];
    var b2 = kx[1];
    var x = (b2 - b1) / (k - K1);
    var y = k1 * x + b1;
    if (inBox(x1, y1, x2, y2, x, y)) {
        var res = [x, y];
    }
    else { res = false }
    return res;
}

function getSelMark(x1, y1, x3, y3, sc) {
    return (getDist(x1, y1, x3, y3) < (10 / sc));
}

//downloadImage(canvas.toDataURL(), filename);
function downloadImage(data, filename) {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
};