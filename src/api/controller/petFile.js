const Base = require('./base.js');
const pinyin = require("pinyin");
const generate = require('nanoid/generate');
module.exports = class extends Base {
    async savePetFileAction() {
        let petFileId = this.post('id');
        const userId = this.getLoginUserId();;
        const petData = {
            user_id: this.getLoginUserId(),
            pet_name: this.post('petName'),
            pet_icon: this.post('petIcon'),
            pet_birthday: this.post('petBirthday'),
            pet_sex: this.post('petSex'),
            pet_weight: this.post('petWeight'),
            is_sterilization: this.post('isSterilization'),
            vaccine_time: this.post('vaccineTime')
        };
        if (think.isEmpty(petFileId)) {
            petFileId = await this.model('pet_file').add(petData);
        } else {
            await this.model('pet_file').where({
                id: petFileId,
                user_id: userId
            }).update(petData);
        }
        let petInfo = await this.model('pet_file').where({ id: petFileId }).find();
        if (!think.isEmpty(petInfo)) {
          petInfo = this.toCamelObj(petInfo)
        }
        return this.success(petInfo);
    }
    async getPetFileListAction() {
        const userId = this.getLoginUserId();;
        let petFileList = await this.model('pet_file').where({
            user_id: userId
        }).order('id desc').select();
        petFileList = petFileList.map((item)=>{
          return this.toCamelObj(item)
        })
        return this.success(petFileList);
    }
    async deletePetFileAction() {
        const id = this.get('id');
	      const userId = this.getLoginUserId();
        let d = await this.model('pet_file').where({
            user_id: userId,
            id: id
        }).delete();
        return this.success(this.toCamelObj(d));
    }
    async petFileDetailAction() {
        const petFileId = this.get('id');
        const userId = this.getLoginUserId();
        let petFileInfo = await this.model('pet_file').where({
            user_id: userId,
            id: petFileId
        }).find();
        if (!think.isEmpty(petFileInfo)) {
          petFileInfo = this.toCamelObj(petFileInfo)
        }
        return this.success(petFileInfo);
    }
};