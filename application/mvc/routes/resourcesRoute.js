'use strict';

var express = require('express');
var session = require('express-session');
var url = require('url');

var multipart = require('connect-multiparty')();

var utils = require.main.require('./application/utils/utils');
var mainController = require.main.require('./application/mvc/controllers/mainController');
var resourcesController = require.main.require('./application/mvc/controllers/resourcesController');
var generatorController = require.main.require('./application/mvc/controllers/generatorController');

module.exports.init = function(app) {

    mainController.initFolderStructure();

    app.get('/',function(req,res){
        res.render('main',{
            resourceNames:resourcesController.RESOURCE_NAMES,
            defaultCodeScript:resourcesController.DEFAULT_CODE_SCRIPT
        });
    });
    app.get('/editor',function(req,res){
        res.render('editor',utils.parametrize({}));
    });

    var getModelFromBody = function(req) {
        return JSON.parse((req.body && req.body.model)||'{}');
    };

    app.post('/resource/create',multipart,function(req,res){
        var pathToUploadedFile = req.files && req.files.file && req.files.file.path;
        var result = resourcesController.create(getModelFromBody(req),pathToUploadedFile);
        res.send(result);
    });

    app.post('/resource/edit',multipart,function(req,res){
        var pathToUploadedFile = req.files && req.files.file && req.files.file.path;
        var result = resourcesController.edit(getModelFromBody(req),pathToUploadedFile);
        res.send(result);
    });

    app.post('/resource/getAll',function(req,res){
        var result = {};
        resourcesController.RESOURCE_NAMES.forEach(function(key){
            result[key] = resourcesController.getAll(key);
        });
        result.gameProps = resourcesController.getGameProps();
        result.commonBehaviour = resourcesController.getCommonBehaviourAttrs();
        res.send(result);
    });

    app.post('/resource/delete',function(req,res){
        var id = req.body.id;
        var type = req.body.type;
        resourcesController.delete(id,type);
        res.send({});
    });


    app.post('/deleteObjectFromResource',function(req,res){
        var resourceType = req.body.resourceType;
        var resourceId = req.body.resourceId;
        var objectType = req.body.objectType;
        var objectId = req.body.objectId;
        resourcesController.deleteObjectFromResource(resourceType,resourceId,objectType,objectId);
        res.send({});
    });

    app.post('/gameProps/save',multipart,function(req,res){
        resourcesController.saveGameProps(getModelFromBody(req));
        res.send({});
    });


    app.post('/createOrEditObjectInResource',function(req,res){
        var model = getModelFromBody(req);
        var resourceId = req.body.resourceId;
        var resourceType = req.body.resourceType;
        var objectType = req.body.objectType;
        res.send(
            resourcesController.createOrEditObjectInResource(resourceType,resourceId,objectType,model)
        );
    });

    app.post('/createFile',function(req,res){
        var name = req.body.name;
        var path = req.body.path;
        var content = req.body.content;
        res.send(
            resourcesController.createFile(name,path,content)
        );
    });

    app.post('/readFile',function(req,res){
        var name = req.body.name;
        var path = req.body.path;
        res.send(
            resourcesController.readFile(name,path)
        );
    });


    app.get('/generate',function(req,res){
        var opts = {};
        var queryData = url.parse(req.url, true).query;
        opts.debug = !!queryData.debug;
        generatorController.generate(opts,function(result){
            res.send(result)
        });
    });

};