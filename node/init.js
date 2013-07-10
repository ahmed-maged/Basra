/**
* @author: Ahmed Maged
* Date: 7/7/13 - 9:39 PM
*
* This file contains the code that initializes tha application
*
*/
exports.gamelib = require('./game.js');
exports.express = require('express');
exports.fs = require('fs');
exports.app = exports.express();
exports.server = require('http').createServer(exports.app);
exports.io = require('socket.io').listen(exports.server);
exports.io.set('log level', 1);

exports.app.set('view engine', 'html'); exports.app.set('views', "../client");
exports.app.use(exports.express.static('../client'));
exports.app.use(exports.express.bodyParser());

exports.rooms = {};
var helper = {};
helper.util = require('./helpers/util.js');
helper.game = require('./helpers/game.js');
exports.helper = helper;
exports.handlers = require('./handlers.js');
exports.routings = require('./routing.js');