---
title: 记录一个bug
date: 2021-08-01 09:56:36
tags:
---
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/b76ecb9a-6268-4a0b-9190-6ca42cb4e9dc/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210801%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210801T015722Z&X-Amz-Expires=86400&X-Amz-Signature=51cf6fcda55f9b38a2760e587997ecec7ec0bfa7a6c93edbb5b02b839f3ffa47&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

接口格式该字段是 string，多个id可以通过空格分割，如下图。虽然我们是ts，但是只能把类型写成string

```jsx
{notify_groups: "2 1" }
```

新增时，用户操作完，需要按空格 join

```jsx
transportData.notify_groups = transportData.notify_groups.join(' ');
```

编辑时从接口获取数据再按空格split

```jsx
notify_groups = curStrategyObj.notify_groups.length > 0 ? curStrategyObj.notify_groups.split(' '): []
```

但是编辑时候有问题，只展示id如下图。

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/cd6ace6a-0092-41f5-8b86-af3474ed7e39/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210801%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210801T015907Z&X-Amz-Expires=86400&X-Amz-Signature=229db94740b110c9e24a227966a10e66a1c6377f631d4bb072cb5df4041ee329&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)

why ? 因为从图一可以看，该Select是从接口获取的，id为number，而前端的组件是将展示的label和背后实际的value分开的。拿该组件距离，它展示的name字段，但是读到的数据是id字段。

```jsx
const notifyGroupsOptions = notifyGroups.map((ng: Team) => (
    <Option value={ng.id} key={ng.id}>
      {ng.name}
    </Option>
  ));
```

Bug怎么产生的呢？因为split 后的数据还是string，而该组件向外抛（或者获取）的数据是number。前端改起来很容易，map时候加个Number方法处理一下就好。

由此bug想到，如果后端把该字段设计成 number[]，前端这么多transfrom就都不必了，还可以用ts的interface来静态检查。何况本来就是user-groups的id字段组成的。