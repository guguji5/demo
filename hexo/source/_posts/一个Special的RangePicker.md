---
title: 一个Special的RangePicker
date: 2021-08-01 09:24:07
tags:
---
很奇妙的感觉，最近在公司做一款开源的产品。公司发着工资让我做开源。嗷，其实我们的商业模式就是开源+商业化。回到正题，为什么我对一个RangePicker耿耿于怀，各种UI组件库里不是都有DatePicker么？ 没错！但是我们需要的是一个这样的RangePicker。

这里是Datadog时间选择器的文档[https://docs.datadoghq.com/dashboards/guide/custom_time_frames/](https://docs.datadoghq.com/dashboards/guide/custom_time_frames/)

<video id="video" controls="" preload="none" poster="http://img-ys011.didistatic.com/static/dc2img/do1_iiaWQLIQLpYgHCnMscVH">
    <source id="mp4" src="http://img-ys011.didistatic.com/static/dc2img/datadog.mp4" type="video/mp4">
</video>

Datadoghq听说市值都300亿美金了，是一个做监控领域的商业化产品，这个好用的RangePicker起码得值1亿（小声比比）。所以我得搞一个这种时间选择器出来。

## Ant design 二次开发

antd已经作为npm包依赖，那么第一想法就是拿它的 DatePicker+Select 通过自己事件的控制做一个出来。事情距离成功只差一步，就是DatePicker的打开和关闭，文档上说可以通过 open 属性来控制选择器的弹出和关闭，但是因为onchange事件的设计导致使用中有一个很重的bug（[https://github.com/ant-design/ant-design/issues/30525](https://github.com/ant-design/ant-design/issues/30525)） 浪费了我很多很多的时间，吃不下睡不着，始终咽不下这口气。

## 弃暗投明

跟周围同事交流和请教之后，发现antd依赖的react-component的代码逻辑（[https://github.com/react-component/picker/blob/master/src/RangePicker.tsx#L439](https://github.com/react-component/picker/blob/master/src/RangePicker.tsx#L439)）就导致这个问题的出现是必然行为。想改rc组件可能性不大，只好去github上找找有没有差不多的组件。果然功夫不负有心人，发现了[https://github.com/y0c/react-datepicker](https://github.com/y0c/react-datepicker)。最终选它的原因在于以下几点。

- 无依赖，antd太庞大了，不想碰
- TypeScript写的虽然文档有点挫，但是通过接口还是能轻松上手
- CodeSandbox 肉眼可见的match需求
- 可配置化程度高

虽然这个库最让我中意的还就是可以通过 show 来控制时间选择器的打开与否。再后来我发现我根本需要的不是一个RangePicker而是一个Calendar！！！但还不是一个单纯的Calendar，而是一个放在RangePicker中样子的Calendar。最终做出来的是这个样子的。

<video id="video" controls="" preload="none" poster="http://img-ys011.didistatic.com/static/dc2img/do1_3INJKj51xnZEfRPBwFiv">
    <source id="mp4" src="http://img-ys011.didistatic.com/static/dc2img/n9e.mp4" type="video/mp4">
</video>
