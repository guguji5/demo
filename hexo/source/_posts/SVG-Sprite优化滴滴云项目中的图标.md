---
title: SVG Sprite优化滴滴云项目中的图标
date: 2018-11-22 21:54:26
tags: 优化
comments: true
---
### 背景介绍

滴滴云用户系统随着模块，功能，页面的增多，小图标也越来越多，随着开发人员的不断加入以及图片需求的不断更新，项目中图片的引用方法也变得多种多样。本次调研旨在整理项目中的图标，网站加载速率，统一开发人员引用图片的用法。

### 项目现状

项目中图片的使用方式有以下三种
1. iconfont，单色小图片。
2. inline直接引用图片。
3. inline直接引用，图片小于2k，转为base64。

第2项中大图片直接引用无可否非，但目前项目中有70-80多个4k-8k的小图片也是直接引用到项目里，这次调研主要针对小图片进行合并，减少请求数，优化网站的响应速度。

### CSS SPRITE

CSS Sprite是传统的优化图片的方法，基本原理也很简单，把小图标按照一定顺序合并在一个大图上，使用时需按background-image方式引入，辅以background-position来控制需要显示图片的位置。

webpack-spritesmith组件可以实现合并小图片，并生成相对于的css样式，在原来使用的标签上添加对应的class类名即可。但是此方法针对项目中通过`<img src="imgages/demo.png />`标签内联引用图片的方式改动较大，需将img标签转换为background显示，可读性减弱，改动effort较大，样式出错的机会及测试的成本都很大，顾放弃此方法。

### SVG SPRITE

SVG 是一种基于 XML 语法的图像格式，全称是可缩放矢量图（Scalable Vector Graphics）。其他图像格式都是基于像素处理的，SVG 则是属于对图像的形状描述，所以它本质上是文本文件，体积较小，且不管放大多少倍都不会失真。

SVG可以直接放在HTML，CSS里使用。SVG Sprite是依赖其symbol标签和use标签实现其合并的效果。合并完以后的svg大概如下图
```
<svg>
    <symbol id="shape">
        <!-- 第1个图标路径形状之类代码 -->
    </symbol>
    <symbol>
        <!-- 第2个图标路径形状之类代码 -->
    </symbol>
    <symbol>
        <!-- 第3个图标路径形状之类代码 -->
    </symbol>
</svg>
```
use的语法如下
```
<svg>
  <use xlink:href="#shape" x="200" y="50" />
</svg>
```
我们期望的效果是把所有svg都通过symbol合并到一个大的svg sprite，而手动维护显然是不现实的，所以我们需要[svg-sprite-loader](https://github.com/kisenka/svg-sprite-loader)，他可以根据config来自动合并所有的svg，形成一个大的svg sprite。需在webpack中添加的配置如下：
```
{
    test: /\.svg$/,
    loader: 'svg-sprite-loader',
    include: [resolve('src/assets/images/svg')], //只合并固定目录
    options: {
        extract: true, // 将合并后的svg提取为一个单独文件，默认false，会将svg解析后以内联方式打包到模板里
        spriteFilename: utils.assetsPath('img/sprite.svg'),
        symbolId: 'icon-[name]', //symbol id的rename规则
    }
},
// 主动调用webpack 方法，循环遍历svg目标文件夹下所有svg格式文件。
const req = require.context('assets/images/svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
```
至此，项目中就可以以`<svg><use xlink:href="#shape"/></svg>`方式来用svg展示icon。进一步可以封装为vue组件以方便使用。
```
<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'icon-svg',
  props: {
    iconClass: {
      type: String,
      required: true
    }
  },
  computed: {
    iconName () {
      return `sprite.svg#icon-${this.iconClass}`
    }
  }
}
</script>

<style>
.svg-icon {
  width: 1em;    //能继承font-size的大小
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;   //可以接受外部color，改变svg内部currentColor的路径
  overflow: hidden;
}
</style>
```
组件可以实现和iconfont一样的通过font-size，color修改图标的大小和颜色，使用方法也更加友好，只需`<icon-svg icon-class="wechat-for-signin" />`,在icon-class传入svg名字即可。在页面中的node节点渲染如图：
![svg](/images/svg_node.png)

### svg vs iconfont

icon-svg     | iconfont
-------- | -----
多种色彩  | 单一色彩
真正的矢量  | 字体文件
css控制大小，颜色，甚至局部颜色  | css控制大小，颜色
webpack实现  | 需要借助外部工具
IE9+  | IE6

### SVG待解决问题

通过symbol+use的方式引入svg，当`<use xlink:href="">`引用的是外部资源时在vue的template里v-if渲染会有问题。尤大大解释说这是chrome的bug。
[https://github.com/vuejs/vue/issues/2661](https://github.com/vuejs/vue/issues/2661)
[https://github.com/vuejs/vue/issues/2782](https://github.com/vuejs/vue/issues/2782)

issue提出已经两年了，有没有官方的解决方案还需继续调研。目前的workaround有一下三种：
- 将v-if改为v-show
- 不提取sprint.svg,内联引用，
- 将sprint.svg通过webpack达成chunk包,通过js引用sprint.svg。

### 总结

项目中4k-8k的小图片没有以iconfont方式引入的方式，原因不管是“多色”，“图片格式限制”。引入icon-svg后，随着设计师更新icon，我们希望尽量将图切成svg，一并合到sprite.svg中，svg文件经过gzip的压缩，会达到减少请求，增加传输的效率的目的。

*参考链接*

https://css-tricks.com/svg-symbol-good-choice-icons/
https://github.com/PanJiaChen/vue-element-admin