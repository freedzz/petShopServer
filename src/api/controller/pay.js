const Base = require('./base.js');
const moment = require('moment');
const generate = require('nanoid/generate');
const Jushuitan = require('jushuitan');
module.exports = class extends Base {
    /**
     * 使用钱包余额进行支付
     */
    async preWalletPayAction() {
      const orderId = this.get('orderId');
      const orderInfo = await this.model('order').where({
          id: orderId
      }).find();
      let userId = orderInfo.user_id;
      let result = {
        transaction_id: 123123123123,
        time_end: parseInt(new Date().getTime() / 1000),
      }
      const orderModel = this.model('order');
      
      // 再次确认库存和价格
      let orderGoods = await this.model('order_goods').where({
          order_id:orderId,
          is_delete:0
      }).select();
      let checkPrice = 0;
      let checkStock = 0;
      for(const item of orderGoods){
          let product = await this.model('product').where({
              id:item.product_id
          }).find();
          if(item.number > product.goods_number){
              checkStock++;
          }
          if(item.retail_price != product.retail_price){
              checkPrice++;
          }
      }
      if(checkStock > 0){
          return this.fail(400, '库存不足，请重新下单');
      }
      if(checkPrice > 0){
          return this.fail(400, '价格发生变化，请重新下单');
      }
      if (think.isEmpty(orderInfo)) {
          return this.fail(400, '订单已取消');
      }
      if (parseInt(orderInfo.pay_status) !== 0) {
          return this.fail(400, '订单已支付，请不要重复操作');
      }
      // 更新用户余额
      let userExtInfo = await this.model('user_ext').where({ user_id: userId }).find();
      let walletBalance = userExtInfo.wallet_balance - orderInfo.actual_price
      let userPoints = userExtInfo.user_points + orderInfo.actual_price
      // 确保余额支付成功再修改订单状态
      if(walletBalance){
        await this.model('user_ext').where({ user_id: userId }).update({ wallet_balance: walletBalance, user_points: userPoints });
        // 更新订单和商品库存
        await orderModel.updatePayData(orderInfo.id, result);
        this.afterPay(orderInfo);
        return this.success();
      }
      return this.fail();
    }
    /**
     * 获取支付的请求参数
     * @returns {Promise<PreventPromise|void|Promise>}
     */
    // 测试时付款，将真实接口注释。 在小程序的services/pay.js中按照提示注释和打开
    // async preWeixinPayaAction() {
    //     const orderId = this.get('orderId');
    //     const orderInfo = await this.model('order').where({
    //         id: orderId
    //     }).find();
    //     let userId = orderInfo.user_id;
    //     let result = {
    //     	transaction_id: 123123123123,
    //     	time_end: parseInt(new Date().getTime() / 1000),
    //     }
    //     const orderModel = this.model('order');
    //     await orderModel.updatePayData(orderInfo.id, result);
    //     this.afterPay(orderInfo);
		  //   return this.success();
    // }
    // 真实的付款接口
    async preWeixinPayAction() {
        const orderId = this.get('orderId');
        const orderInfo = await this.model('order').where({
            id: orderId
        }).find();
        // 再次确认库存和价格
        let orderGoods = await this.model('order_goods').where({
            order_id:orderId,
            is_delete:0
        }).select();
        let checkPrice = 0;
        let checkStock = 0;
        for(const item of orderGoods){
            let product = await this.model('product').where({
                id:item.product_id
            }).find();
            if(item.number > product.goods_number){
                checkStock++;
            }
            if(item.retail_price != product.retail_price){
                checkPrice++;
            }
        }
        if(checkStock > 0){
            return this.fail(400, '库存不足，请重新下单');
        }
        if(checkPrice > 0){
            return this.fail(400, '价格发生变化，请重新下单');
        }
        if (think.isEmpty(orderInfo)) {
            return this.fail(400, '订单已取消');
        }
        if (parseInt(orderInfo.pay_status) !== 0) {
            return this.fail(400, '订单已支付，请不要重复操作');
        }
        const openid = await this.model('user').where({
            id: orderInfo.user_id
        }).getField('weixin_openid', true);
        if (think.isEmpty(openid)) {
            return this.fail(400, '微信支付失败，没有openid');
        }
        const WeixinSerivce = this.service('weixin', 'api');
        try {
            const returnParams = await WeixinSerivce.createUnifiedOrder({
                openid: openid,
                body: '[壹品佳宠]：' + orderInfo.order_sn,
                out_trade_no: orderInfo.order_sn,
                total_fee: parseInt(orderInfo.actual_price * 100),
                spbill_create_ip: ''
            });
            return this.success(returnParams);
        } catch (err) {
            console.log(JSON.stringify(err, null, 2))
            return this.fail(400, err && err.message ? err.message : '微信支付失败?');
        }
    }
    async notifyAction() {
        console.log(JSON.stringify(this.post(), null, 2))
        const WeixinSerivce = this.service('weixin', 'api');
        const data = this.post();
        const result = WeixinSerivce.payNotify(data);
        console.log(JSON.stringify(result, null, 2))
        // 1. 根据不同的订单类型处理回调
        const attach = result && result.attach ? JSON.parse(result.attach) : {}
        const orderType = attach.orderType
        if (!result) {
            return this.json({
              code: 'FAIL',
              message: '失败'
            });
        }
        switch (orderType){
          case 1: // 商品支付
            const orderModel = this.model('order');
            const orderInfo = await orderModel.getOrderByOrderSn(result.out_trade_no);
            if (think.isEmpty(orderInfo)) {
                return this.json({
                  code: 'FAIL',
                  message: '失败'
                });
            }
            let bool = await orderModel.checkPayStatus(orderInfo.id);
            if (bool == true) {
                if (orderInfo.order_type == 0) { //普通订单和秒杀订单
                    await orderModel.updatePayData(orderInfo.id, result);
                    this.afterPay(orderInfo);
                } 
            } else {
                return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单已支付]]></return_msg></xml>';
            }
            break;
          case 2: // vip充值
            break;
          case 3: // 余额充值
            break;
          default:
            break;
        }
        // 2. 累积用户积分
        // 根据openid查找用户是否已经注册
        const userId = await this.model('user').where({ weixin_openid: result.payer.openid }).getField('id', true);
        if(!think.isEmpty(userId)){
          const userInfo = await this.model('user_ext').where({ user_id: userId }).find();
          const total = result.amount && result.amount.total ? (result.amount.total / 100) : 0
          if (userInfo.id && userInfo.user_id) {
            const userPoints = Number(userInfo.user_points || 0) + total
            await this.model('user_ext').where({ id: userInfo.id, user_id: userId }).update({ user_points: userPoints.toFixed(2) });
          } else {
            let userInfo = await this.model('user_ext').add({ user_points: total, user_id: userId })
          }
        }
        
        // 3. 返回成功回调
        return this.json({
          code: 'SUCCESS',
          message: '成功'
        });
    }
    async afterPay(orderInfo) {
        if (orderInfo.order_type == 0) {
            let orderGoodsList = await this.model('order_goods').where({ order_id: orderInfo.id }).select();
            for (const cartItem of orderGoodsList) {
                let goods_id = cartItem.goods_id;
                let product_id = cartItem.product_id;
                let number = cartItem.number;
                let specification = cartItem.goods_specifition_name_value;
                await this.model('goods').where({
                    id: goods_id
                }).decrement('goods_number', number);
                await this.model('goods').where({
                    id: goods_id
                }).increment('sell_volume', number);
                await this.model('product').where({
                    id: product_id
                }).decrement('goods_number', number);
            }
            // version 1.01
        }
    }
    /**
     * 充值vip/余额
     */
    async reChargeWeixinAction() {
        const rechargeAmount = this.post('rechargeAmount');
        const userId = this.getLoginUserId();
        const orderType = this.post('orderType');
        
        const order_sn = this.model('order').generateOrderNumber()
        const openid = await this.model('user').where({ id: userId }).getField('weixin_openid', true);

        if (think.isEmpty(openid)) {
            return this.fail(400, '微信支付失败，没有openid');
        }
        const WeixinSerivce = this.service('weixin', 'api');
        try {
            const returnParams = await WeixinSerivce.createUnifiedOrder({
                openid: openid,
                body: '[壹品佳宠]：' + order_sn,
                out_trade_no: order_sn,
                total_fee: parseInt(rechargeAmount * 100),
                spbill_create_ip: '',
                orderType: orderType || 1
            });
            return this.success(returnParams);
        } catch (err) {
            console.log(JSON.stringify(err, null, 2))
            return this.fail(400, err && err.message ? err.message : '微信支付失败?');
        }
    }
};