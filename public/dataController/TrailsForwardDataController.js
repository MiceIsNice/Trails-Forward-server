/* 
 *  TrailsForwardDataController.js
 * 		- Provides game data from local cache or server through interactions with 
 *			a TrailsForwardGameDataCache and a TrailsForwardServerAPI
 *		- relies on methods in object referenced by TFglobals.IMPACT 
 *   
 */

function TrailsForwardDataController(){
	this.serverAPI = new TrailsForwardServerAPI();
	this.gameDataCache = new TrailsForwardGameDataCache();
	
	this.validContracts = false;
	this.validPlayerStats = false;
	this.validUpgrades = false;
	this.validUserPlayers = false;
}

TrailsForwardDataController.prototype = {

	constructor : TrailsForwardDataController,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY Impact 
		
*****/
/*
	logInWithCookies : function(){
		this.logInUserWithEmailAndPassword('aaron.tietz@tufts.edu','letmein');
	},
*/
	logInUserWithEmailAndPassword : function(anEmail, aPassword){
		this.serverAPI.logInUserWithEmailAndPassword(anEmail, aPassword);
	},
	
	getWorldDataForPlayerId : function(anId){
		this.gameDataCache.player_id = anId;
		var player = this.gameDataCache.getPlayerById(anId);
		if(player && player.world_id)
			this.serverAPI.getWorldDataForWorldId(player.world_id);
		else
			console.log("DC.getWorldDataForPlayerId found no world for player_id: " + anId);
	},
	
	getUserPlayers : function(){
		if(this.validUserPlayers){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getUserPlayers: cached data is fresh");
			TFglobals.IMPACT.onGetPlayers(this.gameDataCache.userPlayers);
		}
		else{
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getUserPlayers: calling serverAPI.getUserPlayers");
			this.serverAPI.getUserPlayers();
		}
	},
	
	getTilesInRect : function (rect){
		if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getTilesInRect: calling serverAPI.getTilesInRect");
		this.serverAPI.getTilesInRect(rect);
	},
	
	getAvailableContractsForPlayer : function(){
	/*
		if(this.validContracts){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableContractsForUser: cached data is fresh");	
			TFglobals.IMPACT.onGetAvailableContracts(this.gameDataCache.getAvailableContractsForPlayer());		
		}
		else{
	*/
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableContractsForUser: calling serverAPI.getAvailableContractsForWorldIdAndPlayerId");	
			this.serverAPI.getAvailableContractsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
		//}
	},
	
	getPlayerStats : function(){
		if(this.validPlayerStats){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getPlayerStats: cached data is fresh");
			TFglobals.IMPACT.onGetPlayerStats(this.gameDataCache.getPlayerStats());
		}
		else{
			if(TFglobals.FULL_DEBUGGING == true) console.log("Dc.getPlayerStats: calling serverAPI.getPlayerStatsForWorldIdAndPlayerId");
			this.serverAPI.getPlayerStatsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
		}
	},
	
	getAvailableUpgradesForPlayer : function(){
		if(this.validUpgrades){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableUpgradesForPlayer: cached data is fresh");
			TFglobals.IMPACT.onGetAvailableUpgradesForPlayer(this.gameDataCache.getAvailableUpgradesForPlayer());
		}
		else{
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableUpgradesForPlayer: calling serverAPI.getAvailableUpgradesForWorldIdAndPlayerId");
			this.serverAPI.getAvailableUpgradesForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
		}
	},
	
	attemptToPurchaseUpgradeWithId : function(equipmentId){
		this.serverAPI.attemptToPurchaseUpgradeWithWorldIdAndEquipmentId(this.gameDataCache.id, equipmentId);
	},
	
	attemptToAcceptContractWithId : function(contract_id){
		if(TFglobals.FULL_DEBUGGING == true) console.log("DC.attemptToAcceptContractWithId: calling serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(" + 
				this.gameDataCache.id + ", " + this.gameDataCache.player_id + ", " + contract_id + ")");
		this.serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(this.gameDataCache.id, 
				this.gameDataCache.player_id, contract_id);
	},
	
	attemptToPurchaseTile : function(x, y){
		//this.serverAPI.attemptToPurchaseTileWithLocation(x, y)
	},
	
	requestSurveyForTile : function(x, y){
		//this.serverAPI.requestSurveyForTileWithLocation(x,y);
	},
	
	
	
/*****

		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
*****/
	
	
	storeTiles : function(theData){
		this.gameDataCache.storeTiles(theData.megatile);
	},
	
	onGetUserPlayers : function(theData){
		if(theData.players.length > 0){
			TFglobals.DATA_CONTROLLER.gameDataCache.setUserPlayers(theData.players);
			TFglobals.IMPACT.onGetUserPlayers(theData.players);
		}
		else{
			user = TFglobals.DATA_CONTROLLER.serverAPI._userId;
			world_id = 3; // hard-coded to our practice world now 
			TFglobals.DATA_CONTROLLER.serverAPI.makeLumberJackForUserInWorld(user, world_id);
		}
	},
	
	onLogIn : function(theData){
	// using cookies now - this was the old way
		TFglobals.DATA_CONTROLLER.serverAPI._auth_token = theData.auth_token;
		TFglobals.DATA_CONTROLLER.serverAPI._userId = theData.id;
		TFglobals.DATA_CONTROLLER.serverAPI.getUserPlayers();
		TFglobals.IMPACT.onLogin();
	},
	
	onGetWorldData : function(theData){
		TFglobals.HELPER_FUNCTIONS.addSimplePropertiesFromObjToObj(theData.world, TFglobals.DATA_CONTROLLER.gameDataCache);
		TFglobals.DATA_CONTROLLER.gameDataCache.initializeMap();
        if (TFglobals.FULL_DEBUGGING) console.log("Done initializing map, calling Impact onGetWorldData");
		TFglobals.IMPACT.onGetWorldData(theData);
	},

	onGetTilesInRect : function(theTiles){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onGetTilesInRect received: ")
			//TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theTiles);
		}
		TFglobals.IMPACT.onGetMapChunk(theTiles);	
	},
	
	onGetAvailableContracts : function(theContracts){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onGetAvailableContracts got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theContracts);
		}
		//TFglobals.DATA_CONTROLLER.validContracts = true;
		//TFglobals.DATA_CONTROLLER.gameDataCache.setAvailableContractsForPlayer(theContracts);
		TFglobals.IMPACT.onGetAvailableContracts(theContracts);
	},
	
	onGetAvailableUpgradesForPlayer : function(theUpgrades){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onGetAvailableUpgradesForPlayer got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theUpgrades);
		}
		TFglobals.DATA_CONTROLLER.validUpgrades = true;
		TFglobals.DATA_CONTROLLER.gameDataCache.setAvailableUpgradesForPlayer(theUpgrades);
		TFglobals.IMPACT.onGetAvailableUpgradesForPlayer(theUpgrades);
	},
	
	onAttemptToAcceptContract : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onAttemptToAcceptContract: received:");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onAttemptToAcceptContract(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult, 
											function(){"successfully accepted contract " + theResult.name}));
	},
	
	onAttemptToPurchaseTile : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onAttemptToPurchaseTile got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
	//	TFglobals.IMPACT.onAttemptToPurchaseTile();
	},
	
	onAttemptToPurchaseUpgradeSuccess : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onAttemptToPurchaseUpgradeResponse got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onAttemptToPurchaseUpgradeResponse(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult, 
											function(){"successfully bought a " + theResult.name}));
	},
	
	onAttemptToPurchaseUpgradeFailure : function(theResult){
		console.log("purchase failed with error ");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
	},
	
	onRequestSurveyForTile : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onRequestSurveyForTile got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onRequestSurveyForTile(theResult);
	},

	/* store stats in the cache and pass them to Impact */
	onGetPlayerStats : function(theStats){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onGetPlayerStats got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theStats);
		}
		TFglobals.DATA_CONTROLLER.validPlayerStats = true;
		TFglobals.DATA_CONTROLLER.gameDataCache.setPlayerStats(theStats);
		TFglobals.IMPACT.onGetPlayerStats(theStats);
	},
	
/*****

		HELPER FUNCTIONS
	
*****/	

	/* successMessage is a function that will only be executed if message is 
		the successfully obtained object hoped for */
	prepareImpactMessage : function(serverResponse, successMessage){
		var response = {};
		if(serverResponse.message){
			response.status = TFglobals.FAILURE;
			response.message = serverResponse.message;	
		}
		else{
			response.status = TFglobals.SUCCESS;
			response.message = successMessage();
		}
		if(TFglobals.FULL_DEBUGGING == true) console.log("DC.prepareImpactMessage made response with status, message: " +
						response.status + ", " + response.message);
		return response;
	},
	
};

