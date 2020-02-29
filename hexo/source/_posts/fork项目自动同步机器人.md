---
title: fork项目自动同步机器人
date: 2020-02-29 20:14:28
tags: 机器人
---
调研了一段时间微前端，发现single-spa的实现很简单清晰，就把它当做主要解决方案使用在项目中，加入其Slack后，single-spa的作者有问必答，着实让人感动，所以在其提出能否帮翻译single-spa的文档时，我也没有推辞。翻译的过程，也是一个详细了解的过程，认真求索的过程。

## 脚本

在参考了react团队的[翻译经验](https://reactjs.org/blog/2019/02/23/is-react-translated-yet.html)后，需要有个同步机器人，具体来讲就是当英文版文档更新后，需要同步到其他语言的文档。

本来以为很难，就去看react翻译团队的[同步机制](https://github.com/reactjs/reactjs.org-translation/blob/master/scripts/sync.js)。很简单，却有一个问题，log没有存储，无法查看运行的状况，而这点log4js本身是支持的。支持了log本地输出的问题，缺引发了另一个问题，`process.exit`会中断log4js日志的写入。尝试了网上的几种解决方案后，如监听beforeExit事件和`process.exit`后通过异步事件输出log都不可信，nodejs的文档也写的非常清楚。

```
在调用 'exit' 事件监听器之后，Node.js 进程将立即退出，从而导致在事件循环中仍排队的任何其他工作被放弃。
```

所以，只好对条件进行通过IF ELSE来判断以保证所有的log都能正常输出，带来的副作用就是没有之前可读性强，后序有时间我再调研一下。

首先需要将待翻译仓库 `git clone` 到本地，然后使用`git remote add`将英语文档的地址添加为远端仓库。

具体同步的流程如下图，so easy。

![同步流程](/images/sync-process.png)

直接提交，会以single-spa-bot账户直接向翻译的仓库直接提交。具体就像[这样](https://github.com/single-spa/zh-hans.single-spa.js.org/commits?author=single-spa-bot)。

而冲突后，会将冲突痕迹保留，等待reviewer来解决冲突。具体就像[这样](https://github.com/guguji5/zh-hans.doc/pull/25/files)。

到此为止，脚本应该是ok了，仓库地址 [https://github.com/guguji5/sync-fork-repo](https://github.com/guguji5/sync-fork-repo)。

*应single-spa owner的要求，后续可能将此仓库transfer到single-spa的账号下*

## 部署

脚本虽然ok了，但是部署却着实让我费了一番功夫。所谓机器人，无非就是一个定时任务，也没有很强的时效性，每天同步一次就可以。

1. 脚本中用到了环境变量，crontab的环境变量我相信谁用谁入坑，这里不展开，google可了解。
2. 脚本中用了一些箭头函数，模板字符串等，对node版本有一定的要求。CentOs中如何升级node，当然是n模块啦。
3. 脚本中使用了`git rev-parse`方法，git1和git2中语法不通，再屡次尝试升级git失败后，只好使用git1语法，git2兼容git1语法。
4. 最后学了一招如何在[同一组织下fork仓库](https://stackoverflow.com/questions/22767617/copy-fork-a-git-repo-on-github-into-same-organization)。

## 结语

虽然是一个很小的东西，但是做出来也是花了很多的时间，也学到了很多的东西，比如crontab定时任务，log4js日志管理后来很快就用到了，git的远程分支管理理解的更加深入。