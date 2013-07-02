/* 
 *  TrailsForwardServerAPI object:
 *		- Holds knowledge of how to talk to server 
 *  	- Relies on callback methods in TrailsForwardDataController 
 * 
 */


function TrailsForwardServerAPI(){
	this.SERVER_URL = "http://localhost:3000";
	this.AUTHENTICATE_USER_URL = "/users/authenticate_for_token.json?";
	this.EMAIL = "email";
	this.PASSWORD = "password";
	this.WORLDS = "/worlds";
	this.JSON = ".json?";
	this.FORWARD_SLASH = "/";
	this.USERS = "/users";
	this.PLAYERS = "/players";
	this.MEGATILES = "/megatiles";
	this.AUTH_TOKEN = "auth_token";
	this.AVAILABLE_CONTRACTS = "/available_contracts";
	this.ID = "id";
	
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
			var params = this.buildParameterString([this.EMAIL, this.PASSWORD], [anEmail, aPassword]);
			this.makeGetRequest(this.AUTHENTICATE_USER_URL, params, TFglobals.DATA_CONTROLLER.onLogIn);
		}
		else
			console.log("TrailsForwardServerAPI.logInUserWithEmailAndPassword received bad email, password combo: " + anEmail + ", " + aPassword);
	},
	
	getWorldDataForWorldId : function(anId){
		if(anId)
			this.makeGetRequest(this.buildWorldRSForWorldId(anId), this.authString(), TFglobals.DATA_CONTROLLER.onGetWorldData);
		else
			console.log("TrailsForwardServerAPI.getWorldDataForWorldId received undefined id");
	},
	

	getUserPlayers : function(){
		if(this._userId){
			var resourceString = this.buildUsersPlayersRSForPlayerId(this._userId);
			this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetUserPlayers);
		}
		else
			console.log("TrailsForwardServerAPI.getUserPlayers: called without a valid this._userId");
	},

	 // We currently have to ask for one megatile at a time, a 3 x 3 block of resource tiles
	loadMapSectionWithXYOriginAndLengthWidth : function(x, y, length, width){
		var total_blocks = length * width;
		this.blocks_to_get = total_blocks;
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		
		/* JUST FOR TESTING */
		total_blocks = 256;
		this.blocks_to_get = 256;
		
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.loadMapSectionWithXYOriginAndLengthWidth: asking for " + 
						total_blocks + "blocks from server");
						
		for(var i = 1; i <= total_blocks; i++)
			this.makeGetRequest(this.buildMegatileRSForWorldIdAndId(world_id, i), this.authString(), TFglobals.SERVER_API.mapStagingArea);
	},
	
	mapStagingArea : function(theData){
		TFglobals.SERVER_API.chunks_to_get--;
		TFglobals.DATA_CONTROLLER.storeTiles(theData);
		if(TFglobals.FULL_DEBUGGING == true) console.log("mapStagingArea received megatile " + theData.megatile.id);
		if(TFglobals.SERVER_API.chunks_to_get == 0)
			TFglobals.DATA_CONTROLLER.onGetMapChunk(TFglobals.SERVER_API.starting_chunk);
	},
	
	getMapChunkWithStartId : function(anId){
		var world_id = TFglobals.DATA_CONTROLLER.gameDataCache.id;
		var total_chunks = TFglobals.CHUNK_WIDTH * TFglobals.CHUNK_WIDTH;
		this.starting_chunk = anId;
		this.chunks_to_get = total_chunks;
		var lastChunk = anId + this.chunks_to_get - 1;
		
		console.log("making a server request for blocks " + anId + " to " + lastChunk);
		for(var i = anId; i < anId + total_chunks; i++)
			this.makeGetRequest(this.buildMegatileRSForWorldIdAndId(world_id, i), this.authString(), TFglobals.SERVER_API.mapStagingArea);	
	},
	
	getAvailableContractsForWorldIdAndPlayerId : function(worldId, playerId){
		var resourceString = this.buildAvailableContractsRSForWorldIdAndPlayerId(worldId, playerId);
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.getAvailableContractsForWorldIdAndPlayerId asking for contracts for world, player: " 
															+ worldId + ", " + playerId);
		this.makeGetRequest(resourceString, this.authString(), TFglobals.DATA_CONTROLLER.onGetAvailableContracts);
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
			console.log("TrailsForwardServerAPI.makeGetRequest received bad resourcePath, urlParameters, callbackFunction 3-tuple: " + 
							aResourcePath + ", " + urlParameters + ", " + aCallbackFunction);
	},
	
	

	/***    
		FUNCTIONS FOR BUILDING PARAMETER STRINGS
	
	***/	
	
	
	buildParameterString : function(aNamesList, aValuesList){
		if(aNamesList && aValuesList && aNamesList.length == aValuesList.length){
			var theString = "";
			for (var i = 0; i < aNamesList.length; i++){
				theString += "&" + aNamesList[i] + "=" + aValuesList[i];
			}
			if(TFglobals.FULL_DEBUGGING) console.log("made the parameter string: " + theString);
			return theString;
		}
		else
			console.log("TrailsForwardServerAPI.buildParameterString should have two equal length arrays but received: " + 
							aNamesList + " of length: " + aNamesList.length + ", and " +  aValuesList + " of length: " + 
							aValuesList.length);
	},
	
	authString : function(){
		return this.buildParameterString([this.ID, this.AUTH_TOKEN], [this._userId, this._auth_token]);
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
	
	buildUsersPlayersRSForPlayerId : function(playerId){
		var resourceString = this.USERS + this.FORWARD_SLASH + playerId + this.PLAYERS + this.JSON;
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.buildUsersPlayersRSForPlayerId made: " + resourceString);
		
		return resourceString;
	},
 
 	buildAvailableContractsRSForWorldIdAndPlayerId : function(worldId, playerId){
		var resourceString = this.WORLDS + this.FORWARD_SLASH + worldId + this.PLAYERS + this.FORWARD_SLASH 
								+ playerId + this.AVAILABLE_CONTRACTS + this.JSON;
		if(TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardServerAPI.buildUsersPlayersRSForPlayerId made: " + resourceString);
		
		return resourceString;
 	},
 
};
