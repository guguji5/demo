---
title: Hexo + Github搭建静态博客(二)
date: 2018-11-11 16:43:29
tags: Hexo
comments: true
---

### 快速介绍
本文是接Hexo + Github搭建静态博客(一)，Hexo环境的搭建，依赖的下载请根据[上文](https://guguji5.github.io/Hexo-Github%E6%90%AD%E5%BB%BA%E9%9D%99%E6%80%81%E5%8D%9A%E5%AE%A2-%E4%B8%80/)自行配置。本文主要介绍Hexo的**归档，标签，分类**，以及依靠插件支持的**评论，站内搜索，字数统计**等功能。

### 归档，分类，标签
三者是众多博客模板的必要元素，而在文档中却没有详细的解释，匆匆一笔带过。笔者阅历浅薄，结合自己的理解，强行解释一波，通过对比将意思表达的更清楚。

归档（archives）是按照一定的周期对博客进行分类，大多数是按年，月等。

分类（categories）和 标签（tags）都是用来描述博客的内容，但却又不尽相同。分类 定义博客的常规主题，而标签会深入反应内容。分类会构成博客的大纲，反应博客的基本结构，而标签会更具体一些。（其实还是会让人confuse）下边我希望通过一个小故事解释清“分类”和“标签”的不同。

假如我们运营着一个关于电子产品（3C）的博客，有众多的博文，可能会有以下的分类

- 笔记本
- 手机
- 存储设备
- 数码相机

当新出iphone的时候，我们可能会写一个新产品开箱博客，他分类肯定是”手机“，而标签会是”iphone“。

创建对应的页面也很简单，只需一行命令。

```
hexo new page "archives"
hexo new page "tags"
hexo new page "categories"
```
### 站内搜索

方式有以下三种，insight、swiftype、baidu。

insight只需安装hexo-generator-json-content组件即可。
swiftype需要去其官网注册key。
baidu搜索的话需要禁用其他两种。

三种都很简单，这里展示第一种的效果图。

![站内搜索](/images/search.jpg)

### 评论

评论是博客必不可少的一项功能。而Hexo作为一个静态博客，没有WordPress那样的server和数据库，评论的功能可想而知肯定是用的第三方的评论系统。大浪淘沙，对比各色的需求，接下来我们XXX。

- 来必力 : 504报错，跨域
- Hypercomments: 付费
- 畅言 : 畅言
- Valine : sound good
- 多说 : 关闭
- 网易云跟帖 : 关闭
- disqus : 科学上网
- gitalk : 需要Github账号
- 搜狐畅言 : 备案

这个topic展开的话会很冗长，搜索引擎上也有很多这类的文章。我最后选择了gittalk，简单大方，技术类的文章，Github不是门槛。
### 字数统计，阅读时间统计

这一部分比较简单，只需要安装hexo-wordcount插件，传入博客的内容即可计算得出。先安装插件：
```
npm i --save hexo-wordcount
```
在主题模板文件中即可使用wordcount方法计算字数统计和阅读时长。
```
<% if(theme.postCount.enable){  %>
	<% if(theme.postCount.wordcount){  %>
		<span class="post-wordcount hidden-xs" itemprop="wordCount"><%= __('article.wordcount') %>: <%= wordcount(post.content) %>(<%= __('unit.word') %>)</span>
	<% } %>
	<% if(theme.postCount.min2read){  %>
		<span class="post-readcount hidden-xs" itemprop="timeRequired"><%= __('article.readcount') %>: <%= min2read(post.content) %>(<%= __('unit.time') %>)</span>
	<% } %>
<% } %>
```

### 如何在博客展示自己github托管的项目

作为一个程序员，GitHub开源项目是程序员展示编程技术和工作阅历，释放程序员个人魅力的宽广舞台。所以，很有必要在博客的核心页面展示自己GitHub的repository。Hexo可以在主题内通过ejs或swig模板引擎来构建页面，GitHub提供开源api支持获取repo列表。所以我们可以通过调用引入JavaScript请求api。展示效果如下

![repository](/images/repo.jpg)

问题出在Github的未授权状态的api每小时只可以请求60次，而超出次数就会403。而授权的api每小时可以访问50000次。所以需要去[https://developer.github.com/v3/auth/#basic-authentication](https://developer.github.com/v3/auth/#basic-authentication)申请授权，我们搭建的Hexo静态博客，没有Server，所以oauth2的方式不可取，这里我用的access_token来对api授权，Github出于安全的考虑，不允许我们把access_token上传到Github仓库，所以我们需要借助你擅长的加密方式，对access_token加密，运行时解密。伪代码如下：
```
var key = 'U2FsdGVkX1+VWdiIkoA3PCbz9KKGlKilMs6UztGd2VQuYuSAoZLyCi8fM2qxUbviYt35kf/tpFvEqNmtY3WppQ='
var access_token = CryptoJS.AES.decrypt(key, 'guguji5').toString(CryptoJS.enc.Utf8);
$.get("https://api.github.com/users/<%=theme.github.username%>/repos?access_token="+access_token, function(result) {
})
```
*参考链接*

https://developer.github.com/v3/auth/#basic-authentication

https://developer.github.com/v3/#rate-limiting

https://amylynnandrews.com/categories-vs-tags/