
ve_local.Renderer = function(){

    var canvas;
    var ctx;
    var scene;
    var self = this;
    var currTime = 0;
    var lastTime = 0;
    var reqAnimFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(f){setTimeout(f,17)};
    var gameProps;
    var canceled = false;

    var setFullScreen = function(){
        var w = window.innerWidth;
        var h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        gameProps.globalScale.x = w / gameProps.width;
        gameProps.globalScale.y = h / gameProps.height;
    };

    var setNormalScreen = function(){
        var w = gameProps.width;
        var h = gameProps.height;
        canvas.width = w;
        canvas.height = h;
        gameProps.globalScale.x = 1;
        gameProps.globalScale.y = 1;
    };

    var listenResize = function(){
        window.addEventListener('resize',function(){
            setFullScreen();
            rescale(gameProps.globalScale.x,gameProps.globalScale.y);
        });
    };

    var rescale = function(scaleX,scaleY){
        ctx.scale(scaleX,scaleY);
    };

    this.getContext = function(){
        return ctx;
    };

    this.getCanvas = function(){
        return canvas;
    };

    this.init = function(){
        canvas = document.querySelector('canvas');
        gameProps = ve_local.bundle.gameProps;
        gameProps.globalScale = {};
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
        //ctx = new ve_local.CanvasContext();
        ctx = new ve_local.GlContext();
        ctx.init(canvas);
        ve_local.rendererContext = ctx;
        rescale(gameProps.globalScale.x,gameProps.globalScale.y);

        drawScene();

    };

    this.getCanvas = function(){
        return canvas;
    };

    // todo remove
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
        canceled = true;
    };

    var drawScene = function(){
        if (canceled) {
           return;
        }
        reqAnimFrame(drawScene);

        if (!scene) return;

        lastTime = currTime;
        currTime = Date.now();
        var deltaTime = lastTime ? currTime - lastTime : 0;

        ctx.clear(gameProps.width,gameProps.height);

        scene.update(currTime,deltaTime);

        ve_local.bundle.particleSystemList.forEach(function(p){
            p.update(currTime,deltaTime);
        });

        ve.keyboard._onNextTick();
    };
    this.setScene = function(_scene){
        scene = _scene;
        ve_local.collider.setUp();
    };

};