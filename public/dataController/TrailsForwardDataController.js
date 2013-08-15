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
	
	getPlayerStatsPromise : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayerStatsPromise", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		return TFglobals.DATA_CONTROLLER.serverAPI.getPlayerStatsForPlayerIdPromise(TFglobals.DATA_CONTROLLER.gameDataCache.player_id);
	},
	
	getPlayersOwnedEquipment : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayersOwnedEquipment", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getPlayersOwnedEquipmentWithPlayerIdAndPromise(this.gameDataCache.player_id, false);
	},
	
	getPlayersOwnedEquipmentPromise : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayersOwnedEquipmentPromise", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		return this.serverAPI.getPlayersOwnedEquipmentWithPlayerIdAndPromise(this.gameDataCache.player_id, true);
	},
	
	getPlayersOwnedResourceTiles : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayersOwnedResourceTiles", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getPlayersOwnedResourceTilesWithPlayerIdAndPromise(this.gameDataCache.player_id, false);
	},
	
	getPlayersOwnedResourceTilesPromise : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getPlayersOwnedResourceTilesPromise", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		return TFglobals.DATA_CONTROLLER.serverAPI.getPlayersOwnedResourceTilesWithPlayerIdAndPromise(TFglobals.DATA_CONTROLLER.gameDataCache.player_id, true);	
	},
	
	getResourceTilesOwnedByOthers : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getResourceTilesOwnedByOthers", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getResourceTilesOwnedByOthersWithWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	getAvailableUpgradesForPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getAvailableUpgradesForPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		this.serverAPI.getAvailableUpgradesForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	attemptToPurchaseUpgradeWithId : function(equipment_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToPurchaseUpgradeWithId", ["equipment_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
		if(equipment_id || equipment_id == 0){
			this.makeRequestWithCallbackAndTwoUpdateCallsWithCallbacks(
				this.serverAPI.attemptToPurchaseUpgradeWithWorldIdAndEquipmentId(this.gameDataCache.id, equipment_id),
				this.onAttemptToPurchaseUpgrade,
				this.getPlayerStatsPromise,
				this.onGetPlayerStats,		
				this.getPlayersOwnedEquipmentPromise,
				this.onGetPlayersOwnedEquipment
			);
		}
		else console.log("bad input");	
	},
	
	attemptToAcceptContractWithId : function(contract_id){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToAcceptContractWithId", ["contract_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(contract_id || contract_id == 0)
			this.serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(this.gameDataCache.id, this.gameDataCache.player_id, contract_id);
		else console.log("bad input");	
	},
	
	attemptToClearCutMegatileIncludingResourceTileXY : function(x,y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToClearCutMegatileIncludingResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.attemptToClearCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, false), 
				this.onAttemptToClearCutMegatileIncludingResourceTileXY);
		else console.log("bad input");
	},
	
	getEstimateForClearCutMegatileIncludingResourceTileXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getEstimateForClearCutMegatileIncludingResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToClearCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, true);
		else console.log("bad input");	
	},
	
	/* NEXT STEP IS TO CHANGE TO ACCEPT AN ABOVE AND BELOW DIAMETER FROM IMPACT */
	attemptToDiameterLimitCutMegatileWithResourceTileXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToDiameterLimitCutMegatileWithResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		var cut_above = 8;
		var cut_below = 18;
		if((x || x == 0) && (y || y == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.attemptToDiameterLimitCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, cut_above, cut_below, false), 
				this.onAttemptToDiameterLimitCutMegatileWithResourceTileXY);
		else console.log("bad input");		
	},
	
	/* NEXT STEP IS TO CHANGE TO ACCEPT AN ABOVE AND BELOW DIAMETER FROM IMPACT */
	getEstimateForDiameterLimitCutMegatileWithResourceTileXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.getEstimateForDiameterLimitCutMegatileWithResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToDiameterLimitCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, cut_above, cut_below, true);
		else console.log("bad input");	
	},
	
	attemptToPurchaseMegatileIncludingResourceTileXY : function(x, y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.attemptToPurchaseMegatileWithResourceTileXY", ["x","y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((x || x == 0) && (y || y == 0)){
			this.makeRequestWithCallbackAndTwoUpdateCallsWithCallbacks(
				this.serverAPI.attemptToPurchaseMegatileWithWorldIdPlayerIdAndResourceTileXY(this.gameDataCache.id, this.gameDataCache.player_id, x, y),
				this.onAttemptToPurchaseMegatileIncludingResourceTileXY,
				this.getPlayerStatsPromise,
				this.onGetPlayerStats,		
				this.getPlayersOwnedResourceTilesPromise,
				this.onGetPlayersOwnedResourceTilesWithPlayerId
			);
		}		
		else console.log("bad input");	
	},
	
	conductSurveyOfTileWithXY : function(tile_x, tile_y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.conductSurveyOfTileWithXY", ["tile_x", "tile_y"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.conductSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y), 
				this.onConductSurveyOfTileWithWorldIdAndTileXY);
		else console.log("bad input");	
	},
	
	viewExistingSurveyOfTileWithXY : function(tile_x, tile_y){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.viewExistingSurveyOfTileWithXY", ["tile_id"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.serverAPI.viewExistingSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y);
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
	
	onAttemptToPurchaseUpgrade : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgrade", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseUpgradeResponse(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeFailure : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToPurchaseUpgradeFailure", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));
		console.log("DC.onAttemptToPurchaseUpgradeFailure");
	},
	
	onConductSurveyOfTileWithWorldIdAndTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onConductSurveyOfTileWithWorldIdAndTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onConductSurveyOfTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onViewExistingSurveyOfTileWithWorldIdAndTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onViewExistingSurveyOfTileWithWorldIdAndTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onViewExistingSurveyOfTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		
	},
	
	onAttemptToClearCutMegatileIncludingResourceTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToClearCutMegatileIncludingResourceTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToClearCutMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetEstimateForClearCutMegatileIncludingResourceTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetEstimateForClearCutMegatileIncludingResourceTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetEstimateForClearCutMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");	
	},
	
	onAttemptToDiameterLimitCutMegatileWithResourceTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onAttemptToDiameterLimitCutMegatileWithResourceTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onAttemptToDiameterLimitCutMegatileWithResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		},
	
	
	onGetEstimateForDiameterLimitCutIncludingResourceTileXY : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetEstimateForDiameterLimitCutIncludingResourceTileXY", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetEstimateForDiameterLimitCutIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		
	},

	onGetPlayerStats : function(theStats){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetPlayerStats", ["theStats"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theStats)
			TFglobals.IMPACT.onGetPlayerStats(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theStats));
		else console.log("bad input");
	},
	
	onGetPlayersOwnedResourceTilesWithPlayerId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetPlayersOwnedResourceTilesWithUserIdAndPlayerId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetPlayersOwnedResourceTiles(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetResourceTilesOwnedByOthersWithWorldIdAndPlayerId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetResourceTilesOwnedByOthersWithWorldIdAndPlayerId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetResourceTilesOwnedByOthers(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetPlayersOwnedEquipmentWithWorldIdAndPromise : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.onGetPlayersOwnedEquipmentWithWorldIdAndPromise", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

		if(theResult)
			TFglobals.IMPACT.onGetPlayersOwnedEquipment(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");	},
	
/*****

		HELPER FUNCTIONS
	
*****/	

    makeRequestWithPlayerStatsUpdate : function(request, request_callback){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.makeRequestWithPlayerStatsUpdate", ["request", "request_callback"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

    	this.makeRequestWithCallbackAndUpdateCallWithCallback(request, request_callback,
				this.getPlayerStatsPromise, this.onGetPlayerStats);
    },
    
    makeRequestWithCallbackAndUpdateCallWithCallback : function(request, request_callback, update, update_callback){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.makeRequestWithCallbackAndUpdateCallWithCallback", ["request", "request_callback", "update","update_callback"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

    	var prepare = TFglobals.DATA_CONTROLLER.prepareImpactMessage;
    	var request_response = null;
/**
		var req = request;
		var up = $.Deferred(update);
		up.then(function(update_response){
					console.log("request_response", request_response);
					console.log("update_response", update_response);
					update_callback(prepare(update_response));
					request_callback(prepare(request_response));			
		});
		req.then(function(req_response){
			console.log("req.then called with: ", req_response);
		  						request_response = req_response;
		  						if(!request_response.errors)
									up.resolve();
								else
									request_callback(prepare(req_response));
							});
		req.done(function(rd){
			console.log("req.done called with: ", rd);
		});
		up.done(function(ud){
			console.log("up.done called with: ", ud);		
		});
**/	

		var req = request,
		  chained = req.then(function(req_response){
		  						request_response = req_response;
		  						if(!request_response.errors)
									return update();
							});
		chained.done(function(update_response, success){
		console.log("update_response: ", update_response);
		console.log("success: " + success);
			if(!request_response.errors)
				update_callback(prepare(update_response));
				
			request_callback(prepare(request_response));			
		});

/**
		$.when(request)
		  .done(function(request_response, request_success){
				if(request_response.errors)
					request_callback(prepare(request_response));
				else{
					$.when(update)
					 .done(function(update_response, update_success){
					 console.log("update response: ", update_response);
					 console.log("update_success: ", update_success);
								update_callback(prepare(update_response));
								request_callback(prepare(request_response));
							});
				}
		  });
**/
    },
    
    makeRequestWithCallbackAndTwoUpdateCallsWithCallbacks : function(request, request_callback, update, update_callback, update_two, update_two_callback){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC.makeRequestWithCallbackAndTwoUpdateCallsWithCallbacks", ["request", "request_callback", "update", "update_callback", "update_two", "update_two_callback"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_DEBUGGING_VERBOSE));

    	var prepare = TFglobals.DATA_CONTROLLER.prepareImpactMessage;
    	var response_one = null;
    	var update_response = null;
    	
		var req = request,
		  chained = req.then(function(first_response){
		  						request_response = first_response;
		  						if(!request_response.errors)
									return update();
							}).then(function(second_response){
							if(!request_response.errors){
								update_response = second_response;
								return update_two();
							}
						});
 
		chained.done(function(update_two_response){
		  	if(!request_response.errors){
				update_callback(prepare(update_response));
				update_two_callback(prepare(update_two_response));		
			}
			request_callback(prepare(request_response));
		});
    },

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

