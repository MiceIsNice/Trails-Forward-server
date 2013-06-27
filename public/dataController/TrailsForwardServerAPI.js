function TrailsForwardServerAPI(){
	this.SERVER_URL = "http://tfnew.dax.getdown.org";
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
	this.ID = "id";
	
	this._userId;
	this._auth_token = "";
	
};

TrailsForwardServerAPI.prototype = {

	constructor : TrailsForwardServerAPI,
	
	/***
		'PUBLIC' FUNCTIONS CALLED BY TrailsForwardDataController OBJECT
		
	***/
	

	logInUserWithEmailAndPassword : function(anEmail, aPassword){
		if(anEmail && aPassword){
			var params = this.buildParameterString([this.EMAIL, this.PASSWORD], [anEmail, aPassword]);
			this.makeGetRequest(this.AUTHENTICATE_USER_URL, params, globalNames.DATA_CONTROLLER.onLogIn);
		}
		else
			console.log("TrailsForwardServerAPI.logInUserWithEmailAndPassword received bad email, password combo: " + anEmail + ", " + aPassword);
	},
	
	getWorldDataForWorldId : function(anId){
		if(anId)
			this.makeGetRequest(this.buildWorldRSForWorldNum(anId), this.authString(), globalNames.DATA_CONTROLLER.onGetWorldData);
		else
			console.log("TrailsForwardServerAPI.getWorldDataForWorldId received undefined id");
	},
	

	getUserPlayers : function(){
		if(this._userId){
			var resourceString = this.buildUsersPlayersRSForPlayerNum(this._userId);
			this.makeGetRequest(resourceString, this.authString(), globalNames.DATA_CONTROLLER.onGetUserPlayers);
		}
		else
			console.log("TrailsForwardServerAPI.getUserPlayers: called without a valid this._userId");
	},

	 // We currently have to ask for one megatile at a time, a 3 x 3 block of resource tiles
	loadMapSectionWithXYOriginAndLengthWidth : function(x, y, length, width){
		var total_blocks = length * width;
		this.blocks_to_get = total_blocks;
		var world_id = globalNames.DATA_CONTROLLER.gameDataCache.id;
		
		/* JUST FOR TESTING */
		total_blocks = 256;
		this.blocks_to_get = 256;
		
		if(globalNames.FULL_DEBUGGING) console.log("TrailsForwardServerAPI.loadMapSectionWithXYOriginAndLengthWidth: asking for " + 
						total_blocks + "blocks from server");
						
		for(var i = 1; i <= total_blocks; i++)
			this.makeGetRequest(this.buildMegatileRSForWorldNumAndId(world_id, i), this.authString(), globalNames.SERVER_API.mapStagingArea);
	},
	
	mapStagingArea : function(theData){
		globalNames.SERVER_API.blocks_to_get--;
		globalNames.DATA_CONTROLLER.storeTileSection(theData);
		if(globalNames.FULL_DEBUGGING) console.log("mapStagingArea received megatile " + theData.megatile.id);
		if(globalNames.SERVER_API.blocks_to_get == 0)
			globalNames.DATA_CONTROLLER.onGetTileBlock(globalNames.SERVER_API.starting_block);
	},
	
	getTileBlockWithStartId : function(anId){
		var world_id = globalNames.DATA_CONTROLLER.gameDataCache.id;
		var total_blocks = globalNames.BLOCK_SIZE * globalNames.BLOCK_SIZE;
		this.starting_block = anId;
		this.blocks_to_get = total_blocks;
		var lastBlock = anId + this.blocks_to_get - 1;
		
		console.log("making a server request for blocks " + anId + " to " + lastBlock);
		for(var i = anId; i < anId + total_blocks; i++)
			this.makeGetRequest(this.buildMegatileRSForWorldNumAndId(world_id, i), this.authString(), globalNames.SERVER_API.mapStagingArea);	
	},


	
	/***    
		FUNCTIONS FOR MAKING SERVER REQUESTS
	
	***/	
	
	
	makeGetRequest : function(aResourcePath, urlParameters, aCallbackFunction){
		if(aResourcePath && urlParameters && (aCallbackFunction || aCallbackFunction == null)){		
			if(globalNames.FULL_DEBUGGING) console.log("TrailsForwardServerAPI.makeGetRequest using url: " + this.SERVER_URL + aResourcePath + urlParameters);
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
			if(globalNames.FULL_DEBUGGING) console.log("made the parameter string: " + theString);
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
	
	
	/***    
		FUNCTIONS FOR BUILDING RESOURCE STRINGS TO ADD TO A URL.  
		'RS' == 'RESOURCE STRING'
	
	***/
	
	buildWorldRSForWorldNum : function(worldNum){
		var resourceString = this.WORLDS + this.FORWARD_SLASH + worldNum + this.JSON;
		if(globalNames.FULL_DEBUGGING) console.log("TrailsForwardServerAPI.buildWorldResourceStringForWorldNum made: " + resourceString);
			
		return resourceString;
	},
	
	buildMegatileRSForWorldNumAndId : function(aWorldNum, anId){
		return resourceString = this.WORLDS + this.FORWARD_SLASH + aWorldNum +
								this.MEGATILES + this.FORWARD_SLASH + anId + this.JSON;
	},
	
	buildUsersPlayersRSForPlayerNum : function(playerNum){
		var resourceString = this.USERS + this.FORWARD_SLASH + playerNum + this.PLAYERS + this.JSON;
		if(globalNames.FULL_DEBUGGING) console.log("TrailsForwardServerAPI.buildUsersPlayersRSForPlayerNum made: " + resourceString);
		
		return resourceString
	},
 
};
