
var Resource = function(){

    var self = this;
    var editData = require('providers/editData');
    var http = require('providers/http');

    var bundle = _require('bundle');
    var collections = _require('collections');
    var CommonBehaviour = _require('commonBehaviour');
    var TextField = _require('textField');
    var Layer = _require('layer');

    var _loadResources = function(projectName){
        http.post('/resource/getAll',{projectName:projectName},function(response){
            bundle.prepare(response);
            Object.keys(bundle).forEach(function(key){
                if (bundle[key] && bundle[key].call) return;
                editData.raw[key] = bundle[key];
            });
            editData.raw.gameProps = bundle.gameProps;
            editData.raw.commonBehaviourList = new collections.List();
            response.commonBehaviour.forEach(function(cb){
                editData.raw.commonBehaviourList.add(new CommonBehaviour(cb));
            });
            editData.raw.userInterfaceList.clear().add(new TextField({protoId:'0_0_1'}));
        });
    };
    this.loadProject = function(projectName){
        editData.reset();
        editData.raw.projectName = projectName;
        document.title = projectName;
        sessionStorage.projectName = projectName;
        Promise.
            resolve().
            then(function(){
                return _loadResources(projectName);
            }).
            then(function(){
                if (!bundle.sceneList.isEmpty()) editData.currSceneInEdit = bundle.sceneList.get(0);
                if (editData.currSceneInEdit) {
                    if (editData.currSceneInEdit._layers.size()) {
                        editData.currLayerInEdit = editData.currSceneInEdit._layers.get(0);
                    }
                }
                location.href = '#/editor';
            });
    };
    //this.createOrEditResource = function(currResourceInEdit,ResourceClass,resourceList,callBack, preserveDialog){
    //    var formData = new FormData();
    //    formData.append('file',currResourceInEdit._file);
    //    var model = {};
    //    currResourceInEdit.toJSON_Array().forEach(function(item){
    //        model[item.key] = item.value;
    //    });
    //    formData.append('model',JSON.stringify(model));
    //    formData.append('projectName',editData.projectName);
    //    var op = currResourceInEdit.id?'edit':'create';
    //    $http({
    //        url: '/resource/'+op,
    //        method: "POST",
    //        data: formData,
    //        headers: {'Content-Type': undefined}
    //    }).
    //        success(function (item) {
    //            if (!(ResourceClass && resourceList)) {
    //                uiHelper.closeDialog();
    //                return;
    //            }
    //            if (op=='create') {
    //                var r = new ResourceClass(item);
    //                resourceList.add(r);
    //                callBack && callBack({type:'create',r:r});
    //            } else {
    //                var index = resourceList.indexOf({id:item.id});
    //                resourceList.rs[index] = new ResourceClass(item);
    //                callBack && callBack({type:'edit',r:resourceList.rs[index]});
    //            }
    //            !preserveDialog && uiHelper.closeDialog();
    //        });
    //};
    //this.createOrEditResourceSimple = function(objResource){
    //    this.createOrEditResource(objResource,objResource.constructor,bundle[objResource.type+'List']);
    //};
    //this.deleteObjectFromResource = function(resourceType,resourceId,objectType,objectId,callback){
    //    $http({
    //        url: '/deleteObjectFromResource',
    //        method: "POST",
    //        headers: {'Content-Type': 'application/json'},
    //        data: {
    //            resourceType:resourceType,
    //            resourceId:resourceId,
    //            objectType:objectType,
    //            objectId:objectId,
    //            projectName:editData.projectName
    //        }
    //    }).
    //        success(function (res) {
    //            callback && callback();
    //        });
    //};
    //this.deleteResource = function(id,type,callBack){
    //    $http({
    //        url: '/resource/delete',
    //        method: "POST",
    //        data: {
    //            id:id,
    //            type:type,
    //            projectName:editData.projectName
    //        }
    //    }).
    //        success(function (res) {
    //            editData[type+'List'].remove({id: id});
    //            callBack && callBack();
    //        });
    //};
    //this.saveGameProps = function(gameProps){
    //    var formData = new FormData();
    //    formData.append('model',JSON.stringify(gameProps));
    //    formData.append('projectName',editData.projectName);
    //    $http({
    //        url: '/gameProps/save',
    //        method: "POST",
    //        data: formData,
    //        headers: {'Content-Type': undefined}
    //    })
    //};
    //this.post = function(url,data,callBack){
    //    data.projectName = editData.projectName;
    //    $http({
    //        url: '/gameProps/save',
    //        method: "POST",
    //        data: data,
    //        headers: {'Content-Type': undefined}
    //    }).
    //        success(function (resp) {
    //            callBack && callBack(resp);
    //        });
    //};
    //this.postMultiPart = function(url,formData,callBack){
    //    $http({
    //        url: url,
    //        method: "POST",
    //        data: formData,
    //        headers: {'Content-Type': undefined}
    //    }).
    //        success(function (resp) {
    //            callBack && callBack(resp);
    //        });
    //};
    //this.createOrEditObjectInResource = function(resourceType,resourceId,objectType,object,callback){
    //    var op = object.id?'edit':'create';
    //    $http({
    //        url: '/createOrEditObjectInResource',
    //        method: "POST",
    //        data: {
    //            model:JSON.stringify(object),
    //            resourceId:resourceId,
    //            resourceType:resourceType,
    //            objectType:objectType,
    //            projectName:editData.projectName
    //        },
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback({type:op,r:resp});
    //        });
    //};
    //this.createOrEditLayer = function(l){
    //    self.createOrEditResource(l,Layer,bundle.layerList,
    //        function(item){
    //            if (item.type=='create') {
    //                self.createOrEditObjectInResource(
    //                    editData.currSceneInEdit.type,
    //                    editData.currSceneInEdit.id,
    //                    'layerProps',
    //                    {
    //                        type:'layer',
    //                        protoId:item.r.id
    //                    },
    //                    function(resp){
    //                        var l = editData.currLayerInEdit.clone(Layer);
    //                        l.id = resp.r.id;
    //                        l.protoId = item.r.id;
    //                        l._scene = editData.currSceneInEdit;
    //                        editData.currSceneInEdit._layers.add(l);
    //                    }
    //                );
    //            }
    //        });
    //};
    //this.createFile = function(name,path,content,callback){
    //    $http({
    //        url: '/createFile',
    //        method: "POST",
    //        data: {
    //            name:name,
    //            path:path,
    //            content:content,
    //            projectName: editData.projectName
    //        },
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //this.readFile = function(name,path,callback){
    //    $http({
    //        url: '/readFile',
    //        method: "POST",
    //        data: {
    //            name:name,
    //            path:path,
    //            projectName: editData.projectName
    //        },
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //this.getProjects = function(callback){
    //    $http({
    //        url: '/getProjects',
    //        method: "GET",
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //this.createProject = function(projectName,callback){
    //    $http({
    //        url: '/createProject',
    //        method: "POST",
    //        data: {projectName:projectName},
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //this.renameFolder = function(oldName,newName,callback){
    //    $http({
    //        url: '/renameFolder',
    //        method: "POST",
    //        data: {oldName:oldName,newName:newName},
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //this.deleteFolder = function(name,callback){
    //    $http({
    //        url: '/deleteFolder',
    //        method: "POST",
    //        data: {name:name},
    //        headers: {'Content-Type': 'application/json'}
    //    }).
    //        success(function (resp) {
    //            callback && callback(resp);
    //        });
    //};
    //
    //
    //this.setTile = function(scene,x,y,tileIndex){
    //    $http({
    //        url: '/setTile/',
    //        method: "POST",
    //        data: {
    //            sceneId:scene.id,
    //            x:x,
    //            y:y,
    //            tileIndex:tileIndex,
    //            projectName:editData.projectName
    //        },
    //        headers: {'Content-Type': 'application/json'}
    //    });
    //};
    //
    //
    (function(){
        if (sessionStorage.projectName) {
            self.loadProject(sessionStorage.projectName);
        } else {
            location.href = '#/explorer';
        }
    })();
};

module.exports = new Resource();