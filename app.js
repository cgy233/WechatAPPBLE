App({
  onLaunch: function () {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.bluetooth" 这个 scope
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        //判断是否有'scope.bluetooth'属性
        if (res.authSetting.hasOwnProperty('scope.bluetooth')) {
          //'scope.bluetooth'属性存在，且为false
          if (!res.authSetting['scope.bluetooth']) {
            //弹窗授权
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
              }
            })
          }
        }
        else
          //'scope.bluetooth'属性不存在，需要授权
          wx.authorize({
            scope: 'scope.bluetooth',
            success() {
              // 用户已经同意小程序使用手机蓝牙功能，后续调用 蓝牙 接口不会弹窗询问
              console.log(res.authSetting)
            }
          })
 
      }
    }),
    wx.getSystemInfo({
    success: e => {
      this.globalData.StatusBar = e.statusBarHeight;
      let custom = wx.getMenuButtonBoundingClientRect();
      this.globalData.Custom = custom;  
      this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
    }
  })
  },
  globalData: {
    ColorList: [{
      title: '嫣红',
      name: 'red',
      color: '#e54d42'
    },
    {
      title: '桔橙',
      name: 'orange',
      color: '#f37b1d'
    },
    {
      title: '明黄',
      name: 'yellow',
      color: '#fbbd08'
    },
    {
      title: '橄榄',
      name: 'olive',
      color: '#8dc63f'
    },
    {
      title: '森绿',
      name: 'green',
      color: '#39b54a'
    },
    {
      title: '天青',
      name: 'cyan',
      color: '#1cbbb4'
    },
    {
      title: '海蓝',
      name: 'blue',
      color: '#0081ff'
    },
    {
      title: '姹紫',
      name: 'purple',
      color: '#6739b6'
    },
    {
      title: '木槿',
      name: 'mauve',
      color: '#9c26b0'
    },
    {
      title: '桃粉',
      name: 'pink',
      color: '#e03997'
    },
    {
      title: '棕褐',
      name: 'brown',
      color: '#a5673f'
    },
    {
      title: '玄灰',
      name: 'grey',
      color: '#8799a3'
    },
    {
      title: '草灰',
      name: 'gray',
      color: '#aaaaaa'
    },
    {
      title: '墨黑',
      name: 'black',
      color: '#333333'
    },
    {
      title: '雅白',
      name: 'white',
      color: '#ffffff'
    },
  ]
  }
})
