var TFApp = window.TFApp || {};


TFApp = (function(win, doc, $) {

	var defaults = {},
		_self;

		var foo = [];
	/**
		@constructor
	*/
	function TFApp () {

		this.views = {};
		this.models = {};
		this.collections = {};

		_self = this;
	}
	TFApp.prototype.arrayTest = function(){

		var bar = [];

	}

	TFApp.prototype.init = function(){
		var that = this;
		
		$(document).ready(function(){

			//globally accessible references to collections, models, and views
			that.collections.userPlayers = new PlayerCollection();
			that.collections.userWorlds = new WorldCollection();
			that.collections.allWorlds = new WorldCollection();

			that.models.currentWorldModel = new _self.WorldModel();
			that.models.currentPlayerModel = new _self.PlayerModel();
			that.models.userModel = new UserModel();
			that.models.gameModel = new GameModel();

			that.views.loginRegisterView = new _self.LoginRegisterView();
			that.views.registerView = new _self.RegisterView();
			that.views.loginView = new _self.LoginView();
			that.views.lobbyView = new _self.LobbyView();
			that.views.gameView = new _self.GameView();
			that.views.consoleView = new _self.ConsoleView();
			that.views.audioView = new _self.AudioView();
			//that.views.gameView = new _self.GameView();


			//some global events
			that.models.userModel.on("change:authQueryString", function(){
				that.models.userModel.getUserPlayers();

				var playerCollectionUrl = "/users/" + that.models.userModel.get("user_id") + "/players.json" + that.models.userModel.get("authQueryString");
				that.collections.userPlayers.url = playerCollectionUrl;// = new PlayerCollection([], {url: playerCollectionUrl});
				that.collections.userPlayers.fetch({reset: true});

				var allWorldCollectionUrl = "/worlds.json" + that.models.userModel.get("authQueryString");
				that.collections.allWorlds.url = allWorldCollectionUrl;// = new PlayerCollection([], {url: playerCollectionUrl});
				that.collections.allWorlds.fetch({reset: true});

				that.DATA_CONTROLLER = new TrailsForwardDataController();
				that.DATA_CONTROLLER.serverAPI._userId = that.models.userModel.get("user_id");
				that.DATA_CONTROLLER.serverAPI._auth_token = that.models.userModel.get("authentication_token");
				
				that.SERVER_API = that.DATA_CONTROLLER.serverAPI;
				that.HELPER_FUNCTIONS = new TrailsForwardHelperFunctions();
			});

				// that.SERVER_API = new TrailsForwardServerAPI();
				// that.SERVER_API._userId = that.models.userModel.get("user_id");
				// that.SERVER_API._auth_token = that.models.userModel.get("authToken");








			that.router = new TFRouter();

			Backbone.history.start();
		});

		
	}

	// Returns a new instance of the TFApp namespace
	return new TFApp();

}(window, document, jQuery));

