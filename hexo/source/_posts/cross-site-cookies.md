---
title: SameSite的解释和跨域cookie问题的解决
date: 2020-11-01 20:14:41
tags:
---

### 问题提出

现在大多项目的前后端都是分离的，部署在不同的 IP 及域名上，之前遇到一个测试环境的问题，虽然解决了但一直不明所以。前端项目测试环境部署在 10.155.18.1 环境的 8080 端口，而后端项目测试环境部署在 10.155.19.2 环境的 8126 端口，通过 sso 登录后回调后端的接口中 `Set-Cookie` 一个 q 字段来给前端保持登录的状态。但是，后续的后端请求都没有带上该 cookie，在浏览器的本地缓存中查看该 cookie 也是存在的。问题就是为啥明明设置了，后续请求却丢失了该 cookie。

我猜想 cookie 在 IP 上是不是有什么问题，我就本地配了两个 host，分别为

```
10.155.18.1 mis.example.io
10.155.19.2 api.example.io
```

通过`mis.example.io:8080`来访问，回调`api.example.io:8126`，cookie 中的 q 会一直带着。一直想不通，这域名跟 IP 有啥不同，反正都是跨域。为啥用 IP 不行，用域名就可以了呢？

直到看到了[samesite-cookies-explained](https://web.dev/samesite-cookies-explained/)，了解到了 samesite 对 cookie 的限制。文章讲了 cookie 的由来，因为 http 协议是无状态的，而 cookie 可以使状态持久化，通过 key=value 的状态来使用，通过 headers 中的 Set-Cookie 来进行设置等等 cookie 的基本概念（这些大家都知道，而跟题目无关）

### 什么是 first-party 和 third-party 的 cookie？

让我们举个例子，你可能会注意到一个网站不仅仅是当前你正在访问的域名，而是有很多不同域名的 cookies 组成。Cookies 会匹配当前网站（在浏览器地址栏的网址）会被认为 first-party cookies，类似的，来自其他域名的 cookies 则被认为 third-party cookies，这不是一个绝对的概念，它会根据用户访问的站点来变化。同一个 cookie 根据当前访问站点的不同，可能会被认为 first-party 或者 third-party。
![cross-site-set-cookie-response-header](https://webdev.imgix.net/samesite-cookies-explained/cross-site-set-cookie-response-header.png)

让我们继续上边的例子，假如你的博客上有一个非常迷人的猫咪图片，它被托管在`/blog/img/amazing-cat.png`。因为它非常的特别，所以其他人会直接把地址放在自己的网站里（其实上图我就是直接粘的原博客的链接）。当有访客访问你的博客时，有一个`promo_shown`的 cookie（在原网站中可能是用来控制弹出框是否展示），然后他访问其他人的网站时，也会带上这个 cookie，但它在其网站上可能没有任何意义，所以有些多余。

如果这是一个意想不到的效果，你为什么要这样做呢?当站点在第三方上下文中使用时，正是这种机制允许站点维护状态。例如，如果你在你的网站上嵌入一个 YouTube 视频，那么访问者将会在播放器中看到一个“稍后观看”的选项。如果访问者已经登录了 YouTube,该有效期的会话会使用第三方嵌入式播放器 cookie，这意味着“稍后观看”按钮将保存视频,而不是弹出对话框提示他们去注册或者迫使用户离开你的页面并导航到 YouTube。
![cross-site-cookie-request-header](https://webdev.imgix.net/samesite-cookies-explained/cross-site-cookie-request-header.png)

网络最大的特性就是开放，这也是许多人去创造和记录 blog 的原因之一，然而这也会带来一些安全和隐私方面的问题。CSRF（跨站请求伪造）的实现依赖于 cookie 的这一属性，无论谁发起的请求，它都会被携带在 http 请求上。为了更好的解释 third-party，再举一个例子，当你访问`evil.example`时，它会向`your-blog.example`发起请求，然后浏览器自然而然的会带上对应的 cookie，如果你的博客网站没有很好的验证和处理好它，那么这些请求就会做一些危险操作，比如删除博文，或者添加一些“evil”想要的内容。

用户也越来越了解如何使用 cookie 在多个站点跟踪他们的活动。然而，到目前为止，还没有一种方法可以明确地说明使用 cookie 的意图。

### 使用 SameSite 属性来明确 cookie 的使用范围

定义在[RFC6265bis](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00)的`SameSite`允许我们声明 cookie 可以用来 first-party 或者 same-site。它会明确的给出“网站”是指哪些（哪些可以带 cookie）。网站由域名后缀和域名前部分组成，比如`www.web.dev`是`web.dev`的一部分。

#### 关键概念

当用户在网站`www.web.dev`，向`static.web.dev`请求一个图片，这是一个`same-site`请求。

不仅仅是顶级域名例如`.com`，也包括了一些公共服务`github.io`。有一个[公共后缀名单](https://publicsuffix.org/list/)定义了 sameSite 的范围，这使的`your-project.github.io`和`my-project.github.io`为两个站点，也就是跨域。
`SameSite`属性提供了三种不同的方式来管理 cookie，你可以不指定这个属性（`None`），或者使用`Strict`和`Lax`来限制 cookie 的 same-site 请求。

#### Strict

如果`SameSite`设置为`Strict`，则 cookie 只能在 first-party 的内容中传输，在用户的层面，只有当访问的 url 匹配 cookie 的站点时才会带上 cookie。可以如下设置：

```
Set-Cookie: promo_shown=1; SameSite=Strict
```

当用户通过一个链接进入你的网站，或者说从从有个你朋友发来的邮件链接中点开网站，cookie 不会起作用。这对于那些有功能性的 cookie（修改密码或者下单）很有益处，但是对于`promo_shown`这种仅仅用来展示弹出框的 cookie 来说有点过于限制了。

#### Lax

还记得迷人猫咪的图片么，假如猫咪的图片被人直接放在他的网站，并且放了一个链接在文章中，如下：

```
<p>Look at this amazing cat!</p>
<img src="https://blog.example/blog/img/amazing-cat.png" />
<p>Read the <a href="https://blog.example/blog/cat.html">article</a>.</p>
```

cookie 会被这样设置

```
Set-Cookie: promo_shown=1; SameSite=Lax
```

当读者打开他的网站时，请求`amazint-cat.png`的时候不会带上 cookie，然而当用户点击链接，进入你博客时，cookie 会被使用。对于仅仅影响展示的 cookie 来说 `Lax` 是一个不错的选择。

#### None

将`SameSite`设置为`None`意味着，你明确的表示，在 third-party 发送请求时使用 cookie，你很清楚这样做的收益和后果。

```
Set-Cookie: widget_session=abc123; SameSite=None; Secure
```

![samesite-none-lax-strict](https://webdev.imgix.net/samesite-cookies-explained/samesite-none-lax-strict.png)

#### 最后两点

- 没有设置`SameSite`会被认为`SameSite=Lax`
- 当设置`SameSite=None`时，必须同时设置`Secure`

谷歌浏览器在 version 84 默认开启该特性，火狐浏览器 69 可以再`about:config`中设置`network.cookie.sameSite.laxByDefault`来体验该特性。Edge 浏览器计划将该特性设为默认。

**相信看到这，最开始的问题，也有了答案了吧。**

### 参考链接

[samesite-cookies-explained](https://web.dev/samesite-cookies-explained/)
[https://www.chromestatus.com/feature/5088147346030592](https://www.chromestatus.com/feature/5088147346030592)
