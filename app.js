App({
  onLaunch: function() {
    var self = this;
    //获取本地openid
    self.globalData.openid = wx.getStorageSync('openid');
    if (self.globalData.openid == '' || self.globalData.openid == null || self.globalData.openid == undefined) {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          self.getOpenid(res.code, self.globalData.appid, self.globalData.secret);
        }
      })
    }else{
      console.log('openid:', self.globalData.openid)
    }
  },


  getOpenid: function (code, appid, secret) {
    const self = this;
    wx.request({
      url: this.globalData.serverIp + 'getWxOpenId.do',
      method: 'POST',
      data: {
        code: code,
        appid: appid,
        secret: secret
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log("openId: " + res.data);
        self.globalData.openid = res.data
        wx.setStorageSync('openid', res.data)
      },
      fail: function (res) {
      }
    })
  },


  globalData: {
    userInfo: null,
    //serverIp: 'https://www.gzfjcyd.com/snack_box_http/',//正式
    //serverIp: 'https://www.gzfjcyd.com/snack_box_backstage/', //开发
    serverIp: 'http://localhost:8080/bubee/',
    appid: 'wx18559bdf27287a41',
    secret: "820c89735e9a6de87e7525811db45dde",
    mchId: "1505544541",
    boxId: '',
    openid: '',
  }
})