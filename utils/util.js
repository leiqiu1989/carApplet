const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-');
}

const format = (date,fmt) => {
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

const multiIndex = (years,months,dates,hours,minutes,date)=>{  
  var _date = new Date(date);
  var _year = _date.getFullYear()
  var _month = _date.getMonth()+1;
  var _day = _date.getDate();
  var _hour = _date.getHours();
  var _minutes = _date.getMinutes();
  return [years.indexOf(_year + ''), months.indexOf(formatNumber(_month)), 
  dates.indexOf(formatNumber(_day)), hours.indexOf(formatNumber(_hour)), 
  minutes.indexOf(formatNumber(_minutes))]
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getSystemWidthHeight = fn => {
  wx.getSystemInfo({
    success: function(res) {
      var _windowWidth = res.windowWidth;
      var _windowHeight = res.windowHeight;
      fn && fn(_windowWidth, _windowHeight);
    }
  });
}

const getUserInfo = () => {
  var userInfo = wx.getStorageSync('userInfo') || {};
  return userInfo;
}

const setUserInfo = (userInfo) => {
  wx.setStorageSync('userInfo', userInfo);
}

const removeStorageSync = (key) => {
  wx.removeStorageSync(key);
}

const compareDate = (s1, s2) => {
  return ((new Date(s1.replace(/-/g, "\/"))) >= (new Date(s2.replace(/-/g, "\/"))));
}

module.exports = {
  formatDate: formatDate,
  format: format,
  multiIndex: multiIndex,
  getSystemWidthHeight: getSystemWidthHeight,
  getUserInfo: getUserInfo,
  setUserInfo: setUserInfo,
  removeStorageSync: removeStorageSync,
  compareDate: compareDate
}