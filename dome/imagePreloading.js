/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 14-12-12
 * Time: 下午6:10
 * 图片的预加载
 * To change this template use File | Settings | File Templates.
 */
/**************
 * 预加载
 **************/
function _PreLoadImg(b, e) {
    var c = 0,
        a = {},
        d = 0;
    for (src in b) {
        d++;
    }
    for (src in b) {
        a[src] = new Image();
        a[src].onload = function() {
            if (++c >= d) {
                e(a)
            }
        };
        a[src].src = b[src];
    }
}

_PreLoadImg([
   'images/p1.jpg',
   'images/p2.jpg',
   'images/p3.jpg',
   'images/p4.jpg',
   'images/p5.jpg',
   'images/p6.jpg',
   'images/p7.jpg'
    ],function(){
    setTimeout(function(){
        var loader = document.getElementById('loading'),
            container = document.getElementById('swiper-container');
swiper.slideTo(1, 1000, false);
        document.body.removeChild(loader);
        container.style.display = 'block';
    },2000);
});
    var swiper = new Swiper('.swiper-container', {
		loop : true,
		direction : 'vertical',
        effect: 'cube',
		setWrapperSize :true,
		nextButton:'.swiper-button-next',
		cube: {
  slideShadows: false,
  shadow: false,
  shadowOffset: 0,
  shadowScale: 0
},
  onTransitionStart: function(swiper){
      c(swiper.activeIndex);
    }
    });
	function c(x){
		/*if(x==1 || x==20){
			$(".p0 .p0_1").addClass("fadeInDownBig");
			$(".p0 .p0_2").addClass("fadeInUpBig");
			}else{
			$(".p0 .p0_1").removeClass("fadeInDownBig");
			$(".p0 .p0_2").removeClass("fadeInUpBig");
			for(var i=0;i<21;i++){
			var cname=x-1;
			if(x==0 || x==19){cname=18;}
			  if(cname==i){
			  $(".p"+cname+" .p"+cname+"_1").addClass("fadeInRight");
			  $(".p"+cname+" .p"+cname+"_2").addClass("fadeInLeft");
			  }else{
				 $(".p"+i+" .p"+i+"_1").removeClass("fadeInRight");
			     $(".p"+i+" .p"+i+"_2").removeClass("fadeInLeft");  
				  }
			}
				
		}*/
		}
$(".music").click(function(){
        if($(".icon-music").attr("num") == "1"){
            $(".icon-music").removeClass("open");
            $(".icon-music").attr("num","2")
            $(".music-span").css("display","none");
            document.getElementById("aud").pause();
            $(".music_text").html("关闭");
            $(".music_text").addClass("show_hide");
            setTimeout(musicHide,2000);
        }else{
            $(".icon-music").attr("num","1");
            $(".icon-music").addClass("open");
            $(".music-span").css("display","block");
            document.getElementById("aud").play();
            $(".music_text").html("开启");
            $(".music_text").addClass("show_hide");
            setTimeout(musicHide,2000);
        }
        function musicHide(){
            $(".music_text").removeClass("show_hide");
        }

	  });
