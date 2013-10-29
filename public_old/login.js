function setup(){
  document.getElementById("loginButton").addEventListener("click", tryToLogin);
  document.getElementById("registerButton").addEventListener("click", tryToRegister);
 //document.getElementById("emailL").value = 'aarontietz@gmail.com';
  document.getElementById("emailL").value = 'aaron.tietz@tufts.edu';
  document.getElementById("passwordL").value = 'letmein';
  
  document.getElementById("usernameR").value = "don't fill these in";
  document.getElementById("emailR").value = 'click submit';
  document.getElementById("passwordR").value = 'to fill in on next page';
  
}

function tryToLogin(){
  var email = document.getElementById("emailL").value;
  var password = document.getElementById("passwordL").value;
  if(email != "" && password != ""){
    //alert("logging in with " + email + ", " + password);
    //$.getJSON("http://tfnew.dax.getdown.org/users/authenticate_for_token.json?email=" + email + "&password=" + password, onLogin);
    $.getJSON("http://0.0.0.0:3000/users/authenticate_for_token.json?email=" + email + "&password=" + password, onLogin);
  }
  else
    console.log("email and password fields cannot be blank");
}

function tryToRegister(){
 var theUsername = document.getElementById("usernameR").value;
 var theEmail = document.getElementById("emailR").value;
 var thePassword = document.getElementById("passwordR").value;

  window.location.href = "http://0.0.0.0:3000/users/sign_up.html";
}

function onLogin(data){
  console.log("successful login!")
  console.log(data);
  var id = data.id;
  var auth_token = data.auth_token;
  window.location.href = "http://0.0.0.0:3000/game.html";
}

window.onload = setup;
