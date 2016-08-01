
ve_local.CanvasRenderer = function(){

    var canvas;
    var ctx;
    var scene;
    var self = this;
    var currTime = 0;
    var lastTime = 0;
    var reqAnimFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){setTimeout(f,17)};
    var gameProps;

    var setFullScreen = function(){
        var w = window.outerWidth;
        var h = window.outerHeight;
        canvas.width = w;
        canvas.height = h;
        gameProps.globalScale = {
            x: w / gameProps.width,
            y: h / gameProps.height
        };
    };

    var setNormalScreen = function(){
        var w = gameProps.width;
        var h = gameProps.height;
        canvas.width = w;
        canvas.height = h;
        gameProps.globalScale = {x:1,y:1};
    };

    var listenResize = function(){
        window.addEventListener('resize',function(){
            setFullScreen();
            rescale();
        });
    };

    var rescale = function(){
        ctx.scale(gameProps.globalScale.x,gameProps.globalScale.y);
    };

    this.init = function(){
        canvas = document.querySelector('canvas');
        gameProps = ve_local.bundle.gameProps;
        if (!canvas) {
            canvas = document.createElement('canvas');
            if (gameProps.scaleToFullScreen) {
                setFullScreen();
                listenResize()
            } else {
                setNormalScreen();
            }
            document.body.appendChild(canvas);
        }
        ctx = canvas.getContext('2d');
        rescale();
    };

    this.getCanvas = function(){
        return canvas;
    };

    this.drawImage = function(img,fromX,fromY,fromW,fromH,toX,toY,toW,toH){
        ctx.drawImage(
            img,
            fromX,
            fromY,
            fromW,
            fromH,
            toX,
            toY,
            toW,
            toH
        );
    };

    this.cancel = function(){
        cancelAnimationFrame(drawScene);
    };

    var drawScene = function(){
        reqAnimFrame(drawScene);

        if (!scene) return;

        lastTime = currTime;
        currTime = Date.now();
        var deltaTime = lastTime ? currTime - lastTime : 0;

        ctx.fillStyle="#FFFFFF";
        ctx.fillRect(
            0,
            0,
            gameProps.width,
            gameProps.height);
        scene._layers.forEach(function(layer){
            layer._gameObjects.forEach(function(obj){
                if (!obj) return;
                obj.__updateCommonBehaviour__();
                obj.__updateIndividualBehaviour__(deltaTime);
                obj.update(currTime,deltaTime);
                obj.render(self);
            });
        });
        ve.keyboard._onNextTick();
    };
    this.setScene = function(_scene){
        scene = _scene;
        ve_local.collider.setUp();
    };

    drawScene();

};