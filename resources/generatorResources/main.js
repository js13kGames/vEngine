
(function(){

    //<code>ve_local.bundle = new ve_local.Bundle({
    //<code><%var l = Object.keys(commonResources).length;%>
    //<code><%Object.keys(commonResources).forEach(function(key,i){%>
    //<code>    <%-key%>:<%-commonResources[key]%><%if (i<l){%><%=','%><%}%>
    //<code><%})%>
    //<code>});

    ve_local.scripts = {};
    ve_local.scripts.gameObject = {};
    ve_local.scripts.scene = {};

    //<code><%for (var i = 0; i<specialResources.gameObjectScripts.length;i++) {%>
    ve_local.scripts.gameObject['<%-specialResources.gameObjectScripts[i].name%>'] = function(exports,self){
        //<code><%-specialResources.gameObjectScripts[i].content%>
        exports.onCreate = onCreate;
        exports.onUpdate = onUpdate;
        exports.onDestroy = onDestroy;
    };
    //<code><%}%>;
    //<code><%for (var i = 0; i<specialResources.sceneScripts.length;i++) {%>
    ve_local.scripts.scene['<%-specialResources.sceneScripts[i].name%>'] = function(exports,self){
        //<code><%-specialResources.sceneScripts[i].content%>
        exports.onCreate = onCreate;
        exports.onUpdate = onUpdate;
        exports.onDestroy = onDestroy;
    };
    //<code><%}%>;

    ve_local.bundle.prepare();
    if (!ve_local.bundle.sceneList.size()) throw 'at least one scene must be created';

    ve_local.renderer = new ve_local.Renderer();
    ve.sceneManager = new ve_local.SceneManager();
    ve_local.collider = new ve_local.Collider();
    ve.keyboard = new ve_local.Keyboard();
    ve_local.bundle.prepareGameObjectScripts();


    window.addEventListener('load',function(){
        document.body.ontouchstart = function(e){
            e.preventDefault();
            return false;
        };
        ve_local.renderer.init();
        ve.mouse = new ve_local.Mouse(ve_local.renderer.getCanvas());
        ve.sceneManager.setScene(ve_local.bundle.sceneList.get(0));
    });

})();