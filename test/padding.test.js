import ViewportCheck from '../src/index'
Object.defineProperties(window.HTMLElement.prototype, {
  offsetLeft: {
    get: function() { return parseFloat(window.getComputedStyle(this).marginLeft) || 0; }
  },
  offsetTop: {
    get: function() { return parseFloat(window.getComputedStyle(this).marginTop) || 0; }
  },
  offsetHeight: {
    get: function() { return parseFloat(window.getComputedStyle(this).height) || 0; }
  },
  offsetWidth: {
    get: function() { return parseFloat(window.getComputedStyle(this).width) || 0; }
  }
});
document.body.innerHTML=`
<style>
  #wrapper{
    width:300px;
    list-style: none;
  }
  #wrapper li{
    background:white;
    width:200px;
    height:200px;
    margin:100px;
    padding:150px;
    border:50px solid #000;
  }
</style>
<ul id="wrapper" style="width:300px;">
    <li>1</li>
    <li>0</li>
    <li>-1</li>
</ul>`


describe("检测筛选边界测试",()=>{
  it("只计算padding",()=>{
    let wrapper=document.getElementById("wrapper")
    let children=wrapper.children
    let zero=children[1]
    new ViewportCheck({
      element:zero,
      offset:0.3,
      border:false,
      enter:()=>{
        zero.style.background='steelblue'
      },
      leave:()=>{
        zero.style.background='white'
      },
    })
    // expect(zero.style.background).toBe("white");
    // expect(zero.style.height).toBe("200px");
    // expect(zero.style.paddingTop).toBe("150px");
    // expect(zero.style.marginTop).toBe("100px");
    // expect(zero.style.borderTopWidth).toBe("50px");
    expect(window.getComputedStyle(zero).background).toBe("white");
    console.log(zero.offsetTop)
    let edge=1200
    document.documentElement.scrollTop=edge
    console.log(document.body.scrollTop)
    console.log(document.documentElement.scrollTop)
    window.scrollTo({top:edge})
    expect(zero.style.background).toBe("white");
  })

})
