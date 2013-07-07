var glob = require('./init.js');
var gamelib = glob.gamelib;
var express = glob.express;
var fs = glob.fs;
var app = glob.app;
var server = glob.server;
var io = glob.io;

var rooms = glob.rooms;


io.sockets.on('connection',function(socket){
    socket.on('create_room',function(data){
        var game = new gamelib.game();
        var room_id = glob.helper.util.make_id();
        game.init();
        rooms[room_id] = {game:game,players:[],name:data};
        io.sockets.emit('room_created',{room_id:room_id,name:data});
    });
    socket.on('start', function (data) {
        
        if(typeof data.room == 'undefined' || typeof rooms[data.room] == 'undefined'){
            io.sockets.socket(socket.id).emit('invalid_room');
        }
        else {
        var player_number = glob.helper.game.add_player(socket,data.room);
            var game = rooms[data.room].game;
            if( player_number > -1 ){
                io.sockets.socket(socket.id).emit('start',game.getStateFor(player_number));
            }
            else if( player_number === -1){
                io.sockets.socket(socket.id).emit('start',game.getStateForWatcher());
            }
            //else if player_num === -2 , do nothing
        }
    });
    socket.on('step', function (data) {

        var player_data = glob.helper.game.get_player(socket.id);
        var player = data.player !== -1 ? player_data.player_id: -1;
        var room = player_data.room_id;

        if(room === -1) return; //player not found in any room

        var game = rooms[room].game;
        var step = game.step(player,data.card);
        var currentPlayer = game.getStateFor(player);

        io.sockets.socket(socket.id).emit('updatePlayer',currentPlayer);
        io.sockets.in(room).emit(
            'update',
            {
                table      : game.table,
                whoPlayed  : {
                    index : data.player,
                    score : JSON.parse(currentPlayer).players.me.score
                }
            }
        );
    });


    socket.on('get_rooms', function () {
        io.sockets.socket(socket.id).emit('rooms',rooms);
    });
    socket.on('disconnect', function () {
        var player = glob.helper.game.get_player(socket.id);
        var room_id = player.room_id;
        if(room_id !== -1)
        {
            var p_index = rooms[room_id].players.indexOf(socket.id);
            delete rooms[room_id].players[p_index];
            io.sockets.in(room_id).emit('player_disconnected',{player_id:p_index});
        }
    });
});


require('./routing.js');
server.listen(3000);
