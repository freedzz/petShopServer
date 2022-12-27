/**
 * 通用常量
 */

const Base = require('./base.js');
// 重量
const weightList = [
  { label: '0.5kg-1.2kg', value: 1 },
  { label: '1.5kg-2kg', value: 2 },
  { label: '5kg-10kg', value: 3 },
  { label: '10kg-20kg', value: 4 },
  { label: '20kg+', value: 5 }
]
// 颗粒大小
const particleSizeList = [
  { label: '小颗粒', value: 1 },
  { label: '标准颗粒', value: 2 },
  { label: '大颗粒', value: 3 }
]
// 年龄段
const ageGroupList = [
  { label: '幼犬', value: 1 },
  { label: '成犬', value: 2 },
  { label: '老年犬', value: 3 },
  { label: '幼猫', value: 4 },
  { label: '成猫', value: 5 },
  { label: '全阶段', value: 6 }
]
// 犬型
const canineTypeList = [
  { label: '小型', value: 1 },
  { label: '中大型', value: 2 },
  { label: '全犬型', value: 3 },
]
// 配方
let formulaList = [
  { label: '鸡肉', value: 1 },
  { label: '鸭肉', value: 2 },
  { label: '羊肉', value: 3 },
  { label: '牛肉', value: 4 },
  { label: '鹿肉', value: 5 },
  { label: '鱼', value: 6 },
]

module.exports = class extends Base {
  getUniversalEnumAction(){
    let universalEnum = {
      weightList,
      particleSizeList,
      ageGroupList,
      canineTypeList,
      formulaList
    }
    return this.success(universalEnum);
  }
  /**
   * 颗粒大小
   * @return {Promise} []
   */
  getParticleSizeListAction() {
    return this.success(particleSizeList);
  }
  /**
   * 年龄段
   * @return {Promise} []
   */
  getAgeGroupListAction() {
    return this.success(ageGroupList);
  }
  /**
   * 犬型
   * @return {Promise} []
   */
  getCanineTypeListAction() {
    return this.success(canineTypeList);
  }
  /**
   * 配方
   * @return {Promise} []
   */
  getFormulaListAction() {
    return this.success(formulaList);
  }
}
