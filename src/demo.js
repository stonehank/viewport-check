import ViewportCheck from './index'
import './style.scss'

window.onload=function(){
  let page=document.getElementById('page')
  let options=[
    null,
    null,
    null,
    {
      offset:0.3,
      margin:false,
      border:false,
      padding:false,
    },
    {
      offset:0.3,
      margin:false,
      border:false,
      padding:true,
    },
    {
      offset:0.3,
      margin:false,
      border:true,
    },
    {
      offset:0.3,
      margin:true,
    },
    {
      offset:0.3,
      baseAt:'screen'
    },
    {
      offset:0.3,
      autoDestroy:true,
    },
    null,
    null,
    null
  ]
  let liList=[]
  let liOpt=[]
  let showStateList=[]
  let markList=[]

  let switchBtn=document.getElementById('pageChoose')
  switchBtn.addEventListener('click',(ev) => {
    let ele=ev.target
    if(ele.getAttribute('data-page')==='0'){
      render('ver')
    }else{
      render('hor')
    }
  })

  render('ver')
  function render(type){
    let demo=null
    page.innerHTML=''
    let markClass=type+'-mark'
    if(type==='ver'){
      demo=createFlatDemo('ver-')
    }else{
      demo=createFlatDemo('hor-')
    }
    page.appendChild(demo)

    for(let i=0; i<liList.length; i++){
      markList[i]= document.createElement('div')
      markList[i].className=markClass
      page.appendChild(markList[i])
      new ViewportCheck({
        element: liList[i],
        ...liOpt[i],
        parentEle:page,
        direction:type,
        enter: (dir) => {
          showStateList[i].innerText='Enter'
          showStateList[i].style.background='green'
          createMark(markList[i],dir)
        },
        leave: (dir) => {
          showStateList[i].innerHTML='Leave'
          showStateList[i].style.background='red'
        },
      })
    }
  }

  function createMark(ele,dir,type){
    let top=page.scrollTop
    if(dir==='down')top+=page.offsetHeight
    if(type==='ver'){
      ele.style.top=top+'px'
    }else{
      // ele.style.left=top+'px'
    }
  }

  function createFlatDemo(prefix){
    liList=[]
    liOpt=[]
    showStateList=[]
    markList=[]
    let ul=document.createElement('ul')
    ul.className='wrapper '
    ul.className+=prefix+'wrapper'
    for(let i=0; i<options.length; ++i){
      let itemWrapper=document.createElement('div')
      itemWrapper.className=prefix+'item-wrapper'
      let li=document.createElement('li')
      let showState=document.createElement('div')
      let showSetting=document.createElement('div')
      let hr=document.createElement('hr')
      showState.className=prefix+'show-state'
      hr.className=prefix+'hr'
      if(options[i]!=null) {
        showSetting.innerText = JSON.stringify(options[i]).replace(/"/g,'').split(',').join('\n')
        showSetting.className='show-options'
        liList.push(li)
        showStateList.push(showState)
        liOpt.push(options[i])
      }
      li.appendChild(showSetting)
      itemWrapper.appendChild(li)
      itemWrapper.appendChild(showState)
      ul.appendChild(itemWrapper)
      ul.appendChild(hr)
    }
    return ul
  }
}
