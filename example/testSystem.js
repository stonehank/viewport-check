function testSystem(test,ans,checkEnter){
  let allPass=true

  window.scrollTo({top:0})
  setTimeout(()=>{
    syncTest(0)
      .then(()=>{
        if(allPass){
          alert('All Test Pass!')
        }
      })
  },100)

  function syncTest(id){
    if(id===test.length)return Promise.resolve()
    return new Promise((res)=>{
      let curT=test[id]
      let curA=ans[id]
      checkEnter(curT)
        .then((enter)=>{
          if(enter!==curA){
            allPass=false
            alert('Test scrollTo '+test[id]+' FAIL! The test index is '+id)
            throw new Error('Test scrollTo '+test[id]+' FAIL! The test index is '+id)
          }else{
            return syncTest(id+1).then(()=>res())
          }
        })
    })
  }



}
window.testSystem=testSystem