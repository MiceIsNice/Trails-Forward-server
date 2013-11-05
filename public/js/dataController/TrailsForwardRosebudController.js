function TrailsForwardRosebudController(){
	this.JSON = ".json?";
	this.ROSEBUD = "/rosebud";
	this.CLEAR_MY_LAND = "/clear_my_owned_land";
	this.CLEAR_ALL_LAND = "/clear_all_owned_land";
	this.CLEAR_MY_SURVEY_DATA = "/clear_my_survey_data";
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
		console.log("onClearMySurveyData")
	},
	/*****

		HELPER FUNCTIONS 
	
	*****/

	buildRosebudRS : function (func_name){
		return this.ROSEBUD + this.UNUSED_NUMBER + func_name + this.JSON;
    },

}

var rosebud = new TrailsForwardRosebudController();
