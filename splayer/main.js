document.addEventListener('DOMContentLoaded', onReady);
document.addEventListener('mousemove', move);
document.addEventListener('mousedown', down);
document.addEventListener('mouseup', up);
document.addEventListener('keydown', keyd);
document.addEventListener('keyup', key);
var gWd;
var gWindow;
function getDist(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function getEq(x1,y1,x2,y2){
    res=[0,0];
    res[0]=(y1-y2)/(x1-x2);
    res[1]=y1-res[0]*x1;
    return res;
}
function getSel(x1,y1,x2,y2,x3,y3){
    var kx=getEq(x1,y1,x2,y2);
    var a=kx[0];
    var b=-1;
    var c=kx[1];
    var dist=Math.abs(a*x3+b*y3+c)/(Math.sqrt(a*a+b*b));
   /* var bou=((x3<=x1)&&(x3>x2)&&(y3<=y1)&&(y3>y2)||
            (x3>x1)&&(x3<=x2)&&(y3<=y1)&&(y3>y2)||
            (x3<=x1)&&(x3>x2)&&(y3>y1)&&(y3<=y2)||
            (x3>x1)&&(x3<=x2)&&(y3>y1)&&(y3<=y2))*/
            if (Math.abs(a)>100000){dist=0;}
            let n=5/sc;
            var bou=((x3<=x1+n)&&(x3>x2-n)&&(y3<=y1+n)&&(y3>y2-n)||
            (x3>x1-n)&&(x3<=x2+n)&&(y3<=y1+n)&&(y3>y2-n)||
            (x3<=x1+n)&&(x3>x2-n)&&(y3>y1-n)&&(y3<=y2+n)||
            (x3>x1-n)&&(x3<=x2+n)&&(y3>y1-n)&&(y3<=y2+n))
    return (((dist<(10/sc))&&bou)|| getSelMark(x1,y1,x3,y3)|| getSelMark(x2,y2,x3,y3));
   // return (getDist(x1,y1,x3,y3)<10||getDist(x2,y2,x3,y3)<10)
}
function getSelMark(x1,y1,x3,y3){
    return (getDist(x1,y1,x3,y3)<(10/sc)); 
}
function clear(ctx){
    ctx.fillStyle = 'rgb(50, 50, 50)';
    ctx.fillRect(0, 0, gWindow.canvas.width, gWindow.canvas.height);
}
class App{
    constructor(){
        this.grid=new grid();
        this.board=new board();
        this.tool=1;
        this.scale=1;
        this.render();
    }
    selTool(tool){
        this.tool=tool;
    }
    render(){
        var curToolIco=document.getElementById("tool"+this.tool);
        var toolIcons=document.querySelectorAll(".sidebar_item");
        toolIcons.forEach((it)=>it.style="");
        curToolIco.style="background-color:rgb(80,80,80)";
    }
}

class grid{
    constructor (){
        this.step=8;
        this.scal=1;
    }
    render(ctx){
        ctx.beginPath();
        ctx.strokeStyle="rgb(90,90,90";
        for (let i=0;i<ctx.canvas.width;i+=this.step*sc){
            ctx.moveTo(i,0);
            ctx.lineTo(i,ctx.canvas.height);
        }
        for (let i=0;i<ctx.canvas.height;i+=this.step*sc){
            ctx.moveTo(0,i);
            ctx.lineTo(ctx.canvas.width,i);
        }
        ctx.stroke();

    }
}
class board{
    constructor (){
        this.entries=[];
        this.mdp=false;
        this.entr=false;
        this.ofs=false;
        this.ldx=0;
        this.ldy=0;
    }
    
    getSelected(){
        var sel;
        brd.entries.forEach((it)=>{if (it.slc==true){sel=it;}});
        return sel;   
    }

    moves(cx,cy){
        if (this.mdp){
            this.mdp[0]=cx;
            this.mdp[1]=cy;
        } else{
    
            if (this.entr){
                this.ofs=[cx-this.ldx,cy-this.ldy];    
            }
        }
    }
    resetSlc(){
        for(let i=0;i<this.entries.length;i++){
            this.entries[i].slc=false;
            this.entries[i].markd=-1;
            this.mdp=false;
            this.entr=false;
 
        }    
    }
    setSlc(){
        for(let i=0;i<this.entries.length;i++){
            this.entries[i].slc=this.entries[i].sel;
            if (this.entries[i].sel==true){
                this.entries[i].markd=this.entries[i].mark;
                this.mdp=this.entries[i].points[this.entries[i].markd];
                this.entr=this.entries[i];
                this.cur=this.entries[i];
                return this.entries[i];
            }
        }    
    }
    render (ctx,cup){
        for(let i=0;i<this.entries.length;i++){
            this.entries[i].render(ctx,false,cup,false);
        }
        if (this.entr){this.entr.render(ctx,false,cup,this.ofs);}
    }
}

class spline{
    constructor (){
        this.points=[];
        this.slc=false;
        this.sel=false;
        this.mark=-1;
        this.markd=-1;
        this.divmark=-1;
        this.divmarkd=-1;
        this.sc=1;
    }
    split (){
        if (this.divmark!=-1){
            let zv=this.divmark;
            let pn=[];
            for (let i=0;i<this.points.length;i++){
                
                if (i==zv){
                    pn.push([(this.points[i][0]+this.points[i-1][0])/2,(this.points[i][1]+this.points[i-1][1])/2]);
                }
                pn.push(this.points[i])
            }
            this.points=pn;
            return true;
        }
        return false;
    }

    fin () {
        var a=new spline();
        a.points=this.points.concat([]);
        return a;
    }
    check (cup){
        this.sel=false;
        for(let i=1;i<this.points.length;i++){
            if (getSel(this.points[i][0],this.points[i][1],this.points[i-1][0],this.points[i-1][1],cup[0],cup[1])){
                this.sel=true;
                break;
            }
        }
    }
    checkMark(cup){
        this.mark=-1;
        for(let i=0;i<this.points.length;i++){
            if (getSelMark(this.points[i][0],this.points[i][1],cup[0],cup[1])){
                if (this.slc==true){this.mark=i;}
                break;
            }   
        }
        
    }
    checkDivMark(cup){
        this.divmark=-1;
        for(let i=1;i<this.points.length;i++){
            if (getSelMark((this.points[i][0]+this.points[i-1][0])/2,(this.points[i][1]+this.points[i-1][1])/2,cup[0],cup[1])){
                if (this.slc==true){this.divmark=i;}
                break;
            }   
        }
        
    }
    checkAll(cpp){
        var cup=[cpp[0]/sc,cpp[1]/sc];
       // gWindow.fillRect(cup[0]-5,cup[1]-5,5,5);
        this.check(cup);
        this.checkMark(cup);
        this.checkDivMark(cup);
        if (this.mark!=-1) {this.divmark=-1;}
    }
    drawMarker(ctx, p, sel){
        if (sel){ctx.fillStyle="rgb(0,255,0)";}
        else {ctx.fillStyle="rgb(0,0,0)";}
        ctx.fillRect(p[0]-5,p[1]-5,5,5);
    }
    render (ctx,cp,cup,ofs){
        //if (!sc){sc=this.sc};
        //sc=this.sc;
        //sc=1;
        //ctx.fillStyle = 'rgb(50, 50, 50)';
        //ctx.fillRect(0, 0, gWindow.canvas.width-1, gWindow.canvas.height-1);
        //splitPoints(this);
        if (!ofs){ofs=[0,0];}
        this.checkAll(cup);
        if (this.points.length>0){
            
            if (this.slc==true) {
                ctx.strokeStyle="rgb(255,0,0)";
                for(let i=0;i<this.points.length;i++){
                    let px=(this.points[i][0]+ofs[0])*sc;
                    let py=(this.points[i][1]+ofs[1])*sc;

                    if (i==this.mark){
                        
                        this.drawMarker(ctx,[px,py],true);
                    }
                    else{
                        this.drawMarker(ctx,[px,py],false);
                    }    
                }
            } else {
                if (this.sel==true){
                ctx.strokeStyle="rgb(100,0,0)";    
                }else{
                ctx.strokeStyle="rgb(0,0,0)";
                }
            }
            ctx.beginPath(); 
            ctx.moveTo((this.points[0][0]+ofs[0])*sc, (this.points[0][1]+ofs[1])*sc); 
            for(let i=1;i<this.points.length;i++){
                let px=(this.points[i][0]+ofs[0])*sc;
                let py=(this.points[i][1]+ofs[1])*sc;
                ctx.lineTo(px,py);  // Рисует линию до точки (150, 100)
                //var eq=getEq(this.points[i][0],this.points[i][1],this.points[i-1][0],this.points[i-1][1])
                ctx.fillStyle="rgb(0,0,0)";
                //if (getSelMark(this.points[i][0],this.points[i][1],cup[0],cup[1])){
                if (i==this.divmark){
                    let px=sc*(this.points[i][0]+this.points[i-1][0])/2;
                    let py=sc*(this.points[i][1]+this.points[i-1][1])/2;
                    if (!this.sel){
                    // this.drawMarker(ctx,[px,py],false);   
                    }
                    else{
                        this.drawMarker(ctx,[px,py],true);    
                    }
                    //ctx.fillRect(-6,-6,6,6);
                }
              /*  for (let j=this.points[i-1][0];j<this.points[i][0];j++){
                ctx.fillRect(j,eq[0]*j+eq[1],3,3);
                }*/
            }
            if (cp!=false){
            //var lp=this.points[this.points.length-1];
            ctx.lineTo(cp[0], cp[1]);
            //if ((cp[1]-lp[1])*(cp[0]-lp[0])>0){
           // ctx.lineTo(lp[0], cp[1]-(cp[0]-lp[0]));
            //} else {
            //ctx.lineTo(cp[0]-(cp[1]-lp[1]), lp[1]);  
             
            //}
            ctx.lineTo(cp[0], cp[1]); 
            }
            ctx.stroke(); 
        }
    }
}
var brd=new board();
var spl=new spline();
var grd=new grid();
var app=new App();
var sc=2;
function scale(scn){
    scn=Math.trunc(scn);
    if (scn>=1){
    var k=scn/sc;
    sc=scn;
    gWd.width=gWd.width*k;
    gWd.height=gWd.height*k;
    render(gWindow);
    }
}
function onReady(){
    gWd=document.getElementById("wnd");
	gWindow=gWd.getContext('2d');
	render(gWindow);
}   
function render(gWindow,c){
    if (!c) {c=[0,0,0,0]}
    var cx=c[0];
    var cy=c[1];
    clear(gWindow);
    grd.render(gWindow);
    brd.render(gWindow,[c[2]*sc,c[3]*sc]);
    spl.render(gWindow,[cx*sc,cy*sc],[c[2],c[3]]);
} 
function getC(e,gr){
    
    var ob=document.querySelector(".main");

    var cx = (e.pageX - gWd.offsetLeft)+ob.scrollLeft;
    var cy = (e.pageY - gWd.offsetTop)+ob.scrollTop;
    var clx=cx;
    var cly=cy;
    if (!gr){
    cx=cx-cx%(grd.step*sc);
    cy=cy-cy%(grd.step*sc);
    }
    return [cx/sc,cy/sc,clx/sc,cly/sc,e.pageX - gWd.offsetLeft,e.pageY - gWd.offsetTop];
}


function move(e){
    
    var c=getC(e);
    var cx=c[0];
    var cy=c[1];

    

    brd.moves(cx,cy);
    render(gWindow,c);
    if (brd.sele){
    gWindow.beginPath();
    gWindow.strokeStyle="rgb(255,0,0)";
    gWindow.moveTo(brd.ldx*sc,brd.ldy*sc);
    gWindow.lineTo(c[4],brd.ldy*sc);
    gWindow.lineTo(c[4],c[5]);
    gWindow.lineTo(brd.ldx*sc,c[5]);
    gWindow.lineTo(brd.ldx*sc,brd.ldy*sc);
    gWindow.stroke();  
    }  
}
function down(e){
    
    var c=getC(e);
    var cx=c[0];
    var cy=c[1];
    
    if ((c[4]<0)||(c[5]<0)||(cx>gWd.width)||(cy>gWd.height)) {return false;}
    
    //if (!app.ctr){brd.resetSlc();}
    brd.resetSlc();
    
    
    if (e.buttons==1){
        //if (app.tool==1){
            spl.points.push([cx,cy]);
        //}
    }
    if ((e.buttons==2)||((app.tool==0)&&(e.buttons==1))){
        //brd.entries.push(spl);
        
        brd.ldx=cx;
        brd.ldy=cy;
        brd.ofs=[0,0];


        if (spl.points.length>1){
            brd.entries.push(spl.fin());
        }
        spl=new spline();
        brd.setSlc();


        if (brd.entr){
                let zv=brd.entr.divmark;
                if (brd.entr.split()){
                 brd.mdp=brd.entr.points[zv];
                }
        } else {
            brd.sele=true;
        }
    }
    render(gWindow,c);
    
    //}    
}
function mergePoints(el){
    if (!el){return false;}
    if (el.points.length>1){
    var pn=[el.points[0]];
    for( let i=1;i<el.points.length;i++){
        if (!(getDist(el.points[i][0],el.points[i][1],el.points[i-1][0],el.points[i-1][1])<0.00001)){
            pn.push(el.points[i]);
        }    
    } 
    el.points=pn;  
    }
}

function up(e){
    var c=getC(e);
    var cx=c[0];
    var cy=c[1];
    brd.sele=false;
    brd.mdp=false;
   /* if (brd.entr){
    for (let i=0;i<brd.entr.points.length;i++){
        brd.entr.points[i][0]=brd.entr.points[i][0]+brd.ofs[0];
        brd.entr.points[i][1]=brd.entr.points[i][1]+brd.ofs[1];
    }
    }*/

    
    //brd.entries.forEach((it)=>{if (it.slc==true){mergePoints(it);}});  
    var it=brd.getSelected();
    if (it){
    mergePoints(it);
    for (let i=0;i<it.points.length;i++){
        it.points[i][0]=it.points[i][0]+brd.ofs[0];
        it.points[i][1]=it.points[i][1]+brd.ofs[1];
    }
    }
    brd.entr=false;
    render(gWindow,c);
}
function keyd(e){
    if (e.key=="Control"){
        app.ctr=true;
    }    
}
function key(e){
    console.log(e.key);
    if (e.key=="Control"){
        app.ctr=false;
    }
    if (e.key=="Delete"){
        var it=brd.getSelected();
        if (it){
            it.points=[];
            it.slc=false;
        }
    }
    render(gWindow);
}