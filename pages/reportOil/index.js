var util = require('../../utils/util')
var api = require('../../utils/api')
import wxCharts from './wxcharts'

Page({
  data: {
    date: util.formatDate(new Date()),
    endDate: util.formatDate(new Date),
    List: [],
    carList: [],
    vid: null,
    emptyData: true,
    carIndex: 0
  },
  onLoad: function() {
    this.getCarList();
  },
  bindChart(data) {
    var _value = [0, 0];
    if (data.length > 0) {
      _value = [data[0].oil, data[data.length - 1].oil];
    }
    new wxCharts({
      canvasId: 'oilCanvas',
      type: 'line',
      categories: ['0:00', '24:00'],
      animation: true,
      background: '#fff',
      series: [{
        name: '油量',
        data: _value,
        format: function(val, name) {
          return val.toFixed(2) + 'L';
        }
      }],
      xAxis: {
        disableGrid: true,
        fontColor: '#ccc'
      },
      yAxis: {
        title: ' 油量(L)',
        format: function(val) {
          return val.toFixed(2);
        },
        fontColor: '#ccc',
        min: 0
      },
      width: 300,
      height: 160,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
    this.getCarOilList();
  },
  bindCarChange(e) {
    var carindex = parseInt(e.detail.value);
    var vid = this.data.carList[carindex].vid;
    this.setData({
      carIndex: carindex,
      vid: vid
    });
    this.getCarOilList();
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
    this.getCarOilList();
  },
  getCarList: function() {
    var that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });
    var obj = api.getApi('carPlateList');
    wx.request({
      url: obj.url,
      data: obj.data,
      success: function(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        if (data.result == 'Success') {
          var _data = data.Data || [];
          var _vid = _data.length ? _data[0].vid : null;
          that.setData({
            carList: _data,
            vid: _vid
          });
          that.getCarOilList();
        } else {
          wx.showModal({
            content: '未找到相关车辆信息',
            showCancel: false
          });
        }
      }
    })
  },
  getCarOilList: function() {
    var that = this;
    var obj = api.getApi('oilReport');
    var param = {
      date: this.data.date,
      vid: this.data.vid
    }
    if (!param.vid) {
      wx.showModal({
        content: '参数异常,未找到合适的车辆',
        showCancel: false
      });
      return false;
    }
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });
    wx.request({
      url: obj.url,
      data: param,
      success: function(res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var _data = data.Data || [];
        if (data.result == 'Success') {
          that.setData({
            List: _data
          });
        } else {
          that.setData({
            emptyData: false,
          })
        }
        that.bindChart(_data);
      }
    })
  }
});