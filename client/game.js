var STONES = 50;

function setPoints(player,small,big) {
  var partial = function(selector,value) {
    var points = $('tr#'+player+' '+selector+' div');
    points.removeClass('point');
    points.each(function(index) {
      if(index<value) {
        $(this).addClass('point');
      }
    });
  }
  partial('.small-points',small);
  partial('.big-points',big);
}

function takeSeat(position,player,me) {
  var slot = $('#'+position+' .player');
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
  Glass.start();
  var room_name = $.url().param("room");
  var user_name = $.url().param("user");
  if(!room_name || !user_name) {
    window.location.replace("index.html");
    return;
  }
  $("title").text("Ciottoli ["+room_name+"]");
  
  $(".rectRow").each(function(index){
    thisId = $(this).attr('id');
    for(var i=1;i<=STONES;i++) {
      $(this).append('<td><div class="rect" id="'+thisId+i+'"><div class="cell-number">'+i+'</div></td>');
    }
  });
  var socket = io.connect(window.location.hostname);
  socket.emit("register",{'room':room_name,'user':user_name});
  
  $(".rect").click(function(){
    if($(this).hasClass("checked")) {
      $(this).removeClass("checked").addClass("async");
      socket.emit("check",{id:$(this).attr('id'),dir:false});
    } else {
      $(this).addClass("checked async");
      socket.emit("check",{id:$(this).attr('id'),dir:true});
    }
  });
  
  $('.player').click(function(){
    socket.emit('sit_request',{position:$(this).closest('tr').attr('id')});
  });
  
  $('#chat-input').keypress(function (e) {
    if (e.which == 13) { // on enter
      socket.emit('chat',{text:$(this).val()});
      $(this).val('');
    }
  });
  
  $('.rect').hover(function(event) {
    $(this).find('.cell-number').css('left',event.clientX+10).css('top',event.clientY+20).show();
    var row = $(this).closest('.rectRow');
    var rowIdLen = row.attr('id').length;
    var id = $(this).attr('id');
    var prefix = id.substring(0,rowIdLen);
    var number = id.substring(rowIdLen);
    for(var i=1;i<=number;i++) {
      row.find('#'+prefix+i).addClass('hover');
    }
  },function() {
    $(this).find('.cell-number').hide();
    $('.rect').removeClass('hover');
  });
  
  $('.cell-number').mouseenter(function() {
    $(this).hide();
  });
  
  $('#new-game').click(function(){
    socket.emit('new_game');
  });
  
  $('#leave-room').click(function(){
    window.location.replace("index.html");
  });
  
  socket.on('username_collision', function(data) {
    window.location.replace("index.html?error=name_used&details="+user_name);
  });
  
  socket.on('check', function (data) {
    check(data["id"],data["dir"]);
  });
  
  socket.on('sit', function (data) {
    var position = data["position"];
    var player = data["player"];
    var me = data["you"];
    takeSeat(position,player,me);
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
    $('.rect').removeClass('checked');
    var keys = Object.keys(data.gameState);
    for(var keyId in keys) {
      var key = keys[keyId];
      check(key,data.gameState[key]);
    }
    var seats = Object.keys(data.seats);
    for(var seatId in seats) {
      var seat = seats[seatId];
      var player = data.seats[seat];
      takeSeat(seat,player,(player==user_name));
    }
    Glass.stop();
  });
});

var Glass = {
  initAnimation: function() {
    Glass.angle = 0;
    Glass.radius = Math.min(window.innerHeight,window.innerWidth)/4;
    Glass.circle = $(".circle");
    Glass.circleRadius = Glass.circle.height()/2;
    Glass.baseX = window.innerWidth/2 - Glass.circleRadius;
    Glass.baseY = window.innerHeight/2 - Glass.circleRadius;
  },
  animate: function() {
    Glass.angle = (Glass.angle+0.2);
    var x = Glass.baseX + Math.cos(Glass.angle)*Glass.radius;
    var y = Glass.baseY + Math.sin(Glass.angle)*Glass.radius;
    Glass.circle.css('top',y).css('left',x);
  },
  start: function() {
    if(Glass.running) {
      return;
    }
    Glass.running = true;
    Glass.initAnimation();
    $(window).resize(Glass.initAnimation);
    Glass.interval = setInterval(Glass.animate,30);
    $('.glass, .circle').show();
  },
  stop: function() {
    Glass.running = false;
    $('.glass, .circle').hide();
    $(window).unbind('resize',Glass.initAnimation);
    clearInterval(Glass.interval);
    Glass.circle.css('top','-40px').css('left','-40px');
  }
};

