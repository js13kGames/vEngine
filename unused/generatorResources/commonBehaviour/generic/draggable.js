/**
 *
 exports.parameters =  {};
 exports.description = 'draggable behaviour with multitouch supporting';
 */

export default class DraggableBehaviour {

    static _getEventId(e){
        return e.id || 1;
    };

    constructor(game){
        this.game = game;
        this.points = {};
    }

    manage(gameObject,params) {
        gameObject.on('click',e=>{
            points[this._getEventId(e)] = {
                isMouseDown:true,
                mX: e.objectX,
                mY: e.objectY,
                target: gameObject
            };
        });
        let scene = this.game.getCurrScene();
        scene.on('mouseMove',function(e){
            let point = points[this._getEventId(e)];
            if (point && point.isMouseDown) {
                // collider.manage(
                //     self,
                //     e.screenX - point.mX,
                //     e.screenY - point.mY
                // );
                gameObject.pos.x = e.screenX - point.mX;
                gameObject.pos.y = e.screenY - point.mY;
            }
        });
        scene.on('mouseUp',function(e){
            delete this.points[this._getEventId(e)];
        });
    }

}

