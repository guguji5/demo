---
title: 滴滴云MIS Single-spa微服务化项目总结
date: 2020-05-30 15:42:15
tags: 微前端 single-spa
---

## 我们为什么要用微前端 ？

当然微前端的优势有很多，具体到我们应用大概就以下三点：

- 因为滴滴云有三个项目，滴滴云官网，滴滴云控制台，滴滴云MIS。滴滴云官网和控制台是对外提供服务，MIS是对内提供服务。MIS如何复用控制台和官网的组件？在单页应用的架构下，目前没有能力，从去年冬天，我们开始探索微前端的结构。
- MIS中功能较为独立，一部分模块改动频繁，另外一些可以说基本不更新。作为一个整体应用，这些原本不需要改动的代码既增加了整体编译，发布，开发时热部署的耗时，多个功能并行开发，也增加了产生BUG的可能性。
- 前端技术栈更迭非常快，微前端可以让我们更自由的选择我们感兴趣的，更新更强的技术栈及配套。

所以我们决定拆分MIS，一方面做优化，另一方面为滴滴云控制台这个庞然大物探索一个解决方案。

## Why single-spa ?

其实微前端的实现方案有很多，这方面无论Way社区还是掘金知乎上讲的很多了。我们不想失去单页应用优秀的用户体验，不想去触碰容易导致各种诡异问题的iframe，也不想去尝试目前兼容性还有待提高的Web Components。在我们体验了single-spa 在线demo，开箱即用的脚手架，再加上其核心团队快速的响应能力，我们决定试水single-spa。

打动我的还有作者[文档上的一段话](https://single-spa.js.org/docs/getting-started-overview#architectural-overview) :

> single-spa takes inspiration from modern framework component lifecycles by applying lifecycles to entire applications. It was born out of Canopy's desire to use React + react-router instead of being forever stuck with our AngularJS + ui-router application, and now single-spa supports almost any framework. Since JavaScript is notorious for the short-life of its many frameworks, we decided to make it easy to use whichever frameworks you want.

这正是在我之前公司遇到的困境，如何把AngularJS升级到Angular 5.0 ，简直是雷锋和雷峰塔的区别。我们选择了重写了项目，新旧项目双线作战，而single-spa的做法却别出心裁。

## 使用single-spa我们需要了解什么

首先简单看一下single-spa重构项目的结构，有一个基座html，多个子应用按需插入基础，不需要的子应用，从基座拔出。

![gitlab-runner](/images/how_single-spa_works.png)

在了解single-spa本身Api之前，我觉得有必要了解一下[SystemJs](https://github.com/systemjs/systemjs)，import maps的使用，[不同构建版本包的使用]([https://cn.vuejs.org/v2/guide/installation.html#%E5%AF%B9%E4%B8%8D%E5%90%8C%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E8%A7%A3%E9%87%8A](https://cn.vuejs.org/v2/guide/installation.html#对不同构建版本的解释))。single-spa的核心团队的Joel Denning录了一系列讲解视频在[YouTube](https://www.youtube.com/playlist?list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU)和[Bilibili](https://space.bilibili.com/495254378/)，非常推荐。

## 实施single-spa遇到的问题
1. 子应用打包格式错误
single-spa 加载子应用的库是systemjs,并不是所有的js文件都可以加载，推荐使用 `libraryTarget: 'system'`,`umd` 和 `amd` 亦可。[参考链接](https://webpack.js.org/configuration/output/#outputlibrarytarget)
  <details>
  <summary>了解更多</summary>
  Now, there are also various other formats and working with them all is a pain so systemjs has the 'extras' it uses in order to interop between them. umd and amd are good formats because they're designed to work in the browser. But that means there's a layer to unwrap/interop with so system should be preferred if possible.( from Carlos )
  </details>


2. 跨域问题
这应该是single-spa开发中一定会遇到的一个问题，因为同时启动多个项目肯定在localhost的不同端口，将不同端口的服务加载到root-html中势必会跨域，所以解决它就好了。需要在webpack配置中中添加
`"Access-Control-Allow-Origin": “*”`即可。


3. single-spa 子应用挂载时把挂载的dom节点替换掉？
拿single-spa-vue为例，1.7.0 会把挂载节点替换掉。而1.8.0 会把挂载节点保留。根据自己的需要选择版本，可以在package-lock.json中锁定版本。


4. single-spa 的项目如何部署在nginx服务器？
single-spa，顾名思义，还是一个单页应用。我们不希望切换路由的时候浏览器发生跳转或者刷新。可以尝试如下配置：
```
location / {
      try_files $uri $uri.html /index.html =404;
  }
```

5. System-importmap 存在哪里，如何修改？
根据官方的推荐，importmap建议存在S3存储，目前我们使用的内部gift服务，gift上目前没有一个支持https协议的域名，所以使用了cdn的域名。但这个cdn的下发有延迟，导致页面的刷新有些问题，后期考虑存到数据库。


6. 有关public path，external 和 systemjs-webpack-interop的解释
首先publicPath是配置项目中所有资源的一个基础路径；
externals提供了运行时从外部获取依赖的方法，external可以接受多种模块类型的资源；
systemjs-webpack-interop是一个搭配single-spa使用的组件，提供了简单方便修改运行时publicPath的方法。
  <details>
  <summary>了解更多</summary>
  相信下边的链接一定能让你搞明白这两个概念。
  https://www.webpackjs.com/configuration/externals/
  https://www.webpackjs.com/guides/public-path/#on-the-fly
  https://github.com/joeldenning/systemjs-webpack-interop
  https://stackoverflow.com/questions/28846814/what-does-publicpath-in-webpack-do
  https://tomasalabes.me/blog/web-development/2016/12/11/Webpack-and-the-public-path.html
  </details>


7. 多个子应用共同依赖的css，组件如何共享，权限如何控制，全局状态如何维护？
根据[官方的推荐](https://single-spa.js.org/docs/recommended-setup/#utility-modules-styleguide-api-etc)，可以专门创建一个子应用来做这些事，公共样式，封装http服务，一些不想暴露在全局的状态也可以在这个应用里维护。这个模块可以配合external被其他模块引用。
  <details>
  <summary>了解更多</summary>
  https://single-spa.js.org/docs/faq/#how-can-i-share-application-state-between-applications
  </details>


8. Css 冲突怎么解决呢？
  1. Namespace the CSS belonging to each app with a class, and wrap the app in that container class (such as BEM).
  2. Use CSS modules in your components https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/( https://vue-loader.vuejs.org/guide/css-modules.html#usage)
  3. Use a CSS-in-JS library like https://styled-components.com/
  4. The 'scoped' attribute in style tag
我选的第一种，postcss-plugin-namespace 可以方便的将项目中所有的postcss 加一个prefix，成本很小。其他的都需要改造代码。


9. 不同子应用切换的时候白屏如何解决？
一种思路使用预加载；另一种思路是在侦测到有新应用加载时增加一个loading的过渡页；我选第二种。[single-spa api文档](https://single-spa.js.org/docs/api) 提供了 `single-spa:before-app-change` 和 `single-spa:app-change` 事件，可以在两个事件中间增加一个loading。(single-spa 5.5.0版本才支持，[具体请见issue](https://github.com/single-spa/single-spa/issues/545))


10. 一个完整spa项目想放入single-spa要做什么更改？
根据[官方的推荐](https://single-spa.js.org/docs/migrating-existing-spas),需要两步。一，实现single-spa所需要的bootstrap，mount，unmount等生命周期钩子函数。二，保证你的外部链接报错css，JavaScript等可以独立工作。** 除此之外 **，如果你使用了webpack抽取了很多chunk，这可能会导致失败，因为不同的chunk包不会加载其他依赖的包。Joeldenning建议按路由懒加载进行拆包。


11. 子应用如何部署，上线时如何更新importMap？
微前端的子应用可以独立部署，目前经过OE打包后，在弹性云或odin部署；目前importMap存储在gift，但是弹性云现有的镜像没有提供部署完后继续shell脚本的执行，所以自己做了一个镜像 registry.xiaojukeji.com/didionline/didiyun-mis-nginx-main:stable，它只不过在内部拉起nginx服务后，执行了一个shell脚本，它会更新gift链接中的内容。


12. 不同子应用访问路径如何配置？
不同的子应用跑在不同的弹性云节点，可以通过不同的子域名来进行映射，odin的微前端就是采用这种方案。也可以通过不同的path映射到不同的ip机器上，地图团队的微前端使用的这种方案。我选的后者。
```
upstream misaccount {
  server 10.1.2.3:8080;
  server 10.4.5.6:8080;
}

location /mis-account/ {
    proxy_pass http://misaccount/;
}
```

## 收益

1. 探索了使用single-spa的成本和难度，为改造滴滴云控制台提供了一种解决方案。
2. 拆分后的项目更独立，为技术栈的改造和升级降低了门槛。
3. 最最重要的给复用滴滴云控制台的代码提供了一种可维护的方案，目前滴滴云MIS中费用中心使用的是滴滴云控制台中现成的视图组件。
4. 改版后的MIS懒加载更合理，不同的用户使用MIS中某些特定的功能，真正做到不使用的应用不加载。
5. 给团队的同学分享和实践了一种可落地的微前端解决方案。
6. 全新的开发体验，做到开发哪里，替换哪里。([import-map-overrides新体验](https://github.com/joeldenning/import-map-overrides))

## 写在最后的话

single-spa核心团队的Joeldenning是一个非常热情，阅历丰富，技术扎实的开发人员。在探索single-spa的过程中，向他学习到很多东西，他也总是能第一时间给出合理的解决方案，并且也是很热心的把再Youtube上的single-spa的介绍视频上传到bilibili一份，投桃报李，我们团队也利用周末时间，进行了[single-spa的中文翻译](https://zh-hans.single-spa.js.org/docs/getting-started-overview)工作，收获良多。






