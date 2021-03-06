/**
* @author: Ahmed Maged
* Date: 7/7/13 - 9:39 PM
*
* This file contains the game specific helpers.
*
*/
var glob = require('../init.js');
var rooms = glob.rooms;

/**
 * Adds a player to a room
 * returns -1 if room is full, -2 for existing players, player number for a successfull new player
 *
 * todo shouldn't this be in game.js?
 * @param socket
 * @param room room id
 * @return {Number}
 */
exports.add_player = function(socket,room){

    var i = 0;
    var player_id = -1; //room full, can't add player ( until proven otherwise )
    var socket_id = socket.id;

    if( rooms[room].players.indexOf(socket_id) !== -1 ) //player already exists
        return -2;

    for( i=0 ; i<rooms[room].players.length ; ++i ){
        //if there is an empty place in already defined indexes, i.e. another player has left the room
        if( !rooms[room].players[i] ){
            rooms[room].players[i] = socket_id;
            player_id = i;
            break;
        }
    }

    //if room was never full, is not full, and there are no empty places to fill, append the player to the end
    if(rooms[room].players.length < 4 && player_id === -1){
        rooms[room].players.push(socket_id);
        player_id = rooms[room].players.length - 1;
    }

    if(rooms[room].game.players[player_id] !== undefined)
    {
        rooms[room].game.players[player_id].socket_id = socket_id;
        rooms[room].game.players[player_id].name = socket_id.substr(0,10);
    }
    socket.join(room);

    return player_id;
}


/**
 * Get player info {room id , player id in the room}
 * @param socket_id
 * @return {Object}
 */
exports.get_player = function(socket_id){
    var rid = -1;
    var pid = -1;

    if(!glob.helper.util.isEmpty(rooms)){ //make sure there is at least one room
        for( var room_id in rooms){
            if(!rooms.hasOwnProperty(room_id)) //ignore inherited stuff
                continue;
            if(rooms[room_id].players.indexOf(socket_id) !== -1){  //found the room containing this player
                rid = room_id;
                pid = rooms[room_id].players.indexOf(socket_id);
            }
        }
    }
    return {room_id:rid,player_id:pid};
}

/**
* Set player name
* @param socket_id
* @param name the new name to be set
*/
exports.set_player_name = function(socket_id,name){
    player = exports.get_player(socket_id);
    glob.rooms[player.room_id].game.players[player.player_id].name = name;
    glob.rooms[player.room_id].game.players[player.player_id].socket_id = socket_id;
}
