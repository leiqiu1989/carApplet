//index.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var topBarHeight = 98; // topbar占用高度
var util = require('../../utils/util')
var api = require('../../utils/api')

Page({
  data: {
    tabs: ["全部", "在线", "离线"],
    count: [0, 0, 0],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    inputShowed: false,
    inputVal: "",
    markers: [],
    markerId: null,
    includePoints: [],
    List: [],
    AllList: [],
    mapList: [],
    switchCls: '',
    markerDetail: {},
    mapHeight: 0,
    mapShow: true,
    hiddenMark: true,
    timer: null,
    iconUrl: '../../resources/list.png',
    modeText: '列表',
    transformCls:'',
    lng: 113.096008,
    lat: 23.016548
  },
  changeMode: function() {
    var _mapShow = this.data.mapShow;
    var _iconUrl = _mapShow ? '../../resources/map.png' : '../../resources/list.png'
    var _modeText = _mapShow ? '地图' : '列表';
    this.setData({
      mapShow: !_mapShow,
      iconUrl: _iconUrl,
      modeText: _modeText,
    });
    wx.setNavigationBarTitle({
      title: _mapShow ? '列表模式' : '地图模式'
    })
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
      this.closeMarkerDetail();
      this.renderMapList(this.data.activeIndex, true);
    }
  },
  transform:function(e){
    var oldCls = this.data.transformCls;
    var newCls = oldCls ? '' :'carlist-trigon-transform';
    this.setData({
      transformCls:newCls
    })
  },
  // 过滤数据并显示
  filterData: function() {
    this.renderMapList(this.data.activeIndex);
  },
  onLoad: function() {
    var that = this;
    util.getSystemWidthHeight(function(_width, _height) {
      that.setData({
        sliderLeft: (_width / that.data.tabs.length - sliderWidth) / 2,
        sliderOffset: _width / that.data.tabs.length * that.data.activeIndex,
        mapHeight: _height - topBarHeight
      });
      that.startTimer();
    });
  },
  filterMapData() {
    var _mapData = [];
    this.data.AllList.forEach(function(item) {
      if (item.children.length > 0) {
        _mapData = _mapData.concat(item.children);
      }
    });
    _mapData = this.getEffectiveData(_mapData);
    return _mapData;
  },
  getCarList: function(opt) {    
    var that = this;
    opt = opt || {
      callback: null,
      loading: true
    }

    opt.loading && wx.showLoading({
      title: '数据加载中',
      mask: true
    });
    var param = api.getApi('carList');
    wx.request({
      url: param.url,
      data: param.data,
      success: function(res) {
        var data = JSON.parse(res.data);
        if (data.result == 'Success') {
          var _data = data.Data || [];
          that.setData({
            AllList: _data,
            count: [data.vehicle_no_all, data.online_no_all, data.offline_no_all]
          });
          that.renderMapList(that.data.activeIndex);
        } else {
          wx.showModal({
            content: data.msg,
            showCancel: false
          });
        }
        opt.callback && opt.callback();
        opt.loading && wx.hideLoading();
      }
    })
  },
  startTimer() {
    var that = this;
    if (!this.data.timer) {
      var opt = {
        callback: function() {
          that.setData({
            inputShowed: false,
            inputVal: "",
            switchCls: '',
            hiddenMark: true,
            markerId: '',
            transformCls:'',
            lng: 113.096008,
            lat: 23.016548
          })
        },
        loading: false
      }
      var _opt = Object.assign({}, opt, {
        loading: true
      })
      that.getCarList(_opt);
      var _timer = setInterval(function() {       
        that.getCarList(opt);
      }, 30000);
      this.setData({
        timer: _timer
      })
    }
  },
  onShow() {
    if (!this.data.timer) {
      this.startTimer();
    }
  },
  onHide() {
    clearInterval(this.data.timer);
    this.setData({
      timer: null
    })
  },
  // 过滤无经纬度数据
  getEffectiveData(data) {
    return data.filter(function(item) {
      return item.lat && item.lng;
    });
  },
  // 根据状态(0:全部,1:在线,2:离线)筛选数据
  getDataByTabIndex: function(tabIndex, isFilter) {
    tabIndex = parseInt(tabIndex) || 0;
    isFilter = isFilter || false;
    var _allData = this.data.AllList;
    var _mapData = this.filterMapData();
    var _listData = [];
    if (tabIndex) {
      _mapData = _mapData.filter(function(item) {
        return item.online == (tabIndex == 1 ? '在线' : '离线');
      });
      _allData.forEach(function(item) {
        if (item.children.length > 0) {
          var _children = item.children.filter(function(child) {
            return child.online == (tabIndex == 1 ? '在线' : '离线');
          });
          if (_children.length > 0) {
            // 在线
            if (tabIndex == 1) {
              item.online_no = _children.length;
              item.offline = item.vehicle_no - _children.length;
            } else { // 离线
              item.offline = _children.length;
              item.online_no = item.vehicle_no - _children.length;
            }
            var _cloneItem = Object.assign({}, item);
            _cloneItem.filterChildren = _children;
            _listData.push(_cloneItem);
          }
        }
      });
    }
    var rtListData = tabIndex ? _listData : _allData;
    // 过滤数据
    var filterListData = [];
    if (isFilter) {
      var _val = this.data.inputVal;
      _mapData = _mapData.filter(function(item) {
        return item.licenseplate.indexOf(_val) > -1;
      });
      rtListData.forEach(function(item) {
        var _filterChildren = item.filterChildren || item.children;
        if (_filterChildren.length > 0) {
          var _children = _filterChildren.filter(function(child) {
            return child.licenseplate.indexOf(_val) > -1;
          });
          if (_children.length > 0) {
            var _cloneItem = Object.assign({}, item);
            // 在筛选结果里面进行是否在线的过滤
            _cloneItem.vehicle_no = _children.length;
            var _onlines = _children.filter(function(child) {
              return child.online == '在线';
            });
            _cloneItem.online_no = _onlines.length;
            _cloneItem.offline = _cloneItem.vehicle_no - _onlines.length;
            _cloneItem.children = _children;
            filterListData.push(_cloneItem);
          }
        }
      });
    }
    return {
      mapData: _mapData,
      listData: isFilter ? filterListData : rtListData
    }
  },
  // 渲染地图和list数据
  renderMapList(tabIndex, isFilter) {
    var obj = this.getDataByTabIndex(tabIndex, isFilter);
    var data = obj.mapData || [];
    var _markers = [],
      _includePoints = [];     
    data.forEach(function(item) {
      _includePoints.push({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lng)
      });
      var _isOnline = item.online == '在线';
      _markers.push({
        iconPath: _isOnline ? "../../resources/marker-online.png" : '../../resources/marker-offline.png',
        id: 'list_' + item.vid,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lng),
        width: 48,
        height: 48,
        callout:{
          content: item.licenseplate,
          borderRadius:4,
          fontSize:12,
          display:'ALWAYS',
          textAlign:'center',          
          color:'#333',
          padding:4
        }
      })
    })
    this.setData({
      markers: _markers,
      includePoints: _includePoints,
      List: obj.listData,
      mapList: data
    })
  },
  tabClick: function(e) {
    var tabIndex = e.currentTarget.id;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: tabIndex,
      inputVal: '',
      inputShowed: false
    });
    this.renderMapList(tabIndex);
  },
  // 跳转到车辆列表
  navCarList(e) {
    var carinfo = e.currentTarget.dataset.carinfo;
    wx.setStorageSync('carinfo', carinfo);
  },
  trackHistory(e) {
    var _dataset = e.currentTarget.dataset;
    var _plateNo = _dataset.plateno;
    wx.navigateTo({
      url: '../track/index?plateNo=' + _plateNo
    });
  },
  // 车辆定位
  carPosition: function (e) {
    var index = parseInt( e.currentTarget.id);
    var markerId = 'list_' + this.data.mapList[index].vid;
    this.markerTapProcess(markerId);
  },
  markerSelected: function(isClose) {
    var me = this;
    var _markerid = this.data.markerId;
    this.data.mapList.forEach(function(item, index) {
      var marker = me.data.markers[index];
      marker.iconPath = item.online == '在线' ?
        "../../resources/marker-online.png" : '../../resources/marker-offline.png';
      marker.callout.color = '#333';
      if (marker.id == _markerid && !isClose) {
        marker.iconPath = item.online == '在线' ?
          "../../resources/marker-online-selected.png" : '../../resources/marker-offline-selected.png';
        marker.callout.color ='#1AAD1A';
      }
    });
    this.setData({
      markers: this.data.markers
    })
  },
  // marker点击事件
  markertap: function(e) {
    var markerId = e.markerId;
    this.markerTapProcess(markerId);
  },
  markerTapProcess: function (markerId){
    var mapList = this.data.mapList;
    var list = mapList.filter(function (item) {
      return 'list_' + item.vid == markerId;
    });
    var data = {};
    if (list.length) {
      list = list.map(function (item) {
        if (item.online == '在线') {
          item.cls = 'online';
          item.iconUrl = '../../resources/icon-online.png';
        } else {
          item.cls = 'offline';
          item.iconUrl = '../../resources/icon-offline.png';
        }
        return item;
      });
      data = list[0];      
      this.setData({
        hiddenMark: false,
        markerDetail: data,
        switchCls: 'switch-patch',
        markerId: markerId,
        lng:parseFloat(data.lng),
        lat:parseFloat(data.lat)
      });
      this.markerSelected();
    }
  },
  closeMarkerDetail() {
    this.setData({
      hiddenMark: true,
      markerDetail: {},
      switchCls: '',
      markerId:''
    });
    this.markerSelected(true);
  }
});