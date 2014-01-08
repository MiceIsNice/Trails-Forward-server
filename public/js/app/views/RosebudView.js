var TFApp = window.TFApp || {};

TFApp.RosebudView = Backbone.View.extend({

	el: "#rosebud",



	JSON: ".json",
	ROSEBUD: "/rosebud",
	CLEAR_PLAYER_LAND: "/clear_player_owned_land",
	CLEAR_ALL_LAND: "/clear_all_owned_land",
	CLEAR_PLAYER_SURVEY_DATA: "/clear_player_survey_data",
	CLEAR_PLAYER_CONTRACTS: "/clear_player_contracts",
	CLEAR_PLAYER_UPGRADES: "/clear_player_upgrades",
	SET_PLAYER_TURN_POINTS: "/set_player_turn_points",
	SET_PLAYER_BALANCE: "/set_player_balance",
	RESET_PLAYER_STATS: "/reset_player_stats",
	END_ROUND: "/end_round",
	UNUSED_NUMBER: "/2",	//heh



	events:{
		"click .end-round": "endRound"
	},


	initialize: function(){
		var that = this;
		//creat and cache some backbone views that are exclusive to this view
		this.QuickBarView = new TFApp.QuickBarView();
		this.ActionButtonsView = new TFApp.ActionButtonsView();
		this.TileDetailsView = new TFApp.TileDetailsView();
		this.SidebarView = new TFApp.SidebarView();

		this.$alerts = this.$el.find(".alerts");
		this.$alertModals = this.$el.find(".alert-modal");
		this.$confirmationModal = this.$el.find(".confirmation.alert-modal");
		this.$errorModal = this.$el.find(".error.alert-modal");
	},
	render: function(){
		//TODO
	},
	start: function(){
		console.log("Starting Game View");
	},

	
	clearPlayerOwnedLand : function(e){
		e.preventDefault();
		rs = this.buildRosebudRS(this.CLEAR_PLAYER_LAND);
		var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
		TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerOwnedLand);
		return false;
	},

    clearPlayerOwnedLand : function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.CLEAR_ALL_LAND);
		var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
		TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearAllOwnedLand);
		return false;
    },

    clearPlayerSurveyData : function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_SURVEY_DATA);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerSurveyData);
    	return false;
    },

    clearPlayerContracts : function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_CONTRACTS);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerContracts);
    	return false;

    },

    clearPlayerUpgrades: function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_UPGRADES);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerUpgrades);
    	return false;

    },

    setPlayerTurnPoints: function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.SET_PLAYER_TURN_POINTS);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onSetPlayerTurnPoints);
    	return false;
    },

    setPlayerBalance: function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.SET_PLAYER_BALANCE);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onSetPlayerBalance);
    	return false;
    },

    resetPlayerStats: function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.RESET_PLAYER_STATS);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onResetPlayerStats);
    	return false;
    },
    endRound: function(e){
    	e.preventDefault();
    	rs = this.buildRosebudRS(this.END_ROUND);
    	var queryString = TFApp.models.userModel.get("authQueryString") + "&world_id=" + TFApp.models.currentWorldModel.get("world_id") + "&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
    	TFApp.SERVER_API.makeGetRequest(rs, queryString);
    	return false;
    },
    /*****

		CALLBACK FUNCTIONS 
	
	*****/

	onClearAllOwnedLand : function (reponse){
    	console.log("onClearAllOwnLand");
    },

    onClearPlayerOwnedLand : function (response){
		console.log("onClearPlayerOwnLand");
	},

	onClearPlayerSurveyData : function (response){
		console.log("onClearPlayerSurveyData");
	},

	onClearPlayerContracts : function (response){
		console.log("onClearPlayerContracts");
	},

	onClearPlayerUpgrades : function (response){
		console.log("onClearPlayerUpgrades");
	},

	onSetPlayerBalance : function (response){
		console.log("onSetPlayerBalance");
	},

	onSetPlayerTurnPoints : function (response){
		console.log("onSetPlayerTurnPoints");
	},

	onResetPlayerStats : function (response){
		console.log("onResetPlayerStats");
	},
	/*****

		HELPER FUNCTIONS 
	
	*****/

	buildRosebudRS : function (func_name){
		var thisRS = this.ROSEBUD + this.UNUSED_NUMBER + func_name + this.JSON;
		return thisRS;
    }



});