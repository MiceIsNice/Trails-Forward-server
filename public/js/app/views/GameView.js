var TFApp = window.TFApp || {};

TFApp.GameView = Backbone.View.extend({

	el: ".game-wrapper",
	events:{
		//"mousewheel .three-container": "handleScroll"
	},


	initialize: function(){
		var that = this;
		console.log("GameView.initialize");
		this.start();
	},
	render: function(){
		//TODO
	},
	start: function(){

		var thegame = TFApp.models.gameModel.get("impactgame");

		TFglobals.initialize(new TrailsForwardDataController(), new TrailsForwardHelperFunctions(), ig.game);
		var user_id = TFApp.models.userModel.get("user_id");
		var auth_token = TFApp.models.userModel.get("authentication_token");




		TFglobals.DATA_CONTROLLER.serverAPI._auth_token = auth_token;
		TFglobals.DATA_CONTROLLER.serverAPI._userId = user_id;




		
	}




});