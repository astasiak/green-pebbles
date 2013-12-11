$( document ).ready(function() {
  $("#enterButton").click(function() {
    var username = $.trim($("#username").val());
    var room = $.trim($("#room").val());
    if(username=="" || room=="") {
      alert("Enter username and room name");
    } else {
      window.location.assign("game.html?user="+username+"&room="+room);
    }
  });
});
