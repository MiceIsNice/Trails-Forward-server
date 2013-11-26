/* 
 *  TrailsForwardDataController.js
 *   
 */

function TrailsForwardDataController(){	
	this.serverAPI = new TrailsForwardServerAPI();
}

TrailsForwardDataController.prototype = {

	constructor : TrailsForwardDataController,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY Impact 
		
*****/

    endTurnForAllPlayers : function(){
    	if(this.gameDataCache.id){
    		console.log("calling this.serverAPI.endTurnForAllPlayers(" + this.gameDataCache.id + ")");
       		this.serverAPI.endTurnForAllPlayers(this.gameDataCache.id);
    	}
        else
        	console.log("No world_id in the gameDataCache");
    },

	logInUserWithEmailAndPassword : function(an_email, a_password){
		if(an_email && a_password)
			this.serverAPI.logInUserWithEmailAndPassword(an_email, a_password);
		else console.log("bad input");
	},
	
	getWorldDataForPlayerId : function(player_id){ 
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
		this.serverAPI.getUserPlayers();
	},
	
	getTilesInRect : function (rect){
		if(rect)
			this.serverAPI.getTilesInRect(rect);
		else console.log("bad input");	
	},
	
	getAvailableContractsForPlayer : function(){
		this.serverAPI.getAvailableContractsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	getPlayerStats : function(){
		this.serverAPI.getPlayerStatsForPlayerId(this.gameDataCache.player_id);
	},
	
	setPlayerBalanceAndTurnPoints : function(new_balance, new_turn_points){
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.setPlayerBalanceAndTurnPointsWithPlayerIdBalanceAndTurnPointsPromise(this.gameDataCache.player_id, new_balance, new_turn_points), 
				this.onSetPlayerBalanceAndTurnPoints);
	},

	getPlayerStatsPromise : function(){
		return TFglobals.DATA_CONTROLLER.serverAPI.getPlayerStatsForPlayerIdPromise(TFglobals.DATA_CONTROLLER.gameDataCache.player_id);
	},
	
	getPlayersOwnedEquipment : function(){
		this.serverAPI.getPlayersOwnedEquipmentWithPlayerIdAndPromise(this.gameDataCache.player_id, false);
	},
	
	getPlayersOwnedEquipmentPromise : function(){
		return this.serverAPI.getPlayersOwnedEquipmentWithPlayerIdAndPromise(this.gameDataCache.player_id, true);
	},
	
	getPlayersOwnedResourceTiles : function(){
		this.serverAPI.getPlayersOwnedResourceTilesWithPlayerIdAndPromise(this.gameDataCache.player_id, false);
	},
	
	getPlayersOwnedResourceTilesPromise : function(){
		return TFglobals.DATA_CONTROLLER.serverAPI.getPlayersOwnedResourceTilesWithPlayerIdAndPromise(TFglobals.DATA_CONTROLLER.gameDataCache.player_id, true);	
	},
	
	getResourceTilesOwnedByOthers : function(){
		this.serverAPI.getResourceTilesOwnedByOthersWithWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	getAvailableUpgradesForPlayer : function(){
		this.serverAPI.getAvailableUpgradesForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
	},
	
	attemptToPurchaseUpgradeWithId : function(equipment_id){
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
		if(contract_id || contract_id == 0)
			this.serverAPI.attemptToAcceptContractWithWorldIdPlayerIdAndContractId(this.gameDataCache.id, this.gameDataCache.player_id, contract_id);
		else console.log("bad input");	
	},

	attemptToClearCutListOfResourceTilesWithWorldId : function(the_tile_ids, world_id){
		this.serverAPI.attemptToClearCutListOfResourceTilesWithWorldId(the_tile_ids, world_id);
	},

	plantSapplingsOnListOfResourceTilesWithWorldIdAndCount : function(the_tile_ids, world_id, sapplings_per_tile){
		this.serverAPI.plantSapplingsOnListOfResourceTilesWithWorldIdAndCount(the_tile_ids, world_id, sapplings_per_tile);
	},

		/* NEED TO REMOVE MEGATILES BEFORE USING THIS */
	attemptToPurchaseResourceTilesWithWorldIdAndPlayerId : function(the_tile_ids, world_id, player_id){
		this.serverAPI.attemptToPurchaseResourceTilesWithWorldIdAndPlayerId(the_tile_ids, world_id, player_id);
	},

	attemptToDiameterLimitCutListOfResourceTilesWithWorldId : function(the_tile_ids, cut_above, cut_below, world_id){
		this.serverAPI.attemptToDiameterLimitCutListOfResourceTilesWithWorldId(the_tile_ids, cut_above, cut_below, world_id);
	},

	getEstimateForClearCutListOfResourceTilesWithWorldId : function(the_tile_ids, world_id){
		this.serverAPI.getEstimateForClearCutListOfResourceTilesWithWorldId(the_tile_ids, world_id);
	},

	getEstimateForDiameterLimitCutListOfResourceTilesWithWorldId : function(the_tile_ids, cut_above, cut_below, world_id){
		this.serverAPI.getEstimateForDiameterLimitCutListOfResourceTilesWithWorldId(the_tile_ids, cut_above, cut_below, world_id);
	},
	
	attemptToClearCutMegatileIncludingResourceTileXY : function(x,y){
		if((x || x == 0) && (y || y == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.attemptToClearCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, false), 
				this.onAttemptToClearCutMegatileIncludingResourceTileXY);
		else console.log("bad input");
	},
	
	getEstimateForClearCutMegatileIncludingResourceTileXY : function(x, y){
		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToClearCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, true);
		else console.log("bad input");	
	},
	
	/* NEXT STEP IS TO CHANGE TO ACCEPT AN ABOVE AND BELOW DIAMETER FROM IMPACT */
	attemptToDiameterLimitCutMegatileIncludingResourceTileXY : function(x, y){
		var cut_above = 8;
		var cut_below = 18;
		if((x || x == 0) && (y || y == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.attemptToDiameterLimitCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, cut_above, cut_below, false), 
				this.onAttemptToDiameterLimitCutMegatileWithResourceTileXY);
		else console.log("bad input");		
	},
	
	/* NEXT STEP IS TO CHANGE TO ACCEPT AN ABOVE AND BELOW DIAMETER FROM IMPACT */
	getEstimateForDiameterLimitCutMegatileIncludingResourceTileXY : function(x, y){
		if((x || x == 0) && (y || y == 0))
			this.serverAPI.attemptToDiameterLimitCutMegatileWithWorldIdResourceTileXYAndEstimate(this.gameDataCache.id, x, y, cut_above, cut_below, true);
		else console.log("bad input");	
	},
	
	attemptToPurchaseMegatileIncludingResourceTileXY : function(x, y){
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
		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.makeRequestWithPlayerStatsUpdate(this.serverAPI.conductSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y), 
				this.onConductSurveyOfTileWithWorldIdAndTileXY);
		else console.log("bad input");	
	},
	
	viewExistingSurveyOfTileWithXY : function(tile_x, tile_y){
		if((tile_x || tile_x == 0) && (tile_x || tile_x == 0))
			this.serverAPI.viewExistingSurveyOfTileWithWorldIdAndTileXY(this.gameDataCache.id, tile_x, tile_y);
		else console.log("bad input");	
	},
	
/*****

		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
*****/

	onGetUserPlayers : function(thePlayers){
		if(thePlayers){
			if(thePlayers.players.length > 0){
				TFglobals.DATA_CONTROLLER.gameDataCache.setUserPlayers(thePlayers.players);
				TFglobals.IMPACT.onGetUserPlayers(thePlayers.players);
			}
			else{
				console.log("no players for user found!");
			}
		}
		else console.log("bad input");	
	},
	
	onLogIn : function(theData){
		if(theData){
			TFglobals.DATA_CONTROLLER.serverAPI._auth_token = theData.auth_token;
			TFglobals.DATA_CONTROLLER.serverAPI._userId = theData.id;
			TFglobals.DATA_CONTROLLER.serverAPI.getUserPlayers();
			TFglobals.IMPACT.onLogin();
		}
		else console.log("bad input");	
	},
	
	onGetWorldData : function(theData){
		if(theData){
			TFglobals.HELPER_FUNCTIONS.addSimplePropertiesFromObjToObj(theData.world, TFglobals.DATA_CONTROLLER.gameDataCache);
			TFglobals.IMPACT.onGetWorldData(theData);
		}
		else console.log("bad input");			
	},

	onGetTilesInRect : function(theTiles){
		if(theTiles)
			TFglobals.IMPACT.onGetMapChunk(theTiles);	
		else console.log("bad input");
	},
	
	onGetAvailableContracts : function(theContracts){
		if(theContracts)
			TFglobals.IMPACT.onGetAvailableContracts(theContracts);
		else console.log("bad input");
	},
	
	onGetAvailableUpgradesForPlayer : function(theUpgrades){
		if(theUpgrades)
			TFglobals.IMPACT.onGetAvailableUpgradesForPlayer(theUpgrades);
		else console.log("bad input");
	},
	
	onAttemptToAcceptContract : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onAttemptToAcceptContract(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseMegatileIncludingResourceTileXY : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgrade : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onAttemptToPurchaseUpgradeResponse(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onAttemptToPurchaseUpgradeFailure : function(theResult){
		console.log("DC.onAttemptToPurchaseUpgradeFailure");
	},
	
	onConductSurveyOfTileWithWorldIdAndTileXY : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onConductSurveyOfTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onViewExistingSurveyOfTileWithWorldIdAndTileXY : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onViewExistingSurveyOfTileWithXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		
	},
	
	onAttemptToClearCutMegatileIncludingResourceTileXY : function(theResult){
		if(theResult)
			console.log("response: ",theResult);
			//TFglobals.IMPACT.onAttemptToClearCutMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetEstimateForClearCutMegatileIncludingResourceTileXY : function(theResult){
		if(theResult)
			console.log("response: ",theResult);
			//TFglobals.IMPACT.onGetEstimateForClearCutMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");	
	},
	
	onAttemptToDiameterLimitCutMegatileWithResourceTileXY : function(theResult){
		if(theResult){
			console.log("response: ",theResult);
			TFglobals.DATA_CONTROLLER.contractComplete(theResult);
			//TFglobals.IMPACT.onAttemptToDiameterLimitCutMegatileIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		}
		else console.log("bad input");		
	},

	onPlantSapplingsOnListOfResourceTilesWithWorldIdAndCount : function(theResult){
		if(theResult){
			console.log("response: ",theResult);
		}
		else console.log("bad input");
	},
	
	onGetEstimateForDiameterLimitCutIncludingResourceTileXY : function(theResult){
		if(theResult)
			console.log("response: ",theResult);
			//TFglobals.IMPACT.onGetEstimateForDiameterLimitCutIncludingResourceTileXY(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");		
	},

	onGetPlayerStats : function(theStats){
		if(theStats)
			TFglobals.IMPACT.onGetPlayerStats(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theStats));
		else console.log("bad input");
	},
	
	onGetPlayersOwnedResourceTilesWithPlayerId : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onGetPlayersOwnedResourceTiles(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetResourceTilesOwnedByOthersWithWorldIdAndPlayerId : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onGetResourceTilesOwnedByOthers(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");
	},
	
	onGetPlayersOwnedEquipmentWithWorldIdAndPromise : function(theResult){
		if(theResult)
			TFglobals.IMPACT.onGetPlayersOwnedEquipment(TFglobals.DATA_CONTROLLER.prepareImpactMessage(theResult));
		else console.log("bad input");	
	},
	
	contractComplete : function(theResult){
		TFglobals.IMPACT.onContractComplete(theResult.contractComplete);
	},
	
	onSetPlayerBalanceAndTurnPoints : function(theResult){
		if(theResult){
			console.log("successfully set user balance and turn points! ", theResult);
		}
		else console.log("bad input");
	},

	onEndTurnForAllPlayers : function(theResult){
		if(theResult){
			console.log("successfully ended turn", theResult);
		}
		else console.log("bad input");		
	},
	
/*****

		HELPER FUNCTIONS
	
*****/	

    makeRequestWithPlayerStatsUpdate : function(request, request_callback){
    	this.makeRequestWithCallbackAndUpdateCallWithCallback(request, request_callback,
				this.getPlayerStatsPromise, this.onGetPlayerStats);
    },
    
    makeRequestWithCallbackAndUpdateCallWithCallback : function(request, request_callback, update, update_callback){
    	var prepare = TFglobals.DATA_CONTROLLER.prepareImpactMessage;
    	var request_response = null;
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
    },
    
    makeRequestWithCallbackAndTwoUpdateCallsWithCallbacks : function(request, request_callback, update, update_callback, update_two, update_two_callback){
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
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(serverResponse);
		if(serverResponse){
			if(serverResponse.errors){
				serverResponse.status = TFglobals.FAILURE;
				console.log("the errors were:",serverResponse.errors);
			}
			else
				serverResponse.status = TFglobals.SUCCESS;
			return serverResponse;
		}
		else console.log("bad input");
	},
	
};

