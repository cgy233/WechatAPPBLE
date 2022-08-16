const jm = require("./encAndDes.js");
// const jm2 = require("./aes.js");

module.exports = function (
	platform,
	onBluetoothAdapterStateChange,
	onDeviceFound,
	onReceiveDatas) {

	this.onBluetoothAdapterStateChange = onBluetoothAdapterStateChange;
	this.onDeviceFound = onDeviceFound;
	this.onReceiveDatas = onReceiveDatas;
	this.platform = platform;

	this.data = {
		isAavailable: false,
		isScanning: false,
		isOpened: false,
		isCanWrite: false,
		bleDatas: [],

		deviceConnected: null,

		serviceId: "0000fff0-0000-1000-8000-00805f9b34fb",
		receiveId: "0000fff6-0000-1000-8000-00805f9b34fb",
		sendId: "0000fff6-0000-1000-8000-00805f9b34fb",
		userCharacteristcID: '0000FFF6-0000-1000-8000-00805F9B34FB',
		headTimeId: 0,
		keys: "CA5BD38AE85973FD7759EC0200000000",
		session: "FFFFFFFF",

		LS_COMM_SESSION: 0x01, //设置session 0x1
		LS_COMM_TIME: 0x02, //更新时间 2
		LS_COMM_PWD: 0x03, //密码操作 增加 删除 修改 3
		LS_COMM_OPEN: 0x04, //开门 4
		LS_COMM_CHIPKEY: 0x05, //配置密钥 5
		LS_COMM_DEVICE: 0x06, //读取设备信息 6
		LS_COMM_DEVICE_ID: 0x07, //设置设备ID 7
		LS_COMM_OPENLOG: 0x08, //开门记录 8
		LS_COMM_HEARBEAT: 0x09, //心跳 3s  9
		LS_COMM_MSG: 0x0a, //获取MSG a
		LS_COMM_OFFLINE: 0x0b, //设置离线密码编号+开关 b
		LS_COMM_PINCODE: 0x0c, //配对 c
		LS_COMM_BATT_VALUE: 0x0d, //d
		LS_COMM_UPDATE: 0x0e, //升级 e
		LS_COMM_PROJECT: 0x0f, //工程版本 f
		LS_COMM_CLEAR: 0x10, //清空 10
		LS_COMM_PWD_VALID: 0x11, //密码操作 增加 删除 修改--生效有效期 11
		LS_COMM_USER_VALID: 0x12, //密码操作 增加 删除 修改--生效有效期 12
		LS_COMM_OPENLOG_BIGDATA: 0x13, //开门记录 13
		LS_COMM_MAX_GET_MCUID: 0x71, //获设备MCU ID

		// 操作类型
		USER_OPERATE_NONE: -1,
		USER_OPERATE_ADD: 0, // 增加
		USER_OPERATE_DELETE: 1, // 删除

		// 操作用户类型
		DO_USER_NONE: -1,
		DO_USER_PASSWD: 1,
		DO_USER_CARD: 3,
		DO_USER_FINGER: 0,

		// 同步类型
		SYNCH_LOCK_OPEN: 1,
		SYNCH_USER_PASSWD: 20010,
		SYNCH_USER_CARD: 20012,
		SYNCH_USER_FINGER: 20011,
	};
	/*
		删除密码用户
	*/
	this.deletePasswdUser = function (uid) {
		console.log("deletePasswdUser", uid);
		let type = 0x11;
		let data = [];
		let dataLen = 0;
		this.sendChangeUser(type, 0, 0, uid, data, dataLen);
	};
	/*
		删除卡用户
	*/
	this.deleteCardUser = function (uid) {
		console.log("deleteCardUser", uid);
		let type = 0x13;
		let data = [];
		let dataLen = 0;
		this.sendChangeUser(type, 0, 0, uid, data, dataLen);
	};
	/*
		删除指纹用户
	*/
	this.deleteFingerUser = function (uid) {
		console.log("deleteFingerUser", uid);
		let type = 0x10;
		let data = [];
		let dataLen = 0;
		this.sendChangeUser(type, 0, 0, uid, data, dataLen);
	};
	/*
		添加密码用户
	*/
	this.addPwdUser = function (uid, passwd, startTime, endTime) {
		let bit1 = parseInt(passwd.substring(0, 2), 16);
		let bit2 = parseInt(passwd.substring(2, 4), 16);
		let bit3 = parseInt(passwd.substring(4, 6), 16);

		let data = [bit1, bit2, bit3];
		let dataLen = 3;

		this.addUser(this.data.DO_USER_PASSWD, uid, data, dataLen, startTime, endTime);
	};
	/*
		添加指纹用户
	*/
	this.addFingerUser = function (uid, startTime, endTime) {
		let data = [];
		let dataLen = 0;
		this.addUser(this.data.DO_USER_FINGER, uid, data, dataLen, startTime, endTime);
	};
	/*
		添加卡用户
	*/
	this.addCardUser = function (uid, startTime, endTime) {
		let data = [];
		let dataLen = 0;
		this.addUser(this.data.DO_USER_CARD, uid, data, dataLen, startTime, endTime);
	};
	/*
		添加用户(密码/指纹/卡)
	*/
	this.addUser = function (type, uid, data, dataLen, startTime, endTime) {
		let date = new Date(startTime * 1000);
		let year_start = (date.getFullYear() - 2000);
		let month_start = date.getMonth() + 1
		let day_start = date.getDate()
		let hour_start = date.getHours()
		let minute_start = date.getMinutes();

		console.log('startTime', startTime, year_start, month_start,
			day_start, hour_start, minute_start);

		date = new Date(endTime * 1000);
		let year_end = (date.getFullYear() - 2000);
		let month_end = date.getMonth() + 1
		let day_end = date.getDate()
		let hour_end = date.getHours()
		let minute_end = date.getMinutes();
		console.log('endTime', endTime, year_end, month_end,
			day_end, hour_end, minute_end);

		startTime = year_start * 0x40000 + month_start * 0x4000 + day_start * 0x200 + hour_start * 0x10 + 0;
		endTime = year_end * 0x40000 + month_end * 0x4000 + day_end * 0x200 + hour_end * 0x10 + 10;
		this.sendChangeUser(type, startTime, endTime, uid, data, dataLen);
	};
	this.sendChangeUser = function (type, startTime, endTime, uid, data, dataLen) {
		let timeList = [];
		// console.log("操作用户 增加删除及修改")
		// console.log("操作类型", type)
		// console.log("开始时间", startTime)
		// console.log("结束时间", endTime)
		// console.log("用户编号", uid)
		// console.log("用户内容数组", data)
		// console.log("内容长度", dataLen)
		//console.log("是否为管理员", isAdmin)

		timeList[0] = type;
		timeList[1] = startTime / 0x10000;
		timeList[2] = startTime / 0x100 % 0x100;
		timeList[3] = startTime % 0x100;
		timeList[4] = endTime / 0x10000;
		timeList[5] = endTime / 0x100 % 0x100;
		timeList[6] = endTime % 0x100;
		timeList[7] = uid / 0x100 % 0x100;
		timeList[8] = uid % 0x100;
		timeList[9] = dataLen % 0x100;
		for (let i = 0; i < dataLen; i++) {
			timeList[10 + i] = data[i];
		}
		//this.addData({ dataType: "其他", content: this.byteToString(timeList) })
		return this.Inferface_GetSendData(this.data.LS_COMM_USER_VALID, timeList, dataLen + 10, true);
	};
	/*
	 */
	this.arraybuffToHexBuffer = function (data) {
		let typedArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {
			return parseInt(h, 16)
		}))
		return typedArray;
	};
	/*
	 */
	this.stringToHexBuffer = function (data) {
		let typedArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {
			return parseInt(h, 16)
		}))
		return typedArray.buffer
	};
	/*
	 */
	this.buf2hex = function (buffer) {
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	};
	//字符串转arraybuffer
	this.char2buf = function (str) {
		let out = new ArrayBuffer(str.length * 2);
		let u16a = new Uint16Array(out);
		let strs = str.split("");
		for (let i = 0; i < strs.length; i++) {
			u16a[i] = strs[i].charCodeAt();
		}
		return out;
	};
	//arraybuffer 转字符串
	this.buf2char = function (buf) {
		let out = "";
		let u16a = new Uint16Array(buf);
		let single;
		for (let i = 0; i < u16a.length; i++) {
			single = u16a[i].toString(16)
			while (single.length < 4) single = "0".concat(single);
			out += "\\u" + single;
		}
		return out //eval("'"+out+ "'");
	};
	/*
		扫描设备
	*/
	this.scan = function (opendo) {
		const that = this;

		console.log("this.scan", opendo)
		if (opendo) {
			that.data.isScanning = true;
			wx.startBluetoothDevicesDiscovery();
		} else if (that.data.isScanning) {
			that.data.isScanning = false;
			wx.stopBluetoothDevicesDiscovery();
		}
	};
	/*
		初始化
	*/
	this.init = function (callback) {
		const that = this;
		let txtBleState = '';
		that.data.isOpened = false;
		wx.openBluetoothAdapter({
			success: function (res) {
				that.data.isAavailable = true;
				that.data.isOpened = true;
				that.scan(true);
				callback(1, txtBleState);
			},
			fail: function (res) {
				// fail
				console.log("openBluetoothAdapter fail:", res.errCode);
				if (!res.errCode) {
					res.errCode = 0;
				}
				if (!res.errCode) {
					txtBleState = "终端不支持蓝牙";
				} else if (res.errCode == 10001) {
					txtBleState = "请打开手机蓝牙";
				} else if (res.errCode == 10002) {
					txtBleState = "找不到指定设备";
				} else if (res.errCode == 10004) {
					txtBleState = "找不到指定服务";
				} else if (res.errCode == 10003) {
					txtBleState = "连接失蓝牙败"
				} else if (res.errCode == -1) {} else {
					console.log(res.errCode);
				}
				callback(0, txtBleState);
			},
			complete: function (res) {}
		})

		/*
			蓝牙监听状态
		*/
		wx.onBluetoothAdapterStateChange(function (res) {
			console.log('adapterState changed:', res);
			that.data.isAavailable = res.available;

			if (!res.available) {
				that.disConnect(function (ret) {});
				that.data.isOpened = false;
				that.data.isScanning = false;
			} else {
				if (!that.data.isScanning) {
					that.scan(true);
				}
			}
			// callback
			if (that.onBluetoothAdapterStateChange) {
				that.onBluetoothAdapterStateChange(res);
			}
		});
		/*
			状态变化
		*/
		wx.onBLEConnectionStateChanged(function (res) {
			console.log('connect state changed:', res);

			if (res && !res.connected) {
				that.disConnect(function (ret) {});
			}
			/*if(this.onBLEConnectionStateChanged){
				this.onBLEConnectionStateChanged(res);
			}*/
		});
		/*
		 */
		wx.onBluetoothDeviceFound(function (res) {
			console.log("onBluetoothDeviceFound:", res);
			if (res.devices && res.devices.length > 0) {
				that.updateBleList(res.devices);
			} else if (res instanceof Array) {
				that.updateBleList(res);
			}
		})
	};
	/*
	 */
	this.clear = function () {
		this.disConnect(function (ret) {});
		this.data.bleDatas = [];
		wx.closeBluetoothAdapter({
			success: function (res) {},
			fail: function (res) {},
			complete: function (res) {}
		})
	};
	/*
	 */
	this.getConneted = function () {
		return this.data.deviceConnected;
	};
	/*
	 */
	this.isConneted = function () {
		return null != this.data.deviceConnected;
	};
	/*
	 */
	this.getDevice = function (i) {
		return (this.data.bleDatas.length < 1 ? null : this.data.bleDatas[i]);
	};
	/*
		关闭已经连接
	*/
	this.disConnect = function (callback) {
		const that = this;
		let device = this.data.deviceConnected;


		if (this.data.headTimeId) {
			clearInterval(this.data.headTimeId);
			this.data.headTimeId = 0;
		}
		if (!device) {
			callback(0);
		} else {
			console.log('disConnect');
			that.data.deviceConnected.connected = false;
			that.data.isCanWrite = false;

			that.data.session = "FFFFFFFF";
			that.data.keys = "CA5BD38AE85973FD7759EC0200000000";

			try {
				wx.closeBLEConnection({
					deviceId: device.deviceId,
					success: function (res) {
						callback(0);
					},
					fail: function (res) {
						callback(1);
					},
					complete: function (res) {
						that.data.deviceConnected = null;
					}
				})
			} catch (e) {
				that.data.deviceConnected = null;
			}
		}
	};
	this.findList = function (device, callback) {
		let datas = this.data.bleDatas;
		for (let i = 0; datas && i < datas.length; i++) {
			let mac = datas[i].name.substring(2).toLowerCase();
			if (device.mac == mac) {
				return datas[i];
			}
		}
		return null;
	};
	/*
		连接指定BLE
	*/
	this.connect = function (device, callback) {
		const that = this;
		console.log('connect device mac:', device);

		if (this.platform == "ios") {
			let dev = this.findList(device);
			if (dev) {
				device.deviceId = dev.deviceId;
			} else {
				wx.showToast({
					title: '设备无法找到或搜索中，请稍后点击打开',
					icon: 'none',
					duration: 5000
				})
			}
		}
		if (this.data.deviceConnected) {
			console.log('deviceConnected mac:', this.data.deviceConnected.mac);
		}
		if (this.data.deviceConnected &&
			device.mac == this.data.deviceConnected.mac) {
			console.log('connect same:', device.mac);
			callback(1);
		} else {
			// 断开连接
			this.disConnect(function (ret) {
				that.data.isCanWrite = false;
				wx.createBLEConnection({
					deviceId: device.deviceId,
					success: function (res) {
						that.data.deviceConnected = device;
						that.data.deviceConnected.connected = true;
						that.getServiceAndCharacteristics(device);
						// wx.showToast({
						// 	title: '打开蓝牙成功',
						// 	icon: 'success',
						// 	duration: 3000
						// })
						callback(1);
					},
					fail: function (res) {
						console.log('createBLEConnection fail:', res);
						wx.showToast({
							title: '打开蓝牙失败',
							icon: 'none',
							duration: 3000
						})
						callback(0);
					}
				})
			})
		}
	};
	/*
		获取服务
	*/
	this.getServiceAndCharacteristics = function (device) {
		const that = this
		wx.getBLEDeviceServices({
			deviceId: device.deviceId,
			success: function (res) {
				console.log("getBLEDeviceServices", res)
				that.linkBle(device, that.getServiceId());
			},
			fail: function (res) {
				console.log('getServiceAndCharacteristics fail:', res)
			}
		})
	};
	/*
		连接蓝牙
	*/
	this.linkBle = function (device, uuid) {
		const that = this;

		wx.getBLEDeviceCharacteristics({
			deviceId: device.deviceId,
			serviceId: uuid,
			success: function (res) {
				console.log('characteristics:', res.characteristics);
				// 监听通知
				wx.onBLECharacteristicValueChange(function (characteristic) {
					if (characteristic.characteristicId.indexOf("FFF6") != -1) {
						const result = characteristic.value;
						const hex = that.buf2hex(result);
						//console.log("onBLECharacteristicValueChange buf2hex:", hex);
						that.recieveData(hex);
					}
				})
				/*wx.notifyBLECharacteristicValueChanged({
				  deviceId: device.deviceId,
				  serviceId: that.getServiceId(),
				  characteristicId: that.data.userCharacteristcID,
				  state: true,
				  success: function (res) {
					console.log('notifyBLECharacteristicValueChanged success:', res);
				  },
				  fail: function (res) {
					console.log('notifyBLECharacteristicValueChanged fail:', res)
				  }
				})*/
				wx.notifyBLECharacteristicValueChanged({
					deviceId: device.deviceId,
					serviceId: that.getServiceId(),
					characteristicId: that.data.userCharacteristcID,
					state: true,
					success: function (res) {
						console.log('notifyBLECharacteristicValueChanged success', res);
					},
					fail: function (res) {
						console.log('notifyBLECharacteristicValueChanged fail:', res)
					}
				})
				// pin 
				console.log('sendPin')
				that.sendPin();
			}
		})
	};
	/*
		更新列表
	*/
	this.updateBleList = function (devices) {
		let newDatas = this.data.bleDatas;

		const that = this;
		let update = false;
		for (let i = 0; i < devices.length; i++) {
			if (!this.isExist(devices[i])) {
				if (devices[i].name != "" && devices[i].deviceId != "") {
					if (devices[i].name.substring(0, 2) == "TM") {
						//&& devices[i].deviceId.substring(devices[i].deviceId.length-2) == 
						//devices[i].name.substring(devices[i].name.length-2)){

						let devId = devices[i].deviceId.split("-");
						if (devId.length > 2) {
							devices[i].devId = devId[devId.length - 1];
						} else {
							devices[i].devId = devices[i].deviceId;
						}
						devices[i].mac = devices[i].name.substring(2).toLowerCase();
						let f1 = devices[i].mac.substring(devices[i].mac.length - 1);
						devices[i].f1 = (f1 == "f1");
						newDatas.push(devices[i]);
						update = true;
						console.log("ble add:", devices[i]);
					} else {
						console.log("ble not fit:", devices[i].deviceId);
					}
				} else {
					console.log("ble no name:", devices[i].deviceId);
				}
			}
		}
		if (update) {
			that.data.bleDatas = newDatas;
			if (this.onDeviceFound) {
				this.onDeviceFound(newDatas);
			}
		}
	};
	// 已添加
	this.isExist = function (device) {
		let datas = this.data.bleDatas;
		for (let i = 0; i < datas.length; i++) {
			if (datas[i].deviceId == device.deviceId) {
				return datas[i]
			}
		}
		return null;
	};

	/*
		服务id
	*/
	this.getServiceId = function () {

		if (this.platform == "ios") {
			return this.data.serviceId.toUpperCase();
		}
		// android 小写
		else if (this.platform == "android") {
			return this.data.serviceId.toLowerCase();
		} else {
			return this.data.serviceId;
		}
	};
	/*
	 */
	this.sendHeadCode = function (e) {
		if (this.data.headTimeId) {
			return this.data.headTimeId;
		}
		const that = this;
		this.data.headTimeId = setInterval(function () {
			that.sendHeartbeat();
		}, 3000);
		return this.data.headTimeId;
	};
	/*
		开锁操作
	*/
	this.openLock = function () {
		let list = [];
		let i = 0,
			check = 0;
		let buffer = this.StringToByte(this.data.session);
		for (i = 0; i < 4; i++) {
			list[i] = buffer[i];
			check ^= list[i];
		}
		list[4] = check;
		return this.Inferface_GetSendData(this.data.LS_COMM_OPEN, list, 5, true);
	};
	/*
		接收数据处理结果
	*/
	this.recieveData = function (bufs) {
		const that = this;

		let list1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let i;
		let cnum;

		let buf = this.StringToByte(bufs);
		let cmd = buf[2];
		let headLen = buf[1];
		let result = buf[3];

		console.log('recieveData:', bufs);
		//console.log('接收数据:' + buf)
		//console.log('接收处理 cmd:' + cmd)
		if (cmd != that.data.LS_COMM_HEARBEAT) {}
		switch (cmd) {
			case that.data.LS_COMM_OPEN: {
				if (this.onReceiveDatas) {
					this.onReceiveDatas(that.data.LS_COMM_OPEN, result == 0 ? 1 : 0, buf);
				}
				break;
			}
			case that.data.LS_COMM_HEARBEAT: {
				break;
			}
			case that.data.LS_COMM_SESSION:
				that.memcpy(list1, buf, 3, 16);
				let jdata2 = this.Inferface_GetDecryptData(list1);
				console.log("LS_COMM_SESSION: ", jdata2);
				cnum = 0;
				for (i = 0; i < 4; i++) {
					cnum ^= jdata2[i];
				}
				if (jdata2[4] != cnum) {
					//return;
				}
				let list = [0x0, 0x0, 0x0, 0x0];
				this.memcpy(list, jdata2, 0, 4);
				let str2 = this.byteToString(list);
				let newKey = "CA5BD38AE85973FD7759EC02" + str2;
				console.log("session:", str2);
				console.log("new key:", newKey);
				that.data.session = str2;
				that.data.keys = newKey;

				that.sendHeartbeat();
				that.synchTime();
				that.sendHeadCode();
				that.openLogs();
				break;
			case that.data.LS_COMM_PINCODE:
				if (result == 0) {
					console.log('pin ok');
					that.blueGetSesson();
				} else {
					console.log('pin fail')
				}
				break;
			case that.data.LS_COMM_TIME: // 0x02,//更新时间 2
				if (result == 0) {
					console.log('更新时间成功')
				} else {
					console.log('更新时间失败')
				}
				break;
			case that.data.LS_COMM_CHIPKEY: //0x05,//配置密钥 5
				if (result == 0) {
					console.log('配置密钥成功')
				} else {
					console.log('配置密钥失败')
				}
				break;
			case that.data.LS_COMM_DEVICE: //0x06,//读取设备信息 6
				if (headLen == 18) {
					console.log('读取设备ID成功')
					var devId = [];
					var HardV = buf[14 + 3];
					var softV = buf[15 + 3];

					this.memcpy(devId, buf, 3, 14);
					console.log('设备ID' + this.byteToString(devId))
					//that({ dataType: "其他", content: 'HardV' + HardV })
					//that({ dataType: "其他", content: 'softV' + softV })
				} else {
					console.log('读取设备ID失败')
				}
				break;
			case that.data.LS_COMM_DEVICE_ID: //0x07,//设置设备ID 7
				if (result == 0) {
					console.log('设置设备信息成功')
				} else {
					console.log('设置设备信息失败')
				}
				break;
			case that.data.LS_COMM_OFFLINE: //0x0b,//设置离线密码编号+开关 b
				if (result == 0) {
					console.log('设置离线密码成功')
				} else {
					console.log('设置离线密码失败')
				}
				break;
			case that.data.LS_COMM_BATT_VALUE: //0x0d, //d

				if (headLen == 3) {
					let mBattValue = buf[3];
					console.log('获取电量成功：' + mBattValue)
				} else {
					console.log('获取电量失败')
				}
				break;
			case that.data.LS_COMM_CLEAR: // 0x10,//清空 10
				if (result == 0) {
					console.log('清空成功')
				} else {
					console.log('清空失败')
				}
				break;
				//0x13,//开门记录 13
			case that.data.LS_COMM_OPENLOG_BIGDATA: {
				if (that.onReceiveDatas) {
					that.onReceiveDatas(that.data.LS_COMM_OPENLOG_BIGDATA,
						headLen >= 18 && result == 0, buf, that.data.logType);
				}
				/*if (headLen == 18) {
				  console.log('开门记录成功' )
				  let logs = [];

				  this.memcpy(logs, buf, 3, 16);
				  console.log('开门记录' + this.byteToString(logs) )
				}
				else {
				  console.log('开门记录失败' )
				}*/
				break;
			}
			case that.data.LS_COMM_MAX_GET_MCUID: // 0x14,//获设备MCU ID
				if (headLen == 14) {
					console.log('获设备MCU ID 成功')
					let logs = [];

					this.memcpy(logs, buf, 3, 12);
					console.log('MCU ID' + this.byteToString(logs))
				} else {
					console.log('获设备MCU ID失败')
				}
				break;
			case that.data.LS_COMM_PROJECT: // 0x14,//获取工程版本
				if (headLen == 18) {
					console.log('获取工程版本  成功')
					let logs = [];

					this.memcpy(logs, buf, 3, 16);
					console.log('获取工程版本' + this.byteToString(logs))
				} else {
					console.log('获取工程版本 ID失败')
				}
				break;
				// 0x12,设置用户
			case that.data.LS_COMM_USER_VALID: {
				console.log('LS_COMM_USER_VALID:', headLen, result);
				if (that.onReceiveDatas) {
					that.onReceiveDatas(that.data.LS_COMM_USER_VALID,
						headLen >= 4 && result == 0, buf);
				}
				// if (headLen == 4) {
				//   console.log('设置用户  成功' )
				//   let logs = [];
				//   this.memcpy(logs, buf, 3, 2);
				//   console.log( '返回用户编号' + this.byteToString(logs) )
				// }
				// else {
				//   console.log('设置用户 ID失败' )
				// }
				break;
			}
			default:
				break;
		}
	};
	/*
		发送配对
	*/
	this.sendPin = function () {
		const tempSendData = "7f120c8f9240b8c453073b423151a845dc7afbbd";
		this.BlueToothCentral_Data_Send_Data(tempSendData);
		return tempSendData;
	};
	/*
		发送数据
	*/
	this.BlueToothCentral_Data_Send_Data = function (str) {
		const that = this
		const device = this.data.deviceConnected;

		if (!device) {
			console.log('BlueToothCentral_Data_Send_Data not device');
			return;
		}
		//console.log('BlueToothCentral_Data_Send_Data', device.deviceId);

		let tempSendData = str; //"7f120c8f9240b8c453073b423151a845dc7afbbd";
		let buffer = that.stringToHexBuffer(tempSendData)
		// console.log("send data:", tempSendData);
		// console.log("send data:", buffer);
		// console.log("deviceId:", device.deviceId);
		// console.log("serviceId:", that.getServiceId());
		// console.log("characteristicId:", that.getSendId());

		wx.writeBLECharacteristicValue({
			deviceId: device.deviceId,
			serviceId: that.getServiceId(),
			characteristicId: that.getSendId(),
			value: buffer,
			success: function (res) {},
			fail: function (res) {
				console.log('write failed:', res)
			},
			complete: function (res) {}
		})
	};
	/*
		获取发送id
	*/
	this.getSendId = function () {
		const platform = this.platform;
		//ios 大写
		if (platform == "ios") {
			return this.data.sendId.toUpperCase();
		}
		//android 小写
		else if (platform == "android") {
			return this.data.sendId.toLowerCase();
		} else {
			return this.data.sendId
		}
	};
	/*
		数组转字符串
	*/
	this.byteToString = function (buf) {
		let buffer = new Uint8Array(buf)
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	};

	this.StringToByte = function (str) {
		let array2 = this.stringToHexBuffer(str);
		return new Uint8Array(array2);
	};

	this.memcpy = function (newbuf, oldbuf, startId, len) {
		for (let i = 0; i < len; i++) {
			newbuf[i] = oldbuf[startId + i];
		}
	};
	this.intToByte = function (value, len) {
		let n = value;
		let list = [];
		for (let i = 0; i < len; i++) {
			list[len - i - 1] = n % 0x100;
			n = n / 0x100;
		}
		return list;
	};
	/*
	* 获取发送数据命令 
	* 参数：命令字cmd 内容数组 p 内容长度length 是否加密 isEncryption
	* 返回：内容字符串
	this.Inferface_GetSendData(this.data.LS_COMM_HEARBEAT, null, 0, false);
	*/
	this.Inferface_GetSendData = function (cmd, p, length, isEncryption) {
		if (isEncryption) {
			let list = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			let check;
			for (let i = 0; i < length; i++) {
				list[i] = p[i];
				check ^= list[i];
			}
			let str = this.byteToString(list);
			console.log(333, str);
			let data = jm.encryptionData(str, this.data.keys);
			console.log(444, data);
			let buffer = this.StringToByte(data);
			console.log(555, buffer);
			return this.Inferface_GetMakeData(cmd, buffer, 16);
		} else {
			return this.Inferface_GetMakeData(cmd, p, length);
		}
	};
	// 
	this.Inferface_GetMakeData = function (cmd, p, length) {
		let buf = [];
		let checkSum = 0;
		buf[0] = 0x7f;
		buf[1] = length + 2;
		buf[2] = cmd;
		let i = 0;

		if (length > 0) {
			for (i = 0; i < length; i++) {
				buf[3 + i] = p[i];
			}
		}

		for (i = 0; i < length + 3; i++) {
			checkSum ^= buf[i];
		}
		buf[i] = checkSum;

		this.BlueToothCentral_Data_Send_Data(this.byteToString(buf));
		return this.byteToString(buf);
	};
	/*
	 * 解密数据
	 * 参数：p 16位数组
	 * 返回：解密后数组
	 */
	this.Inferface_GetDecryptData = function (p) {
		console.log("Inferface_GetDecryptData", p);
		let str = this.byteToString(p);
		let jdata = jm.decryptData(str, this.data.keys);
		console.log("解密", str, jdata);
		return this.StringToByte(jdata);
	};
	/*
	 * 获取Sesson
	 */
	this.blueGetSesson = function () {
		let list = [];
		return this.Inferface_GetSendData(1, list, 0, false);
	};
	/*
		发送心跳
	*/
	this.sendHeartbeat = function () {
		return this.Inferface_GetSendData(this.data.LS_COMM_HEARBEAT, null, 0, false);
	};
	/*
		获取电量
	*/
	this.blueSendBatt = function () {
		return this.Inferface_GetSendData(this.data.LS_COMM_BATT_VALUE, null, 0, false);
	};
	/*
		获得记录
    */
	this.getOpenLog = function (uid) {
		let list = [];
		console.log("getOpenLog", uid)
		list[0] = uid / 0x100;
		list[1] = uid % 0x100;
		return this.Inferface_GetSendData(this.data.LS_COMM_OPENLOG_BIGDATA, list, 2, false);
	};
	/*
	 */
	this.openLogs = function () {
		this.data.logType = this.data.SYNCH_LOCK_OPEN;
		return this.getOpenLog(this.data.SYNCH_LOCK_OPEN);
	};
	/*
	 */
	this.synchCardUser = function () {
		this.data.logType = this.data.SYNCH_USER_CARD;
		return this.getOpenLog(this.data.SYNCH_USER_CARD);
	};
	/*
	 */
	this.synchFingerUser = function () {
		this.data.logType = this.data.SYNCH_USER_FINGER;
		return this.getOpenLog(this.data.SYNCH_USER_FINGER);
	};
	/*
	 */
	this.synchPasswdUser = function () {
		this.data.logType = this.data.SYNCH_USER_PASSWD;
		return this.getOpenLog(this.data.SYNCH_USER_PASSWD);
	};
	/*
	 */
	this.intToHex = function (b) {
		return parseInt(parseInt(b / 10) * 16) + parseInt(b % 10);
	};
	/*
	 */
	this.synchTime = function () {

		let list = [0x20, 0x20, 0x11, 0x11, 0x21, 0x00, 0x03];
		let date = new Date();
		let year = date.getFullYear()
		let month = date.getMonth() + 1
		let day = date.getDate()
		let hour = date.getHours()
		let minute = date.getMinutes()
		let second = date.getSeconds()
		let wday = date.getDay(); //

		list[0] = this.intToHex(parseInt(year / 100));
		list[1] = this.intToHex(parseInt(year % 1000));
		list[2] = this.intToHex(month);
		list[3] = this.intToHex(day);
		list[4] = this.intToHex(hour);
		list[5] = this.intToHex(minute);
		list[6] = wday;
		this.data.isCanWrite = true;

		return this.Inferface_GetSendData(this.data.LS_COMM_TIME, list, 7, false);
	};
}