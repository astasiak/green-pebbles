
var port = process.env.PORT || 5000;
var connect = require('connect');
var app = connect.createServer(connect.static('client')).listen(port);

var io = require('socket.io').listen(app);

function Room(_name) {
  this.name = _name;
  this.players = [];
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
    this[_name] = new Room();
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

io.sockets.on('connection', function (socket) {
  socket.on('register', function (data) {
    var player = new Player(data.user,socket.id,data.room);
    players[socket.id] = player;
  });

  socket.on('check', function (data) {
    var player = players[socket.id];
    player.room.emit('check', data);
  });
  
  socket.on('sit_request', function (data) {
    var player = players[socket.id];
    var message = {position: data['position'], player: player.name};
    player.room.emitOthers(socket.id,'sit',message);
    message['you'] = true;
    player.emit('sit',message);
  });
  
  socket.on('chat', function (data) {
    var player = players[socket.id];
    player.room.emit('chat', {username:player.name,text:data.text});
  });
});
