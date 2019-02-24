// pages/shop/home/home.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxId: '',
    isFirst: false,
    cates: [],
    goodCartFlag: true,
    goodCartData: {
      num: 0,
      price: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   * 
   * 获取boxId与判断应不应该进入欢迎页
   */
  onLoad: function(options) {

    //用户的boxId只能是之前存下来，或者是小程序外扫码
    //如果存储里面没有boxId，说明是第一次使用
    var self = this;
    var optionsBoxId = options.boxId; //小程序外扫码的boxId,优先级高
    var storageBoxId = wx.getStorageSync('boxId'); //存储boxId
    //确定是不是第一次使用
    if (storageBoxId == undefined || storageBoxId == null || storageBoxId == '') { //存储boxId,优先级低
      self.setData({
        isFirst: true
      })
    } else {
      self.setData({
        isFirst: false
      })
    }

    //赋值boxId并检验是否要去欢迎页
    if (optionsBoxId != undefined && optionsBoxId != null && optionsBoxId != '') { //小程序外扫码,优先级高,有第一次的可能
      self.setData({
        boxId: optionsBoxId
      })
      wx.setStorageSync('boxId', optionsBoxId);
      self.checkHello(self.data.isFirst);
      //wx.startPullDownRefresh({});//在checkHello中调用
    } else if (storageBoxId != undefined && storageBoxId != null && storageBoxId != '') { //存储boxId,优先级低，无第一次的可能
      self.setData({
        boxId: storageBoxId
      })
      wx.setStorageSync('boxId', storageBoxId);
      wx.startPullDownRefresh({});
    } else { //第一次，且不是扫码进来的，再扫，再回调里面设置boxId
      //扫码通知
      wx.showModal({
        title: '扫码',
        content: '请扫描盒子二维码',
        showCancel: false,
        confirmText: '开始扫码',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            // 开始扫码
            self.mustScanBoxId();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
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
   * 页面相关事件处理函数--监听用户下拉动作
   * 
   * 应该恢复初始状态，再获取商城
   */
  onPullDownRefresh: function() {
    console.log('boxId:', this.data.boxId)
    this.initData();
    this.getCategorys(this.data.boxId);
  },
  //初始化cate，goodCartData
  initData: function() {
    var self = this;
    self.setData({
      cates: [],
      goodCartData: {
        num: 0,
        price: 0
      }
    })
  },

  //属于onLoad，让用户一定要扫到码的函数，只在第一次被使用
  mustScanBoxId: function() {
    var self = this;
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        var index = res.path.indexOf("boxId");
        var boxId = res.path.substr(index + 6, 6);
        if (boxId.length == 6) {
          self.setData({
            boxId: boxId
          })
          console.log(boxId)
          wx.setStorageSync('boxId', boxId);
          self.checkHello(self.data.isFirst);
          //wx.startPullDownRefresh({});//在checkHello中调用
        } else {
          console.log(res)
          self.mustScanBoxId();
        }
      },
      fail(res) {
        console.log(res)
        self.mustScanBoxId();
      }
    })
  },

  //属于onLoad，有两种打开的方式会用到这个函数
  checkHello: function(isFirst) {
    if (isFirst) {
      wx.reLaunch({
        url: '/pages/hello/hello',
      })
    } else {
      wx.startPullDownRefresh({});
    }
  },

  //购物车的显示商品列表
  showGoodCart: function(e) {
    this.setData({
      goodCartFlag: false
    })
  },
  //购物车的隐藏商品列表
  hideGoodCart: function(e) {
    this.setData({
      goodCartFlag: true
    })
  },

  //再startPull刷新中被调用，用户获取最新的cates，并setData
  getCategorys: function(boxId) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'GetBoxRemainGoodStructDetail.do',
      data: {
        boxId: boxId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        self.getCategorysCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function(res) {
        wx.showModal({
          title: '获取失败',
          content: '链接失败，请重新刷新',
          showCancel: false,
          confirmText: '重新刷新',
          success(res){
            wx.startPullDownRefresh({
              
            })
          }
        })
      }
    })
  },

  getCategorysCallback: function(self, categorys) {
    categorys = self.filterCategorys(categorys); //筛选有用的商品
    categorys = self.priceAdjustment(categorys); //价格*100
    categorys = self.initCommodityNum(categorys); //初始化commodityNum
    console.log('cates:', categorys);
    self.setData({
      cates: categorys,
    })
  },

  //将cates的预购买数初始化为0
  initCommodityNum: function(categorys) {
    for (var i = 0; i < categorys.length; i++) {
      var goods = categorys[i].categoryItem;
      for (var j = 0; j < goods.length; j++) {
        goods[j].commodityNum = 0;
      }
    }
    return categorys;
  },

  //筛选出总数不为0的商品
  filterCategorys: function(categorys) {
    var categorysTemp = [];

    for (var i = 0; i < categorys.length; i++) {
      var categoryItem = categorys[i];
      var categoryItemTemp = {
        categoryName: categorys[i].categoryName,
        categoryItem: []
      };
      for (var j = 0; j < categoryItem.categoryItem.length; j++) {
        var goodItem = categoryItem.categoryItem[j];
        if (goodItem.initGoodNum != '0') {
          categoryItemTemp.categoryItem.push(goodItem);
        }
      }
      if (categoryItemTemp.categoryItem.length > 0) {
        categorysTemp.push(categoryItemTemp);
      }
    }
    return categorysTemp;
  },

//将good价格*100
  priceAdjustment: function(categorys) {
    for (var i = 0; i < categorys.length; i++) {
      var goods = categorys[i].categoryItem;
      for (var j = 0; j < goods.length; j++) {
        goods[j].price *= 100;
      }
    }
    return categorys;
  },


//购物中，减
  subtractGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.cates, goodId);

    if (goodItem.commodityNum > 0) {
      goodItem.commodityNum--;
    }
    this.refreshgoodCartData(this, this.data.cates);
    this.setData({
      cates: this.data.cates,
    })
  },
//购物中，加
  addGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.cates, goodId);
    goodItem.commodityNum++;
    console.log(goodItem);
    this.refreshgoodCartData(this, this.data.cates);
    this.setData({
      cates: this.data.cates,
    })
  },
  //通过goodId获取good类，购物车中用
  getGoodById: function(cates, goodId) {
    for (var i = 0; i < cates.length; i++) {
      var categoryItem = cates[i].categoryItem;
      for (var j = 0; j < categoryItem.length; j++) {
        if (categoryItem[j].goodId == goodId) {
          return categoryItem[j];
        }
      }
    }
    return '';
  },

//根据cates，调整goodCartData数据
  refreshgoodCartData: function(self, cates) {
    var goodCartData = {
      num: 0,
      price: 0
    };

    for (var i = 0; i < cates.length; i++) {
      var categoryItem = cates[i].categoryItem;
      for (var j = 0; j < categoryItem.length; j++) {
        var goodItem = categoryItem[j];
        if (goodItem.commodityNum != 0) {
          goodCartData.num += goodItem.commodityNum;
          goodCartData.price += (goodItem.commodityNum * goodItem.price)
        }
      }
    }
    self.setData({
      goodCartData: goodCartData
    })
  },

//点击目录跳转
  chooseCategory: function(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      toCategory: id,
    })
  },

//点击扫描，若扫码到正确的boxId就会赋值boxId并刷新
  changeBoxId: function(e) {
    var self = this;
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        var index = res.path.indexOf("boxId");
        var boxId = res.path.substr(index + 6, 6);
        console.log(boxId);
        if (boxId.length == 6) { //扫描二维码成功，应该更新商品列表还有boxId
          self.setData({
            boxId: boxId,
          })
          console.log(boxId)
          wx.setStorageSync('boxId', boxId);
          wx.startPullDownRefresh({})
        }
      },
      fail(res) {}
    })
  },

//点击结算
  submit: function(e) {
    const self = this;

    //openid确认
    if (app.globalData.openid == null || app.globalData.openid == undefined || app.globalData.openid == '') {
      // 登录
      wx.login({
        success: res => {
          app.getOpenid(res.code, app.globalData.appid, app.globalData.secret);
        }
      })
    }

    if (this.data.goodCartData.price <= 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'

      })
    } else if (this.data.goodCartData.price > 0) {
      wx.showModal({
        title: '请确认订单信息',
        content: '商品数量:' + this.data.goodCartData.num + '\n应付金额:￥' + this.data.goodCartData.price / 100,
        cancelText: "取消支付",
        confirmText: "确认支付",
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.showNavigationBarLoading();
            wx.showLoading({
              title: '',
            })
            const body = wx.getStorageSync('boxId');
            var boxNum = wx.getStorageSync('boxId');
            var orderDetail = self.getDetailByCategory(self.data.cates);
            wx.request({
              url: app.globalData.serverIp + 'getPayParamers.do',
              data: {
                openId: app.globalData.openid,
                appId: app.globalData.appid,
                mchId: app.globalData.mchId,
                saleType: 'retail',
                body: body,
                boxBsn: boxNum,
                orderDetail: orderDetail
              },
              method: 'POST',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function(res) {
                console.log(res);
                if (res.statusCode == 200) {
                  wx.hideNavigationBarLoading();
                  wx.hideLoading();
                  self.toPay(res.data);
                } else {
                  wx.hideNavigationBarLoading()
                  wx.showToast({
                    title: '连接失败',
                    icon: 'none'
                  })
                }
              },
              fail: function(res) {
                wx.hideNavigationBarLoading()
                wx.showToast({
                  title: '连接失败',
                  icon: 'none'
                })
              }
            });


          } else if (res.cancel) {}
        }
      })
    }


  },
  toPay: function(args) {
    const self = this;
    // console.log(args);
    wx.requestPayment({
      'timeStamp': args.timeStamp,
      'nonceStr': args.nonceStr,
      'package': args.package,
      'signType': 'MD5',
      'paySign': args.paySign,
      'success': function(res) {
        wx.showToast({
          title: '购买成功',
          icon: "success",
          duration: 1500
        })
        // self.initialCategoryGoodCart(self);
        wx.startPullDownRefresh({})
      },
      'fail': function(res) {},
      'complete': function(res) {}
    })
  },

//通过cates获取结算所需要的购物数据
  getDetailByCategory: function(cates) {
    var detail = '';
    for (var i = 0; i < cates.length; i++) {
      var item = cates[i].categoryItem;
      for (var j = 0; j < item.length; j++) {
        var good = item[j];
        if (good.commodityNum > 0) {
          detail += 'goodId:' + good.goodId + '&num:' + good.commodityNum + '|'
        }
      }
    }
    detail = detail.substr(0, detail.length - 1);
    console.log('detail:', detail);
    return detail;
  },

//不刷新cates，将其购物数据恢复为0
  initialCategoryGoodCart: function(self) {
    var cates = self.data.cates;
    for (var i = 0; i < cates.length; i++) {
      var item = cates[i].categoryItem;
      for (var j = 0; j < item.length; j++) {
        var good = item[j];
        good.commodityNum = 0;
      }
    }
    self.setData({
      cates: cates,
      goodCartData: {
        num: 0,
        price: 0
      }
    })
  },


  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },

  callMe: function (e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
})