var util = require('../../utils/util')

Page({
  data: {
    userName: ''
  },
  onLoad() {
    var userInfo = util.getUserInfo() || {};
    this.setData({
      userName: userInfo.userName,
    })
  },
  logOut() {
    util.removeStorageSync('userInfo');
    util.removeStorageSync('carinfo');
    wx.reLaunch({
      url: '../login/login'
    })
  }
})