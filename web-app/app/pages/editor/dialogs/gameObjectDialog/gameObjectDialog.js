
import editData from 'providers/editData';
import restResource from 'providers/rest/resource';
import i18n from 'providers/i18n';
import restFileSystem from 'providers/rest/fileSystem';
import utils from 'providers/utils';

const FrameAnimation = _require('frameAnimation');

export default RF.registerComponent('app-game-object-dialog', {
    template: {
        type: 'string',
        value: require('./gameObjectDialog.html')
    },
    form:{valid: ()=>{return true;}},
    editData,
    i18n: i18n.getAll(),
    utils,
    selectedBehaviourId: '',

    // open: function(){ // not used at this dialog
    // },
    createOrEditGameObject: function(g){
        let self = this;
        restResource.
        save(g).
        then(resp=>{
            if (resp.created) {
                g.id = resp.id;
                editData.gameObjectList.add(g);
                console.log(editData.gameObjectList);
                return resp;
            } else if (resp.updated) {
                g.updateCloner();
            }
        }).
        then((resp)=>{
            if (resp && resp.created) return restFileSystem.createFile(
                `script/gameObject/${g.name}.js`,
                document.getElementById('defaultCodeScript').textContent);
        }).
        then(()=>{
            RF.getComponentById('gameObjectModal').close();
            RF.digest();
        }).
        catch(window.catchPromise);
    },
    refreshGameObjectFramePreview: function(gameObject,ind) {
        let spriteSheet = gameObject.spriteSheet;
        if (!spriteSheet) return;
        let maxNumOfFrame = spriteSheet.numOfFramesH*spriteSheet.numOfFramesV-1;
        if (this.editData.currGameObjectInEdit.currFrameIndex>=maxNumOfFrame) {
            this.editData.currGameObjectInEdit.currFrameIndex = 0;
            ind = 0;
        }
        gameObject.setFrameIndex(ind);
    },
    createFrameAnimation: function(){
        this.editData.currFrameAnimationInEdit = new FrameAnimation(new FrameAnimation().toJSON());
        RF.getComponentById('frameAnimationDialog').open();
    },
    editFrameAnimation: function(fa){
        this.editData.currFrameAnimationInEdit = fa.clone();
        RF.getComponentById('frameAnimationDialog').open();
    },
    deleteFrameAnimation: function(fa){
        utils.deleteModel(fa,()=>{
            this.editData.currGameObjectInEdit.frameAnimations.remove({id:fa.id});
            this.editData.currGameObjectInEdit.updateCloner();
            restResource.save(this.editData.currGameObjectInEdit);
        });
    },

    onSpriteSheetSelected: function(sprId){
        let gameObject = editData.currGameObjectInEdit;
        let spriteSheet = editData.spriteSheetList.find({id: sprId});
        if (!spriteSheet) return;
        spriteSheet = spriteSheet.clone();
        //if (!gameObject.name) gameObject.name = spriteSheet.name;
        //spriteSheet.calcFrameSize();
        gameObject.width = ~~(spriteSheet.width / spriteSheet.numOfFramesH);
        gameObject.height = ~~(spriteSheet.height / spriteSheet.numOfFramesV);
        gameObject.spriteSheet = spriteSheet;
    },

    createCommonBehaviour: function(selectedBehaviourName){
        if (editData.currGameObjectInEdit.commonBehaviour.find({name:selectedBehaviourName})) {
            alertEx(i18n.get('objectAlreadyAdded'));
            return;
        }
        this.editData.currCommonBehaviourInEdit =
            this.editData.commonBehaviourProto.find({name:selectedBehaviourName}).clone();
        RF.getComponentById('commonBehaviourModal').open();
    },
    editCommonBehaviour: function(cb){
        this.editData.currCommonBehaviourInEdit = cb.clone();
        RF.getComponentById('commonBehaviourModal').open();
    },
    deleteCommonBehaviour: function (cb) {
        let self = this;
        window.confirmEx(
            this.i18n.confirmQuestion(cb),
            function () {
                Promise.
                resolve().
                then(()=>{
                    self.editData.commonBehaviourList.remove({id:cb.id});
                    return restResource.remove(cb);
                }).
                then(()=>{
                    self.editData.currGameObjectInEdit.fixateState();
                    self.editData.currGameObjectInEdit.commonBehaviour.remove({id:cb.id});
                    self.editData.currGameObjectInEdit.updateCloner();
                    return restResource.save(self.editData.currGameObjectInEdit.toJSON_Patched());
                }).
                catch(window.catchPromise)
            }
        )
    }
});