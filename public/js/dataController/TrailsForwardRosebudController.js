function TrailsForwardRosebudController(){
	this.JSON = ".json?";
	this.ROSEBUD = "/rosebud";
	this.CLEAR_PLAYER_LAND = "/clear_player_owned_land";
	this.CLEAR_ALL_LAND = "/clear_all_owned_land";
	this.CLEAR_PLAYER_SURVEY_DATA = "/clear_player_survey_data";
	this.CLEAR_PLAYER_CONTRACTS = "/clear_player_contracts";
	this.CLEAR_PLAYER_UPGRADES = "/clear_player_upgrades";
	this.SET_PLAYER_TURN_POINTS = "/set_player_turn_points";
	this.SET_PLAYER_BALANCE = "/set_player_balance";
	this.RESET_PLAYER_STATS = "/reset_player_stats";
	this.UNUSED_NUMBER = "/2";
}

//makePutRequest : function(aResourcePath, urlParameters, messagePayload, aCallbackFunction, aFailureContinuation)

TrailsForwardRosebudController.prototype = {

	constructor: TrailsForwardRosebudController, 
	
	clearPlayerOwnedLand : function(player_id){
		rs = this.buildRosebudRS(this.CLEAR_PLAYER_LAND);
		var queryString = TFApp.SERVER_API.authString() + "&player_id=" + player_id;
		TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerOwnedLand);
	},

    clearPlayerOwnedLand : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_ALL_LAND);
		var queryString = TFApp.SERVER_API.authString() + "&player_id=" + player_id;
		TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearAllOwnedLand);
    },

    clearPlayerSurveyData : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_SURVEY_DATA);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id=" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerSurveyData);
    },

    clearPlayerContracts : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_CONTRACTS);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id=" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerContracts);

    },

    clearPlayerUpgrades: function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_PLAYER_UPGRADES);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id=" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearPlayerUpgrades);

    },

    setPlayerTurnPoints: function(player_id){
    	rs = this.buildRosebudRS(this.SET_PLAYER_TURN_POINTS);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onSetPlayerTurnPoints);
    },

    setPlayerBalance: function(player_id){
    	rs = this.buildRosebudRS(this.SET_PLAYER_BALANCE);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onSetPlayerBalance);
    },

    resetPlayerStats: function(player_id){
    	rs = this.buildRosebudRS(this.RESET_PLAYER_STATS);
    	var queryString = TFApp.SERVER_API.authString() + "&player_id" + player_id;
    	TFApp.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onResetPlayerStats);
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
		return this.ROSEBUD + this.UNUSED_NUMBER + func_name + this.JSON;
    },

}

var rosebud = new TrailsForwardRosebudController();
