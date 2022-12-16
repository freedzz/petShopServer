const Base = require('./base.js');
const generate = require('nanoid/generate');
const moment = require('moment');
module.exports = class extends Base {
  /**
   * 更新vip有效期
   */
  async updateUserVipAction() {
    let userExtId = this.post('id');
    const userId = this.getLoginUserId();
    const userExtInfo = {
      is_vip: 1,
      id: userExtId,
      user_id: userId
    }
    if (think.isEmpty(userExtId)) {
      // 没有用户记录：直接新增一条记录
      let vipStartTime = moment().format('YYYY-MM-DD')
      let vipEndTime = moment().add(1, 'months').format('YYYY-MM-DD')
      userExtId = await this.model('user_ext').add({
        ...userExtInfo,
        vip_start_time: vipStartTime,
        vip_end_time: vipEndTime
      });
    } else {
      // 有用户记录
      let userInfo = await this.model('user_ext').where({ id: userExtId }).find();
      // 有用户记录并且是vip
      let endTime = userInfo.vip_end_time || ''
      let vipEndTime = moment(endTime).add(1, 'months').format('YYYY-MM-DD')
      await this.model('user_ext').where({
        id: userExtId,
        user_id: userId
      }).update({
        ...userExtInfo,
        vip_end_time: vipEndTime
      });
    }
    let userInfo = await this.model('user_ext').where({
      id: userExtId
    }).find();
    if (!think.isEmpty(userInfo)) {
      userInfo = this.toCamelObj(userInfo)
    }
    return this.success(userInfo);
  }
  /**
   * 更新账户余额
   * rechargeAmount: 充值金额
   */
  async updateUserWalletAction(){
    let userExtId = this.post('id');
    const userId = this.getLoginUserId();
    if (think.isEmpty(userExtId)) {
      let userInfo = await this.model('user_ext').add({
        wallet_balance: this.post('rechargeAmount').toFixed(2)
      })
    } else {
      let userInfo = await this.model('user_ext').where({ id: userExtId }).find();
      let totalWalletBalance = userInfo.wallet_balance + this.post('rechargeAmount')
      await this.model('user_ext').where({
        id: userExtId,
        user_id: userId
      }).update({
        wallet_balance: totalWalletBalance.toFixed(2)
      });
    }
    let userInfo = await this.model('user_ext').where({
      id: userExtId
    }).find();
    if (!think.isEmpty(userInfo)) {
      userInfo = this.toCamelObj(userInfo)
    }
    return this.success(userInfo);
  }
  /**
   * 获取用户vip信息和账户信息
   */
  async getUserExtInfoAction(){
    const userId = this.getLoginUserId();
    let userInfo = await this.model('user_ext').where({
      user_id: userId
    }).find();
    if (!think.isEmpty(userInfo)) {
      userInfo = this.toCamelObj(userInfo)
    }
    return this.success(userInfo);
  }
};
