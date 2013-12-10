var io = require('socket.io').listen(8080);

var rooms = {};
var client_rooms = {};

io.sockets.on('connection', function (socket) {
  socket.on('register', function (data) {
    var room_name = data['room'];
    if(!rooms[room_name]) {
      rooms[room_name] = [];
    }
    rooms[room_name].push(socket.id);
    client_rooms[socket.id] = room_name;
  });

  socket.on('check', function (data) {
    var room_name = client_rooms[socket.id];
    for (var i=0; i<rooms[room_name].length; i++) {
      io.sockets.socket(rooms[room_name][i]).emit('check', data);
    };
  });
});
