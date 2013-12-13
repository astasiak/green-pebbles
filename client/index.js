function alertShow() {
  $(".bigInput, #enterButton").hide();
  $("#mainAlert").show();
}
function alertHide() {
  $("#mainAlert").hide();
  $(".bigInput, #enterButton").show();
}
function submit() {
  var username = $.trim($("#username").val());
  var room = $.trim($("#room").val());
  if(username=="" || room=="") {
    alertShow();
  } else {
    window.location.assign("game.html?user="+username+"&room="+room);
  }
}

$( document ).ready(function() {
  $("#enterButton").click(submit);
  
  $("#mainAlert").click(alertHide);
  
  $('.bigInput').keypress(function (e) {
    if (e.which == 13) { // on enter
      submit();
    }
  });
});
