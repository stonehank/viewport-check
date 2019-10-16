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
  useCssHeight = false,
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
  this.bottomPass = false
  this.topPass = false
  this.state = 'standBy'
  // this.offset = offset
  this.enter = enter
  this.leave = leave
  this.autoDestroy = autoDestroy
  this.useCssHeight = useCssHeight
  this.baseAt = baseAt

  this.computedStyle = window.getComputedStyle(element, null)
  // const pureHeight = this.getStyle(this.computedStyle, 'height')
  const marginTop = this.getStyle(this.computedStyle, '  marginTop')
  const marginBottom = this.getStyle(this.computedStyle, 'marginBottom')
  const borderTop = this.getStyle(this.computedStyle, 'borderTopWidth')
  const borderBottom = this.getStyle(this.computedStyle, 'borderBottomWidth')
  const paddingTop = this.getStyle(this.computedStyle, 'paddingTop')
  const paddingBottom = this.getStyle(this.computedStyle, 'paddingBottom')

  this.elementH = this.element.offsetHeight
  this.screenH = window.innerHeight

  // 当getBoundingClientRect计算的 高度和 computedStyle 计算的高度不同时
  // waypoints 的 页面高度基于 getBoundingClientRect计算的，因此这里优先使用getBoundingClientRect
  // 如果优先使用 computedStyle，当遇到元素 scale(0)时，会出现进入视口不执行的bug
  if (!this.useCssHeight && this.element.getBoundingClientRect) {
    const boundH = this.element.getBoundingClientRect().height
    if (boundH !== this.elementH) {
      this.elementH = boundH
    }
  }

  this.baseScreenOffset = 0
  this.baseTargetOffset = 0
  if (typeof offset === 'string') {
    if (offset[offset.length - 1] === '%') {
      const percent = parseFloat(offset) / 100
      this.baseScreenOffset = this.screenH * percent
      this.baseTargetOffset = Math.min(this.elementH, this.screenH) * percent
    } else {
      const parse = parseFloat(offset)
      this.baseScreenOffset = parse
      this.baseTargetOffset = parse
    }
  } else {
    if (offset <= 1) {
      this.baseScreenOffset = this.screenH * offset
      this.baseTargetOffset = Math.min(this.elementH, this.screenH) * offset
    } else {
      this.baseScreenOffset = offset
      this.baseTargetOffset = offset
    }
  }

  let offsetB = 0
  let offsetT = 0
  this.elementOffsetTop = this.getOffsetTop(element)

  if (margin) {
    this.elementH += marginTop + marginBottom
    this.elementOffsetTop -= marginTop
    offsetT = this.getOffsetT() + marginTop
    offsetB = this.getOffsetB() + marginBottom
  } else if (border) {
    offsetT = this.getOffsetT()
    offsetB = this.getOffsetB()
  } else if (padding) {
    this.elementH = this.elementH - (borderTop + borderBottom)
    this.elementOffsetTop += borderTop
    offsetT = this.getOffsetT() - borderBottom
    offsetB = this.getOffsetB() - borderTop
  } else {
    this.elementH = this.elementH - (paddingTop + paddingBottom + borderTop + borderBottom)
    this.elementOffsetTop += borderTop + paddingTop
    offsetT = this.getOffsetT() - borderBottom - paddingBottom
    offsetB = this.getOffsetB() - borderTop - paddingTop
  }

  // console.log(offsetT, offsetB, this.elementH)
  if (useCssHeight) {
    const rect = this.element.getBoundingClientRect()
    offsetT += (this.element.offsetHeight - rect.height) / 2
    offsetB += (this.element.offsetHeight - rect.height) / 2
  }

  this.wayp1 = new Waypoint({
    element: element,
    offset: offsetB,
    // continuous: true,
    handler: (direction) => {
      if (direction === 'down') {
        this.bottomPass = true
      } else {
        if (this.state === 'in') {
          this.leave(direction)
        }
        this.bottomPass = false
        if (!this.topPass) {
          this.state = 'standBy'
        } else {
          this.state = 'out'
        }
      }
      this.exec(direction)
    }
  })
  this.wayp2 = new Waypoint({
    element: element,
    offset: offsetT,
    // continuous: true,
    handler: (direction) => {
      if (direction === 'up') {
        this.topPass = true
      } else {
        if (this.state === 'in') {
          if (typeof this.leave === 'function') this.leave(direction)
        }
        this.topPass = false
        if (!this.bottomPass) {
          this.state = 'standBy'
        } else {
          this.state = 'out'
        }
      }
      this.exec(direction)
    }
  })
}

ViewportCheck.prototype.getOffsetB = function () {
  if (this.baseAt === 'screen') {
    // return this.screenH * this.offset
    return this.baseScreenOffset
  }
  // return this.screenH - Math.min(this.screenH, this.elementH) * this.offset
  return this.screenH - this.baseTargetOffset
}

ViewportCheck.prototype.getOffsetT = function () {
  if (this.baseAt === 'screen') {
    // return this.screenH * this.offset - this.elementH
    return this.baseScreenOffset - this.elementH
  }
  // return Math.min(this.screenH, this.elementH) * this.offset - this.elementH
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

ViewportCheck.prototype.getOffsetTop = function (ele) {
  if (!this.useCssHeight && ele.getBoundingClientRect) {
    return ele.getBoundingClientRect().top + this.getScrollTop()
  }
  let offsetTop = ele.offsetTop
  if (ele.offsetParent) {
    offsetTop += this.getOffsetTop(ele.offsetParent)
  }
  return offsetTop
}

ViewportCheck.prototype.exec = function (direction) {
  if (this.state === 'standBy') {
    if (this.elementH - (this.getScrollTop() - this.elementOffsetTop) >= this.baseTargetOffset) {
      this.topPass = true
    }
  }

  if (this.bottomPass && this.topPass) {
    if (typeof this.enter === 'function') this.enter(direction)
    if (this.autoDestroy){
      this.destroy()
      this.state='out'
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
}

window.ViewportCheck = ViewportCheck

export default ViewportCheck
