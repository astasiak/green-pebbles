function alertShow() {
  $(".bigInput, #enterButton").hide();
  $("#mainAlert").show();
}
function alertHide() {
  $("#mainAlert").hide();
  $(".bigInput, #enterButton").show();
}

$( document ).ready(function() {
  $("#enterButton").click(function() {
    var username = $.trim($("#username").val());
    var room = $.trim($("#room").val());
    if(username=="" || room=="") {
      alertShow();
    } else {
      window.location.assign("game.html?user="+username+"&room="+room);
    }
  });
  $("#mainAlert").click(alertHide);
});
