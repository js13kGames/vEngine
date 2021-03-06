
import editData from 'app/providers/editData';
import utils from 'app/providers/utils';
import i18n from 'app/providers/i18n';
import restFileSystem from 'app/providers/rest/fileSystem';

import SpriteSheet from 'coreEngine/src/model/generic/spriteSheet';

export default RF.registerComponent('app-sprite-sheets', {
    template: {
        type: 'string',
        value: require('./spriteSheets.html')
    },
    editData,
    i18n: i18n.getAll(),
    createSpriteSheet: function(){
        this.editData.currSpriteSheetInEdit = new SpriteSheet(editData);
        RF.getComponentById('spriteSheetDialog').open();
    },
    editSpriteSheet: function(sprSh){
        this.editData.currSpriteSheetInEdit = sprSh.clone();
        RF.getComponentById('spriteSheetDialog').open();
    },
    deleteSpriteSheet: function(model){
        let hasDepends = editData.game._repository.getArray('GameObject').filter(it=>it.spriteSheet.id==model.id).length>0;
        if (hasDepends) {
            window.alertEx(this.i18n.canNotDelete(model));
            return;
        }
        utils.deleteModel(model,()=>{
            restFileSystem.removeFile(model.resourcePath);
        });
    }
});
