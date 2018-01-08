// 立即执行函数是为了变量不用其他冲突，合并的时候也会减少报错
(function (doc, win) {
    var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
    var clientWidth = docEl.clientWidth;
    console.log('the client height is ',docEl.clientHeight);
    clientHeight = docEl.clientHeight;
    if (!clientWidth) return;
    clientWidth=clientWidth>1033?1033:clientWidth;
    var rem = 100 * (clientWidth / 750);   //在宽度等于750px，1rem等于10px 当宽度增大的时候，随宽度增大
    docEl.style.fontSize =  rem + 'px';
    };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
    //初始化参数
    var id = 0;
    var frame = 60; //10ms刷新一次动画
    var position = function(){       //距离左边距20% 右边距 10%的范围内
        return Math.ceil(20+Math.random()*70)+"%";
    };
    var duration = 15; //游戏时长  15s
    var coinMetaData = {
        "0.5":0.5,
        "0.8":0.8,
        "1":1
    }

    //红唇有五种随机角度，大小有small medium large
    function Redlip(style,size,v,a) {
        this.style = style;
        this.size = size;
        this.v = v;
        this.a = a;
        this.position = position();
        this.id = id++;
        this.time = 0;
        this.template ='<img src="img/cloud.png" class="cloud">'+
            ' <img src="img/redlip0.png" class="iconandredlip">';
    };

    Redlip.prototype.createNode = function () {
        var container = document.querySelector(".game");
        var divElement=document.createElement("div");
        divElement.style.left = this.position;
        divElement.setAttribute("id","coin"+this.id);
        divElement.className='redlip lip'+this.style+' '+ this.size;
        divElement.innerHTML=this.template;
        container.appendChild(divElement);
        var _self = this;
        var timer = setInterval(function () {
            _self.time+=frame;
            var length = ((_self.a*_self.time*_self.time)/2+_self.v*_self.time)/50000;
            var div = document.querySelector("#"+"coin"+_self.id);
            if(length>clientHeight){
                var Game = document.querySelector(".game");
                Game.removeChild(div);
                clearInterval(timer);
            }else{
                div.style.top = length+'px';
            }
        },frame);
    };

    //金币有五种随机角度，大小有small medium large  金币面值有coinMetaData中的几种
    function Coin(style,size,v,a,num) {
        this.style = style;
        this.size = size;
        this.v = v;
        this.a = a;
        this.position = position();
        this.id = id++;
        this.time = 0;
        this.num = num;
        this.template ='<img src="img/cloud.png" class="cloud">'+
            '<img src="img/'+this.num+'.png" class="iconandredlip">'
    };

    Coin.prototype.createNode = function () {
        var container = document.querySelector(".game");
        var divElement=document.createElement("div");
        divElement.style.left = this.position;
        divElement.setAttribute("id","coin"+this.id);
        divElement.className='icon icon'+this.style+' '+ this.size;
        divElement.innerHTML=this.template;
        container.appendChild(divElement);
        var _self = this;
        console.log("this id =",this.id,_self);
        var timer = setInterval(function () {
            _self.time+=frame;
            var length = ((_self.a*_self.time*_self.time)/2+_self.v*_self.time)/50000;
            var div = document.querySelector("#"+"coin"+_self.id);
            if(length>clientHeight){
                var Game = document.querySelector(".game");
                Game.removeChild(div);
                clearInterval(timer);
            }else{
                div.style.top = length+'px';
            }
        },frame);
    };
    //试着创建了几个红唇
    // new Redlip(2,'large',2,1).createNode();
    // new Redlip(1,'small',1,2).createNode();
    // new Coin(3,'medium',1.5,0.5,coinMetaData[0.5]).createNode();
})(document, window);