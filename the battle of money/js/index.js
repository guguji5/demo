// 立即执行函数是为了变量不用其他冲突，合并的时候也会减少报错
(function (doc, win) {
    var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
    var clientWidth = docEl.clientWidth;
    console.log(docEl.clientHeight);
    if (!clientWidth) return;
    clientWidth=clientWidth>1033?1033:clientWidth;
    var rem = 100 * (clientWidth / 750);   //在宽度等于750px，1rem等于10px 当宽度增大的时候，随宽度增大
    docEl.style.fontSize =  rem + 'px';
    };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
    var id = 0;


    //红唇有五种随机角度，大小有small medium large
    function Redlip(style,size,v,a,position) {
        this.style = style;
        this.size = size;
        this.v = v;
        this.a = a;
        this.position = position;
        this.id = id++;
        this.time = 0
        var template ='<img src="img/cloud.png" class="cloud">'+
            ' <img src="img/redlip0.png" class="iconandredlip">';

        this.createNode = function () {
            var container = document.querySelector(".game");
            var divElement=document.createElement("div");
            divElement.style.left = this.position;
            divElement.setAttribute("id",this.id);
            divElement.className='redlip lip'+this.style+' '+ this.size;
            divElement.innerHTML=template;
            container.appendChild(divElement);

            var timer = setInterval(function (id) {
                this.time+=1000;
                // var length = (this.a*this.time*this.time)/2+this.v*this,time;
                // var div = document.querySelector("#"+this.id);
                console.log(id)
            }(this.id),1000)
        }
    }

    function createRedlip(style,size) {
        var random = Math.ceil(20+Math.random()*70)+"%";
        var redlip = new Redlip(style,size,1,1,random);
        redlip.createNode();
    }

    createRedlip(1,'small');
    createRedlip(2,'large');

})(document, window);