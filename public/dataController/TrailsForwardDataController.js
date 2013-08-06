/* 
 *  TrailsForwardDataController.js
 * 		- Provides game data from local cache or server through interactions with 
 *			a TrailsForwardGameDataCache and a TrailsForwardServerAPI
 *		- relies on methods in object referenced by TFglobals.IMPACT 
 *   
 */

function TrailsForwardDataController(){
	if(TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING) console.log("TrailsForwardDataController()");
	
	this.serverAPI = new TrailsForwardServerAPI();
	this.gameDataCache = new TrailsForwardGameDataCache();
	
	//this.validPlayerStats = false;
	//this.validUpgrades = false;
	//this.validContracts = false;
	//this.validUserPlayers = false;
}

TrailsForwardDataController.prototype = {

	constructor : TrailsForwardDataController,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY Impact 
		
*****/

	logInUserWithEmailAndPassword : function(an_email, a_password){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.logInUserWithEmailAndPassword", ["an_email","a_password"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(an_email && a_password)
			this.serverAPI.logInUserWithEmailAndPassword(an_email, a_password);
		else console.log("bad input");
	},
	
	getWorldDataForPlayerId : function(player_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getWorldDataForPlayerId", ["player_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(player_id || player_id == 0){
			this.gameDataCache.player_id = player_id;
			var player = this.gameDataCache.getPlayerById(player_id);
			if(player && player.world_id)
				this.serverAPI.getWorldDataForWorldId(player.world_id);
			else
				console.log("DC.getWorldDataForPlayerId found no world for player_id: " + anId);
		}
		else console.log("bad input");
	},
	
	getUserPlayers : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getUserPlayers", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getUserPlayers();
	},
	
	getTilesInRect : function (rect){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getTilesInRect", ["rect"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(rect)
			this.serverAPI.getTilesInRect(rect);
		else console.log("bad input");	
	},
	
	getAvailableContractsForPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getAvailableContractsForPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getAvailableContractsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	getPlayerStats : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayerStats", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getPlayerStatsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	getAvailableUpgradesForPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getAvailableUpgradesForPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getAvailableUpgradesForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	attemptToPurchaseUpgradeWithId : function(equipmentId){
		
	
		this.serverAPI.attemptToPurchaseUpgradeWithWorldIdAndEquipmentId(this.gameDataCache.id, equipmentId);
	},
	
	attemptToAcceptContractWithId : function(contract_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToAcceptContractWithId", ["contract_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(contract_id || contract_id == 0)
			this.serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(this.gameDataCache.id, this.gameDataCache.player_id, contract_id);
		else console.log("bad input");	
	},
	
	attemptToClearCutTileWithId : function(tile_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToClearCutTileWithId", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
	
		if(tile_id || tile_id == 0)
			this.serverAPI.attemptToClearCutTileWithId(tile_id);
		else console.log("bad input");	
	},
	
	attemptToPurchaseTileWithId : function(tile_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToPurchaseTileWithId", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(tile_id || tile_id == 0)
			this.serverAPI.attemptToPurchaseTileWithId(tile_id)
		else console.log("bad input");	
	},
	
	requestSurveyForTileWithId : function(tile_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.requestSurveyForTileWithId", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(tile_id || tile_id == 0)
			this.serverAPI.requestSurveyForTileWithId(tile_id);
		else console.log("bad input");	
	},
	
	
	
/*****

		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
*****/

	onGetUserPlayers : function(thePlayers){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetUserPlayers", ["thePlayers"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(thePlayers){
			if(thePlayers.players.length > 0){
				TFglobals.DATA_CONTROLLER.gameDataCache.setUserPlayers(thePlayers.players);
				TFglobals.IMPACT.onGetUserPlayers(thePlayers.players);
			}
			else{
				user = TFglobals.DATA_CONTROLLER.serverAPI._userId;
				world_id = 3; // hard-coded to our practice world now 
				TFglobals.DATA_CONTROLLER.serverAPI.makeLumberJackForUserInWorld(user, world_id);
			}
		}
		else console.log("bad input");	
	},
	
	onLogIn : function(theData){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onLogIn", ["theData"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theData){
			TFglobals.DATA_CONTROLLER.serverAPI._auth_token = theData.auth_token;
			TFglobals.DATA_CONTROLLER.serverAPI._userId = theData.id;
			TFglobals.DATA_CONTROLLER.serverAPI.getUserPlayers();
			TFglobals.IMPACT.onLogin();
		}
		else console.log("bad input");	
	},
	
	onGetWorldData : function(theData){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetWorldData", ["theData"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theData){
			TFglobals.HELPER_FUNCTIONS.addSimplePropertiesFromObjToObj(theData.world, TFglobals.DATA_CONTROLLER.gameDataCache);
			TFglobals.IMPACT.onGetWorldData(theData);
		}
		else console.log("bad input");			
	},

	onGetTilesInRect : function(theTiles){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetTilesInRect", ["theTiles"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theTiles)
			TFglobals.IMPACT.onGetMapChunk(theTiles);	
		else console.log("bad input");
	},
	
	onGetAvailableContracts : function(theContracts){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetAvailableContracts", ["theContracts"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theContracts)
			TFglobals.IMPACT.onGetAvailableContracts(theContracts);
		else console.log("bad input");
	},
	
	onGetAvailableUpgradesForPlayer : function(theUpgrades){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetAvailableUpgradesForPlayer", ["theUpgrades"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theUpgrades)
			TFglobals.IMPACT.onGetAvailableUpgradesForPlayer(theUpgrades);
		else console.log("bad input");
	},
	
	onAttemptToAcceptContract : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToAcceptContract", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToAcceptContract(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult, 
											function(){"successfully accepted contract " + theResult.name}));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseTile : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseTile", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseTile(theResult);
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeSuccess : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgradeSuccess", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseUpgradeResponse(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult, 
											function(){"successfully bought a " + theResult.name}));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeFailure : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgradeFailure", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
	},
	
	onRequestSurveyForTile : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onRequestSurveyForTile", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onRequestSurveyForTile(theResult);
		else console.log("bad input");
	},
	
	onAttemptToClearCutTileWithId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToClearCutTileWithId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToClearCutTileWithId(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult, 
											function(){"successfully clearcut tile "}));
		else console.log("bad input");
	},

	onGetPlayerStats : function(theStats){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetPlayerStats", ["theStats"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theStats)
			TFglobals.IMPACT.onGetPlayerStats(theStats);
		else console.log("bad input");
	},
	
/*****

		HELPER FUNCTIONS
	
*****/	

	/* successMessage is a function that will only be executed if message is 
		the successfully obtained object hoped for */
	prepareImpactMessage : function(serverResponse, successMessage){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.prepareImpactMessage", ["serverResponse", "successMessage"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(serverResponse && successMessage){
			var response = {};
			if(serverResponse.message){
				response.status = TFglobals.FAILURE;
				response.message = serverResponse.message;	
			}
			else{
				response.status = TFglobals.SUCCESS;
				response.message = successMessage();
			}
			return response;
		}
		else console.log("bad input");
	},
	
};

