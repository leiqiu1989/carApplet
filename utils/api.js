import util from 'util'
const remoteURL = 'https://hfgps.3pgis.cn';

const _api = {
  login: function() {
    return {
      url: remoteURL + '/login.ashx'
    }
  },
  carList: function() {
    return {
      url: remoteURL + '/getDepVehicle.ashx',
      data: {
        dno: util.getUserInfo().dno || ''
      }
    }
  },
  historyTrack() {
    return {
      url: remoteURL + '/getHistorybylicense.ashx'
    }
  },
  reportMileage() {
    return {
      url: remoteURL + '/getDistance.ashx',
      data: {
        dno: util.getUserInfo().dno || ''
      }
    }
  },
  alarm() {
    return {
      url: remoteURL + '/getAlarm.ashx',
      data: {
        dno: util.getUserInfo().dno || ''
      }
    }
  },
  oilReport() {
    return {
      url: remoteURL + '/getOil.ashx'
    }
  },
  carPlateList() {
    return {
      url: remoteURL + '/getvehiclelist.ashx',
      data: {
        dno: util.getUserInfo().dno || ''
      }
    }
  },
  reportLog(){
    return{
      url: remoteURL + '/getVehicleRunLog.ashx',
      data: {
        dno: util.getUserInfo().dno || ''
      }
    }
  },
  reportTrack(){
    return{
      url: remoteURL + '/gethistorylist.ashx'      
    }
  }
}
const getApi = (key) => {
  return _api[key]();
}

module.exports = {
  getApi: getApi
}