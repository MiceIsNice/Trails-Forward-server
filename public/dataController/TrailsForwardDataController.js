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
	
	logInAaronsWorldThreeLumberjack : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.logInAaronsWorldThreeLumberjack", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		var AARONS_EMAIL = "aaron.tietz@tufts.edu";
		var AARONS_PASSWORD = "letmein";
		this.CHOOSE_LUMBERJACK = true;
		this.AARONS_PLAYER_ID = 1;
	
		this.logInUserWithEmailAndPassword(AARONS_EMAIL, AARONS_PASSWORD);
	},
	
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
				console.log("DC.getWorldDataForPlayerId found no world for player_id: " + player_id);
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

		this.serverAPI.getPlayerStatsForPlayerId(this.gameDataCache.player_id);
	},
	
	getAvailableUpgradesForPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getAvailableUpgradesForPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getAvailableUpgradesForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	attemptToPurchaseUpgradeWithId : function(equipment_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToPurchaseUpgradeWithId", ["equipment_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
	
		if(equipment_id || equipment_id == 0)
			this.serverAPI.attemptToPurchaseUpgradeWithWorldIdAndEquipmentId(this.gameDataCache.id, equipment_id);
		else console.log("bad input");	
	},
	
	attemptToAcceptContractWithId : function(contract_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToAcceptContractWithId", ["contract_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(contract_id || contract_id == 0)
			this.serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(this.gameDataCache.id, this.gameDataCache.player_id, contract_id);
		else console.log("bad input");	
	},
	
	attemptToClearCutTileWithXY : function(x,y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToClearCutTileWithXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToClearCutTileWithWorldIdAndTileXYWithEstimate(this.gameDataCache.id, x, y, false);
		else console.log("bad input");
	},
	
	getEstimateForClearCutTileWithXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getEstimateForClearCutTileWithXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToClearCutTileWithWorldIdAndTileXYWithEstimate(this.gameDataCache.id, x, y, true);
		else console.log("bad input");	
	},
	
	attemptToPurchaseMegatileWithWorldIdPlayerIdAndResourceTileXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToPurchaseMegatileWithWorldIdPlayerIdAndResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToPurchaseMegatileWithWorldIdPlayerIdAndResourceTileXY(this.gameDataCache.id, 
																							this.gameDataCache.player_id, x, y)
		else console.log("bad input");	
	},
	
	//conductSurveyOfTileWithXY
	conductSurveyOfTileWithXY : function(tile_x, tile_y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.conductSurveyOfTileWithXY", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.serverAPI.conductSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y);
		else console.log("bad input");	
	},
	
	//conductSurveyOfTileWithXY
	viewExistingSurveyOfTileWithXY : function(tile_x, tile_y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.viewExistingSurveyOfTileWithXY", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.serverAPI.viewExistingSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y);
		else console.log("bad input");	
	},
/**
	conductSurveyOfTileWithId : function(tile_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.conductSurveyOfTileWithId", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(tile_id || tile_id == 0)
			this.serverAPI.conductSurveyOfTileWithWorldIdAndTileId(this.gameDataCache.id, tile_id);
		else console.log("bad input");	
	},
	
	//conductSurveyOfTileWithXY
	viewExistingSurveyOfTileWithId : function(tile_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.viewExistingSurveyOfTileWithId", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(tile_id || tile_id == 0)
			this.serverAPI.viewExistingSurveyOfTileWithWorldIdAndTileId(this.gameDataCache.id, tile_id);
		else console.log("bad input");	
	},
**/
	
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
				console.log("no players for user found!");
			/**
				user = TFglobals.DATA_CONTROLLER.serverAPI._userId;
				world_id = 3; // hard-coded to our practice world now 
				TFglobals.DATA_CONTROLLER.serverAPI.makeLumberJackForUserInWorld(user, world_id);
			**/
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
			TFglobals.IMPACT.onAttemptToAcceptContract(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseMegatileIncludingResourceTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseMegatileIncludingResourceTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeSuccess : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgradeSuccess", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseUpgradeResponse(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeFailure : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgradeFailure", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
		console.log("DC.onAttemptToPurchaseUpgradeFailure");
	},
	
	onConductSurveyOfTileWithWorldIdAndTileId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onConductSurveyOfTileWithWorldIdAndTileId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onConductSurveyOfTileWithId(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onViewExistingSurveyOfTileWithWorldIdAndTileId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onViewExistingSurveyOfTileWithWorldIdAndTileId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onViewExistingSurveyOfTileWithId(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		
	},
	
	onAttemptToClearCutTileWithXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToClearCutTileWithXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToClearCutTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetEstimateForClearCutTileWithXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetEstimateForClearCutTileWithXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetEstimateForClearCutTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");	
	},

	onGetPlayerStats : function(theStats){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetPlayerStats", ["theStats"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theStats)
			TFglobals.IMPACT.onGetPlayerStats(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theStats));
		else console.log("bad input");
	},
	
/*****

		HELPER FUNCTIONS
	
*****/	

	prepareImpactMessage : function(serverResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.prepareImpactMessage", ["serverResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
		console.log("serverResponse: ");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(serverResponse);
		if(serverResponse){
			if(serverResponse.errors)
				serverResponse.status = TFglobals.FAILURE;
			else
				serverResponse.status = TFglobals.SUCCESS;
			return serverResponse;
		}
		else console.log("bad input");
	},
	
};

