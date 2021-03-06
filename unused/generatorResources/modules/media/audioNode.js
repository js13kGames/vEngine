
const cache = require('resourceCache');

const AudioNode = function(context){

    let currSound = null;

    this.setGain = function(){

    };

    this.play = function(sound){
        currSound = sound;
        context.play(cache.get(sound.resourcePath),sound._loop);
    };

    this.stop = function() {
        context.stop();
        currSound = null;
    };

    this.setGain = function(val){
        context.setGain(val);
    };

    this.pause = function() {
        context.pause();
    };

    this.resume = function(){
        context.resume();
    };

    this.isFree = function() {
        return context.isFree();
    };

    this.getCurrSound = function(){
        return currSound;
    }

};

module.exports = AudioNode;
