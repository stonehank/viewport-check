import 'waypoints/lib/noframework.waypoints'

const Waypoint = window.Waypoint

function ViewportCheck ({
  element = null,
  context = null,
  offset = 0.3,
  enter = () => {},
  leave = () => {},
  baseAt = 'target',
  autoDestroy = false,
  // 避免类似初始化时 scale(0)， 无法准确获取高度
  useCssComputed = false,
  horizontal=false,
  padding = true,
  border = true,
  margin = false,
  afterAnimation=true,
} = {}) {
  if (!element) {
    throw new Error('Must need element!')
  }else if(typeof element==='string'){
    this.element=document.querySelector(element)
  }else{
    this.element = element
  }

  if (!context) {
    this.parentIsWindow = true
    this.context = window
  }else if(typeof context==='string'){
    this.context=document.querySelector(context)
  }else{
    this.context = context
  }

  this.horizontal=horizontal
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
  this.afterAnimation=afterAnimation

  this.init=this.init.bind(this)
  if(this.afterAnimation){
    this.checkEleValid().then(status => {
      if(!status)return
      this.init()
    })
  }else{
    this.init()
  }
  this.bindResize()
}

ViewportCheck.prototype.checkEleValid=function(){
  let totalTime=0
  let {top:oldT,left:oldL}=this.element.getBoundingClientRect()
  return new Promise(res => {
    let check=(delay) => {
      delay=Math.min(delay,800)
      setTimeout(() => {
        if(totalTime>=5000){
          throw new Error('Viewport init failed(timeout). Is the element '+this.element+ ' still in animation? ')
    }
        let {top:curT,left:curL}=this.element.getBoundingClientRect()
        if(curT===oldT && oldL===curL)return res(true)
        check(delay+50)
      },delay)
    }
    check(50)
  })
}

ViewportCheck.prototype.bindResize=function(){
  window.addEventListener('resize',this.init)
}

ViewportCheck.prototype.init=function(){
  if(this.hasDestoryed)return
  if(!this.parentIsWindow){
    this.parentComputedStyle=window.getComputedStyle(this.context,null)
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

  this.elementSize = this.horizontal ? this.element.offsetWidth : this.element.offsetHeight

  if(this.horizontal){
    this.screenSize=this.parentIsWindow ? window.innerWidth
      : this.context.offsetWidth -
      this.getStyle(this.parentComputedStyle, 'borderLeftWidth') -
      this.getStyle(this.parentComputedStyle, 'borderRightWidth')
  }else{
    this.screenSize=this.parentIsWindow ? window.innerHeight
      : this.context.offsetHeight -
      this.getStyle(this.parentComputedStyle, 'borderTopWidth') -
      this.getStyle(this.parentComputedStyle, 'borderBottomWidth')
  }

  // 当getBoundingClientRect计算的 高度和 computedStyle 计算的高度不同时
  // waypoints 的 页面高度基于 getBoundingClientRect计算的，因此这里优先使用getBoundingClientRect
  // 如果优先使用 computedStyle，当遇到元素 scale(0)时，会出现进入视口不执行的bug
  if (!this.useCssComputed && this.element.getBoundingClientRect) {
    const size=this.horizontal ? this.element.getBoundingClientRect().width : this.element.getBoundingClientRect().height
    if (size !== this.elementSize) {
      this.elementSize = size
    }
  }

  this.offsetEnd = 0
  this.offsetStart = 0
  this.elementOffsetSize = this.getOffsetSize(this.element)
  if (this.margin) {
    this.elementSize += this.horizontal ? (marginLeft+marginRight) : (marginTop + marginBottom)
    this.elementOffsetSize -= this.horizontal ? marginLeft : marginTop
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() + (this.horizontal ? marginLeft : marginTop)
    this.offsetEnd = this.getOffsetB() + (this.horizontal ? marginRight : marginBottom)
  } else if (this.border) {
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT()
    this.offsetEnd = this.getOffsetB()
  } else if (this.padding) {
    this.elementSize = this.elementSize - (this.horizontal ? borderLeft + borderRight : borderTop + borderBottom)
    this.elementOffsetSize += (this.horizontal ? borderLeft : borderTop)
    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() - (this.horizontal ? borderRight : borderBottom)
    this.offsetEnd = this.getOffsetB() - (this.horizontal ? borderLeft : borderTop)
  } else {
    this.elementSize = this.elementSize - (this.horizontal
      ? (paddingLeft + paddingRight+ borderLeft + borderRight)
      : (paddingTop + paddingBottom + borderTop + borderBottom))
    this.elementOffsetSize += (this.horizontal ? borderLeft + paddingLeft : borderTop + paddingTop)

    this.calcBaseOffset()
    this.offsetStart = this.getOffsetT() - (this.horizontal ? borderRight + paddingRight : borderBottom + paddingBottom)
    this.offsetEnd = this.getOffsetB() - (this.horizontal ? borderLeft + paddingLeft : borderTop + paddingTop)
  }

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
    context:this.context,
    horizontal:this.horizontal,
    handler: (direction) => {
      if (this.horizontal && direction==='right' || (!this.horizontal && direction === 'down')) {
        this.endPass = true
      } else {
        if (this.state === 'in') {
          this.leave(direction)
        }
        this.endPass = false
        if (!this.startPass) {
          this.state = 'out-up'
        } else {
          this.state = 'out-down'
        }
      }
      this.exec(direction)
    }
  })
  this.wayp2 = new Waypoint({
    element: this.element,
    offset: this.offsetStart,
    context:this.context,
    horizontal:this.horizontal,
    handler: (direction) => {
      if (this.horizontal && direction==='left' || (!this.horizontal && direction === 'up')) {
        this.startPass = true
      } else {
        if (this.state === 'in') {
          if (typeof this.leave === 'function') this.leave(direction)
        }
        this.startPass = false
        if (!this.endPass) {
          this.state = 'out-up'
        } else {
          this.state = 'out-down'
        }
      }
      this.exec(direction)
    }
  })
}

ViewportCheck.prototype.getOffsetB = function () {
  if (this.baseAt === 'context') {
    return this.screenSize- this.baseScreenOffset
  }
  return this.screenSize - this.baseTargetOffset
}

ViewportCheck.prototype.getOffsetT = function () {
  if (this.baseAt === 'context') {
    return this.baseScreenOffset - this.elementSize
  }
  return this.baseTargetOffset - this.elementSize
}
ViewportCheck.prototype.getStyle = function (style, attr) {
  return parseFloat(style[attr])
}

ViewportCheck.prototype.getScrollSize = function () {
  if (this.parentIsWindow) {
    return this.horizontal
      ? window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
      : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  } else {
    return this.horizontal ? this.context.scrollLeft : this.context.scrollTop
  }
}

ViewportCheck.prototype.getOffsetSize = function (ele) {
  if(!this.parentIsWindow && ele===this.context)return 0
  if (!this.useCssComputed && ele.getBoundingClientRect) {
    const size=this.horizontal ? ele.getBoundingClientRect().left : ele.getBoundingClientRect().top
    return size+this.getScrollSize()
  }
  let offsetSize = this.horizontal ? ele.offsetLeft : ele.offsetTop
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
  this.context = null
  this.element = null
  this.enter = null
  this.leave = null
  this.computedStyle = null
  this.hasDestoryed=true
}

window.ViewportCheck = ViewportCheck

export default ViewportCheck
