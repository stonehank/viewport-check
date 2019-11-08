import 'waypoints/lib/noframework.waypoints'

const Waypoint = window.Waypoint

function ViewportCheck ({
  element = null,
  parentEle = null,
  offset = 0.3,
  enter = () => {},
  leave = () => {},
  baseAt = 'target',
  autoDestroy = false,
  // 避免类似初始化时 scale(0)， 无法准确获取高度
  useCssComputed = false,
  direction='ver',
  padding = true,
  border = true,
  margin = false,
} = {}) {
  if (!element) {
    throw new Error('Must need element!')
  }
  this.parentEle = parentEle
  if (!parentEle) {
    this.parentIsWindow = true
    this.parentEle = window
  }

  this.element = element
  this.direction=direction
  this.enter = enter
  this.leave = leave
  this.autoDestroy = autoDestroy
  this.useCssComputed = useCssComputed
  this.baseAt = baseAt
  this.offset=offset
  this.margin=margin
  this.border=border
  this.padding=padding
  this.hasDestoryed=false
  this.init=this.init.bind(this)

  this.init()
  this.bindResize()
}

ViewportCheck.prototype.bindResize=function(){
  window.addEventListener('resize',this.init)
}

ViewportCheck.prototype.init=function(){
  if(this.hasDestoryed)return
  this.prevState=this.state
  this.bottomPass = false
  this.topPass = false
  this.state = 'out-up'
  this.computedStyle = window.getComputedStyle(this.element, null)
  // const pureHeight = this.getStyle(this.computedStyle, 'height')
  const marginTop = this.getStyle(this.computedStyle, '  marginTop')
  const marginBottom = this.getStyle(this.computedStyle, 'marginBottom')
  const marginLeft = this.getStyle(this.computedStyle, 'marginLeft')
  const marginRight = this.getStyle(this.computedStyle, 'marginRight')
  const borderTop = this.getStyle(this.computedStyle, 'borderTopWidth')
  const borderBottom = this.getStyle(this.computedStyle, 'borderBottomWidth')
  const borderLeft = this.getStyle(this.computedStyle, 'borderLeftWidth')
  const borderRight = this.getStyle(this.computedStyle, 'borderRight')
  const paddingTop = this.getStyle(this.computedStyle, 'paddingTop')
  const paddingBottom = this.getStyle(this.computedStyle, 'paddingBottom')
  const paddingLeft = this.getStyle(this.computedStyle, 'paddingLeft')
  const paddingRight = this.getStyle(this.computedStyle, 'paddingRight')

  this.elementH = this.element.offsetHeight
  this.elementW = this.element.offsetWidth
  this.screenH = window.innerHeight
  this.screenW = window.innerWidth

  // 当getBoundingClientRect计算的 高度和 computedStyle 计算的高度不同时
  // waypoints 的 页面高度基于 getBoundingClientRect计算的，因此这里优先使用getBoundingClientRect
  // 如果优先使用 computedStyle，当遇到元素 scale(0)时，会出现进入视口不执行的bug
  if (!this.useCssComputed && this.element.getBoundingClientRect) {
    const {width,height}=this.element.getBoundingClientRect()
    // const boundH = this.element.getBoundingClientRect().height
    // const boundH = this.element.getBoundingClientRect().height
    if (height !== this.elementH) {
      this.elementH = height
    }
    if(width!==this.elementW){
      this.elementW=width
    }
  }

  this.baseScreenOffset = 0
  this.baseTargetOffset = 0
  if (typeof this.offset === 'string') {
    if (this.offset[this.offset.length - 1] === '%') {
      const percent = parseFloat(this.offset) / 100
      this.baseScreenOffset = (this.direction==='ver' ? this.screenH : this.screenW) * percent
      this.baseTargetOffset = Math.min((this.direction==='ver' ? this.elementH : this.elementW), (this.direction==='ver' ? this.screenH : this.screenW)) * percent
    } else {
      const parse = parseFloat(this.offset)
      this.baseScreenOffset = parse
      this.baseTargetOffset = parse
    }
  } else {
    if (this.offset <= 1) {
      this.baseScreenOffset = (this.direction==='ver' ? this.screenH : this.screenW) * this.offset
      this.baseTargetOffset = Math.min((this.direction==='ver' ? this.elementH : this.elementW), (this.direction==='ver' ? this.screenH : this.screenW)) * this.offset
    } else {
      this.baseScreenOffset = this.offset
      this.baseTargetOffset = this.offset
    }
  }

  this.offsetEnd = 0
  this.offsetStart = 0
  this.elementOffsetTop = this.getOffsetTop(this.element)
  this.elementOffsetLeft=this.getOffsetLeft(this.element)
  if (this.margin) {
    this.elementH += marginTop + marginBottom
    this.elementW += marginLeft + marginRight
    this.elementOffsetTop -= marginTop
    this.elementOffsetLeft -= marginLeft
    this.offsetStart = this.getOffsetT() + marginTop
    this.offsetEnd = this.getOffsetB() + marginBottom
  } else if (this.border) {
    this.offsetStart = this.getOffsetT()
    this.offsetEnd = this.getOffsetB()
  } else if (this.padding) {
    this.elementH = this.elementH - (borderTop + borderBottom)
    this.elementOffsetTop += borderTop
    this.offsetStart = this.getOffsetT() - borderBottom
    this.offsetEnd = this.getOffsetB() - borderTop
  } else {
    this.elementH = this.elementH - (paddingTop + paddingBottom + borderTop + borderBottom)
    this.elementOffsetTop += borderTop + paddingTop
    this.offsetStart = this.getOffsetT() - borderBottom - paddingBottom
    this.offsetEnd = this.getOffsetB() - borderTop - paddingTop
  }

  if (this.useCssComputed) {
    const rect = this.element.getBoundingClientRect()
    this.offsetStart += (this.element.offsetHeight - rect.height) / 2
    this.offsetEnd += (this.element.offsetHeight - rect.height) / 2
  }
  this.listen()
  setTimeout(() => {
    console.log(this.state)
    if(this.prevState==='in' && this.state!=='in'){
      if (typeof this.leave === 'function') {
        let dir=this.state==='out-up' ? 'up' : 'down'
        this.leave(dir)
      }
    }
  },0)
}

ViewportCheck.prototype.listen=function(){
  if (this.wayp1) this.wayp1.destroy()
  if (this.wayp2) this.wayp2.destroy()
  this.wayp1 = new Waypoint({
    element: this.element,
    offset: this.offsetEnd,
    // continuous: true,
    handler: (dir) => {
      if (dir === 'down') {
        this.bottomPass = true
      } else {
        if (this.state === 'in') {
          this.leave(dir)
        }
        this.bottomPass = false
        if (!this.topPass) {
          this.state = 'out-up'
        } else {
          this.state = 'out-down'
        }
      }
      this.exec(dir)
    }
  })
  this.wayp2 = new Waypoint({
    element: this.element,
    offset: this.offsetStart,
    // continuous: true,
    handler: (dir) => {
      if (dir === 'up') {
        this.topPass = true
      } else {
        if (this.state === 'in') {
          if (typeof this.leave === 'function') this.leave(dir)
        }
        this.topPass = false
        if (!this.bottomPass) {
          this.state = 'out-up'
        } else {
          this.state = 'out-down'
        }
      }
      this.exec(dir)
    }
  })
}

ViewportCheck.prototype.getOffsetB = function () {
  if (this.baseAt === 'screen') {
    return this.baseScreenOffset
  }
  return this.screenH - this.baseTargetOffset
}

ViewportCheck.prototype.getOffsetT = function () {
  if (this.baseAt === 'screen') {
    return this.baseScreenOffset - this.elementH
  }
  return this.baseTargetOffset - this.elementH
}
ViewportCheck.prototype.getStyle = function (style, attr) {
  return parseFloat(style[attr])
}

ViewportCheck.prototype.getScrollTop = function () {
  if (this.parentIsWindow) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  } else {
    return this.parentEle.scrollTop
  }
}
ViewportCheck.prototype.getScrollLeft=function(){
  if(this.parentIsWindow){
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
  }else{
    return this.parentEle.scrollLeft
  }
}

ViewportCheck.prototype.getOffsetTop = function (ele) {
  if (!this.useCssComputed && ele.getBoundingClientRect) {
    return ele.getBoundingClientRect().top + this.getScrollTop()
  }
  let offsetTop = ele.offsetTop
  if (ele.offsetParent) {
    offsetTop += this.getOffsetTop(ele.offsetParent)
  }
  return offsetTop
}
ViewportCheck.prototype.getOffsetLeft = function (ele) {
  if (!this.useCssComputed && ele.getBoundingClientRect) {
    return ele.getBoundingClientRect().left + this.getScrollLeft()
  }
  let offsetLeft = ele.offsetLeft
  if (ele.offsetParent) {
    offsetLeft += this.getOffsetLeft(ele.offsetParent)
  }
  return offsetLeft
}

ViewportCheck.prototype.exec = function (direction) {
  if (this.state === 'out-up') {
    if (this.elementH - (this.getScrollTop() - this.elementOffsetTop) >= this.baseTargetOffset) {
      this.topPass = true
    }
  }

  if (this.bottomPass && this.topPass) {
    if (typeof this.enter === 'function') this.enter(direction)
    if (this.autoDestroy){
      this.destroy()
      this.state='out-down'
    }else{
      this.state = 'in'
    }
  }
}

ViewportCheck.prototype.destroy = function () {
  if (this.wayp1) this.wayp1.destroy()
  if (this.wayp2) this.wayp2.destroy()
  this.wayp1 = null
  this.wayp2 = null
  this.parentEle = null
  this.element = null
  this.enter = null
  this.leave = null
  this.computedStyle = null
  this.hasDestoryed=true
}

window.ViewportCheck = ViewportCheck

export default ViewportCheck
