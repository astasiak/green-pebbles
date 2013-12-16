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
  
  $("#error").click(function() {$(this).slideUp();});
  
  var error = $.url().param("error");
  if(error && error=='name_used') {
    var user_used = $.url().param("details");
    $('#error').show().text('Sorry, there is already "'+user_used+'" in the room');
  }
  
  $('.bigInput').keypress(function (e) {
    if (e.which == 13) { // on enter
      submit();
    }
  });
});
