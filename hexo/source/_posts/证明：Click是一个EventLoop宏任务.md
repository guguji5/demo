---
title: 证明：Click是一个EventLoop宏任务
date: 2021-01-26 9:39:14
tags: 
---

#### 如题，证明Click是一个EventLoop宏任务

JavaScript中事件根据同步异步可以分为哪些类型呢，无非就是 同步（立马执行）和 异步（延迟执行）。而异步又分为宏任务（marcoTask 有的地方也叫Task）和微任务（microTask）。综上，JavaScript中的事件可以分为同步，宏任务和微任务。

EventLoop的讲解可以看看[阮一峰博客event-loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)或[MDN的解释](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)

那么如何证明，Click是一个宏任务呢，它似乎也没有一个定义，那让我们用反证法来证明一下吧。首先让我们看个例子。 https://guguji5.github.io/clickIsMacroEvent/
```
<div id="outter">
    outter
    <div id="inner">
        <span>inner</span>
        点我，猜猜console
    </div>
</div>

var out = document.getElementById('outter')
var inner = document.getElementById('inner')
out.addEventListener('click', function(){
    console.log('outter')
    setTimeout(function() {
        console.log('this is outter settimeout')
    })
    Promise.resolve(111).then(res =>{
        console.log('this is outter promise')
    })
})

inner.addEventListener('click', function(){
    console.log('inner')
    setTimeout(function() {
        console.log('this is inner settimeout')
    })
    Promise.resolve(111).then(res =>{
        console.log('this is inner promise')
    })
})
```
![](http://img-ys011.didistatic.com/static/dc2img/clickismarcoevent.png)

#### 如果Click事件是同步的
```
inner
outter
this is inner promise
this is outter promise
this is inner settimeout
this is outter settimeout
```

#### 如果Click事件是微任务的
```
// 如果click是微任务，刚开始则 微任务队列中为[inner listener, outter listener]，宏任务队列为[]
inner //执行inner的click listener，console.log同步代码立即执行，微任务队列中push进promise的then 为 [outter listener, inner then]，宏任务中push为 [inner setTimeout]
outter //执行outter的click listener，console.log同步代码立即执行，微任务队列中push进promise的then 为 [inner then, outter then]，宏任务中再push进setTimeout，为[inner setTimeout, outter setTimeout]
this is inner promise
this is outter promise //先情况微任务队列，再执行宏任务
this is inner settimeout
this is outter settimeout
```

哪个是真的呢，可以试验一下 https://guguji5.github.io/clickIsMacroEvent/ 
**显然同步是不对的，毕竟是IO，肯定异步的。如果是微任务，则输出应该是第二种，也不相符，由此得出是宏任务。**

#### 如果Click事件是宏任务的
```
// 如果click是宏任务 宏任务队列中为[inner listener, outter listener]，微任务队列为[]
inner //执行inner的click listener，console.log同步代码立即执行，微任务队列中push进promise的then 为 [inner then]，宏任务中push进setTimeout 为 [outter listener, inner setTimeout]
// 如果是click是一个宏任务，那么应该先清空微任务队列，再执行宏任务，则执行then
this is inner promise
// 微任务队列为空，执行一个宏任务task：outter listener
outter //执行outter的click listener，console.log同步代码立即执行，微任务队列中push进promise的then，宏任务中再push进setTimeout，为两个setTimeout
this is outter promise //先情况微任务队列，再执行宏任务
this is inner settimeout
this is outter settimeout
```

*https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop*
*http://www.ruanyifeng.com/blog/2014/10/event-loop.html*
