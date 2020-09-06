---
title: 记一次koa转发请求遇到的bug
date: 2020-07-18 19:50:39
tags: nodejs
---
> 最近公司内某业务线清理非法请求，options请求就被归为此类，从浏览器端直接调用跨域的api必然产生options，所以需要proxy来转发。

无论对于何种后端语言来说，转发都是一个基本切正常的需求，我们选择使用前端自己搭的nodejs server来做转发。在调研了 [koa-proxy](https://github.com/popomore/koa-proxy)，[koa-proxies](https://github.com/vagusX/koa-proxies)，[koa-better-http-proxy](https://github.com/nsimmons/koa-better-http-proxy)，[koa2-proxy-middleware](https://github.com/sunyongjian/koa2-proxy-middleware)等，选择了koa-proxies。用法简单，配置清晰。


```
// middleware
app.use(proxy('/octocat', {
  target: 'https://api.github.com/users',    
  changeOrigin: true,
  agent: new httpsProxyAgent('http://1.2.3.4:88'), // if you need or just delete this line
  rewrite: path => path.replace(/^\/octocat(\/|\/\w+)?$/, '/vagusx'),
  logs: true
}))
```

可是一直超时，看了koa-proxies源码后，在其node-http-proxy里边打了断点，有输出如下报错
```
{
    Error: socket hang up
    at createHangUpError (_http_client.js:342:15)
    at Socket.socketOnEnd (_http_client.js:437:23)
    at emitNone (events.js:111:20)
    at Socket.emit (events.js:208:7)
    at endReadableNT (_stream_readable.js:1064:12)
    at _combinedTickCallback (internal/process/next_tick.js:139:11)
    at process._tickCallback (internal/process/next_tick.js:181:9) code: 'ECONNRESET'
}
```
在node-http-proxy的issue里查了好久好久，经 [koa2-proxy-middleware](https://github.com/sunyongjian/koa2-proxy-middleware) 文档提醒，将bodyParser挪到proxy后解决问题。具体对比demo如下：

```
// this works well.
const Koa = require('koa');
const app = new Koa();
const proxy = require('koa-proxies')
const bodyParser = require('koa-bodyparser');

app.use(proxy('/user', {
  target: 'http://example.com',    
  changeOrigin: true,
  rewrite: path => path
}))
app.use(bodyParser())
app.listen(8080);
```

```
// this works with bug "socket hang up".
const Koa = require('koa');
const app = new Koa();
const proxy = require('koa-proxies')
const bodyParser = require('koa-bodyparser');
app.use(bodyParser())

app.use(proxy('/user', {
  target: 'http://example.com',    
  changeOrigin: true,
  rewrite: path => path
}))

app.listen(8080);
```

这个proxy，真的是 从查找文档，拷贝粘贴，一共也就用了5分钟。但是把bodyParser从proxy上边挪到proxy下边用了many many多的hours。**这事不能这么过了，必须得找下原因看看为啥。**

先从 `koa-bodyparser` 这个库说起吧，它到期对api请求过来的数据做了什么？我们都知道这个库是在koa框架下解析post put等有请求体的api时，将请求体数据转换成我们想要的格式，比如json，form，text等。
那么它是如何做的呢？我们举一个最简单的nodejs例子来如何处理post数据
```
http.createServer(function (req, res) {
  console.log(req.url)
  let postData = '' 
  req.on('data', chunk => {
    postData += chunk.toString()
  })
  req.on('end', () => {
    if (postData) {
      res.setHeader('Content-type', 'text/plain')
      res.end('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2) + postData)
    }
    console.log(JSON.parse(postData))
  }) 
}).listen(9000);
```
很显然在bodyParser这个中间件中消费了data数据，直到它结束。**而middleware会串行的一个一个执行，并且修改ctx中的res和req。** 再到proxy这个中间件执行时req中就没有data事件了。

这和使用postman请求的结果符合，使用postman请求是一直不返回数据，其实它被bodyParser接受并消费了，根本没发到proxy的target去，也就没有返回值可言了，超时后报错`hang up`,一切就通了。

这次浪费这么多时间主要还是对middleware和bodyParser这个库的实现不熟悉，继续加油吧。
