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
}

TrailsForwardDataController.prototype = {

	constructor : TrailsForwardDataController,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY Impact 
		
*****/
	
	logInUserWithEmailAndPassword : function(anEmail, aPassword){
		this.serverAPI.logInUserWithEmailAndPassword(anEmail, aPassword);
	},

        logInWithCookies : function(){
               // this.onLogIn();
    		this.serverAPI.logInUserWithEmailAndPassword("aaron.tietz@tufts.edu", "letmein");
        },     
	
	getWorldDataForPlayerId : function(anId){
		this.gameDataCache.player_id = anId;
		var player = this.gameDataCache.getPlayerById(anId);
		if(player && player.world_id)
			this.serverAPI.getWorldDataForWorldId(player.world_id);
		else
			console.log("TrailsForwardDataController.getWorldDataForPlayerId found no world for player_id: " + anId);
	},
	
	getUserPlayers : function(){
		if(this.gameDataCache.getUserPlayers())
			TFglobals.IMPACT.onGetPlayers(this.gameDataCache.userPlayers);
		else
			this.serverAPI.getUserPlayers();
	},
	
	getMapChunkWithStartId : function(anId){
		var theChunk = this.gameDataCache.getMapChunkWithStartId(anId);
		if(theChunk[0] != null){
			if(TFglobals.FULL_DEBUGGING == true) console.log("getTileBlockWithStartId: requested map data was cached");	
			TFglobals.IMPACT.onGetMapChunk(theChunk);
		}
		else {
			if(TFglobals.FULL_DEBUGGING == true) console.log("getTileBlockWithStartId: calling serverAPI.getTileBlockWithStartId");
			this.serverAPI.getMapChunkWithStartId(anId);
		}
	},
	
	getAvailableContractsForPlayer : function(){
		var worldId = this.gameDataCache.id;
		var playerId = this.gameDataCache.player_id;
		var theContracts = this.gameDataCache.getAvailableContractsForPlayer();
		if(theContracts.length != 0){
			if(TFglobals.FULL_DEBUGGING == true) console.log("getAvailableContractsForUser: data was cached and fresh");	
			TFglobals.IMPACT.onGetAvailableContracts(theContracts);	
		}
		else{
			if(TFglobals.FULL_DEBUGGING == true) console.log("getAvailableContractsForUser: calling serverAPI.getAvailableContractsForWorldIdAndPlayerId");	
			this.serverAPI.getAvailableContractsForWorldIdAndPlayerId(worldId, playerId);
		}
	},
	
	
	
/*****

		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
*****/
	
	
	storeTiles : function(theData){
		this.gameDataCache.storeTiles(theData.megatile);
	},
	
	onGetUserPlayers : function(theData){
		TFglobals.DATA_CONTROLLER.gameDataCache.setUserPlayers(theData.players);
		TFglobals.IMPACT.onGetUserPlayers(theData.players);
	},
	
	onLogIn : function(theData){
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
	
	onGetMapChunk : function(startId){
		var theChunk = this.gameDataCache.getMapChunkWithStartId(startId);
		TFglobals.IMPACT.onGetMapChunk(theChunk);
	},
	
	onGetAvailableContracts : function(theContracts){
		TFglobals.DATA_CONTROLLER.gameDataCache.setAvailableContractsForPlayer(theContracts);
		TFglobals.IMPACT.onGetAvailableContracts(theContracts);
	}
	
};

