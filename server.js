
var connect = require('connect');
connect.createServer(connect.static('client')).listen(8080);

var io = require('socket.io').listen(8081);

var rooms = {
  socket_room_map: {},
  rooms_map: {},
  register: function(_socketId, _username, _room) {
    console.log("Register "+_username+" in "+_room);
    if(!this.rooms_map[_room]) {
      this.rooms_map[_room] = [];
    }
    this.rooms_map[_room].push({username:_username,socketId:_socketId});
    this.socket_room_map[_socketId] = {username:_username,room:_room};
  },
  getPresence: function(_socketId) {
    var socketData = this.socket_room_map[_socketId];
    return {username:socketData.username, room:{name:socketData.room, members:this.rooms_map[socketData.room]}};
  }
};

io.sockets.on('connection', function (socket) {
  socket.on('register', function (data) {
    rooms.register(socket.id, data.user, data.room);
  });

  socket.on('check', function (data) {
    var sendTo = rooms.getPresence(socket.id).room.members;
    for (var i=0; i<sendTo.length; i++) {
      io.sockets.socket(sendTo[i].socketId).emit('check', data);
    };
  });
  
  socket.on('sit_request', function (data) {
    var presence = rooms.getPresence(socket.id);
    var sendTo = presence.room.members;
    for (var i=0; i<sendTo.length; i++) {
      var message = {position: data['position'], player: presence.username};
      if(socket.id==sendTo[i].socketId) {
        message['you']=true;
      }
      io.sockets.socket(sendTo[i].socketId).emit('sit', message);
    };
  });
});
