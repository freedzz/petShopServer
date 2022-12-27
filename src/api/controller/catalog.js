const { forIn } = require('lodash');
const Base = require('./base.js');
module.exports = class extends Base {
  /**
   * 获取分类栏目数据
   * @returns {Promise.<Promise|void|PreventPromise>}
   */
  async indexAction() {
    const categoryId = this.get('id');
    const model = this.model('category');
    const data = await model.limit(10).where({
      parent_id: 0,
      is_category: 1
    }).order('sort_order ASC').select();
    let currentCategory = null;
    if (categoryId) {
      currentCategory = await model.where({
        'id': categoryId
      }).find();
    }
    if (think.isEmpty(currentCategory)) {
      currentCategory = data[0];
    }
    return this.success({
      categoryList: data,
    });
  }
  async currentAction() {
    const categoryId = this.get('id');
    let data = await this.model('category').where({
      id: categoryId
    }).field('id,name,img_url,p_height').find();
    return this.success(data);
  }
  async currentlistAction() {
    const page = this.post('page');
    const size = this.post('size');
    const categoryId = this.post('id');
    const searchParams = this.post('searchParams')
    const extSearchParams = this.post('extSearchParams')

    if (!extSearchParams) {
      // 1. 不是高级搜索 -- 排序
      const sort = searchParams.sort;
      const order = searchParams.order
      const sales = searchParams.sales
      let orderMap = {};
      switch (sort) {
        case 'price':
          // 按价格
          orderMap = {
            retail_price: order
          };
          break;
        case 'sales':
          // 按价格
          orderMap = {
            sell_volume: sales
          };
        case 'default':
          // 按商品添加时间
          orderMap = {
            sort_order: 'asc'
          };
        default:
          break;
      }
      if (categoryId == 0) {
        let list = await this.model('goods').where({
          is_on_sale: 1,
          is_delete: 0
        }).order(orderMap).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page,
          size).countSelect();
        return this.success(list);
      } else {
        let list = await this.model('goods').where({
          is_on_sale: 1,
          is_delete: 0,
          category_id: categoryId
        }).order(orderMap).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page,
          size).countSelect();
        return this.success(list);
      }
    } else {
      // 2. 高级搜索 先查询hiolabs_goods_enum 获取goodId
      let searchParams = {}
      forIn(extSearchParams, (value, key)=>{
        if(value && value.length){
          searchParams[key] = ['IN', value]
        }
      })
      let goodIdlist = await this.model('goods_enum').where({
        ...searchParams
      }).field('goods_id').select()
      if(!think.isEmpty(goodIdlist)){
        // 查询商品
        if (categoryId == 0) {
          let list = await this.model('goods').where({
            is_on_sale: 1,
            is_delete: 0,
            id: ['IN', goodIdlist.map((good) => good.goods_id)]
          }).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page, size).countSelect();
          return this.success(list);
        } else {
          let list = await this.model('goods').where({
            is_on_sale: 1,
            is_delete: 0,
            id: ['IN', goodIdlist.map((good) => good.goods_id)],
            category_id: categoryId
          }).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page, size).countSelect();
          return this.success(list);
        }
      }
      this.success({
        count: 0,
        currentPage: 1,
        data: [],
        totalPages: 0,
        pageSize: 0
      })
    }
  }
};
