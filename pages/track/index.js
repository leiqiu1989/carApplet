var _placeHeight = 218; // 占用高度
var util = require('../../utils/util')
var api = require('../../utils/api')
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];


for (let i = date.getFullYear() - 20; i <= date.getFullYear() + 5; i++) {
  years.push("" + i);
}

for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}

for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}

for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}

for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}

Page({
  data: {
    time: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex_Start: [0, 0, 0, 0, 0],
    multiIndex_End: [0, 0, 0, 0, 0],
    date: util.formatDate(new Date),
    endDate: util.formatDate(new Date),
    plateNo: '',
    polyline: [],
    includePoints: [],
    isRun: false,
    eventType: 'today',
    currentIndex: 0,
    processValue: 0,
    allData: [],
    runData: {
      speed: 0,
      totalDistance: 0,
      status: '未知',
      location: '未知'
    },
    markers: []
  },
  bindMultiPickerChange_Start: function(e) {   
    this.setData({
      multiIndex_Start: e.detail.value
    })
    const index = this.data.multiIndex_Start;
    const year = this.data.multiArray[0][index[0]]
    const month = this.data.multiArray[1][index[1]]
    const day = this.data.multiArray[2][index[2]]
    const hour = this.data.multiArray[3][index[3]]
    const minute = this.data.multiArray[4][index[4]]
    this.setData({
      date: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
  },
  //监听start-picker的滚动事件
  bindMultiPickerColumnChange_Start: function(e) {    
    var data = {
      multiArray: this.data.multiArray,
      multiIndex_Start: this.data.multiIndex_Start
    };
    data.multiIndex_Start[e.detail.column] = e.detail.value;
    this.setData(data);
  }, 
  bindMultiPickerChange_End: function (e) {
    this.setData({
      multiIndex_End : e.detail.value
    })
    const index = this.data.multiIndex_End;
    const year = this.data.multiArray[0][index[0]]
    const month = this.data.multiArray[1][index[1]]
    const day = this.data.multiArray[2][index[2]]
    const hour = this.data.multiArray[3][index[3]]
    const minute = this.data.multiArray[4][index[4]]
    this.setData({
      endDate: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
  },
  //监听end-picker的滚动事件
  bindMultiPickerColumnChange_End: function (e) {   
    var data = {
      multiArray: this.data.multiArray,
      multiIndex_End: this.data.multiIndex_End
    };
    data.multiIndex_End[e.detail.column] = e.detail.value;    
    this.setData(data);
  },
  defaultData() {
    this.setData({
      polyline: [],
      includePoints: [],
      isRun: false,
      currentIndex: 0,
      processValue: 0,
      allData: [],
      runData: {
        speed: 0,
        totalDistance: 0,
        status: '未知',
        location: '未知'
      },
      markers: []
    })
    if (this.drawCircleContext) {
      this.drawCircleContext.clearRect();
      this.drawCircleContext.draw();
    }
  },
  renderMap(data) {
    var _points = [];
    var _markers = [];
    var firstData = data[0];
    data.forEach(function(item, index) {
      var _lat = parseFloat(item.lat);
      var _lng = parseFloat(item.lng);
      _points.push({
        latitude: _lat,
        longitude: _lng
      })
      if (index == 0) {
        var _opt = {
          width: 32,
          height: 32,
          latitude: _lat,
          longitude: _lng
        }
        _markers.push(Object.assign({
          id: index,
          iconPath: '../../resources/start.png'
        }, _opt))
        _markers.push(Object.assign({
          id: index + 1,
          iconPath: '../../resources/marker-online.png'
        }, _opt))
      }
      if (index == data.length - 1) {
        _markers.push({
          id: index,
          iconPath: '../../resources/end.png',
          width: 32,
          height: 32,
          latitude: _lat,
          longitude: _lng
        })
      }
    });

    this.setData({
      includePoints: _points,
      runData: {
        speed: firstData.speed,
        status: firstData.status,
        location: firstData.location,
        totalDistance: firstData.Distance > 0 ? firstData.Distance.toFixed(2) : firstData.Distance
      },
      markers: _markers,
      polyline: [{
        points: _points,
        color: '#4fa0fb',
        width: 3
      }]
    })
  },
  onLoad: function(param) {
    var that = this;
    that.setData({
      plateNo: param.plateNo
    })
    that.createCircle();
    that.getTrackHistory();
  },
  plateNoInput(e) {
    this.setData({
      plateNo: e.detail.value
    })
  },
  getParam() {
    var _param = null;
    if (this.data.plateNo) {
      _param = {
        license: this.data.plateNo
      }
    }
    return _param;
  },
  // 快速查询
  search(e) {
    var eventType = e.currentTarget.dataset.type || '';
    var _date = new Date();
    var strDate = this.data.date;
    switch (eventType) {
      case 'today':
        strDate = util.formatDate(_date);
        break;
      case 'yesterday':
        strDate = util.formatDate(new Date(_date.setTime(_date.getTime() - 24 * 60 * 60 * 1000)));
        break;
      case 'old':
        strDate = util.formatDate(new Date(_date.setTime(_date.getTime() - 2 * 24 * 60 * 60 * 1000)))
        break;
      case 'more':
        break;
    }
    if (eventType != 'more') {
      this.setData({
        date: strDate,
        eventType: eventType
      })
      this.getTrackHistory(true);
    } else {
      var _date = util.format(new Date, 'yyyy-MM-dd hh:mm');
      this.setData({
        date: _date,
        endDate: _date,
        eventType: eventType,
        multiIndex_Start: util.multiIndex(years, months, days, hours, minutes, _date),
        multiIndex_End: util.multiIndex(years, months, days, hours, minutes, _date),
      })
    }
  },
  // 按钮查询
  btnSearch() {
    this.getTrackHistory(true);
  },
  getTrackHistory(bySearch) {
    var that = this;
    // 暂停
    this.setData({
      isRun: false
    });
    var _param = this.getParam();
    var _dateParam = {
      stime: this.data.date + ' 00:00:00',
      etime: this.data.date + ' 23:59:59'
    }
    if (!_param && bySearch) {
      wx.showModal({
        content: '车牌号码不能为空',
        showCancel: false
      });
      return false;
    }
    // 如果为自定义时间，则需要重新验证
    if (this.data.eventType == 'more'){
      if (util.compareDate(this.data.date,this.data.endDate)){
        wx.showModal({
          content: '开始日前不能大于结束日期',
          showCancel: false
        });
        return false;
      }
      _dateParam={
        stime:this.data.date,
        etime:this.data.endDate
      }
    }
    if (_param) {
      wx.showLoading({
        title: '数据加载中',
        mask: true
      })
      var _data = api.getApi('historyTrack');
      var _param = Object.assign(_dateParam, _param);
      wx.request({
        url: _data.url,
        data: _param,
        success: function(res) {
          wx.hideLoading();
          var data = JSON.parse(res.data);
          if (data.result == 'Success') {
            var _data = data.Data || [];
            that.setData({
              allData: _data,
              isRun: false,
              currentIndex: 0,
              processValue: 0,
              totalDistance: 0
            });
            that.renderMap(_data);
            if (that.drawCircleContext) {
              that.drawCircleContext.clearRect();
              that.drawCircleContext.draw();
            }
          } else {
            // 设置默认值
            that.defaultData()
          }
        }
      })
    }
  },
  setRunData(data) {
    var distance = parseFloat(this.data.runData.totalDistance) + data.Distance
    this.setData({
      runData: {
        speed: data.speed,
        status: data.status,
        location: data.location,
        totalDistance: distance > 0 ? distance.toFixed(2) : distance
      }
    })
  },
  start() {
    if (this.data.allData.length > 0) {
      this.setData({
        isRun: true
      })
      this.initTrack();
    }
  },
  pause() {
    this.setData({
      isRun: false
    })
  },
  initTrack() {
    var points = this.data.includePoints;
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('trackMap');
    this.translateMarker(points, points.length, this.data.currentIndex);
  },
  translateMarker: function(points, len, current) {
    var that = this;
    var point = points[current];
    if (point) {
      this.mapCtx.translateMarker({
        markerId: 1,
        autoRotate: false,
        duration: 500,
        destination: point,
        animationEnd() {
          that.setData({
            currentIndex: current
          })
          if (that.data.isRun) {
            current += 1;
            if (current < len) {
              var _processValue = current / (len / 2);
              that.setData({
                processValue: _processValue
              });
              that.drawCircle(_processValue);
              that.setRunData(that.data.allData[current]);
              that.translateMarker(points, points.length, current)
            } else {
              that.setData({
                isRun: false
              })
              that.drawCircle(2);
            }
          }
        }
      })
    }
  },
  createCircle() {
    var ctx = wx.createCanvasContext('canvasProgressBg')
    ctx.setLineWidth(1); // 设置圆环的宽度
    ctx.setStrokeStyle('#20183b'); // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath(); //开始一个新的路径
    ctx.arc(30, 30, 25, 0, 2 * Math.PI, false);
    //设置一个原点(100,100)，半径为90的圆的路径到当前路径
    ctx.stroke(); //对当前路径进行描边
    ctx.draw();
  },
  drawCircle: function(step) {
    var context = wx.createCanvasContext('canvasProgress');
    // 设置渐变
    var gradient = context.createLinearGradient(200, 100, 100, 200);
    gradient.addColorStop("0", "#2661DD");
    gradient.addColorStop("0.5", "#40ED94");
    gradient.addColorStop("1.0", "#5956CC");

    context.setLineWidth(4);
    context.setStrokeStyle(gradient);
    context.setLineCap('round')
    context.beginPath();
    // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(30, 30, 25, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    context.stroke();
    context.draw();
    this.drawCircleContext = context;
  }
})