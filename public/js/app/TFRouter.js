var TFApp = window.TFApp || {};

var TFRouter = Backbone.Router.extend({
	'routes':{
		"login": 			"login",
		"game": 			"game",
		"*path": 			"index"
	},
	login: function(){
		$(".tf-page").removeClass("active");
		TFApp.views.loginRegisterView.$el.addClass("active");
	},
	game: function(){
		$(".tf-page").removeClass("active");
		TFApp.views.gameView.$el.addClass("active");
	},
	index: function(){

		//If their auth token is empty or not valid, show the login screen
		//TODO: Check auth token validity
		if(TFApp.models.user.get("authentication_token") == ""){
			this.navigate("login", true);
		}
		//Otherwise, show the game client
		else{
			this.navigate("game", true);
			//TODO: Load up the game client
		}
	}


});

