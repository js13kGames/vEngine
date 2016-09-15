exports.Queue = function(){
    var self = this;
    this.size = function(){
        return tasksTotal;
    };
    this.onResolved = null;
    var tasksTotal = 0;
    var tasksResolved = 0;
    this.addTask = function() {
        tasksTotal++;
    };
    this.resolveTask = function(){
        tasksResolved++;
        if (tasksTotal==tasksResolved) {
            if (self.onResolved) self.onResolved();
        }
    };
    this.start = function() {
        if (this.size()==0) this.onResolved();
    }
};
exports.merge = function(obj1,obj2){
    Object.keys(obj2).forEach(function(key){
        obj1[key]=obj2[key];
    });
};
exports.clone = function(obj){
    return Object.create(obj);
};
exports.capitalize = function(s){
    return s.substr(0,1).toUpperCase() +
        s.substr(1);
};
exports.getBase64prefix = function(fileType,fileName) {
    var ext = fileName.split('.').pop();
    return 'data:'+fileType+'/'+ext+';base64,'
};