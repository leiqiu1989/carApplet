//index.js
var util = require('../../utils/util')
var api = require('../../utils/api')

Page({
  data: {
    date: util.formatDate(new Date()),
    endDate: util.formatDate(new Date),
    inputShowed: false,
    inputVal: "",
    List: [],
    AllList: [],
    carCount: 0,
    emptyData: true,
    driverTime: 0,
    stopTime: 0
  },
  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
    this.filterData();
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
    this.filterData();
  },
  inputTyping: function(e) {
    var _value = e.detail.value;
    this.setData({
      inputVal: e.detail.value
    });
    if (_value.trim()) {
      this.filterData(true);
    }
  },
  filterData(isFilter) {
    var data = this.data.AllList
    if (isFilter) {
      var _val = this.data.inputVal;
      data = data.filter(function(item) {
        return item.licenseplate.indexOf(_val) > -1;
      });
    }
    this.setData({
      List: data
    })
  },
  onLoad: function() {
    this.getCarLogList();
  },
  search(e) {
    var _type = e.currentTarget.dataset.type;
    var _currentDate = new Date();
    var strDate = this.data.date;
    if (_type == 'afterday' && util.compareDate(strDate, util.formatDate(_currentDate))) {
      wx.showModal({
        content: '日期已是当前最大日期',
        showCancel: false
      });
      return false;
    }
    var _date = new Date(strDate);
    switch (_type) {
      case 'yesterday':
        strDate = util.formatDate(new Date(_date.setTime(_date.getTime() - 24 * 60 * 60 * 1000)))
        break;
      case 'afterday':
        strDate = util.formatDate(new Date(_date.setTime(_date.getTime() + 24 * 60 * 60 * 1000)))
        break;
    }
    this.setData({
      date: strDate
    })
    this.getCarLogList();
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
    this.getCarLogList();
  },
  getCarLogList: function() {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });
    var obj = api.getApi('reportLog');
    var param = Object.assign({
      time: this.data.date
    }, obj.data);
    //param.dno = '001000000019002000';
    //param.time = '2018-07-12';
    wx.request({
      url: obj.url,
      data: param,
      success: function(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        if (data.result == 'Success') {
          var _data = data.Data || [];
          that.setData({
            AllList: _data,
            List: _data,
            carCount: data.vehicle_no,
            driverTime: data.acc_on_all,
            stopTime: data.acc_off_all
          });
        } else {
          that.setData({
            emptyData: false,
          })
        }
      }
    })
  }
});