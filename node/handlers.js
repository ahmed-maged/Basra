var glob = require('./init.js');
var rooms = glob.rooms;
var gamelib = glob.gamelib;
var io = glob.io;


exports.create_room_handler = function(data,socket){
        var game = new gamelib.game();
        var room_id = glob.helper.util.make_id();
        game.init();
        rooms[room_id] = {game:game,players:[],name:data};
        io.sockets.emit('room_created',{room_id:room_id,name:data});
};

exports.start_handler = function (data,socket) {
        
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
}
exports.step_handler = function (data,socket) {

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
    }