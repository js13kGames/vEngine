
var bundle = require('bundle').instance();
var collider = require('collider').instance();
var keyboard = require('keyboard').instance();
var glContext = require('glContext').instance();
var canvasContext = require('canvasContext').instance();

var Renderer = function(){

    var canvas;
    var ctx;
    var scene;
    var self = this;
    var currTime = 0;
    var lastTime = 0;
    var reqAnimFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){setTimeout(f,17)};
    var gameProps;



    this.getContext = function(){
        return ctx;
    };

    this.getCanvas = function(){
        return canvas;
    };

    this.init = function(){
        canvas = document.querySelector('canvas');
        gameProps = bundle.gameProps;
        if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
        }
        ctx = glContext;
        //ctx = canvasContext;
        require('scaleManager').instance(canvas,ctx).manage();
        ctx.init(canvas);

        drawScene();

    };

    this.getCanvas = function(){
        return canvas;
    };

    this.cancel = function(){
        window.canceled = true;
    };

    var drawScene = function(){
        if (window.canceled) {
           return;
        }
        //<code>//<%if (opts.debug){%>if (window.canceled) return<%}%>


        reqAnimFrame(drawScene);

        if (!scene) return;

        lastTime = currTime;
        currTime = Date.now();
        var deltaTime = lastTime ? currTime - lastTime : 0;

        ctx.beginFrameBuffer();

        ctx.clear();
        scene.update(currTime,deltaTime);
        bundle.particleSystemList.forEach(function(p){
            p.update(currTime,deltaTime);
        });

        ctx.flipFrameBuffer();


        keyboard.update();
    };
    this.setScene = function(_scene){
        scene = _scene;
        ctx.colorBG = scene.colorBG;
        collider.setUp();
    };

};

var instance = null;

module.exports.instance = function(){
    if (instance==null) instance = new Renderer();
    return instance;
};