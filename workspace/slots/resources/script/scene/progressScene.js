
var GameObject = require('gameObject').GameObject;

var progressLabel = GameObject.find('progress');

self.onProgress = function(pr){
    var txt = ~~(pr*100)+' %';
    progressLabel.setText(txt);
}

function onUpdate(time) {

}