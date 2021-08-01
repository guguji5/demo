---
title: AST搞定i18n
date: 2021-07-31 15:47:12
tags:
---

最近的夜莺开发过程中虽然提前被告知过需要做好i18n的准备，但是开发过程很紧张，难点一个又一个，i18n就被低优考虑了，等快上线前补充这个功能的时候。已经有133 个文件，577 处需要被translation函数包裹，而且每个文件前都需要引入依赖，就变成一个纯粹的体力活。每个文件都需要如下的改动

```jsx
import React from 'react';
+ import { useTranslation } from 'react-i18next';
export default function About() {
+ const { t } = useTranslation();
-  return <h2>关于</h2>;
+  return <h2>t('关于')</h2>;
}
```

我的第一个想法是拿nodejs脚本通过正则的手段来匹配dom中的中文，属性中的中文，模板字符串中的中文等进行对应的包裹，插入和替换。团队中的另一个小伙伴提出可以使用AST来做，我们就开始了babel的探索。

babel以及AST的介绍我就不再赘述，以下链接都讲的非常清楚和深入。


下边的链接都是精华

- [https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-traverse](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#babel-traverse)

- [https://babeljs.io/docs/en/babel-types](https://babeljs.io/docs/en/babel-types)

- [https://astexplorer.net/](https://astexplorer.net/)

- [https://www.cnblogs.com/jyybeam/p/13375179.html](https://www.cnblogs.com/jyybeam/p/13375179.html)

- [https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation/](https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation/)

- [https://lihautan.com/manipulating-ast-with-javascript/#creating-a-node](https://lihautan.com/manipulating-ast-with-javascript/#creating-a-node)




上边那么多的链（血）接（泪）告诉我们几个事实。

- AST的Node类型很多，很复杂，变幻多端；但是可以对不同的类型进行精准操作很方便。
- 看起来用字符串处理能轻松搞定的事，AST费死老劲
- AST一定要用最新的包，看最新的文档。babel-types，babel-traverse等等都是过时的包，最新的包都在@babel的目录下

举个简单的例子吧，我们写一个最简单的代码`const habit = t("running");`如果用AST来构造是什么样子的呢？

```jsx
const t = require('@babel/types');
const generate = require('@babel/generator').default;

const Identifier = t.Identifier('habit')
const callee = t.Identifier('t')
const arguments =t.StringLiteral('running')
const CallExpression = t.CallExpression(callee, [arguments])
const VariableDeclarator = t.VariableDeclarator(Identifier, CallExpression)
const variableDeclaration = t.variableDeclaration('const',[VariableDeclarator])
const output = generate(variableDeclaration);
console.log(output.code);   // 输出 const habit = t("running");
```

天壤之别。所以根据 [https://lihautan.com/manipulating-ast-with-javascript/#creating-a-node](https://lihautan.com/manipulating-ast-with-javascript/#creating-a-node) 的推荐，使用@babel/parse将需要的结构直接解析。

```jsx
const babelParser = require('@babel/parser');
const generate = require('@babel/generator').default;

const expectNode = babelParser.parse(`const habit = t("running")`).program.body[0];
const output = generate(expectNode);
console.log(output.code);   // 输出 const habit = t("running");
```

回到正题，我们想要的是什么？

1. 插入依赖
2. 调用useTranslation hook
3. 包裹字符串

第一个插入依赖，使用上边提到的方法找到对应的节点插入即可。

第二个插入hook，粗暴的在所有返回JSX 函数组件顶层添加一个useTranslation 调用即可。

第三个使用t方法包裹字符串则比较麻烦，需要根据dom，属性，以及模板字符串中的分别记性处理。

普通字符串处理比较简单，直接在traverse中调用`path.replaceWithSourceString('t("'+node.value+'")')`就好。但是要处理好所有的场景需要分别对StringLiteral，JSXText，TemplateLiteral，ReturnStatement，Program等类型分别进行处理。

假设我们要处理的原文件如下：

source javascript

```jsx
import React from 'react';
import { Input } from 'antd';
export default function About() {
    const name = '咕咕鸡';
    const habit = '跑步';
    const description = `${name} 是个boy`;
    return (
    <>
        <h2>关于</h2>
        <p>
        我的名字： {name}, 我的兴趣： {habit + '网球'}
        </p>
        <p>{description}</p>
        <Input placeholder='请输入你的年龄' />
    </>
    );
}
```

完整的babel脚本

```jsx
let fs = require('fs');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const core = require('@babel/core');
const path = require('path');
const srcPath = path.resolve('../', 'src', 'pages', 'about.tsx');

const includeSpace = v => /[\f\r\t\n\s]/.test(v);
const includesChinese = v =>/^[\u4e00-\u9fa5]+/g.test(v);
const extractChinese = str => str.match(/[\u4e00-\u9fa5]+/g)

const code = fs.readFileSync(srcPath, 'utf8');

let ast = babelParser.parse(code, {
    sourceType: 'module', // default: "script"
    plugins: ['typescript', 'jsx'],
    });

// transform the ast
traverse(ast, {
    StringLiteral(path){
        const { node, parent } = path;

        if(includesChinese(node.value)){
            // console.log('StringLiteral', node.value, parent)
            if(t.isJSXAttribute(parent)){
                // <Input placeholder='请输入你的年龄' /> => <Input placeholder={t('请输入你的年龄')} />
                // 按说应该这么写 path.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier('t'),[t.stringLiteral(node.value)])))
                // 但是结果是 <Input placeholder={t(t("请输入你的年龄"))} /> 
                // 明显被下边的逻辑重复处理了所以可以简单点。只处理成字符串,再经过下边逻辑时就变成我们想要的结果
                path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(node.value)))
                return
            }else{
                path.replaceWithSourceString('t("'+node.value+'")')
            }
        }
        path.skip()
    },
    JSXText(path){
        const { node, parent } = path;
        const { value } = node;
        if(includesChinese(node.value)){
            if(!includeSpace(node.value)){
                path.replaceWith(t.jsxExpressionContainer(t.stringLiteral(node.value)))
                return
            }else{
                const newAstNode = []
                let chineseArr = extractChinese(node.value)
                chineseArr.forEach(str =>{
                    let preIndex = node.value.indexOf(str)
                    newAstNode.push(t.jSXText(node.value.slice(0,preIndex)))
                    newAstNode.push(t.jsxExpressionContainer(t.stringLiteral(str)))
                })
                path.replaceWithMultiple(newAstNode)
                return
                // console.log(value.length, value.replace(/[\u4e00-\u9fa5]+/,function(value){return `{t('${value}')}`}) )
                // path.replaceWithSourceString(value.replace(/[\u4e00-\u9fa5]+/,function(value){return `{t('${value}')}`}))
            }
            
        }
        path.skip()
    },
    // 模版字符串
    TemplateLiteral: function (path) {
        const { node } = path;
        // expressions 表达式
        // quasis 表示表达式中的间隙字符串, 每个表达式中间都必须有quasis, 同时首尾也必须是quasis,其中末尾元素需要是tail = true
        // 其中 quasis: {
        //    value: 值, 如果为‘’,一般表示给表达式的占位符
        //     tail: 是否为末尾
        // }
        const { expressions, quasis } = node;
        // todo 获取所有quasis中value 不为空和数字的, 如果不为末尾,记录前面有几个''
        // 生成函数, 插入expressions数组中, 修改quasis节点value为空
        // 如果字符串为最后一个节点,还需要生成一个空白的节点
        let hasTail = false;
        let enCountExpressions = 0;
        quasis.forEach((node, index) => {
            const {
            value: { raw },
            tail,
            } = node;
            if (!includesChinese(raw)) {
            return;
            } else {
            let newCall = t.stringLiteral(raw);
            expressions.splice(index + enCountExpressions, 0, newCall);
            enCountExpressions++;
            node.value = {
                raw: '',
                cooked: '',
            };
            // 每增添一个表达式都需要变化原始节点,并新增下一个字符节点
            quasis.push(
                t.templateElement(
                {
                    raw: '',
                    cooked: '',
                },
                false,
                ),
            );
            }
        });
        quasis[quasis.length - 1].tail = true;
        return
    },
    ReturnStatement(path) {
        const { node, parent, parentPath } = path;
        const { body } = parent;
        body.unshift(
            babelParser.parse('const { t } = useTranslation()').program.body[0],
        );
    },
    Program(path) {
        const { node } = path;
        const { body } = node;
        
        body.unshift(babelParser.parse("import { useTranslation } from 'react-i18next'",{sourceType: 'module'}).program.body[0])
    }
});

const output = generate(ast);
console.log(output.code);
```

target javascript

```jsx
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Input } from 'antd';
export default function About() {
    const {
    t
    } = useTranslation();
    const name = t("咕咕鸡");
    const habit = t("跑步");
    const description = `${name}${t(" 是个boy")}`;
    return <>
        <h2>{t("关于")}</h2>
        <p>
        {t("我的名字")}{name}, {t("我的兴趣")}{habit + t("网球")}
        </p>
        <p>{description}</p>
        <Input placeholder={t("请输入你的年龄")} />
    </>;
}
```

这次的i18n的过程中学到了很多，第一次手写一个babel的visitor方法，不断的调试中感受到尤大能把vue转成JavaScript的loader是真的不易。
