
import mathEx from '../mathEx'

let isTouch = 'ontouchstart' in window;


export default class Mouse {

    constructor(game){
        this.game = game;
        this.objectsCaptured = {};
    }

    listenTo(container) {
        if (isTouch) {
            let lastTouch = {}; // todo
            container.ontouchstart = e=>{
                let l = e.touches.length;
                while (l--){
                    this.resolveClick(e.touches[l]);
                }
            };
            container.ontouchend = container.ontouchcancel = e=>{
                let l = e.changedTouches.length;
                while (l--){
                    this.resolveMouseUp(e.changedTouches[l]);
                }
            };
            container.ontouchmove = e=>{
                let l = e.touches.length;
                while (l--){
                    this.resolveMouseMove(e.touches[l]);
                }
            }
        } else {
            container.onmousedown = e=>{
                (e.button === 0) && this.resolveClick(e);
            };
            container.onmouseup = e=>{
                this.resolveMouseUp(e);
            };
            container.onmousemove = e=>{
                this.resolveMouseMove(e);
            };
            container.ondblclick = e=>{
                this.resolveDoubleClick(e);
            }
        }
    }

    resolveScreenPoint(e){
        return {
            //x: (e.clientX * device.scale - gameProps.left) / globalScale.x ,
            //y: (e.clientY * device.scale - gameProps.top) / globalScale.y ,
            x: ~~((e.clientX - this.game.pos.x) / this.game.scale.x) ,
            y: ~~((e.clientY - this.game.pos.y) / this.game.scale.y) ,
            id: e.identifier || 0
        };
    }

    triggerEvent(e,name){
        let scene = this.game.getCurrScene();
        if (!scene) return;
        let point = this.resolveScreenPoint(e);

exit:   for (let i=0;i<scene.layers.length;i++){
            let layer = scene.layers[scene.layers.length - 1 - i];
            for (let j=0;j<layer.gameObjects.length;j++){
                let g = layer.gameObjects[layer.gameObjects.length - 1 - j];
                if (
                    mathEx.isPointInRect(point,g.getRect())
                ) {
                    g.trigger(name,{
                        screenX:point.x,
                        screenY:point.y,
                        objectX:point.x - g.pos.x,
                        objectY:point.y - g.pos.y,
                        id:point.id
                    });
                    scene.trigger(name,{
                        screenX:point.x,
                        screenY:point.y,
                        id:point.id,
                        target:g
                    });
                    break exit;
                }
            }
        }

        return point;
    }

    resolveClick(e){
        if (window.canceled) return;
        let point = this.triggerEvent(e,'click');
        this.triggerEvent(e,'mouseDown');
    }

    resolveMouseMove(e){
        if (DEBUG && window.canceled) return;
        let point = this.triggerEvent(e,'mouseMove');
        if (!point) return;
        let lastMouseDownObject = this.objectsCaptured[point.id];
        if (lastMouseDownObject && lastMouseDownObject!=point.object) {
            lastMouseDownObject.trigger('mouseLeave');
            delete this.objectsCaptured[point.id];
        }
        if (point.object && lastMouseDownObject!=point.object) {
            point.object.trigger('mouseEnter');
            this.objectsCaptured[point.id] = point.object;
        }
    }

    resolveMouseUp(e){
        if (DEBUG && window.canceled) return;
        let point = this.triggerEvent(e,'mouseUp');
        if (!point) return;
        let lastMouseDownObject = this.objectsCaptured[point.id];
        if (!lastMouseDownObject) return;
        lastMouseDownObject.trigger('mouseUp');
        delete this.objectsCaptured[point.id];
    }

    resolveDoubleClick(e){
        if (DEBUG && window.canceled) return;
        let point = this.triggerEvent(e,'doubleClick');
        if (!point) return;
        delete this.objectsCaptured[point.id];
    }

}