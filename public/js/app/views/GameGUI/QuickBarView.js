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
		this.$playerBalance = this.$el.find(".player-lumber");

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
	updatePlayerValues: function(){
		this.$actionsRemaining.text(TFApp.models.currentPlayerModel.get("time_remaining_this_turn"));
		this.$playerBalance.text(TFApp.models.currentPlayerModel.get("balance"));
		//todo: update lumber once we have that
		//this.$playerLumber.text(TFApp.models.currentPlayerModel.get("lumber"));
	}





});