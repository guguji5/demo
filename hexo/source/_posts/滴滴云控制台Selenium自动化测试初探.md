---
title: 滴滴云控制台Selenium自动化测试初探
date: 2019-02-13 14:23:21
tags: 自动化测试
comments: true
---
Selenium是一系列基于Web的自动化工具，提供一套测试函数，用于支持Web自动化测试。函数非常灵活，能够完成界面元素定位、窗口跳转、结果比较。具有如下特点：

1. 多浏览器支持。如IE、Firefox、Safari、Chrome、Android手机浏览器等。
2. 支持多种语言。如Java、C#、Python、Ruby、PHP等。
3. 支持多种操作系统。如Windows、Linux、IOS、Android等。
4. 开源免费。官网：http://www.seleniumhg.org/

## Selenium组成部分
### 一、Selenium IDE
该工具是一个用于构建脚本的初级工具，其实是FireFox的一个插件，拥有一个易于使用的界面。它拥有记录功能，能够记录用户执行的操作，并可以导出为可重复使用的脚本。如果没有编程经验，可以通过Selenium IDE来快速熟悉Selenium的命令。较少使用。

### 二、Selenium RC
Selenium RC是selenium家族核心部分。Selenium RC支持多种不同的语言编写自动化测试脚本，通过SeleniumRC的服务器作为代理服务器去访问应用，从而达到测试的目的。

### 三、Selenium WebDriver
当Selenium2.x提出了WebDriver的概念之后，它提供了完全另外的一种方式与浏览器交互。那就是利用浏览器原生的API，封装成一套更加面向对象的SeleniumWebDriver API，直接操作浏览器页面里的元素，甚至操作浏览器本身（截屏，窗口大小，启动，关闭，安装插件，配置证书之类的）。由于使用的是浏览器原生的API，速度大大提高，而且调用的稳定性交给了浏览器厂商本身，显然是更加科学。然而带来的一些副作用就是，不同的浏览器厂商，对Web元素的操作和呈现多少会有一些差异，这就直接导致了Selenium WebDriver要分浏览器厂商不同，而提供不同的实现。例如Firefox就有专门的FirefoxDriver，Chrome就有专门的ChromeDriver等等。（甚至包括了AndroidDriver和iOS WebDriver）

### 四、Selenium Grid
Selenium Grid通过在许多服务器上同时运行测试，将Selenium Remote Control带到另一个层次，从而减少了测试多个浏览器或操作系统所需的时间。

----

这里借助Selenium WebDriver，以[滴滴云控制台](https://app.didiyun.com/#/)的**默认选中**为例展示Selenium如何解放测试人员的双手。

[滴滴云控制台](https://app.didiyun.com/#/)的[DC2创建页](https://app.didiyun.com/#/dc2/add)承载着复杂的业务逻辑，众多页面都需要跳转到此，并需要根据URL上的参数而对DC2的配置做默认选中。当多人开发对业务逻辑耦合时，众多逻辑均会对默认选中的结果造成影响，难以避免导致BUG的产生。在手动测试的情况下，需要回归测试整个页面的所有功能点，而用Selenium如何如何保证页面的稳定呢？

### Selenium安装

Selenium支持多种语言，python最受欢迎，安装也比较简单。
```
pip install selenium
```
然后需要根据[链接](https://sites.google.com/a/chromium.org/chromedriver/downloads)下载chromedriver 到/usr/local/bin。

执行以下代码检测你的环境已经安装完毕
```
# coding = utf-8
from selenium import webdriver
import time

browser = webdriver.Chrome()
browser.get("http://www.baidu.com")
browser.find_element_by_id("kw").send_keys("selenium")
browser.find_element_by_id("su").click()
time.sleep(3)
browser.quit()
```
如果程序能正常打开你的Chrome浏览器，输入selenium并搜索，则说明Selenium安装成功。

### Selenium定位页面元素

webdriver提供了一系列的对象定位方法，常用的有id,name,class name,link text,partial link text,tag name,xpath,css selector，针对百度的网页可以有一下多种方法定位页面元素。

```
#coding=utf-8

from selenium import webdriver
import time

browser = webdriver.Chrome()

browser.get("http://www.baidu.com")
time.sleep(2)

#########百度输入框的定位方式##########

#通过id方式定位
browser.find_element_by_id("kw").send_keys("selenium")

#通过name方式定位
browser.find_element_by_name("wd").send_keys("selenium")

#通过tag name方式定位
browser.find_element_by_tag_name("input").send_keys("selenium")

#通过class name 方式定位
browser.find_element_by_class_name("s_ipt").send_keys("selenium")

#通过CSS方式定位
browser.find_element_by_css_selector("#kw").send_keys("selenium")

#通过xpath方式定位
browser.find_element_by_xpath("//input[@id='kw']").send_keys("selenium")

############################################

browser.find_element_by_id("su").click()
time.sleep(3)
browser.quit()
```
### 测试登录 
因为滴滴云控制台部分页面需登录后方可打开，所以测试的第一步打开首页，填入用户名密码。

```
#coding=utf-8
from selenium import webdriver

import time

driver = webdriver.Chrome()
driver.get("http://app.didiyun.com")

driver.find_element_by_css_selector('input[type="text"]').send_keys("189****3932")
driver.find_element_by_css_selector('input[type="password"]').send_keys("3e****FV")
time.sleep(2)

subbutton=driver.find_element_by_css_selector('button[type="submit"]')

subbutton.click()

time.sleep(3)

```
检查程序可以打开滴滴云控制台首页，并成功登录dashboard页，则登录验证成功。

### 测试默认项选中

本次自动化测试的目的为检测从官网跳转到控制台时，进入https://app.didiyun.com/#/dc2/add?srvType=ebs&systemDiskType=HE&zoneId=gz01 页，能否默认选中广州一区，标准云服务器，系统盘为高效云盘。

```
#coding=utf-8
from selenium import webdriver

import time

driver = webdriver.Chrome()
driver.get("http://app.didiyun.com")

driver.find_element_by_css_selector('input[type="text"]').send_keys("18903393932")
driver.find_element_by_css_selector('input[type="password"]').send_keys("3edc$RFV%TGB")
time.sleep(2)

#测试的最终结果
TEST_PASS = True

subbutton=driver.find_element_by_css_selector('button[type="submit"]')

subbutton.click()

time.sleep(3)
if (driver.current_url == 'https://app.didiyun.com/#/'):
	print 'Success our dashboard login'

print "Opening our target page"
driver.get('https://app.didiyun.com/#/dc2/add?srvType=ebs&systemDiskType=HE&zoneId=gz01')

#浏览器打开需要时间
time.sleep(3)
if (driver.current_url == 'https://app.didiyun.com/#/dc2/add?srvType=ebs&systemDiskType=HE&zoneId=gz01'):
	print 'Opened the dc2 add page'
#################################################
regionName = driver.find_element_by_css_selector('div.region-select3-item.active .region-head span').text

zoneName = driver.find_element_by_css_selector('div.region-select3-item.active .zone-item.active span').text
if(regionName != u'广州'):
	TEST_PASS = False
	print u"期望区域是广州，但实际选中是%s" %(regionName)
else:
	if(zoneName != '1'):
		TEST_PASS = False
		print u"期望1区，但实际选中是%s区" %(zoneName)
#################################################
serverType = driver.find_elements_by_xpath('//*[@id="app"]/div[2]/div/form/div[3]/div[1]/div/div[1]/div/div[2]/div/span[1]')[0].text

if(serverType != u'标准云服务器'):
	 TEST_PASS = False
	 print u"期望服务器类型是标准云服务器，但实际选中是%s" %(serverType)
##################################################
serverVerion = driver.find_elements_by_xpath('//*[@id="app"]/div[2]/div/form/div[3]/div[2]/div[1]/div/label[1]/span/span')[0].text

if(serverVerion != u'通用型'):
	TEST_PASS = False
	print u"期望服务器类型是通用型，但实际选中是%s" %(serverVerion)
#################################################
diskType = driver.find_element_by_css_selector('div.selector-wrapper input').get_attribute('value')
if(diskType != u'高效云盘'):
	TEST_PASS = False
	print u"期望的系统盘类型是高效云盘，但实际选中是%s" %(diskType)

if(TEST_PASS):
	print 'SUCCESS 从官网跳到控制台dc2创建页，选中了对应的配置'
else:
	print 'FAIL 从官网跳到控制台dc2创建页，未选中了对应的配置'


time.sleep(3)
driver.close()
```
如果有如下输出，则测试失败，需要我们手动进入对应页面查看默认选中项的情况。

```
(venv) ➜  ~ python test.py
Success our dashboard login
Opening our target page
期望的系统盘类型是高效云盘，但实际选中是普通云盘
FAIL 从官网跳到控制台dc2创建页，未选中了对应的配置
(venv) ➜  ~ 
```
如果有如下输出，则通过测试。
```
(venv) ➜  ~ python test.py
Success our dashboard login
Opening our target page
Opened the dc2 add page
SUCCESS 从官网跳到控制台dc2创建页，选中了对应的配置
(venv) ➜  ~
```

### 后记

我们知道，selenium是一个很优秀的web框架，提供了很丰富的API，使用它结合进行做web的自动化测试真的很完美，但是在实际的情况中，理想与现实总是存在那么一点距离，这点距离主要是难维护，难维护的最核心是页面元素经常改变，测试过程中数据很多，不知道怎么进行维护，页面元素确实经常改变，很难改变，另外一个就是数据问题，比如我们验证N个表单在不同输入情况下的提示信息，会有不同的提示信息，都得需要验证。

本文只是一个菜鸡前端为减少重复劳动而对自动化测试所做的一个探索，专业的自动化测试肯定会封装的更加易用，可读，可维护。断言，日志都会用更加专业的框架。

期待自动化测试可以为滴滴云的稳定性出一份力。

参考链接：

Selenium官网：https://www.seleniumhq.org









