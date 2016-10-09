
var bundle = require('bundle').instance();
var renderer = require('renderer').instance();
var math = require('math');
var sceneManager = require('sceneManager').instance();
var deviceScale = require('device').deviceScale;

var Mouse = function(){

    var self = this;
    var globalScale = bundle.gameProps.globalScale;
    var canvas = renderer.getCanvas();

    if ('ontouchstart' in window) {
        canvas.ontouchstart = function(e){
            e.touches.forEach(function(evt){
                resolveClick(evt);
            });
        };
        canvas.ontouchend = canvas.ontouchcancel = function(){
            resolveMouseUp();
        };
        canvas.ontouchmove = function(e){
            e.touches.forEach(function(evt){
                resolveMouseMove(evt);
            });
        }
    } else {
        canvas.onmousedown = function(e){
            resolveClick(e);
        };
        canvas.onmouseup = function(){
            resolveMouseUp();
        };
        canvas.onmousemove = function(e){
            resolveMouseMove(e);
        }
    }

    var resolveScreenPoint = function(e){
        return {
            x: (e.clientX - bundle.gameProps.left) / globalScale.x * deviceScale,
            y: (e.clientY - bundle.gameProps.top) / globalScale.y * deviceScale
        };
    };

    var resolveEvent = function(e,name){
        var scene = sceneManager.getCurrScene();
        if (!scene) return;
        var point = resolveScreenPoint(e);
        var isObjectCaptured = false;
        scene._layers.someReversed(function(l){
            var found = false;
            l._gameObjects.someReversed(function(g){
                if (
                    math.isPointInRect(point,g.getRect(),g.angle)
                ) {
                    g.trigger(name,{
                        screenX:point.x,
                        screenY:point.y,
                        objectX:point.x - g.posX,
                        objectY:point.y - g.posY
                    });
                    isObjectCaptured = true;
                    return found = true;
                }
            });
            return found;
        });
        if (!isObjectCaptured) {
            scene.trigger(name,{
                screenX:point.x,
                screenY:point.y
            });
        }
    };

    var resolveClick = function(e){
        resolveEvent(e,'click');
    };

    var resolveMouseMove = function(e){
        resolveEvent(e,'mouseMove');
    };

    var resolveMouseUp = function(){
        //resolveEvent(e,'mouseUp');
    };

};

var instance = null;

module.exports.instance = function(){
    if (instance==null) instance = new Mouse();
    return instance;
};