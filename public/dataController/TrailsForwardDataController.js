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
	
	/** CURRENTLY USING THIS WITH THE EXISTING IMPACT INTERFACE **/
/*
	getMapChunkWithStartId : function(anId){
		this.serverAPI.getMapChunksWithIds([1,2,3,4,5,6,7,8]);
		//this.getMapChunkWithId(anId);
	},
	
	getMapChunksWithIds : function(someIds){
		someIds.map(this.getMapChunkWithId);
	},
	
	getMapChunkWithId : function(anId){
	
		if(TFglobals.DATA_CONTROLLER.gameDataCache.chunkIsFresh(anId)){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getMapChunkWithId: cached data is fresh");	
			TFglobals.IMPACT.onGetMapChunk(TFglobals.DATA_CONTROLLER.gameDataCache.getMapChunkWithId(anId));
		}
		else {
	
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getTileBlockWithStartId: calling serverAPI.getMapChunkWithId for chunk id: " + anId);
			TFglobals.DATA_CONTROLLER.serverAPI.getMapChunkWithId(anId);
		} 
	},
*/
	getTilesInRect : function (rect){
		if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getTilesInRect: calling serverAPI.getTilesInRect");
		this.serverAPI.getTilesInRect(rect);
	},
	
	getAvailableContractsForPlayer : function(){
		if(this.validContracts){
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableContractsForUser: cached data is fresh");	
			TFglobals.IMPACT.onGetAvailableContracts(this.gameDataCache.getAvailableContractsForPlayer());		
		}
		else{
			if(TFglobals.FULL_DEBUGGING == true) console.log("DC.getAvailableContractsForUser: calling serverAPI.getAvailableContractsForWorldIdAndPlayerId");	
			this.serverAPI.getAvailableContractsForWorldIdAndPlayerId(this.gameDataCache.id, this.gameDataCache.player_id);
		}
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
	
	attemptToPurchaseUpgradeWithName : function(upgradeName){
		//this.serverAPI.attemptToPurchaseUpgradeWithName(upgradeName)
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


/**	
	onGetMapChunk : function(chunkId){
		var theChunk = this.gameDataCache.getMapChunkWithId(chunkId);

			//THIS IS COMING BACK EMPTY.  NEXT: LOOK AT HOW THE TILE STAGING AREA.  FIGURE OUT A 
			//	WAY TO STAGE MULTIPLE CHUNKS, SEND EACH TO IMPACT WHEN DONE (AND STORE), AND 
			//	TO ASK FOR TILES NOT RECEIVED (OR SHOULD THAT BE ON IMPACT'S SIDE OF THINGS?)
	
		console.log("I believe I have a valid chunk: ");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theChunk);
		this.gameDataCache.chunkQueue.push(chunkId);
		TFglobals.IMPACT.onGetMapChunk(theChunk);
	},
	
	onGetMapChunks : function(theChunks){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("DC.onGetMapChunks: got chunks:");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theChunks);	
		}
		var result = new Array();
		result.push(theChunks.megatile);
		TFglobals.IMPACT.onGetMapChunk(result);
	},
**/

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
		TFglobals.DATA_CONTROLLER.validContracts = true;
		TFglobals.DATA_CONTROLLER.gameDataCache.setAvailableContractsForPlayer(theContracts);
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
	
	onAttemptToPurchaseTile : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("onAttemptToPurchaseTile got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onAttemptToPurchaseTile(theResult);
	},
	
	onAttemptToPurchaseUpgrade : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("onAttemptToPurchaseUpgrade got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onAttemptToPurchaseUpgrade(theResult);
	},
	
	onRequestSurveyForTile : function(theResult){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("onRequestSurveyForTile got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theResult);
		}
		TFglobals.IMPACT.onRequestSurveyForTile(theResult);
	},

	/* store stats in the cache and pass them to Impact */
	onGetPlayerStats : function(theStats){
		if(TFglobals.FULL_DEBUGGING == true){
			console.log("onGetPlayerStats got: ");
			TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theStats);
		}
		TFglobals.DATA_CONTROLLER.validPlayerStats = true;
		TFglobals.DATA_CONTROLLER.gameDataCache.setPlayerStats(theStats);
		TFglobals.IMPACT.onGetPlayerStats(theStats);
	},
	
};

