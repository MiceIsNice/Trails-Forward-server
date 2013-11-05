var TFApp = window.TFApp || {};

var TFRouter = Backbone.Router.extend({
	'routes':{
		"login": 			"login",
		"lobby": 			"lobby",
		"game" :			"game",
		"world/:id": 		"game",
		""	   : 			"index",
		"*path": 			"index"
	},

	index: function(){
		if(this.checkForAuth()){
			this.navigate("lobby", true);
		}
	},
	login: function(){
		$(".tf-page.active").removeClass("active");
		TFApp.views.loginRegisterView.$el.addClass("active");

	},
	lobby: function(){
		if(this.checkForAuth()){
			$(".tf-page.active").removeClass("active");
			TFApp.views.lobbyView.$el.addClass("active");
		}
	},
	game: function(id){
		if(this.checkForAuth()){
			$(".tf-page.active").removeClass("active");


			TFApp.models.currentWorldModel.loadWorld(id);
			//when the world data is loaded, load the player data
			TFApp.models.currentWorldModel.on("change:world_id", function(){
				TFApp.models.currentPlayerModel.getPlayerId(id);
				//todo: get available contracts
				//todo: get available upgrades
			});

			//create a new world view
			TFApp.views.worldView = new TFApp.WorldView();
			TFApp.views.gameView.$el.addClass("active");
		}
	},

	// world: function(id){
	// 	if(this.checkForAuth()){
	// 		$("html").css({"margin-top": "-89px"});
	// 		$(".tf-page.active").removeClass("active");
	// 		//create a new world view
	// 		TFApp.views.worldView = new TFApp.WorldView();
	// 		TFApp.views.worldView.$el.addClass("active");
	// 	}


	// },
	checkForAuth: function(){
		var user_id = $.cookie("user_id");

		var authentication_token = $.cookie("authentication_token");

		if(user_id==undefined){
			this.navigate("login", true);
			return false;
		}else{
			TFApp.models.userModel.set({"user_id": user_id, "authentication_token": authentication_token});
			return true;
		}


	}


});

