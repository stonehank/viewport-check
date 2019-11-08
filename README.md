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

- [ ] 横向滚动判断
- [ ] 进入视口回调的方向参数
- [ ] 基于自定义父组件的滚动

### 使用说明

* 安装

`npm install viewport-check`


* 使用

```js
import ViewportCheck from 'viewport-check'

new ViewportCheck({
  element:document.getElementById("target"),
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

### Options

|Attr|Description|Default value|Type|Required|
|:---|:---|:---:|:---:|:---:|
|element  |需要监控的元素|/|HTMLElement|true|
|parentEle|目标元素的父级|window|HTMLElement|false|
|offset|进出视口的偏移量|0.3|Number[String]|false|
|baseAt|偏移量基于元素还是屏幕|target|(target/screen)|false|
|padding|高度计算是否包括padding[更多](#关于高度计算)|true|Boolean|false|
|border|高度计算是否包括border[更多](#关于高度计算)|true|Boolean|false|
|margin|高度计算是否包括margin[更多](#关于高度计算)|false|Boolean|false|
|useCssComputed|是否使用`css`的高度设置，默认为使用`getBoundingClientRect`，这个是为了避免当元素初始为`scale(0)`的情况，无法准确获取高度|false|Boolean|false|
|autoDestroy|是否在进入视口后销毁|false|Boolean|false|
|direction|滚动方向|ver|(ver/hor)|false|
|enter|进入视口的回调函数|()=>{}|Function|false|
|leave|离开视口的回调函数|()=>{}|Function|false|


### 关于高度计算

在css的盒模型中，最外层的是`margin`，接着是`border`，接着是`padding`和`height`。

在`ViewportCheck`中，默认是`margin:false`，`border:true`， `padding:true`；这么做遵循了`element.offsetHeight`的配置。

因此，如果设定了`margin:true`，也就意味着包括`margin`，同样也包括了`border`和`padding`。

如果只想计算最纯粹的`height`，那么需要设定`border:false`, `padding:false`, 因为`margin`默认为`false`。
