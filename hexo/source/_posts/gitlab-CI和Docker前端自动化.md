---
title: gitlab-CI和Docker前端自动化
date: 2019-10-14 20:15:59
tags:
---

DevOps已经不是什么新概念了，现在前端开发人员多，分支多，测试环境多，前端自动化的重要性不（无)言（形）而（装）喻（比）。本博客的目的是实现在代码更新后，通过gitlab的webhook自动将部署文件打包成docker镜像。然后通过拿镜像名称去服务器上部署。这里我们分三步走，第一步配置Dockerfile先在本地测试docker build的流程；第二部注册gitlab-runner；第三部配置.gitlab-ci.yml监听代码更新后触发docker build流程并push到docker的hub。

## <a name="docker_config">docker 配置</a>
前端的部署环境很简单，无论你是react，vue还是Angular，部署的时候都是启动一个nginx，然后将build的静态文件放到nginx的共享目录就好了。这里我们不关心前端功能的具体打包过程，直接打包一个简单的html文件到镜像里就好。

#### 1. 安装
docker安装很简单，针对不同的系统提供了不同的方法，参照官方文档[Install Docker](https://docs.docker.com/v17.09/engine/installation/)安装即可。
```
➜  ~ docker

Usage:	docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default "/Users/dida/.docker")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/Users/dida/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/Users/dida/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/Users/dida/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Management Commands:
  builder     Manage builds
  config      Manage Docker configs
  container   Manage containers
  image       Manage images
  network     Manage networks
  node        Manage Swarm nodes
  plugin      Manage plugins
  secret      Manage Docker secrets
  service     Manage services
  stack       Manage Docker stacks
  swarm       Manage Swarm
  system      Manage Docker
  trust       Manage trust on Docker images
  volume      Manage volumes
  ...
```
执行`docker`即为安装成功。

#### 2. 镜像制作
我们需要一个有nginx的镜像，可以nginx依赖一个操作系统。我们用ubuntu为base镜像，在里边安装nginx，然后再讲我们准备好的html（假设其为build后的前端工程）放到nginx的目录。docker build镜像可以用docker commit 也可以用Dockerfile，后者更为灵活，使用也更为广泛。

```
FROM ubuntu:14.04
RUN apt-get -yqq update && apt-get -yqq install nginx
RUN mkdir -p /var/www/html/website
ADD index.html /var/www/html/website
RUN chmod -R 777 /var/www/html/website
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```
Dockerfile的内容包括以下几项：
- 使用ubuntu 14.04为基础镜像
- 更新并安装nginx
- 在容器中创建一个/var/www/html/website目录
- 将静态html文件拷贝到上述目录
- 将上述目录权限改为可读，可写，可执行
- 将准备好的nginx配置copy到容器中
- 暴露出来80端口

```
# global.conf
server {
        listen          0.0.0.0:80;
        server_name     _;

        root            /var/www/html/website;
        index           index.html index.htm;

        access_log      /var/log/nginx/default_access.log;
        error_log       /var/log/nginx/default_error.log;
}
```

```
# nginx.conf
user www-data;
worker_processes 4;
pid /run/nginx.pid;
daemon off;

events {  }

http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;
  gzip on;
  gzip_disable "msie6";
  include /etc/nginx/conf.d/*.conf;
}
```
具体代码可见 https://github.com/guguji5/demo/tree/master/try-ci

打包命令`docker build -t [name]:[tag] .`
然后`docker images`查看本地镜像

#### 2. 镜像上传
制作好的镜像需要推到远端，就像我们的代码需要git push到仓库一样。首先你需要注册一个[docker账号](https://hub.docker.com/)，`docker login`测试是否登录成功，成功后`docker push [name]:[tag]`推到远端

#### 3. 测试镜像
```
docker run -d -p 8081:80 [name]:[tag] nginx
```
查看本地8081端口是否能访问到镜像中的80服务

## gitlab-runner注册
#### 1.安装
根据https://docs.gitlab.com/runner/install/ 选择对应平台安装
根据https://docs.gitlab.com/runner/register/ 进行注册,Runner executor选择shell就好。
注册成功后可以在Settings下边的CI/CD中的Runners看到刚注册的机器。
![gitlab-runner](/images/gitlab-runner.jpg)
#### 2.测试
新建.gitlab-ci.yml并写入如下简单的命令测试job是否能执行成功

```
# 执行job的阶段 按顺序串行执行
stages:
  - upload
job2: # 自定义名字
  stage: upload # 指定这阶段操作的名称
  only: # 指定那些分支会进入该处理流程
    - master # 正式环境
  variables:
    VERSION: 'damon' # 除了后面会说到的私密变量 还可以在这里定义变量
  before_script:

  script:
    - echo "It is a job2,"
    - echo ${VERSION}
    - your_name="qinjx"
    - echo $your_name
    - echo ${your_name}

```

每当master有新的提交时，出触发上述脚本的运行。我们可以在CI/CD - Pipelines中看到对应的job。

![gitlab-runner-job](/images/gitlab-runner-job.png)

## 自动化打包镜像
我们的最终目的是每当代码更新后，自动打包成docker镜像，部署的每台服务器都用同一镜像部署就好。Build Once, Deploy Everywhere.

每当代码更新后gitlab 的hook会自动触发，我们只需要把<a href="#docker_config">第一步</a>中的打包和上传的流程放到hook中即可。.gitlab-ci.yml如下：
```
stages:
  - build
 
# 自定义阶段build的job流程
job1: # 自定义名字
  stage: build # 指定这阶段操作的名称
  only: # 指定那些分支会进入该处理流程
    - master # 正式环境
    - pre # 预发环境
  before_script:

  script:
    - docker login -u $USERNAME -p $PASSWORD
    - IMAGE_ID=`docker build . | tail -n 1 | awk -F "Successfully built " '{print $2}' | sed 's/^ *\| *$//g'`
    - echo "IMAGE_ID=$IMAGE_ID"
    - DATE=`date +%Y%m%d`;
    - docker tag $IMAGE_ID guguji/forth:$DATE.$CI_JOB_ID;
    - docker push guguji/forth:$DATE.$CI_JOB_ID;
    - docker rmi guguji/forth:$DATE.$CI_JOB_ID;
    - echo "--------------------------------------------------------------------------------";
    - echo "guguji/forth:$DATE.$CI_JOB_ID";
```

其中的$USERNAME $PASSWORD是Setting - CI/CD - Variables 中存入的变量。其含义依次是：
- 登录docker
- 执行docker build 并将输出的将镜像ID赋值给IMAGE_ID
- 给上述镜像打上标签
- 上传到docker hub
- 删除本地镜像
- 输出镜像名称

结果如下
```
Running with gitlab-runner 12.3.0 (a8a019e0)
  on damon test xXUC7Le6
Using Shell executor...
Running on 10-254-203-137...
Fetching changes...
Reinitialized existing Git repository in /home/gitlab-runner/builds/xXUC7Le6/0/guguji5/try-ci/.git/
From https://gitlab.com/guguji5/try-ci
 * [new ref]         refs/pipelines/89119102 -> refs/pipelines/89119102
   7aeff9e..6d585aa  master     -> origin/master
Checking out 6d585aa7 as master...
Skipping Git submodules setup
$ docker login -u $USERNAME -p $PASSWORD
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /home/gitlab-runner/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
$ IMAGE_ID=`docker build . | tail -n 1 | awk -F "Successfully built " '{print $2}' | sed 's/^ *\| *$//g'`
$ echo "IMAGE_ID=$IMAGE_ID"
IMAGE_ID=41555aab3b76
$ DATE=`date +%Y%m%d`;
$ docker tag $IMAGE_ID guguji/forth:$DATE.$CI_JOB_ID;
$ docker push guguji/forth:$DATE.$CI_JOB_ID;
The push refers to repository [docker.io/guguji/forth]
82ce84f6435c: Preparing
8f360e1cf4bb: Preparing
8f360e1cf4bb: Pushed
29c9093a1ab9: Pushed
66285ac4bf24: Layer already exists
48334332ed8d: Layer already exists
82ce84f6435c: Pushed
b057ab380990: Layer already exists
bc89fbcf9125: Pushed
46c1a22ffea5: Layer already exists
b17e63608209: Layer already exists
20191016.322211021: digest: sha256:971e8c83827b10e1ffb9d109f7b2507e26622b56113f5ee183b92bdc8e0acd8a size: 2401
$ docker rmi guguji/forth:$DATE.$CI_JOB_ID;
Untagged: guguji/forth:20191016.322211021
Untagged: guguji/forth@sha256:971e8c83827b10e1ffb9d109f7b2507e26622b56113f5ee183b92bdc8e0acd8a
Deleted: sha256:41555aab3b76a88fbde71a02afd7c400973d8ec9f1ab7ce533d4d7cc6dfdb17e
Deleted: sha256:854ac28d0ceabc1b910aa58e96d1fabe577a63a60c3459ca7ee6152f00630cc1
$ echo "--------------------------------------------------------------------------------";
--------------------------------------------------------------------------------
$ echo "guguji/forth:$DATE.$CI_JOB_ID";
guguji/forth:20191016.322211021
Job succeeded
```

*如果有如下报错*
```
Got permission denied while trying to connect to the Docker daemon socket
```
原因是gitlab-runner执行时 是以 gitlab-runner用户来执行的 该用户不属于docker group，需将该用户加入该组。
首先查询 是否有该用户 `cut -d : -f 1 /etc/passwd`
然后查询 是否存在docker组`sudo groupadd docker`
然后执行 将gitlab-runner加入docker组 `sudo gpasswd -a gitlab-runner docker`

**我们想要的效果**是在服务器上拉取我们刚build并上传的镜像，并run 起来就好。我们可以在本地用如下命令测试刚打包的镜像

```
docker pull guguji/forth:20191016.322211021
docker run -d -p 8080:80 guguji/forth:20191016.322211021 nginx
```
效果如下
```
➜  ~ docker pull guguji/forth:20191016.322211021
20191016.322211021: Pulling from guguji/forth
a7344f52cb74: Already exists
515c9bb51536: Already exists
e1eabe0537eb: Already exists
4701f1215c13: Already exists
b9999057545e: Pull complete
57c313e6fd56: Pull complete
76ac29208590: Pull complete
ebec49c77172: Pull complete
c514c1fe8afa: Pull complete
de4ad1f5b5dc: Pull complete
Digest: sha256:971e8c83827b10e1ffb9d109f7b2507e26622b56113f5ee183b92bdc8e0acd8a
Status: Downloaded newer image for guguji/forth:20191016.322211021
➜  ~ docker run -d -p 8080:80 guguji/forth:20191016.322211021 nginx
330efb99cafab59b46ddaf61a62221bf94722e9c76be59523b538cb3a49bd651
➜  ~
```
![gitlab-runner-sample](/images/gitlab-runner-sample.png)
