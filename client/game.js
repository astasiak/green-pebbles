$( document ).ready(function() {

  var room_name = $.url().param("room");
  var user_name = $.url().param("user");
  if(!room_name || !user_name) {
    window.location.replace("index.html");
    return;
  }
  $("title").text("Ciottoli ["+room_name+"]");
  var socket = io.connect(window.location.hostname);
  socket.emit("register",{'room':room_name,'user':user_name});
  
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
  
  socket.on('sit', function (data) {
    var position = data["position"];
    var player = data["player"];
    var me = data["you"];
    var slot = $('#'+position);
    if(player) {
      slot.text(player).removeClass("empty");
      if(me) {
        slot.addClass('me');
      } else {
        slot.removeClass('me');
      }
    } else {
      slot.text('sit down').removeClass('me').addClass("empty");
    }
  });
  
  $('.player').click(function(){
    socket.emit('sit_request',{position:$(this).attr('id')});
  });
  
  $('#chat-input').keypress(function (e) {
    if (e.which == 13) { // on enter
      socket.emit('chat',{text:$(this).val()});
      $(this).val('');
    }
  });
  
  socket.on('chat', function(data) {
    user = $('<span/>').addClass('username').append(data.username+': ');
    text = $('<span/>').addClass('text').append(data.text);
    $('#chat-history').append(user).append(text).append($('<br/>')).scrollTop(100000);
  });
  
  socket.on('registered', function(data) {
    msg = $('<span/>').addClass('message').append(data.player+' joined the room');
    $('#chat-history').append(msg).append($('<br/>')).scrollTop(100000);
  });
  
  socket.on('disconnected', function(data) {
    msg = $('<span/>').addClass('message').append(data.player+' left the room');
    $('#chat-history').append(msg).append($('<br/>')).scrollTop(100000);
  });
});


