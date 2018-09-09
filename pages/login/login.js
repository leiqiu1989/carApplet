var instance = getApp()
var util = require('../../utils/util')
var api = require('../../utils/api')

Page({
  data: {
    userName: '',
    userPwd: ''
  },
  onLoad: function() {
    this.WxValidate = instance.wxValidate({
      userName: {
        required: true
      },
      userPwd: {
        required: true
      }
    }, {
      userName: {
        required: '用户名不能为空'
      },
      userPwd: {
        required: '密码不能为空'
      }
    });
  },
  formSubmit: function(e) {
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        content: `${error.msg}`,
        showCancel: false
      });
      return false;
    }
    var submitData = e.detail.value;
    wx.showLoading({
      title: '数据请求中',
      mask: false
    });
    var param = api.getApi('login');
    wx.request({
      url: param.url,
      data: {
        username: submitData.userName,
        pwd: submitData.userPwd
      },
      success: function(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        if (data.result == 'Success') {
          var _data = data.Data || {};
          wx.showToast({
            title: '登陆成功',
            icon: 'success',
            duration: 2000
          });
          wx.hideLoading();
          util.setUserInfo(Object.assign({
            dno: _data.dno
          }, {
            userName: submitData.userName
          }));
          wx.reLaunch({
            url: '../index/index'
          })
        } else {
          wx.showModal({
            content: data.msg,
            showCancel: false
          });
        }
      },
      fail(e) {
        console.log(e);
      }
    })
  }
})