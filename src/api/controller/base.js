module.exports = class extends think.Controller {
	async __before() {
		// 根据token值获取用户id
		const token = this.ctx.header['x-hioshop-token'] || '';
		const tokenSerivce = think.service('token', 'api');
		think.userId = tokenSerivce.getUserId(token);
	}
  /**
   * 把对象中的key由下横线转换成驼峰
   * @param {Object} obj 对象
   */
  toCamelObj(obj){
    let camelObj = {}
    for(let key in obj){
      camelObj[this.toCamel(key)] = obj[key]
    }
    return camelObj
  }
  /**
   * 下横线转驼峰式
   * test_to_camel => testToCamel
   */
  toCamel(str) {
    return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
      return $1 + $2.toUpperCase();
    });
  }
	/**
	 * 获取时间戳
	 * @returns {Number}
	 */
	getTime() {
		return parseInt(Date.now() / 1000);
	}
	/**
	 * 获取当前登录用户的id
	 * @returns {*}
	 */
	getLoginUserId() {
		// 开始修复userId的问题
		const token = this.ctx.header['x-hioshop-token'] || '';
		const tokenSerivce = think.service('token', 'api');
		return tokenSerivce.getUserId(token);
	}
};
