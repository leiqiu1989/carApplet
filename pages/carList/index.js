//index.js
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var topBarHeight = 100; // topbar占用高度
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
    List: [],
    AllList: [],
    plateCount: 0,
    mapHeight: 0,
    mapShow: true,
    iconUrl: '../../resources/list.png',
    modeText: '列表',
    markers: [],
    markerId: null,
    includePoints: [],
    mapList: [],
    hiddenMark: true,
    markerDetail: {},
    arrorUrl: '../../resources/arrow_state_grey_collapsed.png',
    isHide: false,
    lng: 113.096008,
    lat: 23.016548
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
    this.renderMapList(this.data.activeIndex);
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
    this.renderMapList(this.data.activeIndex, );
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
  onLoad: function(param) {
    var that = this;
    this.setData({
      activeIndex: parseInt(param.tabIndex)
    })
    util.getSystemWidthHeight(function(_width, _height) {
      that.setData({
        sliderLeft: (_width / that.data.tabs.length - sliderWidth) / 2,
        sliderOffset: _width / that.data.tabs.length * that.data.activeIndex,
        mapHeight: _height - topBarHeight
      });
      that.getCarList();
    });
  },
  getCarList: function() {
    var carInfo = wx.getStorageSync('carinfo') || {};
    var data = carInfo.children || [];
    this.setData({
      AllList: data,
      dName: carInfo.dname,
      plateCount: carInfo.vehicle_no,
      count: [carInfo.vehicle_no, carInfo.online_no, carInfo.offline]
    });
    this.renderMapList(this.data.activeIndex);
  },
  transform: function (e) {
    var _isHide = this.data.isHide;
    this.setData({
      isHide: !_isHide,
      arrorUrl: _isHide ? '../../resources/arrow_state_grey_collapsed.png' :
        '../../resources/arrow_state_grey_expanded.png'
    });
  },  
  renderMapList(tabIndex, isFilter) {
    var data = this.getDataByTabIndex(tabIndex, isFilter);
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
        callout: {
          content: item.licenseplate,
          borderRadius: 4,
          fontSize: 12,
          display: 'ALWAYS',
          textAlign: 'center',
          color: '#333',
          padding: 4
        }
      })
    })
    this.setData({
      markers: _markers,
      includePoints: _includePoints,
      List: data,
      mapList: data
    })
  },
  // 根据状态(0:全部,1:在线,2:离线)筛选数据
  getDataByTabIndex: function(tabIndex, isFilter) {
    tabIndex = parseInt(tabIndex) || 0;
    isFilter = isFilter || false;
    var _data = [];
    if (tabIndex) {
      _data = this.data.AllList.filter(function(item) {
        return item.online == (tabIndex == 1 ? '在线' : '离线');
      });
    }
    var rtListData = tabIndex ? _data : this.data.AllList;
    // 过滤数据   
    if (isFilter) {
      var _val = this.data.inputVal;
      rtListData = rtListData.filter(function(item) {
        return item.licenseplate.indexOf(_val) > -1;
      });
    }
    rtListData = rtListData.map(function(item) {
      if (item.online == '在线') {
        item.cls = 'online';
        item.iconUrl = '../../resources/icon-online.png';
      } else {
        item.cls = 'offline';
        item.iconUrl = '../../resources/icon-offline.png';
      }
      return item;
    });
    return rtListData;
  },
  changeMode: function() {
    var _mapShow = this.data.mapShow;
    var _iconUrl = _mapShow ? '../../resources/map.png' : '../../resources/list.png'
    var _modeText = _mapShow ? '地图' : '列表';
    this.setData({
      mapShow: !_mapShow,
      iconUrl: _iconUrl,
      modeText: _modeText
    });
    wx.setNavigationBarTitle({
      title: _mapShow ? '列表模式' : '地图模式'
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
  trackHistory(e) {
    var _dataset = e.currentTarget.dataset;
    var _plateNo = _dataset.plateno;
    wx.navigateTo({
      url: '../track/index?plateNo=' + _plateNo
    });
  },
  enterMap:function(e){
    var _markerid = 'list_'+e.currentTarget.id;
    this.changeMode();
    this.markerTabProcess(_markerid);
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
        marker.callout.color = '#1AAD1A';
      }
    });
    this.setData({
      markers: this.data.markers
    })
  },
  // 车辆定位
  carPosition: function (e) {
    var index = parseInt(e.currentTarget.id);
    var markerId = 'list_' + this.data.mapList[index].vid;
    this.markerTabProcess(markerId);
  },
  // marker点击事件
  markertab: function(e) {
    var markerId = e.markerId;
    this.markerTabProcess(markerId);
  },
  markerTabProcess: function (markerId){
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
        lng: parseFloat(data.lng),
        lat: parseFloat(data.lat)
      });
      this.markerSelected();
    }
  },
  closeMarkerDetail() {
    this.setData({
      hiddenMark: true,
      markerDetail: {},
      switchCls: '',
      markerId: ''
    });
    this.markerSelected(true);
  }
});