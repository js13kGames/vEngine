var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var setup = function(app){
    app.set('views', './editor/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(session({
        key: 'session_cookie_name',
        secret: 'session_cookie_secret'
    }));
    app.use(express.static('editor/public'));
    app.use(express.static('project'));
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
};

module.exports.setUpRotes = function(app){
    setup(app);
    require('../routes/resourcesRoute').init(app);
};