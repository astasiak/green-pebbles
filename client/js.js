$( document ).ready(function() {
  var socket = io.connect('http://localhost:8080');
  socket.on('resp_data', function (data) {
    $(".panel").text(data["hello"]);
  });
  $(".rect").click(function(){
    if($(this).hasClass("checked")) {
      $(this).removeClass("checked");
    } else {
      $(this).addClass("checked");
    }
  });
  $(".panel").click(function(){
    socket.emit('my_event');
  });
});
