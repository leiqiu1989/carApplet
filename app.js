//app.js
import wxValidate from 'utils/wxValidate'

App({
  onLaunch: function() {},
  onShow: function() {},
  globalData: {},
  getGid: (function() { //全局唯一id
    let id = 0
    return function() {
      id++
      return id
    }
  })(),
  wxValidate: (rules, messages) => new wxValidate(rules, messages)
})