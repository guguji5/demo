---
title: vue-cli4加载css重复？
date: 2020-03-13 11:26:24
tags: CSS
---

vue-cli引入css的正确姿势是什么？ vue-cli怎么避免重复引入css呢？

------------

### 问题

最近用[single-spa](https://single-spa.js.org/)尝试重构项目,每个子项目用vue-cli初始化，瞧了一眼vue-cli都已经第四版了。我的css预编译框架选的less，本计划是像之前一样直接在main.js中直接 `import './styles/index.less';` 报错了（但是错误是啥不记得了），查了vue-cli的文档[CSS 相关](https://cli.vuejs.org/zh/guide/css.html#引用静态资源) 可以选择 [style-resources-loader](https://github.com/yenshih/style-resources-loader)  和  [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader) 来引用资源。（见下图一）

结果在debug样式的时候发现样式重复引入了，啥叫重复了呢，就是像下边这个样子，明明是同一段css，却被加载了N多次。

![重复资源](http://img-ys011.didistatic.com/static/dc2img/do1_bfuBHyFYhpB8FBBSextw)

原来  `vue-cli-plugin-style-resources-loader` 是会在每个vue文件中都注入依赖的代码，一般只把less变量放进去。像我这边这样，把的入口index.less文件都引进去，相当于在每个文件中都import了index.less一遍。

```javascript
//vue.config.js 图一
pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, 'src/styles/index.less')]
    }
  }
```

```less
//vars.less 图二
@blue-base: #2D77EE;
@blue-light: #6C9FF3;
@blue-middle-light: #DDE9FC;
@blue-extra-light: #F3F7FE;
@blue-lightest: #E4E5EA;
@blue-active: #2A6BD4;
@base-color: @blue-base;

```



### 结论 

1. 全局less样式，可以在main.js中通过import引入，需要less变量的文件手动`@import vars.less`，比较清楚明白。
2. 单独使用 [style-resources-loader](https://github.com/yenshih/style-resources-loader) 可以按图一的方式将index.less文件的作为样式入口文件引入，不会重复。注意一定不要安装  [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader) 组件。
3. [style-resources-loader](https://github.com/yenshih/style-resources-loader)  和  [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader)  同时安装时，`vue.config.js` 中只能引入变量（如图二）。
4. 比较推荐的方法是，index.less在main.js中引入，vars.less 等变量在vue.config.js中引入。

