var io = require('socket.io').listen(8080);

io.sockets.on('connection', function (socket) {
  socket.on('my_event', function (data) {
    console.log(data);
    socket.emit('resp_data', { hello: 'First response!'});
    setTimeout((function(){
      socket.emit('resp_data', { hello: 'Hello World!'});
    }),1000);
  });
});
