Page({
  data: {
    imgs: [
      "../../resources/logo.png"
    ],
    img: "../../resources/logo.png",
    isLogin: Object.keys(wx.getStorageSync('userInfo') || {}).length > 0
  },
  isLogin() {
    var userInfo = wx.getStorageSync('userInfo');
    var len = Object.keys(userInfo).length;
    return !!len;
  },
  onLoad() {
    var isLogin = this.isLogin();
    var url = isLogin ? '../index/index' : '../login/login'
    setTimeout(() => {
      wx.reLaunch({
        url: url
      })
    }, 1500)
  }  
})