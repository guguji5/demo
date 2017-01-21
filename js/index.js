// 立即执行函数是为了变量不用其他冲突，合并的时候也会减少报错
(function (doc, win) {
	var docEl = doc.documentElement,
	resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
	recalc = function () {
	var clientWidth = docEl.clientWidth;
	if (!clientWidth) return;
	clientWidth=clientWidth>1033?1033:clientWidth;
	docEl.style.fontSize = 100 * (clientWidth / 640) + 'px';
	};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);

	var tabs=document.getElementById('tabs');
	var li=tabs.getElementsByTagName('li');
	var tabContent=document.getElementsByClassName('tab')
	// 循环tab绑定函数
	for(var i=0;i<li.length;i++){
		// 因为js变量是全局的，必须引入闭包，保存变量的状态
		li[i].onclick=function(num){
			return function(){
				for(var i=0;i<li.length;i++){
					li[i].className="";
					tabContent[i].className='tab';
				}
				li[num].className='active';
				tabContent[num].className='tab active';
			}
			
		}(i)
	}
	// 部分安卓浏览器有最小字体限制，隐藏部分内容
	if(navigator.userAgent.indexOf("Android") > -1){
		var isShown=document.getElementsByClassName('isShown');
		for(var i=0;i<isShown.length;i++){
			isShown[i].style.display="none";
		}
	};



})(document, window);