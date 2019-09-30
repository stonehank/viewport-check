> 检测元素是否进入或者退出视口。

[![npm](https://img.shields.io/npm/v/viewport-check.svg)](https://www.npmjs.com/package/viewport-check)


### 特性

1. 可选择基于屏幕或者元素来判断是否进入视口，例如进入屏幕`30%`后，或者元素出现`30%`后

2. 输入方式多样化，可以输入数字`200`，字符串`30%`，小数`0.3`

3. 可选择`autoDestory`模式，进入视口后，移除监听，销毁对象

4. 元素高度自定义，可选择：
    
    1. 包括`margin, border, padding`
    2. 包括`border, padding`，不包括`margin`
    3. 包括`padding`，不包括`margin,border`
    4. 纯粹的高度，不包括`margin, border, padding`


### 效果查看

[暂无，添加中](https://stonehank.github.io/viewport-check)


### 待添加特性

- [] 横向滚动判断
- [] 进入视口回调的方向参数
- [] 基于自定义父组件的滚动

### 使用说明

* 安装

`npm install viewport-check`


* 使用

```js
import ViewportCheck from 'viewport-check'

new ViewportCheck({
  element:document.getElementById("#target"),
  offset:0.3,
  baseAt:'target',
  margin:true,
  enter:() => {
    console.log('enter, the height include margin, border and padding!')
  },
  leave:() => {
    console.log('leave')
  }
})

```

### 关于自定义高度

在css的盒模型中，最外层的是`margin`，接着是`border`，接着是`padding`和`height`。

在`ViewportCheck`中，默认是`margin:false`，`border:true`， `padding:true`；这么做遵循了`element.offsetHeight`的配置。

因此，如果设定了`margin:true`，也就意味着包括`margin`，同样也包括了`border`和`padding`。

如果只想计算最纯粹的`height`，那么需要设定`border:false`, `padding:false`, 因为`margin`默认为`false`。
