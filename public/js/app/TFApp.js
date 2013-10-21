var TFApp = window.TFApp || {};


TFApp = (function(win, doc, $) {

	var defaults = {},
		_self;

	/**
		@constructor
	*/
	function TFApp () {

		this.views = {};
		this.models = {};
		this.collections = {};

		_self = this;
	}

	TFApp.prototype.init = function(){
		var that = this;

		//globally accessible references to collections, models, and views
		this.collections.userPlayers = new PlayerCollection();
		this.collections.userWorlds = new WorldCollection();
		this.collections.allWorlds = new WorldCollection();

		this.models.userModel = new UserModel();
		this.models.worldModel = new WorldModel();
		this.models.gameModel = new GameModel();

		this.views.loginRegisterView = new _self.LoginRegisterView();
		this.views.registerView = new _self.RegisterView();
		this.views.loginView = new _self.LoginView();
		this.views.lobbyView = new _self.LobbyView();
		//this.views.gameView = new _self.GameView();



		//some global events
		this.models.userModel.on("change:authQueryString", function(){
			that.models.userModel.getUserPlayers();

			var playerCollectionUrl = "/users/" + that.models.userModel.get("user_id") + "/players.json" + that.models.userModel.get("authQueryString");
			that.collections.userPlayers.url = playerCollectionUrl;// = new PlayerCollection([], {url: playerCollectionUrl});
			that.collections.userPlayers.fetch({reset: true});

			var allWorldCollectionUrl = "/worlds.json" + that.models.userModel.get("authQueryString");
			that.collections.allWorlds.url = allWorldCollectionUrl;// = new PlayerCollection([], {url: playerCollectionUrl});
			that.collections.allWorlds.fetch({reset: true});
		});











		this.router = new TFRouter();

		Backbone.history.start();
		
	}

	// Returns a new instance of the TFApp namespace
	return new TFApp();

}(window, document, jQuery));

