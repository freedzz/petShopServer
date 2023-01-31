// default config
module.exports = {
    default_module: 'api',
    weixin: {
        appid: 'wx883f2208bf8ff3e5', // 小程序 appid
        secret: '54e6f366c46e7ffe71daeed24bd81f40', // 小程序密钥
        mch_id: '1637046225', // 商户帐号ID
        notify_url: 'https://www.freedzz.com/api/pay/notify' // 微信支付异步通知
    },
    express: {
        // 已废弃，之后考虑改回来，做成和阿里云的物流查询可以切换，方便大家的使用
        // 免费的，但是顺丰的话，要配合快递鸟的电子面单
        // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/ 
        appid: '1787058', // 对应快递鸟用户后台 用户ID
        appkey: 'c1971848-9cff-435d-9329-f758eb157183', // 对应快递鸟用户后台 API key
        request_url: 'http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx'
    },
   mianexpress:{
        appid: '1787058', // 对应快递鸟用户后台 用户ID
        appkey: 'c1971848-9cff-435d-9329-f758eb157183', // 对应快递鸟用户后台 API key
        request_url: 'http://testapi.kdniao.com:8081/api/EOrderService',
        print_url: 'http://sandboxapi.kdniao.com:8080/kdniaosandbox/gateway/exterfaceInvoke.json',
        ip_server_url:'http://www.kdniao.com/External/GetIp.aspx'
    },
    // 上传图片
    qiniu: {
        access_key: 'e6MmzV6juuZb1tSKkiC3Uaw1qV6Ka8lbK1uBnt82', // 在七牛密钥管理中获取
        secret_key: '9U64BD11qKjKzSdmW5o5rfOiRqn24Xu-zqn4ocDb', // 在七牛密钥管理中获取
        bucket: 'xhqiniu', // 请填自己的bucket的名称
        domain: 'http://pic.freedzz.com/' // 请填自己的domain域名
    },
    // 图片上传成功后后台获取访问地址
    // 在七牛新建一个https的空间，这个是用来存储分享图片的https图片，对应的是goods表中的https_pic_url
    qiniuHttps: {
        access_key: 'e6MmzV6juuZb1tSKkiC3Uaw1qV6Ka8lbK1uBnt82', // 在七牛密钥管理中获取
        secret_key: '9U64BD11qKjKzSdmW5o5rfOiRqn24Xu-zqn4ocDb', // 在七牛密钥管理中获取
        bucket: 'xhqiniu', // 自己设置的
        domain: 'http://pic.freedzz.com/', // 自己设置，例如：'http://img.你的域名.com/',别忘了这个”/“
        // https://developer.qiniu.com/kodo/manual/1671/region-endpoint
        zoneNum: 2  // 这个自己根据地区设置：华东 0；华北 1；华南 2； 北美 3；东南亚 4
    },
    aliexpress:{
        // https://market.aliyun.com/products/56928004/cmapi021863.html?spm=5176.730005.productlist.d_cmapi021863.6ba73524uQjLqE&innerSource=search_%E5%85%A8%E5%9B%BD%E5%BF%AB%E9%80%92%E7%89%A9%E6%B5%81%E6%9F%A5%E8%AF%A2-%E5%BF%AB%E9%80%92%E6%9F%A5%E8%AF%A2%E6%8E%A5%E5%8F%A3#sku=yuncode1586300000
        url:'http://wuliu.market.alicloudapi.com/kdi', //阿里云的物流查询api，收费的
        appcode: 'asldjalsjdlasjdla' ,// 阿里云后台获取,
		    sfLastNo:'0580', // 顺丰寄件人后四位，这个根据自己的寄件人手机设置，如果寄件人是不固定的，那么需要在order_express自己写代码了。
    },
	templateId:{
		// deliveryTemplate:
	}
};
