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

  this.screenH = window.innerHeight
  let offsetB = 0
  let offsetT = 0
  this.elementOffsetTop = this.getOffsetTop(element)
  if (margin) {
    this.style = window.getComputedStyle(element, null)
    this.marginTop = this.getStyle(this.style, 'marginTop')
    this.marginBottom = this.getStyle(this.style, 'marginBottom')

    this.elementH = this.element.offsetHeight + this.marginTop + this.marginBottom
    this.elementOffsetTop -= this.marginTop
    offsetT = this.getOffsetT() + this.marginTop
    offsetB = this.getOffsetB() + this.marginBottom
  } else if (border) {
    this.elementH = this.element.offsetHeight
    offsetT = this.getOffsetT()
    offsetB = this.getOffsetB()
  } else if (padding) {
    this.style = window.getComputedStyle(element, null)
    this.borderTop = this.getStyle(this.style, 'borderTopWidth')
    this.borderBottom = this.getStyle(this.style, 'borderBottomWidth')
    this.elementH = this.element.clientHeight
    this.elementOffsetTop += this.borderTop
    offsetT = this.getOffsetT() - this.borderBottom
    offsetB = this.getOffsetB() - this.borderTop
  } else {
    this.style = window.getComputedStyle(element, null)
    this.borderTop = this.getStyle(this.style, 'borderTopWidth')
    this.borderBottom = this.getStyle(this.style, 'borderBottomWidth')
    this.paddingTop = this.getStyle(this.style, 'paddingTop')
    this.paddingBottom = this.getStyle(this.style, 'paddingBottom')
    this.pureHeight = this.getStyle(this.style, 'height')
    this.elementH = this.pureHeight
    this.elementOffsetTop += this.borderTop + this.paddingTop
    offsetT = this.getOffsetT() - this.borderBottom - this.paddingBottom
    offsetB = this.getOffsetB() - this.borderTop - this.paddingTop
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
  return parseFloat(style[attr].split('px')[0])
}

ViewportCheck.prototype.getScrollTop = function () {
  if (this.parentIsWindow) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  } else {
    return this.parentEle.scrollTop
  }
}

ViewportCheck.prototype.getOffsetTop = function (ele) {
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
  console.log(this.elementH - (this.getScrollTop() - this.elementOffsetTop) >= Math.min(this.screenH, this.elementH) * this.offset, this.topPass)
  console.log(this.elementH, this.getScrollTop(), this.elementOffsetTop, this.screenH)
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
