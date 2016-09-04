
var bundle = require('bundle').instance();
var collider = require('collider',{ignoreFail:true}).instance();
var renderer = require('renderer',{ignoreFail:true}).instance();
var collections = require('collections');
var math = require('math');

var isPropNotFit = function(el,key){
    if (!key) return true;
    if (key.indexOf('$$')==0) return true;
    if (el[key] && key.indexOf('_')==0) return true;
    if (el[key] && el[key].call) return true;
    if (typeof el[key] == 'string') return false;
    if (typeof el[key] == 'number') return false;
    if (!el[key]) return true;
};

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = deepCopy(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = deepCopy(obj[i]);
        }
        return out;
    }
    return obj;
}

exports.BaseModel = Class.extend({
    id:null,
    protoId:null,
    name:'',
    toJSON: function(){
        var res = {};
        for (var key in this) {
            if (isPropNotFit(this,key)) {
                continue;
            }
            res[key]=this[key];
        }
        return deepCopy(res);
    },
    toJSON_Array: function(){
        var res = [];
        for (var key in this) {
            if (isPropNotFit(this,key)) continue;
            res.push({key:key,value:this[key]});
        }
        return res;
    },
    fromJSON:function(jsonObj){
        var self = this;
        Object.keys(jsonObj).forEach(function(key){
            if (key in self) {
                self[key] = jsonObj[key];
                self[key] = +self[key]||self[key];
            }
        });
    },
    clone: function(){
        return new this.constructor(this.toJSON());
    },
    on: function(eventName,callBack){
        var self = this;
        self.__events__[eventName] = self.__events__[eventName] || [];
        self.__events__[eventName].push(callBack);
    },
    trigger: function(eventName,data){
        var self = this;
        var es = self.__events__[eventName];
        if (!es) return;
        es.forEach(function(e){
            e(data);
        });
    },
    _init:function(){
        this.__events__ = {};
        arguments && arguments[0] && this.fromJSON(arguments[0]);
    }
});

exports.Behaviour = exports.BaseModel.extend({});

var Resource = exports.BaseModel.extend({
    resourcePath:''
});

exports.Sound = Resource.extend({
    type:'sound',
    _buffer:null
});

exports.SpriteSheet = Resource.extend({
    type:'spriteSheet',
    width:0,
    height:0,
    numOfFramesH:1,
    numOfFramesV:1,
    _frameWidth:0,
    _frameHeight:0,
    _numOfFrames:0,
    _textureInfo: null,
    getFramePosX: function(frameIndex){
        return (frameIndex%this.numOfFramesH)*this._frameWidth;
    },
    getFramePosY: function(frameIndex){
        return ~~(frameIndex/this.numOfFramesH)*this._frameHeight;
    },
    calcFrameSize: function(){
        if (!(this.numOfFramesH && this.numOfFramesV)) return;
        this._frameWidth = this.width/this.numOfFramesH;
        this._frameHeight = this.height/this.numOfFramesV;
        this._numOfFrames = this.numOfFramesH * this.numOfFramesV;
    },
    construct: function(){
        this.calcFrameSize();
    }
});

exports.BaseGameObject = exports.BaseModel.extend({
    type:'baseGameObject',
    groupName:'',
    _spriteSheet:null,
    posX:0,
    posY:0,
    width:0,
    height:0,
    _layer:null,
    getRect: function(){
        return {x:this.posX,y:this.posY,width:this.width,height:this.height};
    },
    kill: function(){
        this._layer._gameObjects.remove({id:this.id});
        this._layer._scene._allGameObjects.remove({id:this.id});
    },
    /**
     * @deprecated
     */
    getScene: function(){
        // todo remove
        console.warn('BaseGameObject:getScene is deprecated. Use sceneManager.getCurrScene instead');
        return this._layer._scene;
    },
    update: function(){},
    _render: function(){}
});

exports.GameObject = exports.BaseGameObject.extend({
    type:'gameObject',
    spriteSheetId:null,
    _spriteSheet: null,
    _behaviour:null,
    commonBehaviour:[],
    _commonBehaviour:null,
    velX:0,
    velY:0,
    currFrameIndex:0,
    _sprPosX:0,
    _sprPosY:0,
    _frameAnimations: null,
    frameAnimationIds:[],
    _currFrameAnimation:null,
    rigid:true,
    _timeCreated:null,
    construct: function(){
        var self = this;
        this._frameAnimations = new collections.List();
        if (!this.spriteSheetId) {
            return;
        }
        this._spriteSheet = bundle.spriteSheetList.find({id: this.spriteSheetId});
        self.setFrameIndex(self.currFrameIndex);
        self._frameAnimations.clear();
        this.frameAnimationIds.forEach(function(id){
            var a = bundle.frameAnimationList.find({id: id});
            a = a.clone(exports.FrameAnimation);
            a._gameObject = self;
            self._frameAnimations.add(a);
        });
        self._commonBehaviour = new collections.List();
        this.commonBehaviour.forEach(function(cb){
            self._commonBehaviour.add(new exports.CommonBehaviour(cb));
        });
    },
    getFrAnimation: function(animationName){
        return this._frameAnimations.find({name: animationName});
    },
    setFrameIndex: function(index){
        this.currFrameIndex = index;
        this._sprPosX = this._spriteSheet.getFramePosX(this.currFrameIndex);
        this._sprPosY = this._spriteSheet.getFramePosY(this.currFrameIndex);
    },
    setSpriteSheet: function(spriteSheet){
        this._spriteSheet = spriteSheet;
        this.width = spriteSheet._frameWidth;
        this.height = spriteSheet._frameHeight;
    },
    update: function(time,delta) {
        this._currFrameAnimation && this._currFrameAnimation.update(time);
        var deltaX = this.velX * delta / 1000;
        var deltaY = this.velY * delta / 1000;
        var posX = this.posX+deltaX;
        var posY = this.posY+deltaY;
        collider.check(this,posX,posY);
        this.__updateIndividualBehaviour__(delta);
        this.__updateCommonBehaviour__();
        this._render();
    },
    stopFrAnimations: function(){
        this._currFrameAnimation && this._currFrameAnimation.stop();
    },
    _render: function(){
        renderer.getContext().drawImage(
            this._spriteSheet._textureInfo,
            this._sprPosX,
            this._sprPosY,
            this._spriteSheet._frameWidth,
            this._spriteSheet._frameHeight,
            this.posX,
            this.posY,
            this.width,
            this.height
        );
    }
});

exports.FrameAnimation = exports.BaseModel.extend({
    type:'frameAnimation',
    name:'',
    frames:[],
    duration:1000,
    _gameObject:null,
    _startTime:null,
    _timeForOneFrame:0,
    construct: function(){
        this._timeForOneFrame = ~~(this.duration / this.frames.length);
    },
    play: function(){
        this._gameObject._currFrameAnimation = this;
    },
    stop:function(){
        this._gameObject._currFrameAnimation = null;
        this._startTime = null;
    },
    update: function(time){
        if (!this._startTime) this._startTime = time;
        var delta = (time - this._startTime)%this.duration;
        var ind = ~~((this.frames.length)*delta/this.duration);
        var lastFrIndex = this._gameObject.currFrameIndex;
        if (lastFrIndex!=this.frames[ind]) {
            this._gameObject.setFrameIndex(this.frames[ind]);
        }
    }
});

exports.Layer = exports.BaseModel.extend({
    type:'layer',
    gameObjectProps:[],
    _gameObjects:null,
    _scene:null,
    construct: function() {
        var self = this;
        self._gameObjects = new collections.List();
        this.gameObjectProps.forEach(function(prop){
            var objCloned;
            switch (prop.subType) {
                case 'textField':
                    objCloned = new exports.TextField(prop);
                    break;
                default:
                    var obj = bundle.gameObjectList.find({id: prop.protoId});
                    objCloned = obj.clone();
                    objCloned.fromJSON(prop);
                    break;
            }
            objCloned._layer = self;
            self._gameObjects.add(objCloned);
        });
    },
    getAllSpriteSheets:function() {
        var dataSet = new collections.Set();
        this._gameObjects.forEach(function(obj){
            obj._spriteSheet && dataSet.add(obj._spriteSheet);
        });
        return dataSet;
    },
    update: function(currTime,deltaTime){
        this._gameObjects.forEach(function(obj){
            if (!obj) return;
            obj.update(currTime,deltaTime);
        });
    }
});

exports.Scene = exports.BaseModel.extend({
    type:'scene',
    layerProps:[],
    _layers:null,
    _allGameObjects:null,
    useBG:false,
    colorBG:null,
    _twins:null,
    __onResourcesReady: function(){
        var self = this;
        self._allGameObjects = new collections.List();
        self._layers.forEach(function(l){
            self._allGameObjects.addAll(l._gameObjects);
        });
    },
    construct: function(){
        var self = this;
        self._layers = new collections.List();
        this.layerProps.forEach(function(prop){
            var l = bundle.layerList.find({id: prop.protoId});
            var lCloned = l.clone(exports.Layer);
            lCloned.fromJSON(prop);
            lCloned._scene = self;
            self._layers.add(lCloned);
        });
    },
    getAllSpriteSheets:function() {
        var dataSet = new collections.Set();
        this._layers.forEach(function(l){
            dataSet.combine(l.getAllSpriteSheets());
        });
        return dataSet;
    },
    findGameObject: function(name){
        return this._allGameObjects.find({name:name});
    },
    getAllGameObjects:function(){
        return this._allGameObjects;
    },
    update: function(currTime,deltaTime){
        this._layers.forEach(function(layer){
            layer.update(currTime,deltaTime);
        });
        this.__updateIndividualBehaviour__(deltaTime);
    }
});

exports.Font = exports.BaseModel.extend({
    type:'font',
    fontColor:'black',
    fontSize:12,
    fontFamily:'Monospace',
    resourcePath:'',
    fontContext:null
});

exports.TextField = exports.BaseGameObject.extend({
        type:'userInterface',
        subType:'textField',
        _chars:null,
        text:'',
        _font:null,
        fontId:null,
        rigid:false,
        setText: function(text) {
            text+='';
            this._chars = [];
            this.text = text;
            this.width = 0;
            for (var i=0,max=text.length;i<max;i++) {
                this._chars.push(text[i]);
                var currSymbolInFont = this._font.fontContext.symbols[text[i]] || this._font.fontContext.symbols[' '];
                this.width+=currSymbolInFont.width;
            }
        },
        setFont: function(font){
            this._font = font;
            this.height = this._font.fontContext.symbols[' '].height;
            this._spriteSheet = new exports.SpriteSheet({resourcePath:this._font.resourcePath});
            this.setText(this.text);
        },
        clone:function(){
            return this._super();
        },
        construct: function(){
            this.rigid = false;
            var font =
                bundle.fontList.find({id:this.fontId}) ||
                bundle.fontList.find({name:'default'});
            this.setFont(font);
        },
        update: function(){
            this._render();
        },
        _render: function(){
            var posX = this.posX;
            var posY = this.posY;
            var self = this;
            this._chars.forEach(function(ch){
                var charInCtx = self._font.fontContext.symbols[ch]||self._font.fontContext.symbols['?'];
                renderer.getContext().drawImage(
                    self._spriteSheet._textureInfo,
                    charInCtx.x,
                    charInCtx.y,
                    charInCtx.width,
                    charInCtx.height,
                    posX,
                    posY,
                    charInCtx.width,
                    charInCtx.height
                );
                posX+=charInCtx.width;
            });
        }
    },
    {
        _cnt:0
    });

exports.CommonBehaviour = exports.BaseModel.extend({
    type:'commonBehaviour',
    name:'',
    description:'',
    parameters:[],
    construct: function(){

    }
});

exports.ParticleSystem = exports.BaseModel.extend({
    type:'particleSystem',
    gameObjectId:null,
    _gameObject:null,
    _particles:null,
    numOfParticlesToEmit:null,
    particleAngle:null,
    particleVelocity:null,
    particleLiveTime:null,
    emissionRadius:null,
    construct: function(){
        this._particles = [];
        if (!this.numOfParticlesToEmit) this.numOfParticlesToEmit = {from:1,to:10};
        if (!this.particleAngle) this.particleAngle = {from:0,to:0};
        if (this.particleAngle.to>this.particleAngle.from) this.particleAngle.from += 2*Math.PI;
        if (!this.particleVelocity) this.particleVelocity = {from:1,to:100};
        if (!this.particleLiveTime) this.particleLiveTime = {from:100,to:1000};
        if (!this.emissionRadius) this.emissionRadius = 0;
        this._gameObject = bundle.gameObjectList.find({id:this.gameObjectId});
    },
    emit: function(x,y){
        var r = function(obj){
            return math.getRandomInRange(obj.from,obj.to);
        };
        for (var i = 0;i<r(this.numOfParticlesToEmit);i++) {
            var particle = this._gameObject.clone();
            var angle = r(this.particleAngle);
            var vel = r(this.particleVelocity);
            particle.fromJSON({
                velX:vel*Math.cos(angle),
                velY:vel*Math.sin(angle),
                posX:r({from:x-this.emissionRadius,to:x+this.emissionRadius}),
                posY:r({from:y-this.emissionRadius,to:y+this.emissionRadius})
            });
            particle.liveTime = r(this.particleLiveTime);
            bundle.applyBehaviour(particle);
            this._particles.push(particle);
        }
    },
    update:function(time,delta){
        var self = this;
        this._particles.forEach(function(p){
            if (!p._timeCreated) p._timeCreated = time;
            if (time - p._timeCreated > p.liveTime) {
                self._particles.splice(self._particles.indexOf(p),1);
            }
            p.update(time,delta);
        });
    }
});
