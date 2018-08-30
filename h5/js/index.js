(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            clientHeight = docEl.clientHeight;
            if (!clientWidth) return;
            clientWidth=clientWidth>1033?1033:clientWidth;
            rem = 100 * (clientWidth / 750);   //在宽度等于750px，1rem等于100px 当宽度增大的时候，随宽度增大
            docEl.style.fontSize =  rem + 'px';
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
    
})(document, window);
function urlSearchParams(url){
    var result = {};
    var reg = /[?|&][\w=]+/g;
    var arr = url.match(reg);
    if(arr){
        for(var item of arr){
            var reg1 = /[^?=&]+/g;
            var itemArr = item.match(reg1);
            if(itemArr.length ===2){
                result[itemArr[0]] = itemArr[1]
            }
        }
    }
    
    return result;
}