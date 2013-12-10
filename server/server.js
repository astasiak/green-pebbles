var io = require('socket.io').listen(8080);

var rooms = {};
var client_rooms = {};

io.sockets.on('connection', function (socket) {
  socket.on('register', function (data) {
    var room_name = data['room'];
    var user_name = data['user'];
    if(!rooms[room_name]) {
      rooms[room_name] = [];
    }
    rooms[room_name].push(socket.id);
    client_rooms[socket.id] = {'room':room_name, 'user':user_name};
  });

  socket.on('check', function (data) {
    var room_name = client_rooms[socket.id]['room'];
    for (var i=0; i<rooms[room_name].length; i++) {
      socketId = rooms[room_name][i];
      io.sockets.socket(socketId).emit('check', data);
    };
  });
  
  socket.on('sit_request', function (data) {
    var room_name = client_rooms[socket.id]['room'];
    var user_name = client_rooms[socket.id]['user'];
    for (var i=0; i<rooms[room_name].length; i++) {
      socketId = rooms[room_name][i];
      message = {position:data['position'],player:user_name};
      if(socket.id==socketId) {
        message['you']=true;
      }
      io.sockets.socket(socketId).emit('sit', message);
    };
  });
});
