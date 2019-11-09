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
  if(!this.parentIsWindow){
    this.parentComputedStyle=window.getComputedStyle(this.parentEle,null)
  }

  this.prevState=this.state
  this.endPass = false
  this.startPass = false
  this.state = 'out-up'
  this.computedStyle = window.getComputedStyle(this.element, null)
  // const pureHeight = this.getStyle(this.computedStyle, 'height')
  const marginTop = this.getStyle(this.computedStyle, 'marginTop')
  const marginBottom = this.getStyle(this.computedStyle, 'marginBottom')
  const marginLeft = this.getStyle(this.computedStyle, 'marginLeft')
  const marginRight = this.getStyle(this.computedStyle, 'marginRight')
  const borderTop = this.getStyle(this.computedStyle, 'borderTopWidth')
  const borderBottom = this.getStyle(this.computedStyle, 'borderBottomWidth')
  const borderLeft = this.getStyle(this.computedStyle, 'borderLeftWidth')
  const borderRight = this.getStyle(this.computedStyle, 'borderRightWidth')
  const paddingTop = this.getStyle(this.computedStyle, 'paddingTop')
  const paddingBottom = this.getStyle(this.computedStyle, 'paddingBottom')
  const paddingLeft = this.getStyle(this.computedStyle, 'paddingLeft')
  const paddingRight = this.getStyle(this.computedStyle, 'paddingRight')

  this.elementSize = this.direction==='ver' ? this.element.offsetHeight : this.element.offsetWidth
  // this.elementW = this.element.offsetWidth
  if(this.direction==='ver'){
    this.screenSize=this.parentIsWindow ? window.innerHeight
      : this.parentEle.offsetHeight -
      this.getStyle(this.parentComputedStyle, 'borderTopWidth') -
      this.getStyle(this.parentComputedStyle, 'borderBottomWidth')
  }else{
    this.screenSize=this.parentIsWindow ? window.innerWidth
      : this.parentEle.offsetWidth -
      this.getStyle(this.parentComputedStyle, 'borderLeftWidth') -
      this.getStyle(this.parentComputedStyle, 'borderRightWidth')
  }

  // 当getBoundingClientRect计算的 高度和 computedStyle 计算的高度不同时
  // waypoints 的 页面高度基于 getBoundingClientRect计算的，因此这里优先使用getBoundingClientRect
  // 如果优先使用 computedStyle，当遇到元素 scale(0)时，会出现进入视口不执行的bug
  if (!this.useCssComputed && this.element.getBoundingClientRect) {
    const size=this.direction==='ver' ? this.element.getBoundingClientRect().height : this.element.getBoundingClientRect().width
    if (size !== this.elementSize) {
      this.elementSize = size
    }
  }

  // console.log(this.elementSize,this.direction)
  this.offsetEnd = 0
  this.offsetStart = 0
  this.elementOffsetSize = this.getOffsetSize(this.element)
  if (this.margin) {
    this.elementSize += this.direction==='ver' ? (marginTop + marginBottom) : (marginLeft+marginRight)
    this.elementOffsetSize -= this.direction==='ver' ? marginTop : marginLeft
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() + (this.direction==='ver' ? marginTop : marginLeft)
    this.offsetEnd = this.getOffsetB() + (this.direction==='ver' ? marginBottom : marginRight)
  } else if (this.border) {
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT()
    this.offsetEnd = this.getOffsetB()
  } else if (this.padding) {
    this.elementSize = this.elementSize - (this.direction==='ver' ? borderTop + borderBottom : borderLeft + borderRight)
    this.elementOffsetSize += (this.direction==='ver' ? borderTop : borderLeft)
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() - (this.direction==='ver' ? borderBottom : borderRight)
    this.offsetEnd = this.getOffsetB() - (this.direction==='ver' ? borderTop : borderLeft)
  } else {
    this.elementSize = this.elementSize - (this.direction==='ver'
      ? (paddingTop + paddingBottom + borderTop + borderBottom)
      : (paddingLeft + paddingRight+ borderLeft + borderRight))
    this.elementOffsetSize += (this.direction==='ver' ? borderTop + paddingTop : borderLeft + paddingLeft)

    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() - (this.direction==='ver' ? borderBottom + paddingBottom : borderRight + paddingRight)
    this.offsetEnd = this.getOffsetB() - (this.direction==='ver' ? borderTop + paddingTop : borderLeft + paddingLeft)
  }

  // console.log(this.elementOffsetSize,this.elementSize)
  if (this.useCssComputed) {
    const rect = this.element.getBoundingClientRect()
    this.offsetStart += (this.element.offsetHeight - rect.height) / 2
    this.offsetEnd += (this.element.offsetHeight - rect.height) / 2
  }
  this.listen()
  setTimeout(() => {
    if(this.prevState==='in' && this.state!=='in'){
      if (typeof this.leave === 'function') {
        let dir=this.state==='out-up' ? 'up' : 'down'
        this.leave(dir)
      }
    }
  },0)
}
ViewportCheck.prototype.calcBaseOffset=function(){
  this.baseScreenOffset = 0
  this.baseTargetOffset = 0
  if (typeof this.offset === 'string') {
    if (this.offset[this.offset.length - 1] === '%') {
      const percent = parseFloat(this.offset) / 100
      this.baseScreenOffset = this.screenSize * percent
      this.baseTargetOffset = Math.min(this.elementSize, this.screenSize) * percent
    } else {
      const parse = parseFloat(this.offset)
      this.baseScreenOffset = parse
      this.baseTargetOffset = parse
    }
  } else {
    if (this.offset <= 1) {
      this.baseScreenOffset = this.screenSize * this.offset
      this.baseTargetOffset = Math.min(this.elementSize, this.screenSize) * this.offset
    } else {
      this.baseScreenOffset = this.offset
      this.baseTargetOffset = this.offset
    }
  }
}
ViewportCheck.prototype.listen=function(){
  if (this.wayp1) this.wayp1.destroy()
  if (this.wayp2) this.wayp2.destroy()
  this.wayp1 = new Waypoint({
    element: this.element,
    offset: this.offsetEnd,
    context:this.parentEle,
    horizontal:this.direction==='hor',
    handler: (dir) => {
      if (this.direction==='hor' && dir==='right' || (this.direction!=='hor' && dir === 'down')) {
        this.endPass = true
      } else {
        if (this.state === 'in') {
          this.leave(dir)
        }
        this.endPass = false
        if (!this.startPass) {
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
    context:this.parentEle,
    horizontal:this.direction==='hor',
    handler: (dir) => {
      if (this.direction==='hor' && dir==='left' || (this.direction!=='hor' && dir === 'up')) {
        this.startPass = true
      } else {
        if (this.state === 'in') {
          if (typeof this.leave === 'function') this.leave(dir)
        }
        this.startPass = false
        if (!this.endPass) {
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
    return this.screenSize- this.baseScreenOffset
  }
  return this.screenSize - this.baseTargetOffset
}

ViewportCheck.prototype.getOffsetT = function () {
  if (this.baseAt === 'screen') {
    return this.baseScreenOffset - this.elementSize
  }
  return this.baseTargetOffset - this.elementSize
}
ViewportCheck.prototype.getStyle = function (style, attr) {
  return parseFloat(style[attr])
}

ViewportCheck.prototype.getScrollSize = function () {
  if (this.parentIsWindow) {
    return this.direction==='ver'
      ? window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
  } else {
    return this.direction==='ver' ? this.parentEle.scrollTop : this.parentEle.scrollLeft
  }
}

ViewportCheck.prototype.getOffsetSize = function (ele) {
  if(!this.parentIsWindow && ele===this.parentEle)return 0
  if (!this.useCssComputed && ele.getBoundingClientRect) {
    // const boundingClientRect=ele.getBoundingClientRect()
    const size=this.direction==='ver' ? ele.getBoundingClientRect().top : ele.getBoundingClientRect().left
    return size+this.getScrollSize()
    // return ele.getBoundingClientRect().top + this.getScrollSize()
  }
  let offsetSize = this.direction==='ver' ? ele.offsetTop : ele.offsetLeft
  if (ele.offsetParent) {
    offsetSize += this.getOffsetSize(ele.offsetParent)
  }
  return offsetSize
}

ViewportCheck.prototype.exec = function (direction) {
  if (this.state === 'out-up') {
    if (this.elementSize - (this.getScrollSize() - this.elementOffsetSize) >= this.baseTargetOffset) {
      this.startPass = true
    }
  }

  if (this.endPass && this.startPass) {
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
