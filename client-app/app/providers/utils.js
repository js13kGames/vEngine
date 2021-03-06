
import mathEx from 'coreEngine/src/engine/mathEx';

import editData from 'app/providers/editData';
import restResource from 'app/providers/rest/resource';
import restFileSystem from 'app/providers/rest/fileSystem';
import i18n from 'app/providers/i18n';

import GameObjectProto from 'coreEngine/src/model/generic/gameObjectProto'

class Utils {
    getGameObjectCss(gameObj){
        if (!gameObj) gameObj = {};
        gameObj.scale = gameObj.scale || {};
        gameObj.spriteSheet = gameObj.spriteSheet || {};
        return {
            width:                 gameObj.width+'px',
            height:                gameObj.height+'px',
            backgroundImage:       gameObj.spriteSheet &&
            gameObj.spriteSheet.resourcePath &&
            `url(${editData.projectName}/${gameObj.spriteSheet.resourcePath})`,
            backgroundPositionY:  -gameObj._sprPosY+'px',
            backgroundPositionX:  -gameObj._sprPosX+'px',
            backgroundRepeat:     'no-repeat',
            opacity:               gameObj.alpha,
            transform:            `scale(${gameObj.scale.x},${gameObj.scale.y}) rotateZ(${mathEx.radToDeg(gameObj.angle)}deg)`,
            backgroundSize:       `${gameObj.spriteSheet.numOfFramesH*gameObj.width}px ${gameObj.spriteSheet.numOfFramesV*gameObj.height}px`
        };

    }

    calcZoom(gameObject) {
        if (!gameObject) gameObject = {};
        if (!gameObject.height) gameObject.height = 30;
        return gameObject.height>30?
            30/gameObject.height:
            1;
    }

    merge(a,b){
        a = a || {};
        b = b || {};
        let res = {};
        Object.keys(a).forEach(key=>{
            res[key] = a[key];
        });
        Object.keys(b).forEach(key=>{
            res[key] = b[key];
        });
        return res;
    }

    hexToRgb(hex) {
        if (!hex) return {r:0,g:0,b:0};
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) || 0,
            g: parseInt(result[2], 16) || 0,
            b: parseInt(result[3], 16) || 0
        } : {r:0,g:0,b:0};
    }

    rgbToHex(col) {
        if (!col) return '#000000';
        let r = +col.r,g=+col.g,b=+col.b;
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    range(rFr,rTo,step) {
        if (!step) step = 1;
        let arr = [], i;
        if (rTo==undefined) {
            rTo = rFr;
            rFr = 0;
        }
        if (rFr<rTo) {
            for (i=rFr;i<=rTo;i+=step) {
                arr.push(i);
            }
        } else {
            for (i=rFr;i>=rTo;i-=step) {
                arr.push(i);
            }
        }
        return arr;
    }

    _createAceCompleter(){
        let result = [];
        let res = {};
        let objs = ['gameObject'];
        objs.forEach(go=>{
            let GObjClass = GameObjectProto;
            let goObj = new GObjClass(editData.game);
            for (let key in goObj) {
                if (key.indexOf('_')==0) continue;
                res[key] = {
                    name:key,
                    value:key,
                    score:1,
                    meta:'gameObject property'
                }
            }
        });
        Object.keys(res).forEach(key=>{
            result.push(res[key]);
        });
        return result;
    }

    _waitForFrameAndDo(file,path){
        let frame = document.getElementById('scriptEditorFrame');
        let contentWindow = frame && frame.contentWindow;
        if (!contentWindow || !contentWindow.ready) {
            setTimeout(()=>{
                this._waitForFrameAndDo(file,path);
            },100);
            return;
        }
        contentWindow.setCode(file);
        contentWindow.calcEditorSize();
        contentWindow.setAutocomplete(this._createAceCompleter());
        window.removeEventListener('resize',contentWindow.calcEditorSize);
        window.addEventListener('resize',()=>{
            contentWindow && contentWindow.calcEditorSize();
        });
        window.saveCode = code =>{
            restFileSystem.createFile(path,code);
        };
    };

    getArray(num) {
        if (!num) return [];
        let res = [];
        for (let i=0;i<num;i++) {
            res.push(i);
        }
        return res;
    }

    size(obj) {
        if (!obj) return 0;
        return Object.keys(obj).length;
    }

    deleteModel(model,callback){
        return new Promise(resolve=>{
            window.confirmEx(
                i18n.getAll().confirmQuestion(model),
                ()=>{
                    restResource.remove(model,callback);
                    editData.game._repository.removeObject(model);
                    resolve();
                }
            )
        });
    }

    openEditor(path) {
        editData.scriptEditorUrl = path;
        restFileSystem.readFile(path,(file)=>{
            this._waitForFrameAndDo(file,path);
        });
    }

    assign(model,property,value){
        model && (model[property] = value);
    }

    capitalise(s){
        return s[0].toUpperCase() + s.substr(1);
    }

}

export default new Utils();