---
title: Hexo + Github搭建静态博客(一)
date: 2018-11-09 13:19:48
tags: Hexo
comments: true
---
### 快速介绍
Hexo是一个基于Node.js搭建的静态博客框架，通过Hexo，用户可以以博文的方式发布Markdown文档。结合默认或定制化主题模板（很像其他静态博客生成框架，Jekyll或Ghost）博文会被转化和生成为HTML/CSS。Hexo所需的所有组件都是模块化的，所以你可以按需安装。

### 提前准备
跟着本博客，你可能需要提前准备：

1. git
2. Node.js
3. Github账号

### 第一步 安装和初始化Hexo
这一步需要安装好Hexo所需的东西，Hexo是有许多软件包组成的，而最必要的一个就是npm，Node.js包管理器。

首先，安装hexo-cli,最重要最核心的Hexo命令。
```
$ npm install hexo-cli -g
```
其次，我们需要创建一些基础文件，很幸运，Hexo为我们提供了一键生成的命令。我们只需要切换到准备好的文件夹目录，执行如下命令。
```
$ hexo init 
```
此时，文件夹下可能会出现很多文件和文件夹，如下图所示：
```shell
blog/
├── _config.yml
├── node_modules
├── package.json
├── scaffolds
├── source
└── theme

4 directory, 2 files
```

### 第二步 设置Hexo主要的配置文件 _config.yml
上图的这些文件中，_config.yml是至关重要的，所有的核心配置都存储在这个博客中，如果将来你想调整博客的一些设置，大概率就是这个文件。

我们将会一步一步的修改配置，选择你喜欢的编辑器，vi， nano 或者sublime等打开_config.yml，在最上边你会看到如下的内容。
```
# Site
title: Hexo
subtitle:
description:
author: John Doe
language:
timezone:
```
前四行分别是博客的名称，二级名称，描述和作者的名称。目前不是所有的Hexo主题都会显示这些信息，所以它大多数当成网站基本信息。

后边两行是语言和时区，语言选择两字符ISO 639-1代码。时区默认指的是用户服务器的时区，用“tz database"格式。你可以根据需要修改他们，下边是一个例子：
```
#Site
title: 滴滴云博客 
subtitle: 为开发者而生 
description: 滴滴云基于滴滴出行的业务技术和经验积累,采用领先的云计算架构、高规格服务器集群搭建、高性能资源配置机制、精细化运营模式,致力于为开发者提供简单快捷、高效稳定。
author: didicloud 
language: zh-CN 
timezone: 
```
**主题** 的更换是在_config.yml中`theme`字段。

最后我们要更改的设置是default_layout: 在Writing下边，在一个博文没发表之前，它是不可见的，我们想存成草稿，所以我们把default_layout设置成draft。
```
# Writing
new_post_name: :title.md # File name of new posts
default_layout: draft
titlecase: false # Transform title into titlecase
```
### 第三步 创建和发表博客
用如下命令来创建一个博文（草稿）,这里的‘first-page’是博文的名称。

```
$ hexo new first-post
```
然后我们应该会看到这样的显示：
```
Output
INFO  Created: ~/hexo_blog/source/_drafts/first-post.md
```
我们可以选择自己喜欢的编辑器，打开first-post.md

每一个博文都有一个front-matter设置，Front-matter是一个JSON or YAML块，它可以用来设置这标题，发布时间，标签等等。Front-matter一般用`---`或者`;;;`标志结尾。在Front-matter之后，你可以用Markdown语法写自己的博文。

用如下的内容替换first-post.md的内容。
```
title: 滴滴云--为开发者而生
tags:
  - Test
  - Blog
categories:
  - Hexo
comments: true
date: 2018-11-04 00:00:00
---

## Markdown goes here.

**This is our first post!**
```
然后执行`$ hexo publish first-post`会看到如下的结果：
```
Output
INFO  Published: ~/hexo_blog/source/_posts/first-post.md
```
### 第四步 启动服务器
到目前为止，所有的配置文件和博文都已准备完毕，接下来，我们启动服务器。
```
$ hexo server
```
现在，我们可以访问自己的博客通过`http://localhost:4000`。你会看到自己预设的hello-world博客,`ctrl+c`可以停止服务器。
![draw](https://img-blog.csdn.net/20161023150235594?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)
### 第五步 设置部署脚本
到目前为止，Hexo有许多不同的方法可以部署，本博客是用git来进行存储，上传，托管博客。除此之外，还支持Heroku, Git, Rsync, OpenShift, FTPSync等多种工具。

这里需要一个git仓库来存储Hexo生成的静态HTML文件，为了简单起见，这里我们用Github提供的git仓库。

在Github上创建一个`<username>.Github.io`的仓库，选择“Public”，并且点击“Initialize this repository with a README”选择框。然后打开_config.yml。
```
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type:
```
按如下所示，填上deploy选项，你必须替换`username`为自己的Github账号。
```

deploy:
  type: git
  repo: https://Github.com/username/username.Github.io.git //e.g. https://Github.com/guguji5/guguji5.Github.io.git
  branch: master
```
因为我们选择了git来部署，所以我们需要安装Hexo包来发布静态模板到git仓库。用npm来安装：
```
$ npm install hexo-deployer-git --save
```
现在你可以部署你的代码到Github仓库了。
```
$ hexo generate && hexo deploy
```
在Github密码校验框输入密码以后，如下是成功结果。
```
hexo HEXO G
INFO  Start processing
INFO  Files loaded in 214 ms
INFO  Generated: archives/2018/index.html
INFO  Generated: repository/index.html
INFO  Generated: archives/index.html
INFO  Generated: about/index.html
INFO  Generated: archives/2018/11/index.html
INFO  Generated: index.html
INFO  Generated: angular-splitter/index.html
INFO  Generated: 如何使用GZIP来优化你的网站/index.html
INFO  8 files generated in 231 ms
➜  hexo HEXO D
INFO  Deploying: git
INFO  Clearing .deploy_git folder...
INFO  Copying files from public folder...
INFO  Copying files from extend dirs...
[master 143ec29] Site updated: 2018-11-04 23:14:03
 8 files changed, 80 deletions(-)
To https://Github.com/guguji5/guguji5.Github.io.git
   c8f0b04..143ec29  HEAD -> master
Branch master set up to track remote branch master from https://Github.com/guguji5/guguji5.Github.io.git.
INFO  Deploy done: git
```
### 结语
完成了所有配置，快去搭建属于自己的静态博客吧。
1. https://guguji5.Github.io/
2. https://kouss.com/

*Hexo的子页面包括归档、分类，标签使用，github项目的关联，ejs模板的配置将在下一篇《Hexo + Github搭建静态博客(二)》中给大家分享。*