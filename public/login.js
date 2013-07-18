function setup(){
  document.getElementById("loginButton").addEventListener("click", tryToLogin);
  document.getElementById("registerButton").addEventListener("click", tryToRegister);
  document.getElementById("emailL").value = 'aaron.tietz@tufts.edu';
  document.getElementById("passwordL").value = 'letmein';
}

function tryToLogin(){
  var email = document.getElementById("emailL").value;
  var password = document.getElementById("passwordL").value;
  if(email != "" && password != ""){
    //alert("logging in with " + email + ", " + password);
    $.getJSON("http://tfnew.dax.getdown.org/users/authenticate_for_token.json?email=" + email + "&password=" + password, onLogin);
  }
  else
    console.log("email and password fields cannot be blank");
}

function tryToRegister(){
 var username = document.getElementById("usernameR").value;
 var email = document.getElementById("emailR").value;
 var password = document.getElementById("passwordR").value;
 alert("logging in with " + username + ", " + email + ", " + password);
}

function onLogin(data){
  console.log("successful login!")
  console.log(data);
  var id = data.id;
  var auth_token = data.auth_token;
  window.location.href = "http://tfnew.dax.getdown.org/game.html";
}

window.onload = setup;
