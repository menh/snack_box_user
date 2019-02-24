// pages/bill/home/home.js

const app = getApp()
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxId: '',
    box: {},
    orders: [],
    ordersType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startPullDownRefresh({});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var boxId = this.data.boxId;
    if (boxId != '' && boxId != wx.getStorageSync('boxId')) {
      console.log('hello')
      console.log('boxId:',boxId);
      console.log('wx:', wx.getStorageSync('boxId'))
      wx.startPullDownRefresh({});
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var boxId = wx.getStorageSync('boxId');
    this.setData({
      boxId:boxId
    })
    this.getBox(boxId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getBox: function (boxId) {
    console.log(boxId);
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selBox.do',
      data: {
        boxId: boxId,
        conditionParam: 'boxId',
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.getBoxCallback(res.data[0]);
      },
      fail: function (res) {
        console.log("faile");
      }
    })

  },
  getBoxCallback: function (box) {
    console.log('box:', box)
    var self = this;
    if (box.boxId == null || box.boxId.length < 1) {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '该盒子不存在',
        icon: 'none',
      })
    } else {
      box = self.processBox(box);
      self.setData({
        box: box
      })
      var now = util.date2String(new Date());
      self.getOneBoxOrders(box.boxId, box.lastSuppleDate, now)
    }
  },

  getOneBoxOrders: function (boxId, beginDate, endDate) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'GetBoxSnackOrderBetweenDate.do',
      data: {
        boxId: boxId,
        beginDate: beginDate,
        endDate: endDate
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.getOneBoxOrdersCallback(res.data);
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },

  getOneBoxOrdersCallback: function (orders) {
    var self = this;
    orders = self.processDateForOrders(orders); //对时间进行处理
    // orders = self.processDataForOrders(orders); //对openid进行处理
    self.setData({ //更新box，及其显示模式
      orders: orders.reverse()
    })
    console.log('orders:', orders);
    wx.stopPullDownRefresh();
  },

  processDateForOrders: function (orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      temp[i].orderDateDay = util.getDayFromDate(temp[i].orderTime);
      temp[i].orderDateTime = util.getTimeFromDate(temp[i].orderTime).substr(0, 5);
    }
    return temp;
  },
  processDataForOrders: function (orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      if (temp[i].openid != undefined || temp[i].openid != null) {
        temp[i].openid = '**' + temp[i].openid.substr(temp[i].openid.length - 6);
      }
    }
    return temp;
  },

  processBox: function (box) {
    var self = this;
    box.attendDateDay = util.getDayFromDate(box.attendDate);
    box.attendDateTime = util.getTimeFromDate(box.attendDate);
    box.lastSuppleDateDay = util.getDayFromDate(box.lastSuppleDate);
    box.lastSuppleDateTime = util.getTimeFromDate(box.lastSuppleDate);
    box.lastPurchaseDateDay = util.getDayFromDate(box.lastPurchaseDate);
    box.lastPurchaseDateTime = util.getTimeFromDate(box.lastPurchaseDate);
    return box;
  },
})