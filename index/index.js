var ble = require('./bleSdk.js');

const app = getApp();

function stringToHexBuffer(data) {
  let typedArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {
  return parseInt(h, 16)
  }))
  return typedArray.buffer
}

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

//  获取系统当前时间
function getNowTime()
{
  
  //获取当前时间戳
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  //获取当前时间
  var n = timestamp * 1000;
  var date = new Date(n);
  // console.log("当前时间：" + date.toLocaleDateString());
  return  date.toLocaleString()
}

const gServiceId = "0000fff0-0000-1000-8000-00805f9b34fb"
const gReceiveId = "0000fff6-0000-1000-8000-00805f9b34fb"
Page({
  data: {
    devices: [],
    triggered: false,
    connected: false,
    consoleSwitch: 1,
    chs: [],
    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://cdn.yun.sooce.cn/6/34931/jpg/16522555312680c9ad68c5ecfd418.jpg?imageMogr2/thumbnail/3186x&version=0'
    }, {
      id: 1,
        type: 'image',
        url: 'https://cdn.yun.sooce.cn/6/34931/jpg/16469027196653c33b0b033ebef27.jpg?imageMogr2/thumbnail/1918x&version=1646902722',
    }, {
      id: 2,
      type: 'image',
      url: 'https://cdn.yun.sooce.cn/6/34931/jpg/1648549389662e69db3e1184a407c.jpg?imageMogr2/thumbnail/1800x&version=1648549393'
    }, {
      id: 3,
      type: 'image',
      url: 'https://cdn.yun.sooce.cn/6/34931/jpg/164007717367373a421b14cd8fc29.jpg?imageMogr2/thumbnail/1800x&version=0'
    }, {
      id: 4,
      type: 'image',
      url: 'https://cdn.yun.sooce.cn/6/34931/jpg/16398159583051444bb6f79cc8a75.jpg?imageMogr2/thumbnail/1800x&version=1639815960'
    }, {
      id: 5,
      type: 'image',
      url: 'https://cdn.yun.sooce.cn/6/34931/jpg/16570151830798ff4d34d644f0c94.jpg?imageMogr2/thumbnail/1800x&version=0'
    }],
  },
  mcShowSuccess(params) {
    wx.showToast({
      title: params,       //弹出提示
      icon: 'success',
      duration: 1000,
    })
  },
  mcShowNone(params) {
    wx.showToast({
      title: params,       //弹出提示
      icon: 'none',
      duration: 2000,
    })
  },
  mcShowLoading(params) {
    wx.showToast({
      title: params,       //弹出提示
      icon: 'loading',
      duration: 8000,
    })
  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  onScrollRefresh: function () {
    var that=this;
    setTimeout(function(){
      that.setData({
        triggered: false,
      })
    },2000);
    this.startBluetoothDevicesDiscovery()
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        this.mcShowSuccess("蓝牙初始化成功");
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        this.mcShowNone("初始化失败，请检查蓝牙开关");
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    this.mcShowLoading("正在扫描");
    console.log('startBluetoothDevicesDiscovery success')
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    this.mcShowSuccess("停止扫描");
    console.log('Stop scan.')
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    this.data.devices =  [];
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    this.mcShowLoading("正在连接");
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.mcShowSuccess("连接成功");
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.showModal(e);
        this.getBLEDeviceServices(deviceId)
      },
      fail: (res) =>
      {
        this.mcShowNone("连接失败");
      }
    })
    wx.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection(e) {
    this.hideModal(e);
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        console.log('This service id is',  deviceId)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      var datetime = getNowTime()
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
          datetime: datetime
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value),
          datetime: datetime
        }
      }
      this.setData(data)
    })
  },
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
		const tempSendData = "7f120c8f9240b8c453073b423151a845dc7afbbd";
		let buffer = stringToHexBuffer(tempSendData)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success: function (res) {
		  },
		  fail: function (res) {
			console.log('write failed:', res)
		  },
		  complete: function (res) {
		  }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!app.globalData.consoleSwitch){
      console.log = ()=>{}
    }
    console.log("onLoad");
    wx.getLocation({
      type: 'gcj02',
      success (res) {
        console.log(res)
      }
     })
    this.openBluetoothAdapter();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide");
  },
})