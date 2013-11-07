function TrailsForwardRosebudController(){
	this.JSON = ".json?";
	this.ROSEBUD = "/rosebud";
	this.CLEAR_MY_LAND = "/clear_my_owned_land";
	this.CLEAR_ALL_LAND = "/clear_all_owned_land";
	this.CLEAR_MY_SURVEY_DATA = "/clear_my_survey_data";
	this.CLEAR_MY_CONTRACTS = "/clear_my_contracts";
	this.CLEAR_MY_UPGRADES = "/clear_my_upgrades";
	this.UNUSED_NUMBER = "/2";
}

//makePutRequest : function(aResourcePath, urlParameters, messagePayload, aCallbackFunction, aFailureContinuation)

TrailsForwardRosebudController.prototype = {

	constructor: TrailsForwardRosebudController, 
	
	clearMyOwnedLand : function(player_id){
		rs = this.buildRosebudRS(this.CLEAR_MY_LAND);
		var queryString = TFglobals.SERVER_API.authString() + "&player_id=" + player_id;
		TFglobals.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearMyOwnedLand);
	},

    clearAllOwnedLand : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_ALL_LAND);
		var queryString = TFglobals.SERVER_API.authString() + "&player_id=" + player_id;
		TFglobals.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearAllOwnedLand);
    },

    clearMySurveyData : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_MY_SURVEY_DATA);
    	var queryString = TFglobals.SERVER_API.authString() + "&player_id=" + player_id;
    	TFglobals.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearMySurveyData);
    },

    clearMyContracts : function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_MY_CONTRACTS);
    	var queryString = TFglobals.SERVER_API.authString() + "&player_id=" + player_id;
    	TFglobals.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearMyContracts);

    },

    clearMyUpgrades: function(player_id){
    	rs = this.buildRosebudRS(this.CLEAR_MY_UPGRADES);
    	var queryString = TFglobals.SERVER_API.authString() + "&player_id=" + player_id;
    	TFglobals.SERVER_API.makePutRequest(rs, queryString, {}, rosebud.onClearMyUpgrades);

    },


    /*****

		CALLBACK FUNCTIONS 
	
	*****/

	 onClearAllOwnedLand : function (reponse){
    	console.log("onClearAllOwnLand");
    },

    onClearMyOwnedLand : function (response){
		console.log("onClearMyOwnLand");
	},

	onClearMySurveyData : function (response){
		console.log("onClearMySurveyData");
	},

	onClearMyContracts : function (response){
		console.log("onClearMyContracts");
	},


	onClearMyUpgrades : function (response){
		console.log("onClearMyUpgrades");
	},
	/*****

		HELPER FUNCTIONS 
	
	*****/

	buildRosebudRS : function (func_name){
		return this.ROSEBUD + this.UNUSED_NUMBER + func_name + this.JSON;
    },

}

var rosebud = new TrailsForwardRosebudController();
