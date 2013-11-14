var TFApp = window.TFApp || {};

TFApp.QuickBarView = Backbone.View.extend({

	el: ".quick-bar",

	events:{

	},


	initialize: function(){
		var that = this;
		//cache some elements
		this.$worldName = this.$el.find(".world-name");
		this.$worldYear = this.$el.find(".world-year");
		this.$currentTurn = this.$el.find(".current-turn");

		this.$actionsRemaining = this.$el.find(".actions-remaining");
		this.$playerBalance = this.$el.find(".player-balance");
		this.$playerLumber = this.$el.find(".player-lumber");

		TFApp.models.currentWorldModel.on("change", that.updateWorldValues, that);
		TFApp.models.currentPlayerModel.on("change", that.updatePlayerValues, that);
	},
	render: function(){
		//TODO
	},
	start: function(){
		console.log("Starting World View");
	},
	updateWorldValues: function(){
		this.$worldName.text(TFApp.models.currentWorldModel.get("name"));
		this.$worldYear.text(TFApp.models.currentWorldModel.get("year_current"));
		this.$currentTurn.text(TFApp.models.currentWorldModel.get("current_turn"));
	},
	updatePlayerValues: function(shouldAnimate){
		if(shouldAnimate){
			var currentTimeRemaining = TFApp.models.currentPlayerModel.get("time_remaining_this_turn");
			var previousTimeRemaining = TFApp.models.currentPlayerModel.previous("time_remaining_this_turn");
			
			var previousBalance = TFApp.models.currentPlayerModel.previous("balance");
			var previousLumber = TFApp.models.currentPlayerModel.previous("lumber");




		}
		this.$actionsRemaining.text(parseInt(TFApp.models.currentPlayerModel.get("time_remaining_this_turn")).toLocaleString());
		this.$playerBalance.text(parseInt(TFApp.models.currentPlayerModel.get("balance")).toLocaleString());
		this.$playerLumber.text(parseInt(TFApp.models.currentPlayerModel.get("lumber")).toLocaleString());
		//todo: update lumber once we have that
	}





});