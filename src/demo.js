import ViewportCheck from './index'
import './style.scss'

window.onload=function(){
  let resultDom=document.getElementsByClassName('show-result')[0]
  let dirDom=document.getElementsByClassName('show-dir')[0]
  let zero1=document.getElementById('zero-1')
  let enter=false
  new ViewportCheck({
    element:zero1,
    offset:0.3,
    enter:(dir) => {
      zero1.style.background='steelblue'
      resultDom.innerHTML='Enter viewpoint'
      dirDom.innerHTML='enter directiong:'+dir
      enter=true
    },
    leave:(dir) => {
      zero1.style.background='lightgreen'
      resultDom.innerHTML='Leave viewpoint'
      dirDom.innerHTML='leave directiong:'+dir
      enter=false
    },
  })
}
