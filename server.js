
var port = process.env.PORT || 5000;
var connect = require('connect');
var app = connect.createServer(connect.static('client')).listen(port);

var io = require('socket.io').listen(app);
io.set('log level', 1);


function Room(_name) {
  this.name = _name;
  this.players = [];
  this.gameState = {};
  this.seats = {}
}
Room.prototype.newGame = function() {
  this.gameState = {};
}
Room.prototype.descriptor = function() {
  var playerNames = [];
  for (var i=0; i<this.players.length; i++) {
    playerNames.push(this.players[i].name);
  }
  return {
    players: playerNames,
    gameState: this.gameState,
    seats: this.seats
  }
}
Room.prototype.removePlayer = function(socketId) {
  for (var i=0; i<this.players.length; i++) {
    if (this.players[i].socket == socketId ) {
      this.players.splice(i,1);
      break;
    }
  }
}
Room.prototype.emitOthers = function(socketId,msg,data) {
  for (var i=0; i<this.players.length; i++) {
    if (this.players[i].socket != socketId ) {
      io.sockets.socket(this.players[i].socket).emit(msg, data);
    }
  }
}
Room.prototype.emit = function(msg,data) {this.emitOthers(null,msg,data);}

var rooms = {}; // name->room
rooms.room = function(_name) {
  if(!this[_name]) {
    this[_name] = new Room(_name);
  }
  return this[_name];
};

function Player(_name,_socket,_room) {
  this.name = _name;
  this.socket = _socket;
  this.room = rooms.room(_room);
  this.room.players.push(this);
}
Player.prototype.emit = function(msg,data) {
  io.sockets.socket(this.socket).emit(msg,data);
}

var players = {}; // socket->user
players.player = function(socketId) {
  if(this[socketId]) {
    return this[socketId];
  } else {
    throw "not found user for socket \""+socketId+"\"";
  }
}

function handle(socket,event,f) {
  socket.on(event,function(data) {
    try {
      f(data);
    } catch(err) {
      console.log("Error when processing ["+event+"]:["+err+"]");
    }
  });
}

io.sockets.on('connection', function (socket) {
  handle(socket, 'register', function (data) {
    var player = new Player(data.user,socket.id,data.room);
    players[socket.id] = player;
    player.room.emit('registered', {player: player.name, players: player.room.descriptor().players});
    player.emit('game_state', player.room.descriptor());
    console.log("Registered ["+player.name+"] in room ["+player.room.name+"]");
  });

  handle(socket, 'check', function (data) {
    var player = players.player(socket.id);
    player.room.gameState[data.id] = data.dir;
    player.room.emit('check', data);
  });
  
  handle(socket, 'sit_request', function (data) {
    var player = players.player(socket.id);
    var position = data['position'];
    player.room.seats[position] = player.name;
    var message = {position: position, player: player.name};
    player.room.emitOthers(socket.id,'sit',message);
    message['you'] = true;
    player.emit('sit',message);
  });
  
  handle(socket, 'chat', function (data) {
    var player = players.player(socket.id);
    player.room.emit('chat', {username:player.name,text:data.text});
    console.log(" --chat ["+player.name+"]: ["+data.text+"]");
  });
  
  handle(socket, 'new_game', function (data) {
    var player = players.player(socket.id);
    player.room.newGame();
    player.room.emit('game_state', player.room.descriptor());
  });
  
  handle(socket, 'disconnect', function (data) {
    var player = players.player(socket.id);
    player.room.removePlayer(socket.id);
    player.room.emit('disconnected', {player: player.name, players: player.room.descriptor().players});
    delete players[socket.id];
    console.log("Disconnected ["+player.name+"] from room ["+player.room.name+"]");
  });
});
