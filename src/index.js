import 'waypoints/lib/noframework.waypoints'

const Waypoint = window.Waypoint

function ViewportCheck ({
                          element = null,
                          parentEle = null,
                          offset = 0.3,
                          enter = () => {},
                          leave = () => {},
                          autoDestroy = false,
                          includeBorder = true,
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
  this.state = 'stay'
  this.offset = offset
  this.enter = enter
  this.leave = leave
  this.autoDestroy = autoDestroy

  let computedStyle=window.getComputedStyle(element, null)
  let pureHeight=this.getStyle(computedStyle,'height')
  let marginTop = this.getStyle(computedStyle, 'marginTop')
  let marginBottom = this.getStyle(computedStyle, 'marginBottom')
  let borderTop = this.getStyle(computedStyle, 'borderTopWidth')
  let borderBottom = this.getStyle(computedStyle, 'borderBottomWidth')
  let paddingTop = this.getStyle(computedStyle, 'paddingTop')
  let paddingBottom = this.getStyle(computedStyle, 'paddingBottom')

  this.elementH=pureHeight

  // 当getBoundingClientRect计算的 高度和 computedStyle 计算的高度不同时
  // waypoints 的 页面高度基于 getBoundingClientRect计算的，因此这里优先使用getBoundingClientRect
  // 如果优先使用 computedStyle，当遇到元素 scale(0)时，会出现进入视口不执行的bug
  if(this.element.getBoundingClientRect){
    let boundH=this.element.getBoundingClientRect().height
    if(boundH!==this.elementH){
      this.elementH=boundH
    }
  }

  this.screenH = window.innerHeight
  let offsetB = 0
  let offsetT = 0
  this.elementOffsetTop = this.getOffsetTop(element)
  if (margin) {
    this.elementH += paddingTop + paddingBottom + borderTop + borderBottom + marginTop + marginBottom
    this.elementOffsetTop -= marginTop
    offsetT = this.getOffsetT() + marginTop
    offsetB = this.getOffsetB() + marginBottom
  } else if (border) {
    this.elementH += paddingTop + paddingBottom + borderTop + borderBottom
    offsetT = this.getOffsetT()
    offsetB = this.getOffsetB()
  } else if (padding) {
    this.elementH += paddingTop + paddingBottom
    this.elementOffsetTop += borderTop
    offsetT = this.getOffsetT() - borderBottom
    offsetB = this.getOffsetB() - borderTop
  } else {
    this.elementOffsetTop += borderTop + paddingTop
    offsetT = this.getOffsetT() - borderBottom - paddingBottom
    offsetB = this.getOffsetB() - borderTop - paddingTop
  }

  this.wayp1 = new Waypoint({
    element: element,
    offset: offsetB,
    handler: (direction) => {
      if (direction === 'down') {
        this.bottomPass = true
      } else {
        if (this.state === 'in') {
          this.leave(direction)
        }
        this.bottomPass = false
        this.state = 'out'
      }
      this.exec(direction)
    }
  })
  this.wayp2 = new Waypoint({
    element: element,
    offset: offsetT,
    handler: (direction) => {
      if (direction === 'up') {
        this.topPass = true
      } else {
        if (this.state === 'in') {
          this.leave(direction)
        }
        this.topPass = false
        this.state = 'out'
      }
      this.exec(direction)
    }
  })
}

ViewportCheck.prototype.getOffsetB = function () {
  return this.screenH - Math.min(this.screenH, this.elementH) * this.offset
}

ViewportCheck.prototype.getOffsetT = function () {
  return -this.elementH + Math.min(this.screenH, this.elementH) * this.offset
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
  if(ele.getBoundingClientRect){
    return ele.getBoundingClientRect().top + this.getScrollTop()
  }
  let offsetTop = ele.offsetTop
  if (ele.offsetParent) {
    offsetTop += this.getOffsetTop(ele.offsetParent)
  }
  return offsetTop
}

ViewportCheck.prototype.exec = function (direction) {
  if (this.state === 'stay') {
    if (this.elementH - (this.getScrollTop() - this.elementOffsetTop) >= Math.min(this.screenH, this.elementH) * this.offset) {
      this.topPass = true
    }
  }

  if (this.bottomPass && this.topPass) {
    this.enter(direction)
    if (this.autoDestroy) this.destroy()
    this.state = 'in'
  }
}

ViewportCheck.prototype.destroy = function () {
  this.wayp1.destroy()
  this.wayp2.destroy()
}

window.ViewportCheck = ViewportCheck

export default ViewportCheck
