// 立即执行函数是为了变量不用其他冲突，合并的时候也会减少报错
(function (doc, win) {
    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }
    var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
        var clientWidth = docEl.clientWidth;
        // console.log('the client height is ',docEl.clientHeight);
        clientHeight = docEl.clientHeight;
        if (!clientWidth) return;
        clientWidth=clientWidth>1033?1033:clientWidth;
        rem = 100 * (clientWidth / 750);   //在宽度等于750px，1rem等于100px 当宽度增大的时候，随宽度增大
        docEl.style.fontSize =  rem + 'px';
    };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);

    //初始化参数
    var id = 0;
    var frame = 30; //30ms刷新一次动画
    var position = function(w){       //距离左边距20% 右边距 10%的范围内 参数w为红唇或者kiss的宽度，需要减去宽度的一半。
        if(w){
            return Math.ceil(25+Math.random()*65-w*100/2/750)+"%";
        }else{
            return Math.ceil(25+Math.random()*65)+"%";
        }
    };
    var duration = 15; //游戏时长  10s   如果需要修改，请一并修改css的 drop 动画
    total = 0;//收货的金额
    var killTime =2; //红唇显示的时间 单位是秒
    var coinMetaData = {
        "0.01":0.01,
        "0.1":0.1,
        "0.2":0.2,
        "0.5":0.5,
        "0.8":0.8,
        "1":1
    };
    var acceleratedspeed=0.5;  //加速度，越大下落的越快
    var ratio = 10000;  //配速   越大，下落的越慢
    var loginUrl = "http://www.baidu.com";
    var $ = function(selector){
        return document.querySelectorAll(selector);
    }
    var isRadio = true;
    var isLogged =false;
    var $get = function (url,f) {
        var httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
            console.log('Giving up :( Cannot create an XMLHTTP instance');
            return false;
        }
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    f(JSON.parse(httpRequest.responseText));
                } else {
                    console.log('There was a problem with the request to',url);
                }
            }
        };
        httpRequest.open('GET', url,true);
        httpRequest.send();
    };

    //红唇有五种随机角度，大小有small medium large
    function Redlip(style,size,v,a) {
        this.style = style;
        this.size = size;
        this.v = v;
        this.a = a;
        switch(this.size){
            case "large":
                this.position = position(175);
                break;
            case "medium":
                this.position = position(163);
                break;
            case "small":
                this.position = position(136);
                break;
            default:
                this.position = position();
        }
        this.id = id++;
        this.time = 0;
        this.template ='<img src="img/cloud.png" class="cloud">'+
            ' <img src="img/redlip.png" class="iconandredlip">';
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
            var length = ((_self.a*_self.time*_self.time)/2+_self.v*_self.time)/ratio-1.75*rem;
            var div = document.querySelector("#"+"coin"+_self.id);
            if(div){
                if(length>clientHeight){
                    var Game = document.querySelector(".game");
                    Game.removeChild(div);
                    clearInterval(timer);
                }else{
                    div.style.top = length+'px';
                }
            }else{
                clearInterval(timer);
            }

        },frame);
    };

    //金币有五种随机角度，大小有small medium large  金币面值有coinMetaData中的几种
    function Coin(style,size,v,a,num) {
        this.style = style;
        this.size = size;
        this.v = v;
        this.a = a;
        switch(this.size){
            case "large":
                this.position = position(175);
                break;
            case "medium":
                this.position = position(163);
                break;
            case "small":
                this.position = position(136);
                break;
            default:
                this.position = position();
        }
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
        var timer = setInterval(function () {
            _self.time+=frame;
            var length = ((_self.a*_self.time*_self.time)/2+_self.v*_self.time)/ratio-1.75*rem;
            var div = document.querySelector("#"+"coin"+_self.id);
            if(div){
                if(length>clientHeight){
                    var Game = document.querySelector(".game");
                    Game.removeChild(div);
                    clearInterval(timer);
                }else{
                    div.style.top = length+'px';
                }
            }else{
                clearInterval(timer);
            }

        },frame);
    };

    //点击登陆后跳转到登录页
    $('.login')[0].onclick=function () {
        window.location.href=loginUrl;
    };
    //点击出现规则页面
    $('.countDown .rule')[0].onclick=function () {
      $('.mask')[0].show();
      $('.rules')[0].show();
    };
    $('.radio')[0].onclick=function () {
        isRadio = !isRadio;
        if(isRadio){
            $('.radio')[0].className = "radio open";
        }else{
            $('.radio')[0].className = "radio shut";
        }
    }
    $('.rules .close')[0].onclick=function () {
        $('.mask')[0].hide();
        $('.rules')[0].hide();
    };
    $get("http://apitest.ddrmb.com:8019/v1/activity/coins_fight/islogin?phone=18710149987&token=2017-12-27-9155878111",function (data) {
        //已登陆,如未登陆则按钮依然不显示
        if(data.content.isLogged===1){
            $('.login')[0].style.display = "none";
            isLogged = true;
        }
        //在活动时间内
        if(data.content.remainingTime>0){
            randerCountDown(data.content.remainingTime)
        }else if(data.content.remainingTime=="-1"){
            //未在活动时间内
            $("#countdown span")[0].innerText = "00";
            $("#countdown span")[1].innerText = "00";
            $("#countdown span")[2].innerText = "-1";
        }else if(data.content.remainingTime==0){
            //当倒计时微0时，不自动开始
            $("#countdown span")[0].innerText = "00";
            $("#countdown span")[1].innerText = "00";
            $("#countdown span")[2].innerText = "00";
        }
    })
    //倒计时页面倒计时计算时间
    function randerCountDown(ss) {
        var h = parseInt(ss/3600);
        var m = parseInt(ss / 60 % 60);
        var s = parseInt(ss % 60);
        $("#countdown span")[0].innerText = h;
        $("#countdown span")[1].innerText = m;
        $("#countdown span")[2].innerText = s;
        if(ss ===0){
            if(isLogged){
                //如果登陆了，就请求剧本接口。
                getCoinList();
                setTimeout(function () {
                    document.removeEventListener('click',lipAndKillClick);
                    $('.congratulations .close')[0].onclick = function () {
                        // $('.congratulations')[0].hide();
                        // $('.mask')[0].hide();
                        window.location.replace(location.href);
                    }
                    $('.noReceipt')[0].onclick=function () {
                        window.location.replace(location.href);
                    }
                    $('.game')[0].hide();
                    $('.mask')[0].show();
                    if(total>0){
                        $('b')[0].innerText = total;
                        $('.description')[0].innerText = total+"元现金红包";
                        $('.congratulations')[0].show();
                        $get("http://apitest.ddrmb.com:8019/v1/activity/coins_fight/handle?phone=18710149987&token=2017-12-27-9155878111                            &value="+total,function (data) {
                            if(data.content.state ===1 && data.content.money===total){
                                alert('恭喜您获得'+total+'元现金红包')
                            }else{
                                alert(data.desc);
                            }
                        })
                    }else{
                        $('.noReceipt')[0].show();
                    }
                    if(isRadio){
                        $('#music')[0].pause();
                    }
                },duration*1000)
            }
            return;
        };
        setTimeout(function () {
            randerCountDown(--ss)
        },1000)

    }
    //倒计时结束时获取金币序列
    function getCoinList() {
        $('.countDown')[0].hide();
        $('.game')[0].show();
        //倒计时开始
        if(isRadio){
            $('#music')[0].play();
        };
        document.addEventListener('click',lipAndKillClick);
        $get("http://apitest.ddrmb.com:8019/v1/activity/coins_fight/data?phone=18710149987&token=2017-12-27-9155878111",function (data) {
            if(data.content.isLogged ===1 && data.content.remainingTime===0 && data.content.xl){
                var list = data.content.xl;
                list.forEach(function(value,key){
                    if(value.number ===0){
                        var size = ['small','medium','large'];
                        var ran = Math.floor(Math.random()*3);
                        var style = [1,2,3,4,5];
                        var ran1 = Math.floor(Math.random()*5);
                        setTimeout(function () {
                            new Redlip(style[ran1],size[ran],value.speed,acceleratedspeed).createNode();
                        },value.showTime)
                    }else{
                        var size = ['small','medium','large'];
                        var ran = Math.floor(Math.random()*3);
                        var style = [1,2,3,4,5];
                        var ran1 = Math.floor(Math.random()*5);
                        setTimeout(function () {
                            new Coin(style[ran1],size[1],value.speed,acceleratedspeed,coinMetaData[value.number]).createNode();
                        },value.showTime)
                    }
                })

            }else{
                alert(data.desc,'打开console看log');
                console.log(data);
            }
        })

        // new Redlip(2,'large',2,1).createNode();
        // new Redlip(1,'small',1,2).createNode();
        // new Coin(3,'small',1.5,0.5,coinMetaData[0.5]).createNode();
        //
        // setTimeout(function () {
        //     new Redlip(4,'small',2,2).createNode();
        //     new Coin(5,'small',1600,0,coinMetaData[0.8]).createNode();
        // },5000)
        //
        // setTimeout(function () {
        //     new Redlip(3,'medium',2.5,2).createNode();
        //     new Coin(1,'small',1,1,coinMetaData[1]).createNode();
        // },3000)


    }
    //点击红唇或者金币的事件
    function lipAndKillClick(event){
        var targetDom = event.target;
        console.log(targetDom.parentElement.offsetLeft,targetDom.parentElement.offsetTop,targetDom.parentElement.offsetWidth)
        var imgSrc = targetDom.getAttribute('src');
        console.log(imgSrc);
        switch(imgSrc){
            case "img/redlip.png":
                $('.mask')[0].show();
                $('.kiss')[0].show();
                setTimeout(function () {
                    $('.mask')[0].hide();
                    $('.kiss')[0].hide();
                },killTime*1000)
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/0.01.png":
                addTotalValue(0.01);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/0.1.png":
                addTotalValue(0.1);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/0.2.png":
                addTotalValue(0.2);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/0.5.png":
                addTotalValue(0.5);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/0.8.png":
                addTotalValue(0.8);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            case "img/1.png":
                addTotalValue(0.8);
                coinEffect(targetDom.parentElement.offsetTop,targetDom.parentElement.offsetLeft);
                $('.game')[0].removeChild(targetDom.parentElement);
                break;
            default:
                return;
        }
    }
    function coinEffect(top,left) {
        var dom = document.createElement("div");
        var container = document.querySelector(".game");
        dom.className="coinEffect";
        dom.style.position = "absolute";
        dom.style.width = 0.55*rem+'px';
        dom.style.height = 0.55*rem+'px';
        dom.style.background = "url(img/coin.png) no-repeat 0 0";
        dom.style.backgroundSize = "cover";
        dom.style.animationDuration = "1.5s";
        dom.style.animationFillMode = "forwards";
        dom.style.animationName = "fly";
        container.appendChild(dom);
        var rule;
        var ss = document.styleSheets;
        for (var i = 0; i < ss.length; ++i) {
            if(ss[i].cssRules){//外链css好像有问题，必须用内联的
                for (var x = 0; x < ss[i].cssRules.length; ++x) {
                    rule = ss[i].cssRules[x];
                    if (rule.name == "fly" && rule.type
                        == CSSRule.KEYFRAMES_RULE) {
                        cssRule = rule;
                    }
                }
            }

        }
        cssRule.deleteRule("0");
        cssRule.deleteRule("1");
        cssRule.appendRule("0% { top: "+top*0.01+"rem;left:"+left*0.01+"rem;transform:  scale(2)}");
        cssRule.appendRule("100% { top:0.29rem;left:0.14rem;transform:  scale(1) }");

    }
    //game页面给左上角游戏总额赋值；
    function addTotalValue(v) {
        if(v){
            var temp =total+v;
            total=Math.round(temp* 100)/100 ;
            $('.game p span')[0].innerText = total;
        }
    }

    Object.prototype.show = function () {
        this.style.display = "block";
    };
    Object.prototype.hide = function () {
        this.style.display = "none";
    }
})(document, window);