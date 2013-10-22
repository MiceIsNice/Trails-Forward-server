var TFApp = window.TFApp || {};

TFApp.WorldView = Backbone.View.extend({

	el: ".world-wrapper",
	events:{
		//"mousewheel .three-container": "handleScroll"
	},


	initialize: function(){
		var that = this;
		console.log("WorldView.initialize");

		var thegame = TFApp.models.gameModel.get("impactgame");

		if(thegame != undefined){
			console.log("thegame was not undefined");
			that.start();
		}
		TFApp.models.gameModel.on("change:impactgame", function(){
			that.start();
		});	
		

		TFApp.models.worldModel.on("change:world_id", function(){
			ig.game.init();
		});
	},
	render: function(){
		//TODO
	},
	start: function(){
		console.log("Starting World View");


		
		var thegame = TFApp.models.gameModel.get("impactgame");
		

		TFglobals.initialize(new TrailsForwardDataController(), new TrailsForwardHelperFunctions());

        ig.main( 
            '#canvas',
            thegame,
            60,
            1200,
            675,
            1,
            ig.Loader
        );

		TFglobals.DATA_CONTROLLER.serverAPI._auth_token = TFApp.models.userModel.get("authentication_token");
		TFglobals.DATA_CONTROLLER.serverAPI._userId = TFApp.models.userModel.get("user_id");










		
	}




});