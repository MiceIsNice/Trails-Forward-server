/* 
 *  TrailsForwardServerAPI object:
 *		- Holds knowledge of how to talk to server 
 *  	- Relies on callback methods in TrailsForwardDataController 
 * 
 */


function TrailsForwardServerAPI(){
	this.SERVER_URL = "http://0.0.0.0:3000";
	//this.SERVER_URL = "http://tfnew.dax.getdown.org";
	this.AUTHENTICATE_USER_URL = "/users/authenticate_for_token.json?";
	this.EMAIL = "email";
	this.PASSWORD = "password";
	this.WORLDS = "/worlds";
	this.NEW = "/new";
	this.JSON = ".json?";
	this.XML = ".xml?";
	this.FORWARD_SLASH = "/";
	this.USERS = "/users";
	this.PLAYERS = "/players";
	this.ACCEPT = "accept";
	this.MEGATILES = "/megatiles";
	this.RESOURCE_TILES = "/resource_tiles";
	this.LOGGING_EQUIPMENT = "/logging_equipment";
	this.CLEARCUT = "/clearcut";
	this.BUY = "/buy";
	this.SURVEYS = "/surveys";
	this.PLAYER_STATS = "/player_stats";
	this.AUTH_TOKEN = "auth_token";
	this.AVAILABLE_CONTRACTS = "/available_contracts";
	this.OWNED_RESOURCE_TILES = "/owned_resource_tiles";
	this.OWNED = "/owned";
	this.OWNED_BY_OTHERS = "/owned_by_others";
	this.PLANT_SAPLINGS = "/plant_saplings";
	this.PLAYER_EQUIPMENT = "/player_equipment";
	this.DIAMETER_LIMIT_CUT = "/diameter_limit_cut";
	this.SET_BALANCE_AND_TURN_POINTS = "/set_player_balance_and_turn_points";
	this.AVAILABLE_LOGGING_EQUIPMENT = "/available"; // this will change to something like 'equipment'
													 // and the server will filter by player type
	this.END_ALL_PLAYER_TURNS = "/end_turn_for_all_players";
	this.UNUSED_NUMBER = "/2";
	this.ID = "id";
	this.OPENING_BRACKET = "&#91";
	this.CLOSING_BRACKET = "&#93";
	this.COMMA = "&#44";
	this.X_MIN = "x_min";
	this.X_MAX = "x_max";
	this.Y_MIN = "y_min";
	this.Y_MAX = "y_max";
	this.AMP = "&";
	this.EQUALS = "=";
	this._userId;
	this._auth_token = "";
};

TrailsForwardServerAPI.prototype = {

	constructor : TrailsForwardServerAPI,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY TrailsForwardDataController OBJECT
		
*****/

    endTurnForAllPlayers : function (world_id){
    	var resourceString = this.buildEndAllPlayerTurnsRSWithWorldId(world_id);
	  	var queryString = this.authString();
    	this.makePutRequest(resourceString, queryString, {}, TFApp.DATA_CONTROLLER.onEndTurnForAllPlayers);
    },

	logInUserWithEmailAndPassword : function(anEmail, aPassword){		
		if(anEmail && aPassword){
			var params = this.buildParameterStringWithNamesAndValues([this.EMAIL, this.PASSWORD], [anEmail, aPassword]);
			this.makeGetRequest(this.AUTHENTICATE_USER_URL, params, TFApp.DATA_CONTROLLER.onLogIn);
		}
		else console.log("bad input");
	},
	
	getWorldDataForWorldId : function(world_id){
		if(world_id || world_id == 0)
			this.makeGetRequest(this.buildWorldRSForWorldId(world_id), this.authString(), TFApp.DATA_CONTROLLER.onGetWorldData);
		else console.log("bad input");
	},

	getUserPlayers : function(){
		if(this._userId){
			var resourceString = this.buildUsersPlayersRSForUserId(this._userId);
			this.makeGetRequest(resourceString, this.authString(), TFApp.DATA_CONTROLLER.onGetUserPlayers);
		}
		else
			console.error("S_API.getUserPlayers: called without a valid this._userId");
	},

	getTilesInRect : function(rect){ 	
		if(rect && 	(rect[this.X_MIN] || rect[this.X_MIN] == 0) && (rect[this.X_MAX] || rect[this.X_MAX] == 0) &&
					(rect[this.Y_MIN] || rect[this.Y_MIN] == 0) && (rect[this.Y_MAX] || rect[this.Y_MAX] == 0)){
			var world_id = TFApp.DATA_CONTROLLER.gameDataCache.id;
			var resourceString = this.buildTilesInRectRSWithWorldIdAndRect(world_id, rect);
			this.makeGetRequest(resourceString, this.authString(), TFApp.DATA_CONTROLLER.onGetTilesInRect);
		}
		else console.log("bad input");
	},
	
	getAvailableContractsForWorldIdAndPlayerId : function(world_id, player_id){	
		if((world_id || world_id == 0) && (player_id || player_id == 0)){
			var resourceString = this.buildAvailableContractTemplatesRSForWorldIdAndPlayerId(world_id, player_id);
			this.makeGetRequest(resourceString, this.authString(), TFApp.DATA_CONTROLLER.onGetAvailableContracts);
		}
		else console.log("bad input");
	},
	
	getPlayersOwnedResourceTilesWithPlayerIdAndPromise : function(player_id, promise){
		if((this._userId || this._userId == 0) && (player_id || player_id == 0)){
			var resourceString = this.buildPlayerResourceTilesRSWithUserIdAndPlayerId(this._userId, player_id);
			var parameterString = this.authString();
			if(promise)
				return this.makeGetRequestPromise(resourceString, parameterString);
			else
				this.makeGetRequest(resourceString, parameterString, TFApp.DATA_CONTROLLER.onGetPlayersOwnedResourceTilesWithPlayerId);
		}
		else console.log("bad input");
	},
	
	getResourceTilesOwnedByOthersWithWorldIdAndPlayerId : function(world_id, player_id){
		if((world_id || world_id == 0) && (player_id || player_id == 0)){
			var resourceString = this.buildGetResourceTilesOwnedByOthersRSWithWorldId(world_id);
			var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["player_id"],[player_id]);
			this.makeGetRequest(resourceString, parameterString, TFApp.DATA_CONTROLLER.onGetResourceTilesOwnedByOthersWithWorldIdAndPlayerId);
		}
		else console.log("bad input");	
	},

	setPlayerBalanceAndTurnPointsWithPlayerIdBalanceAndTurnPointsPromise : function(player_id, new_balance, new_turn_points){
		if((player_id || player_id == 0) && (new_balance || new_balance == 0) && (new_turn_points || new_turn_points == 0)){
			var resourceString = this.buildSetPlayerBalanceAndTurnPointsRSWithUserIdAndPlayerId(this._userId, player_id);
			var queryString = this.authString();
			return this.makePutRequestPromise(resourceString, queryString, {balance : new_balance, turn_points : new_turn_points});
		}
		else console.log("bad input");
	},

	getPlayerStatsForPlayerId : function(player_id){
		if(player_id || player_id == 0){
			var resourceString = this.buildPlayerStatsRSWithUserIdAndPlayerId(this._userId, player_id);
			var queryString = this.authString();
			this.makeGetRequest(resourceString, queryString, TFApp.DATA_CONTROLLER.onGetPlayerStats);	
		}
		else console.log("bad input");		
	},
	
	getPlayerStatsForPlayerIdPromise : function(player_id){
		if(player_id || player_id == 0){
			var resourceString = this.buildPlayerStatsRSWithUserIdAndPlayerId(this._userId, player_id);
			var queryString = this.authString() + this.buildParameterStringWithNamesAndValues(["player_id"],[player_id]);
			return this.makeGetRequestPromise(resourceString, queryString);
		}
		else console.log("bad input");		
	},
	
	getAvailableUpgradesForWorldIdAndPlayerId : function (world_id, player_id){			
		if((world_id || world_id == 0) && (player_id || player_id == 0)){
			var resourceString = this.buildAvailableEquipmentRSForWorldId(world_id);
			this.makeGetRequest(resourceString, this.authString(), TFApp.DATA_CONTROLLER.onGetAvailableUpgradesForPlayer);
		}
		else console.log("bad input");
	},
	
	attemptToPurchaseUpgradeWithWorldIdAndEquipmentId : function(world_id, equipment_id){	
		if((world_id || world_id == 0) && (equipment_id || equipment_id == 0)){
			var resourceString = this.buildPurchaseLoggingEquipmentRSForWorldIdAndEquipmentId(world_id, equipment_id);
			return this.makePutRequestPromise(resourceString, this.authString(), {}, TFApp.DATA_CONTROLLER.onAttemptToPurchaseUpgradeSuccess);
		}
		else console.log("bad input");
	},
	
	attemptToAcceptContractWithWorldIdPlayerIdAndContractId : function(world_id, player_id, contract_id){												
		if((world_id || world_id == 0) && (player_id || player_id == 0) && (contract_id || contract_id == 0)){
			var resourceString = this.buildAcceptContractRSForWorldIdPlayerIdAndContractId(world_id, player_id, contract_id);
			this.sendPostMessage(resourceString, this.authString(), {}, TFApp.DATA_CONTROLLER.onAttemptToAcceptContract);
		}
		else console.log("bad input");
	},
	
	getPlayersOwnedEquipmentWithPlayerIdAndPromise : function(player_id, promise){
		if((player_id || player_id == 0) && (promise == true || promise == false)){
			var resourceString = this.buildPlayersOwnedEquipmentRSWithUserIdAndPlayerId(this._userId, player_id);
			var parameterString = this.authString();
			
			if(promise)
				return this.makeGetRequestPromise(resourceString, parameterString);
			else
				this.makeGetRequest(resourceString, parameterString, TFApp.DATA_CONTROLLER.onGetPlayersOwnedEquipmentWithWorldIdAndPromise);
		}
		else console.log("bad input");
	},
	
	// attemptToClearCutMegatileWithWorldIdResourceTileXYAndEstimate : function(world_id, x, y, the_estimate){												
	// 	if((world_id || world_id == 0) && (x || x == 0) && (y || y == 0)){
	// 		var resourceString = this.buildAttemptToClearCutTileRSWithWorldId(world_id);
	// 		var parameterString = this.authString();
	// 		if(the_estimate)
	// 			this.sendPostMessage(resourceString, parameterString, {tile_x : x, tile_y : y, estimate : the_estimate}, 
	// 									TFApp.DATA_CONTROLLER.onGetEstimateForClearCutMegatileIncludingResourceTileXY);
	// 		else
	// 			return this.sendPostMessagePromise(resourceString, parameterString, {tile_x : x, tile_y : y, estimate : the_estimate});
	// 	}
	// 	else console.log("bad input");
	// },

	attemptToClearCutListOfResourceTilesWithWorldId : function(the_tile_ids, world_id){
		if(the_tile_ids && (world_id || world_id == 0)){
			var resourceString = this.buildAttemptToClearCutTileRSWithWorldId(world_id);
			var parameterString = this.authString();
			return this.sendPostMessagePromise(resourceString, parameterString, {tile_ids : the_tile_ids, estimate : false});
		}
		else console.log("bad input");
	},

	attemptToDiameterLimitCutListOfResourceTilesWithWorldId : function(the_tile_ids, cut_above, cut_below, world_id){
		if(the_tile_ids && (world_id || world_id == 0) && cut_above && cut_below){
			var resourceString = this.buildAttemptToDiameterLimitCutTileRSWithWorldId(world_id);
			var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["above", "below"],[cut_above, cut_below]);
			return this.sendPostMessagePromise(resourceString, parameterString, {tile_ids : the_tile_ids, estimate : false});
		}
		else console.log("bad input");

	},

	getEstimateForClearCutListOfResourceTilesWithWorldId : function(the_tile_ids, world_id){
		if(the_tile_ids && (world_id || world_id == 0)){
			var resourceString = this.buildAttemptToClearCutTileRSWithWorldId(world_id);
			var parameterString = this.authString();
			this.sendPostMessage(resourceString, parameterString, {tile_ids : the_tile_ids, estimate : true}, 
									TFApp.DATA_CONTROLLER.onGetEstimateForClearCutMegatileIncludingResourceTileXY);
		}
		else console.log("bad input");
	},

	getEstimateForDiameterLimitCutListOfResourceTilesWithWorldId : function(the_tile_ids, cut_above, cut_below, world_id){
		if(the_tile_ids && (world_id || world_id == 0) && cut_above && cut_below){
			var resourceString = this.buildAttemptToDiameterLimitCutTileRSWithWorldId(world_id);
			var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["above", "below"],[cut_above, cut_below]);
			this.sendPostMessage(resourceString, parameterString, {tile_ids : the_tile_ids, estimate : true}, 
						TFApp.DATA_CONTROLLER.onGetEstimateForDiameterLimitCutIncludingResourceTileXY);
		}
		else console.log("bad input");

	},
	
	// attemptToDiameterLimitCutMegatileWithWorldIdResourceTileXYAndEstimate : function(world_id, x, y, cut_above, cut_below, the_estimate){		
	// 	if((world_id || world_id == 0) && (x || x == 0) && (y || y == 0)){
	// 		var resourceString = this.buildAttemptToDiameterLimitCutTileRSWithWorldId(world_id);
	// 		var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["above", "below"],[cut_above, cut_below]);
	// 		if(the_estimate)
	// 			this.sendPostMessage(resourceString, parameterString, {tile_x : x, tile_y : y, estimate : the_estimate}, 
	// 									TFApp.DATA_CONTROLLER.onGetEstimateForDiameterLimitCutIncludingResourceTileXY);
	// 		else
	// 			return this.sendPostMessagePromise(resourceString, parameterString, {tile_x : x, tile_y : y, estimate : the_estimate});
	// 	}
	// 	else console.log("bad input");		
	// },

	// attemptToPurchaseMegatileWithWorldIdPlayerIdAndResourceTileXY : function(world_id, player_id, tile_x, tile_y){					
	// 	if((world_id || world_id == 0) && (player_id || player_id == 0) && (tile_x || tile_x == 0) && (tile_y || tile_y == 0)){
	// 		var resourceString = this.buildPurchaseMegatileRSWithWorldId(world_id);
	// 		var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["tile_x", "tile_y", "player_id"], [tile_x, tile_y, player_id]);
	// 		return this.makePutRequestPromise(resourceString, parameterString, {});
	// 	}
	// 	else console.log("bad input");	
	// },

	attemptToPurchaseResourceTilesWithWorldIdAndPlayerId : function(the_tile_ids, world_id, player_id){
		if(the_tile_ids && (world_id || world_id == 0) && (player_id || player_id == 0)){
			var resourceString = this.buildPurchaseMegatileRSWithWorldId(world_id);
			var parameterString = this.authString();
			return this.makePutRequestPromise(resourceString, parameterString, {tile_ids : the_tile_ids});
		}
		else console.log("bad input");
	},
	
	conductSurveyOfTileWithWorldIdAndTileXY : function (world_id, tile_x, tile_y){
		if((world_id || world_id == 0) && (tile_x || tile_x == 0) && (tile_y || tile_y == 0)){
			var resourceString = this.buildSurveyRSWithWorldId(world_id);
			var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["tile_x", "tile_y"], [tile_x, tile_y]);
			return this.sendPostMessagePromise(resourceString, parameterString, {});
		}
		else console.log("bad input");
	},

	viewExistingSurveyOfTileWithWorldIdAndTileXY : function (world_id, tile_x, tile_y){
		if((world_id || world_id == 0) && (tile_x || tile_x == 0) && (tile_y || tile_y == 0)){
			var resourceString = this.buildSurveyRSWithWorldId(world_id);
			var parameterString = this.authString() + this.buildParameterStringWithNamesAndValues(["tile_x", "tile_y"], [tile_x, tile_y]);
			this.makeGetRequest(resourceString, parameterString, TFApp.DATA_CONTROLLER.onViewExistingSurveyOfTileWithWorldIdAndTileXY);		
		}
		else console.log("bad input");
	},

	plantSaplingsOnListOfResourceTilesWithWorldIdAndCount : function(the_tile_ids, world_id, saplings_per_tile){
		if(the_tile_ids && (world_id || world_id == 0) && (saplings_per_tile >= 0)){
			var resourceString = this.buildPlantSaplingsRSWithWortdId(world_id);
			var parameterString =  this.authString();
			this.sendPostMessage(resourceString, parameterString, {tree_count : saplings_per_tile, tile_ids : the_tile_ids}, 
									TFApp.DATA_CONTROLLER.onPlantSaplingsOnListOfResourceTilesWithWorldIdAndCount);
		}
		else console.log("bad input");
	},
	
/*****    

		FUNCTIONS FOR MAKING SERVER REQUESTS
	
*****/	
	
	  /* send GET message to TF server */
	makeGetRequest : function(aResourcePath, urlParameters, aCallbackFunction){												
		if(aResourcePath && urlParameters && (aCallbackFunction || aCallbackFunction == null))
			$.getJSON(this.SERVER_URL + aResourcePath + urlParameters, aCallbackFunction);
		else console.log("bad input");
	},
	
	makeGetRequestPromise : function(aResourcePath, urlParameters){												
		if(aResourcePath && urlParameters)
			return $.getJSON(this.SERVER_URL + aResourcePath + urlParameters, null);
		else console.log("bad input");
	},
	
	  /* send PUT message to TF server */
	makePutRequest : function(aResourcePath, urlParameters, messagePayload, aCallbackFunction, aFailureContinuation){
		if(aResourcePath && urlParameters && messagePayload && aCallbackFunction && aFailureContinuation || aFailureContinuation == null){		
			messagePayload._method = 'PUT';
			$.ajax({
				type: "POST",
				url: this.SERVER_URL + aResourcePath + urlParameters,
				data: messagePayload,
				success: aCallbackFunction,
				fail: aFailureContinuation
			});
		}
		else console.log("bad input");
	},
	
	makePutRequestPromise : function(aResourcePath, urlParameters, messagePayload){	
		if(aResourcePath && urlParameters && messagePayload){		
			messagePayload._method = 'PUT';
			return $.ajax({
				type: "POST",
				url: this.SERVER_URL + aResourcePath + urlParameters,
				data: messagePayload,
			});
		}
		else console.log("bad input");
	},	
	
	  /* send POST message to TF server */
	sendPostMessage : function(aResourcePath, urlParameters, messagePayload, aCallbackFunction){	
		if(aResourcePath && urlParameters && messagePayload && (aCallbackFunction || aCallbackFunction == null))
			$.post(this.SERVER_URL + aResourcePath + urlParameters, messagePayload, aCallbackFunction);
		else console.log("bad input");
	},
	
	sendPostMessagePromise : function(aResourcePath, urlParameters, messagePayload){	
		if(aResourcePath && urlParameters && messagePayload)
			return $.post(this.SERVER_URL + aResourcePath + urlParameters, messagePayload, null);
		else console.log("bad input");
	},


/******

		FUNCTIONS FOR BUILDING PARAMETER STRINGS
	
******/	
	
	  /* example: (["name", "hometown"],["Aaron","Decatur"]) => "&name=Aaron&hometown=Decatur" */
	buildParameterStringWithNamesAndValues : function(aNamesList, aValuesList){												
		if(aNamesList && aValuesList && aNamesList.length == aValuesList.length){
			var theString = "";
			for (var i = 0; i < aNamesList.length; i++)
				theString += "&" + aNamesList[i] + "=" + aValuesList[i];
				
			return theString;
		}
		else console.log("bad input");
	},
	
	  /* produces: "this.ID=this.user_id&this.AUTH_TOKEN=this._auth_token" */
	authString : function(){
		if((this._userId || this._userId == 0) && this._auth_token)
			return this.buildParameterStringWithNamesAndValues([this.ID, this.AUTH_TOKEN], [this._userId, this._auth_token]);
		else console.log("bad input");		
	},
	
	
/*****

		FUNCTIONS FOR BUILDING RESOURCE STRINGS TO ADD TO A URL.  
		'RS' == 'RESOURCE STRING'
	
*****/

	  /* produces: "/worlds/world_id/end_turn_for_all_players.json" */
    buildEndAllPlayerTurnsRSWithWorldId : function (world_id){
		if(world_id) 
			return (this.WORLDS + this.FORWARD_SLASH + world_id + this.END_ALL_PLAYER_TURNS + this.JSON);
		else console.log("bad input");
    },
	
	  /* produces: "/worlds/world_id.json" */
	buildWorldRSForWorldId : function(world_id){
		if(world_id) 
			return (this.WORLDS + this.FORWARD_SLASH + world_id + this.JSON);
		else console.log("bad input");
	},
	
	  /* example: (3, [x_min: 0, x_max: 10, y_min: 0, y_max: 10]) => "/worlds/3/resource_tiles.json?x_min=0&x_max=10&y_min=0&y_max=10" */
	buildTilesInRectRSWithWorldIdAndRect : function(world_id, rect){	
		if(world_id || world_id == 0){
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.JSON + 
					 this.X_MIN + this.EQUALS + rect[this.X_MIN] + this.AMP + 
					 this.X_MAX + this.EQUALS + rect[this.X_MAX] + this.AMP +
					 this.Y_MIN + this.EQUALS + rect[this.Y_MIN] + this.AMP + 
					 this.Y_MAX + this.EQUALS + rect[this.Y_MAX];
		}
		else console.log("bad input");
	},
	
	  /* produces: "/users/user_id/players.json?" */
	buildUsersPlayersRSForUserId : function(user_id){
		if(user_id || user_id == 0)
			return this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.JSON;
		else console.error("bad input");
	},
 
      /* produces: "worlds/world_id/players/player_id/available_contracts.json?" */
 	buildAvailableContractTemplatesRSForWorldIdAndPlayerId : function(world_id, player_id){ 	
 		if((world_id || world_id == 0) && (player_id || player_id == 0))
			return this.resourceStringForWorldIdAndPlayerId(world_id, player_id) + this.AVAILABLE_CONTRACTS + this.JSON;
		else console.log("bad input");
 	},
 	
 	  /* produces: "worlds/world_id/logging_equipment/n/available.json?" 
 	  		note: current path uses an unused id number - change this in time */
 	buildAvailableEquipmentRSForWorldId : function(world_id){ 	
 		if(world_id || world_id == 0)
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.LOGGING_EQUIPMENT + this.UNUSED_NUMBER +
								 this.AVAILABLE_LOGGING_EQUIPMENT + this.JSON;
		else console.log("bad input");

 	},
 	
 	 /* produces: "worlds/world_id/players/player_id" */
 	resourceStringForWorldIdAndPlayerId : function(world_id, player_id){
 		if((world_id || world_id == 0) && (player_id || player_id == 0))
 			return this.WORLDS + this.FORWARD_SLASH + world_id + this.PLAYERS + this.FORWARD_SLASH + player_id;
		else console.log("bad input");
 	},
 	
 	  /* produces Rails compliant array query string 
 	  	 example: ("names",["Aaron", "Nick"]) => "names[]=Aaron&names[]=Nick&" */
 	buildQueryStringArrayWithIdentifierAndValuesList : function (anIdentifier, aValuesList){ 	
 		if(anIdentifier && aValuesList){
			var qs = "";
			for(var i = 0; i < aValuesList.length - 1; i++)
				qs += anIdentifier + "[]=" + aValuesList[i].toString() + "&";
		}
		else console.log("bad input");		
 	},
 	
 	  /*  produces: /worlds/world_id/logging_equipment/equipment_id/buy.json? */
 	buildPurchaseLoggingEquipmentRSForWorldIdAndEquipmentId : function(world_id, equipment_id){ 	
 		if((world_id || world_id == 0) && (equipment_id || equipment_id == 0))
 			return this.WORLDS + this.FORWARD_SLASH + world_id + this.LOGGING_EQUIPMENT + this.FORWARD_SLASH + equipment_id + this.BUY + this.JSON;
		else console.log("bad input");
 	},
 	
 	  /* produces: /worlds/world_id/players/player_id/available_contracts/contract_id/accept.json? */
 	buildAcceptContractRSForWorldIdPlayerIdAndContractId : function(world_id, player_id, contract_id){
 		if((world_id || world_id == 0) && (player_id || player_id == 0) && (contract_id || contract_id == 0))
 			return this.WORLDS + this.FORWARD_SLASH + world_id + this.PLAYERS + this.FORWARD_SLASH + player_id + 
 					this.AVAILABLE_CONTRACTS + this.FORWARD_SLASH + contract_id + this.FORWARD_SLASH + this.ACCEPT + this.JSON;
		else console.log("bad input");			
 	},
 	
 	  /* produces: worlds/world_id/megatiles/this.UNUSED_NUMBER/buy.json?	*/
 	buildPurchaseMegatileRSWithWorldId : function(world_id){
 		if(world_id || world_id == 0)
 			return this.WORLDS + this.FORWARD_SLASH + world_id + this.MEGATILES + this.UNUSED_NUMBER + this.BUY + this.JSON;
		else console.log("bad input");
 	},
 	
 	  /* produces /worlds/world_id/resource_tiles/this.UNUSED_NUMBER/clearcut.json? */
 	buildAttemptToClearCutTileRSWithWorldId : function(world_id){
		if(world_id || world_id == 0)
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.UNUSED_NUMBER + this.CLEARCUT + this.JSON;
		else console.log("bad input");
 	},
 	
 	  /* produces: /worlds/world_id/resource_tiles/this.UNUSED_NUMBER/diameter_limit_cut.json? */
 	buildAttemptToDiameterLimitCutTileRSWithWorldId : function(world_id){
		if(world_id || world_id == 0)
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.UNUSED_NUMBER + this.DIAMETER_LIMIT_CUT + this.JSON;
		else console.log("bad input");	
	},
 	
 	  /* produces: /users/user_id/players/player_id/player_stats.json? */
 	buildPlayerStatsRSWithUserIdAndPlayerId : function(user_id, player_id){
 		if((user_id || user_id == 0) && (player_id || player_id == 0))
 			return this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.FORWARD_SLASH + player_id + this.PLAYER_STATS + this.JSON;
 		else console.log("bad input");	
 	},
 	
 	  /* produces: /worlds/:world_id/megatiles/this.UNUSED_NUMBER/surveys.json? */
 	buildSurveyRSWithWorldId : function(world_id){	
		if(world_id || world_id == 0)
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.MEGATILES + this.UNUSED_NUMBER + this.SURVEYS + this.JSON;
		else console.log("bad input");	
 	},
 	
 	  /* produces: /users/user_id/players/player_id/owned_resource_tiles.json? */
	buildPlayerResourceTilesRSWithUserIdAndPlayerId : function(user_id, player_id){
		if((user_id || user_id == 0) && (player_id || player_id == 0))
			return this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.FORWARD_SLASH + player_id + this.OWNED_RESOURCE_TILES + this.JSON;
		else console.log("bad input")
	},
	
	  /* produces: /worlds/world_id/resource_tiles/this.UNUSED_NUMBER/owned_by_others.json? */
	buildGetResourceTilesOwnedByOthersRSWithWorldId : function(world_id, player_id){
		if(world_id || world_id == 0)
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.UNUSED_NUMBER + this.OWNED_BY_OTHERS + this.JSON;
		else console.log("bad input")
	},
	
	/* produces: /users/user_id/players/player_id/player_equipment(.:format) */
	buildPlayersOwnedEquipmentRSWithUserIdAndPlayerId : function(user_id, player_id){
		if((user_id || user_id == 0) && (player_id || player_id == 0))
			return this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.FORWARD_SLASH + player_id + this.PLAYER_EQUIPMENT + this.JSON;
		else console.log("bad input")		
	},
	
	/* /users/user_id/players/player_id/set_player_balance_and_turn_points.json? */
	buildSetPlayerBalanceAndTurnPointsRSWithUserIdAndPlayerId : function(user_id, player_id){
		if((user_id || user_id == 0) && (player_id || player_id == 0))
			return this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.FORWARD_SLASH + player_id + this.SET_BALANCE_AND_TURN_POINTS + this.JSON;
		else console.log("bad input");
	},

	/* /worlds/world_id/resource_tiles/id/plant_saplings.json? */
	buildPlantSaplingsRSWithWortdId : function(world_id){
		if(world_id || world_id == 0){
			return this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.UNUSED_NUMBER + this.PLANT_SAPLINGS + this.JSON;
		}
		else console.log("bad input");
	},
 
};

