$( document ).ready(function() {

  var room_name = $.url().param("room");
  if(room_name) {
    $("title").text(room_name);
  }
  var socket = io.connect('http://localhost:8080');
  
  socket.on('check', function (data) {
    var obj = $('#'+data["id"]);
    var dir = data["dir"];
    obj.removeClass("async");
    if(dir=="check") {
      obj.addClass("checked");
    } else if(dir=="uncheck") {
      obj.removeClass("checked");
    }
  });
  
  $(".rect").click(function(){
    if($(this).hasClass("checked")) {
      $(this).removeClass("checked").addClass("async");
      socket.emit("check",{id:$(this).attr('id'),dir:"uncheck"});
    } else {
      $(this).addClass("checked async");
      socket.emit("check",{id:$(this).attr('id'),dir:"check"});
    }
  });
});
