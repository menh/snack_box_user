// pages/shop/applyRestocking/applyRestocking.js
const app = getApp()
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {
      boxId: '',
      name: '',
      phone: '',
      openId: '',
      mark: '',
      applyTime: '',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      info: {
        boxId: wx.getStorageSync('boxId'),
        name: wx.getStorageSync('name'),
        phone: wx.getStorageSync('phone'),
        openId: app.globalData.openid,
        mark: wx.getStorageSync('mark'),
        applyTime: util.date2String(new Date())
      }
    })
    console.log(this.data.info)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

    return {
      title: '宅宅快乐盒',
      path: '/pages/shop/home/home'
    }

  },


  editInputChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'name') {
      this.data.info.name = value;
      wx.setStorageSync('name', value)
    } else if (name == 'phone') {
      this.data.info.phone = value;
      wx.setStorageSync('phone', value)
    } else if (name == 'mark') {
      this.data.info.mark = value;
      wx.setStorageSync('mark', value)
    }
  },


  checkInput: function(info) {
    console.log(info)
    if (info.name.length < 1) {
      return false;
    } else if (info.phone.length != 11) {
      return false;
    }
    return true;
  },


  navigate: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },

  callMe: function(e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },


  editSubmit: function(e) {
    var self = this;
    var info = this.data.info;
    var week = new Date().getDay();
    var content = '';
    console.log(week)
    if (week >= 5) {
      content = '由于周末休息，预计下周一晚补货'
    } else {
      content = '预计明晚补货'
    }
    if (self.checkInput(info)) {
      wx.showModal({
        title: '补货时间',
        content: content,
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            self.applyBox(info);

            var phoneNumber = '15013149789'
            var param = '' + info.boxId + '|' + info.name + '|' + info.phone + '|' + info.mark + '|' + self.data.info.openId
            var templateId = '210019'
            // self.sendMessage(phoneNumber, param, templateId);
            //调用接口
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      })
    } else {
      wx.showModal({
        content: '请填写全部目录信息',
        showCancel: false
      })
    }
  },

  sendMessage: function(phoneNumber, param, templateId) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'SendMessage.do',
      data: {
        phoneNumber: phoneNumber,
        param: param,
        templateId: templateId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res);
      },
      fail: function(res) {
        console.log(res.data);
        console.log("faile");
      }
    })
  },


  applyBox: function(info) {
    var self = this;
    console.log(info);
    wx.showLoading({
      title: '正在提交',
    })
    wx.request({
      url: app.globalData.serverIp + 'applyBox.do',
      data: {
        openId: info.openId,
        boxId: info.boxId,
        name: info.name,
        mark: info.mark,
        phone: info.phone,
        applyTime: info.applyTime
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res);
        wx.hideLoading();
        if (res.statusCode == 200){
          
        wx.navigateTo({
          url: '/pages/shop/applySuccess/applySuccess',
          })
        }else{
          wx.showModal({
            title: '申请失败',
            content: '请联系客服',
            showCancel:false
          })
        }
      },
      fail: function(res) {
        console.log(res.data);
        console.log("faile");
      }
    })
  },

})