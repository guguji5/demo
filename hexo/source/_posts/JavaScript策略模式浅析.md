---
title: JavaScript策略模式浅析
date: 2020-06-04 14:26:22
tags:
---

策略模式封装了针对 **特定任务** 的可选策略。在客户端（使用方）无感的前提下，它允许一个方法在运行时 **切换** 成任何其他策略。本质上，策略是一组可互换的算法。

## 例1. 算法效率

假设要测试不同排序算法的性能，包括希尔排序，堆排序，冒泡排序，快速排序等。应用策略模式，可以将测试代码循环所有的算法。我们可以在运行时更改数组中的每一个算法。为了使策略模式生效，所有的算法参数必须相同，这使得算法可以变换，而对测试程序无感。

测试算法效率是Context，不同的算法是不同的Strategy。算法可以测试人的需求来变更。

## 例2. 快递计费

在本例中，我们有一个产品订单，需要从仓库发货给客户。对不同的快递公司进行评估，以确定最优价格。这对于购物车非常有用，在购物车中，客户可以选择自己的运输偏好，所选择的策略返回估算的成本。

运输是Context，三家快递公司顺丰，EMS, 和圆通是Strategy。货运(策略)改变了3次，每次我们计算快递成本。在真实的场景中，计算方法可能调用快递公司的Web服务。最后我们显示了不同的成本。

## 策略模式组成

## 1. Context ##
在例2中，寄快递这件事是Context，他有三个特性：
1. 可以获取当前策略的引用（比如出发地信息，目的地信息，包裹重量等等）
1. 根据不同策略计算不同价格
1. 允许用户选择不同的快递公司 

## 2. Strategy ##
实现算法的接口

## 策略模式流程图
![pattern](/images/strategy_pattern.jpg)

## show me your code

```
var Shipping = function() {
    this.company = "";
};
 
Shipping.prototype = {
    setStrategy: function(company) {
        this.company = company;
    },
 
    calculate: function(package) {
        return this.company.calculate(package);
    }
};
 
var UPS = function() {
    this.calculate = function(package) {
        // calculations...
        return "$45.95";
    }
};
 
var USPS = function() {
    this.calculate = function(package) {
        // calculations...
        return "$39.40";
    }
};
 
var Fedex = function() {
    this.calculate = function(package) {
        // calculations...
        return "$43.20";
    }
};
 
// log helper
 
var log = (function() {
    var log = "";
 
    return {
        add: function(msg) { log += msg + "\n"; },
        show: function() { alert(log); log = ""; }
    }
})();
 
function run() {
    var package = { from: "76712", to: "10012", weigth: "lkg" };
 
    // the 3 strategies
 
    var ups = new UPS();
    var usps = new USPS();
    var fedex = new Fedex();
 
    var shipping = new Shipping();
 
    shipping.setStrategy(ups);
    log.add("UPS Strategy: " + shipping.calculate(package));
    shipping.setStrategy(usps);
    log.add("USPS Strategy: " + shipping.calculate(package));
    shipping.setStrategy(fedex);
    log.add("Fedex Strategy: " + shipping.calculate(package));
 
    log.show();
}
```

## links:
https://www.dofactory.com/javascript/strategy-design-pattern
https://refactoringguru.cn/design-patterns/state