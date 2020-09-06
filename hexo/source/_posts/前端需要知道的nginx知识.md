---
title: 前端需要知道的nginx知识
date: 2020-05-08 16:12:53
tags: nginx
---
看来我必须得写点前端需要掌握的nginx知识了，每次都浪费我好多好多的时间。

# 1. proxy_pass
具体的可以见 https://blog.csdn.net/u010433704/article/details/99945557 这个链接，使用场景是，当我们有很多机器，但是只有一个域名时，可以通过不同的location来转发到不同的机器上。

# 2. gzip
有关gzip的介绍，可以参考这个[如何使用GZIP来优化你的网站](https://guguji5.js.org/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8GZIP%E6%9D%A5%E4%BC%98%E5%8C%96%E4%BD%A0%E7%9A%84%E7%BD%91%E7%AB%99/)，在nginx开启gzip很简单，但是proxy_pass 和 gzip配合起来，有些好坑，https://reinout.vanrees.org/weblog/2015/11/19/nginx-proxy-gzip.html 这个链接解释了如何操作。

# 3. upstream 负载均衡
nginx的一个重要功能就是负载均衡，可以使用upstream来实现。负载均衡的策略可以有很多种，hash，requestUrl，轮询等待。
```
upstream helloworld {
  server 10.133.25.1:8080;
  server 10.160.60.75:8080;
}

server {
    listen 8080;
    server_name www.example.com;
    root /home/demo/public;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        try_files $uri $uri.html /index.html =404;
    }

    location /home/ {
        proxy_pass http://helloworld/;
    }

}
```