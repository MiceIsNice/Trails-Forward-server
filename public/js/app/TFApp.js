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
		
		this.models.user = new UserModel();
		this.models.worldModel = new WorldModel();

		this.views.loginRegisterView = new _self.LoginRegisterView();
		this.views.registerView = new _self.RegisterView();
		this.views.loginView = new _self.LoginView();
		this.views.gameView = new _self.GameView();

		this.router = new TFRouter();
		Backbone.history.start();
		

		
	}

	// Returns a new instance of the TFApp namespace
	return new TFApp();

}(window, document, jQuery));

