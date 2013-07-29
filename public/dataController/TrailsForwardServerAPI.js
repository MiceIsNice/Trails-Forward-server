/* 
 *  TrailsForwardServerAPI object:
 *		- Holds knowledge of how to talk to server 
 *  	- Relies on callback methods in TrailsForwardDataController 
 * 
 */


function TrailsForwardServerAPI(){
	this.SERVER_URL = "http://localhost:3000";
	//this.SERVER_URL = "http://tfnew.dax.getdown.org";
	this.AUTHENTICATE_USER_URL = "/users/authenticate_for_token.json?";
	this.EMAIL = "email";
	this.PASSWORD = "password";
	this.WORLDS = "/worlds";
	this.NEW = "/new";
	this.JSON = ".json?";
	this.FORWARD_SLASH = "/";
	this.USERS = "/users";
	this.PLAYERS = "/players";
	this.MEGATILES = "/megatiles";
	this.RESOURCE_TILES = "/resource_tiles";
	this.AUTH_TOKEN = "auth_token";
	this.AVAILABLE_CONTRACTS = "/available_contracts";
	this.AVAILABLE_EQUIPMENT = "/logging_equipment"; // this will change to something like 'equipment'
													 // and the server will filter by player type
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
	

	logInUserWithEmailAndPassword : function(anEmail, aPassword){
		if(anEmail && aPassword){
			var params = this.buildParameterStringWithNamesAndValues([this.EMAIL, this.PASSWORD], [anEmail, aPassword]);
			this.makeGetRequest(this.AUTHENTICATE_USER_URL, params, TFglobals.DATA_CONTROLLER.onLogIn);
		}
		else
			console.log("S_API.logInUserWithEmailAndPassword received bad email, password combo: " + anEmail + ", " + aPassword);
	},
	
	getWorldDataForWorldId : function(anId){
		if(anId)
			this.makeGetRequest(this.buildWorldRSForWorldId(anId), this.authString(), TFglobals.DATA_CONTROLLER.onGetWorldData);
		else
			console.log("S_API.getWorldDataForWorldId received undefined id");
	},
	

	getUserPlayers : function(){
		if(this._userId){
			var resourceString = this.buildUsersPlayersRSForPlayerId(this._userId);
			this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetUserPlayers);
		}
		else
			console.log("S_API.getUserPlayers: called without a valid this._userId");
	},

/**
	 // We currently have to ask for one megatile at a time, a 3 x 3 block of resource tiles
	loadMapSectionWithXYOriginAndLengthWidth : function(x, y, length, width){
		var total_blocks = length * width;
		this.blocks_to_get = total_blocks;
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		
		//
		total_blocks = 256;
		this.blocks_to_get = 256;
		
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.loadMapSectionWithXYOriginAndLengthWidth: asking for " + 
						total_blocks + "blocks from server");
						
		for(var i = 1; i <= total_blocks; i++)
			this.makeGetRequest(this.buildMegatileRSForWorldIdAndId(world_id, i), this.authString(), TFglobals.SERVER_API.mapStagingArea);
	},
	
	mapStagingArea : function(theData){
		TFglobals.SERVER_API.chunks_to_get--;
		TFglobals.DATA_CONTROLLER.storeTiles(theData);
		if(TFglobals.FULL_DEBUGGING == true) console.log("mapStagingArea received megatile " + theData.megatile.id);
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theData);
		if(TFglobals.SERVER_API.chunks_to_get == 0)
			TFglobals.DATA_CONTROLLER.onGetMapChunk(TFglobals.SERVER_API.starting_chunk);
	},
	
	getMapChunkWithId : function(anId){
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		this.chunks_to_get = 1;

        var total_chunks = 6;
		this.chunks_to_get = total_chunks;
		var lastChunk = anId + this.chunks_to_get - 1;
		
		console.log("making a server request for blocks " + anId + " to " + lastChunk);
		for(var i = anId; i < anId + total_chunks; i++)

		this.makeGetRequest(this.buildMegatileRSForWorldIdAndId(world_id, anId), this.authString(), TFglobals.SERVER_API.mapStagingArea);	
	},
	
	getMapChunksWithIds : function(someIds){
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		var rs = this.buildMegatileRSForWorldIdAndId(world_id, 1);
		var qs = this.authString() + "&" + this.buildQueryStringArrayWithIdentifierAndValues("ids", someIds);
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.getMapChunksWithIds: making get request");
		this.makeGetRequest(rs, qs, TFglobals.DATA_CONTROLLER.onGetMapChunks);
	},
**/

	getTilesInRect : function(rect){
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		var resourceString = this.buildTilesInRectRSWithWorldIdAndRect(world_id, rect);
		this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetTilesInRect);
	},
	
	getAvailableContractsForWorldIdAndPlayerId : function(worldId, playerId){
		var resourceString = this.buildAvailableContractsRSForWorldIdAndPlayerId(worldId, playerId);
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.getAvailableContractsForWorldIdAndPlayerId asking for contracts for world, player: " 
															+ worldId + ", " + playerId);
		this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetAvailableContracts);
	},
	
	makeLumberJackForUserInWorld : function(user_id, world_id){
		var resourceString = this.buildMakeLumberJackRSForUserIdAndWorldId(user_id, world_id);
		var names = ["world_id","user_id","player_type"];
		var values = [world_id, user_id, "Lumberjack"];

		var queryString = this.authString() + this.buildParameterStringWithNamesAndValues(names, values);
		console.log("S_API: trying to make a lumberjack");
		//this.makeGetRequest(resourceString, queryString, TFglobals.DATA_CONTROLLER.getUserPlayers());
		this.makeGetRequest(resourceString, queryString, this.gotLumberJack());
		//this.sendPostMessage(resourceString, this.authString(), 
		 //      	this.buildPostMessageObjectWithNamesAndValues(names, values), this.gotLumberJack());
	},
	
	gotLumberJack : function(data){
		console.log("Did I get a lumberjack? You tell me:");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(data);
	},
	
	getPlayerStats : function(){
	
	},
	
	getAvailableUpgradesForWorldIdAndPlayerId : function (world_id, player_id){
		//var resourceString = this.buildAvailableEquipmentRSForWorldIdAndPlayerId(world_id, player_id);
		var resourceString = this.AVAILABLE_EQUIPMENT + this.JSON;
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.getAvailableUpgradesForWorldIdAndPlayerId asking for upgrades for world, player: " 
															+ world_id + ", " + player_id);
		this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetAvailableUpgradesForPlayer);
	},
	
	attemptToPurchaseUpgradeWithName : function(upgradeName){
	
	},
	
	attemptToPurchaseTileWithLocation : function(x, y){
	
	},
	
	requestSurveyForTileWithLocation : function(x, y){

	},

	
/*****    

		FUNCTIONS FOR MAKING SERVER REQUESTS
	
*****/	
	
	
	makeGetRequest : function(aResourcePath, urlParameters, aCallbackFunction){
		if(aResourcePath && urlParameters && (aCallbackFunction || aCallbackFunction == null)){		
			if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.makeGetRequest using url: " + this.SERVER_URL + aResourcePath + urlParameters);
			$.getJSON(this.SERVER_URL + aResourcePath + urlParameters, aCallbackFunction);
		}
		else
			console.log("S_API.makeGetRequest received bad resourcePath, urlParameters, callbackFunction 3-tuple: " + 
							aResourcePath + ", " + urlParameters + ", " + aCallbackFunction);
	},
	
	sendPostMessage : function(aResourcePath, urlParameters, messageData, aCallbackFunction){
		if(aResourcePath && urlParameters && messageData && (aCallbackFunction || aCallbackFunction == null)){		
			if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.sendPostMessage using url: " + this.SERVER_URL + aResourcePath + urlParameters + "with message: " + messageData);
			$.post(this.SERVER_URL + aResourcePath + urlParameters, messageData, aCallbackFunction);
		}
		else
			console.log("S_API.sendPostMessage received bad resourcePath, urlParameters, messageData, callbackFunction 4-tuple: " + 
							aResourcePath + ", " + urlParameters + ", " + messageData + ", " + aCallbackFunction);
	},

	/***    
		FUNCTIONS FOR BUILDING PARAMETER STRINGS
	
	***/	
	
	
	buildParameterStringWithNamesAndValues : function(aNamesList, aValuesList){
		if(aNamesList && aValuesList && aNamesList.length == aValuesList.length){
			var theString = "";
			for (var i = 0; i < aNamesList.length; i++){
				theString += "&" + aNamesList[i] + "=" + aValuesList[i];
			}
			if(TFglobals.FULL_DEBUGGING) console.log("made the parameter string: " + theString);
			return theString;
		}
		else
			console.log("TrailsForwardServerAPI.buildParameterStringWithNamesAndValues should have two equal length arrays but received: " + 
							aNamesList + " of length: " + aNamesList.length + ", and " +  aValuesList + " of length: " + 
							aValuesList.length);
	},
	
	authString : function(){
		return this.buildParameterStringWithNamesAndValues([this.ID, this.AUTH_TOKEN], [this._userId, this._auth_token]);
	},
	
	
/*****

		FUNCTIONS FOR BUILDING RESOURCE STRINGS TO ADD TO A URL.  
		'RS' == 'RESOURCE STRING'
	
*****/
	
	buildWorldRSForWorldId : function(worldNum){
		var resourceString = this.WORLDS + this.FORWARD_SLASH + worldNum + this.JSON;
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.buildWorldResourceStringForWorldNum made: " + resourceString);
			
		return resourceString;
	},
	
	buildMegatileRSForWorldIdAndId : function(worldId, anId){
		return resourceString = this.WORLDS + this.FORWARD_SLASH + worldId +
								this.MEGATILES + this.FORWARD_SLASH + anId + this.JSON;
	},
	
	buildMegatileRSForWorldIdAndIds : function(worldId, someIds){
		return resourceString = this.WORLDS + this.FORWARD_SLASH + worldId +
								this.MEGATILES + this.FORWARD_SLASH + this.buildQueryStringArrayWithValues("ids", someIds) + this.JSON;
	},
	
	buildTilesInRectRSWithWorldIdAndRect : function(world_id, rect){
		resourceString = this.WORLDS + this.FORWARD_SLASH + world_id + this.RESOURCE_TILES + this.JSON + 
						 this.X_MIN + this.EQUALS + rect[this.X_MIN] + this.AMP + 
						 this.X_MAX + this.EQUALS + rect[this.X_MAX] + this.AMP +
						 this.Y_MIN + this.EQUALS + rect[this.Y_MIN] + this.AMP + 
						 this.Y_MAX + this.EQUALS + rect[this.Y_MAX];
	 	if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.buildTilesInRectRSWithWorldIdAndRect made: " + resourceString);
	 	 return resourceString;
	},
	
	buildUsersPlayersRSForPlayerId : function(playerId){
		var resourceString = this.USERS + this.FORWARD_SLASH + playerId + this.PLAYERS + this.JSON;
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.buildUsersPlayersRSForPlayerId made: " + resourceString);
		
		return resourceString;
	},
 
 	buildAvailableContractsRSForWorldIdAndPlayerId : function(world_id, player_id){
		var resourceString = this.resourceStringForWorldIdAndPlayerId(world_id, player_id) + this.AVAILABLE_CONTRACTS + this.JSON;
		
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.buildUsersPlayersRSForPlayerId made: " + resourceString);
		return resourceString;
 	},
 	
 	buildAvailableEquipmentRSForWorldIdAndPlayerId : function(world_id, player_id){
		var resourceString = this.resourceStringForWorldIdAndPlayerId(world_id, player_id) + this.AVAILABLE_EQUIPMENT + this.JSON;
		
		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.buildUsersPlayersRSForPlayerId made: " + resourceString);
		return resourceString;
 	},
 	
 	 /* worlds/n/players/n */
 	resourceStringForWorldIdAndPlayerId : function(world_id, player_id){
 		return this.WORLDS + this.FORWARD_SLASH + world_id + this.PLAYERS + this.FORWARD_SLASH + player_id;
 	},
 	
 	buildQueryStringArrayWithIdentifierAndValues : function (theIdentifier, theValues){
 		var qs = "";
 		for(var i = 0; i < theValues.length - 1; i++)
 		 	qs += theIdentifier + "[]=" + theValues[i].toString() + "&";
 		 	
 		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.buildQueryStringArrayWithValues: made: " + qs);
 		return qs;
 	},
 	
 	buildPostMessageObjectWithNamesAndValues : function(aNamesList, aValuesList){
 	  var obj = {};
		if(aNamesList && aValuesList && aNamesList.length == aValuesList.length){
			for (var i = 0; i < aNamesList.length; i++)
				obj[aNamesList[i]] = aValuesList[i];

			if(TFglobals.FULL_DEBUGGING){
				console.log("S_API.buildPostMessageObjectWithNamesAndValues made: ");
				TFglobals.HELPER_FUNCTIONS.prettyPrintObject(obj);
			}
			return obj;
		}
		else
			console.log("S_API.buildPostMessageObjectWithNamesAndValues should have two equal length arrays but received: " + 
						aNamesList + " of length: " + aNamesList.length + ", and " +  aValuesList + " of length: " + 
						aValuesList.length);
 	},
 	
 	 /* /users/:user_id/players/new(.:format) */
 	buildMakeLumberJackRSForUserIdAndWorldId : function(user_id, world_id){
 		var resourceString = this.USERS + this.FORWARD_SLASH + user_id + this.PLAYERS + this.NEW + this.JSON;
 		if(TFglobals.FULL_DEBUGGING == true) console.log("S_API.buildMakeLumberJackRSForUserIdAndWorldId made: " + resourceString);
		return resourceString;
 	},
 	
 	addArrayElement : function(previousValue, currentValue, index, array){
 		console.log("previous value: " + previousValue);
 		console.log("currentValue" + currentValue);
 		//var theValue = previousValue + currentValue;
 		//console.log(""):
 		return previousValue += currentValue.toString += (index == 0 || index == array.length -1) ? "" : this.COMMA;
 	},
 
};

