function takeSeat(position,player,me) {
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
}

function check(id,dir) {
  var obj = $('#'+id);
  obj.removeClass("async");
  if(dir) {
    obj.addClass("checked");
  } else {
    obj.removeClass("checked");
  }
}

function setPlayersBox(players) {
  $('#players-box').empty();
  players.sort();
  for(var i=0;i<players.length;i++) {
    $('#players-box').append($('<span/>').append(players[i])).append($('<br/>'));
  }
}

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
    check(data["id"],data["dir"]);
  });
  
  $(".rect").click(function(){
    if($(this).hasClass("checked")) {
      $(this).removeClass("checked").addClass("async");
      socket.emit("check",{id:$(this).attr('id'),dir:false});
    } else {
      $(this).addClass("checked async");
      socket.emit("check",{id:$(this).attr('id'),dir:true});
    }
  });
  
  socket.on('sit', function (data) {
    var position = data["position"];
    var player = data["player"];
    var me = data["you"];
    takeSeat(position,player,me);
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
    setPlayersBox(data.players);
  });
  
  socket.on('disconnected', function(data) {
    msg = $('<span/>').addClass('message').append(data.player+' left the room');
    $('#chat-history').append(msg).append($('<br/>')).scrollTop(100000);
    setPlayersBox(data.players);
  });
  
  socket.on('game_state', function(data) {
    console.log('Game state synchronization');
    var keys = Object.keys(data.gameState);
    for(var keyId in keys) {
      var key = keys[keyId];
      check(key,data.gameState[key]);
    }
    var seats = Object.keys(data.seats);
    for(var seatId in seats) {
      var seat = seats[seatId];
      takeSeat(seat,data.seats[seat]);
    }
  });
});


