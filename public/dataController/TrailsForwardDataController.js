/* TrailsForwardDataController.js
 * 	Responsible for negotiating between cached data on the client, 
 *   
 */

function TrailsForwardDataController(){
	this.serverAPI = new TrailsForwardServerAPI();
	this.gameDataCache = new TrailsForwardGameDataCache();
}

TrailsForwardDataController.prototype = {

	constructor : TrailsForwardDataController,
	
	logInUserWithEmailAndPassword : function(anEmail, aPassword){
		this.serverAPI.logInUserWithEmailAndPassword(anEmail, aPassword);
	},
	
	getWorldDataForPlayerId : function(anId){
		this.gameDataCache.player_id = anId;
		var player = this.gameDataCache.getPlayerById(anId);
		if(player && player.world_id)
			this.serverAPI.getWorldDataForWorldId(player.world_id);
		else
			console.log("TrailsForwardDataController.getWorldDataForPlayerId found no world for player_id: " + anId);
	},
	
		/* return the cached data or call method to  */
	getUserPlayers : function(){
		if(this.gameDataCache.getUserPlayers())
			globalNames.IMPACT.onGetPlayers(this.gameDataCache.userPlayers);
		else
			this.serverAPI.getUserPlayers();
	},
	
	getTileChunkWithStartId : function(anId){
		var theChunk = this.gameDataCache.getTileChunkWithStartId(anId);
		if(theChunk[0] != null){
			if(globalNames.FULL_DEBUGGING == true) console.log("getTileBlockWithStartId: requested map data was cached");	
			globalNames.IMPACT.onGetMapPiece(theChunk);
		}
		else{
			if(globalNames.FULL_DEBUGGING == true) console.log("getTileBlockWithStartId: calling serverAPI.getTileBlockWithStartId");
			this.serverAPI.getTileChunkWithStartId(anId);
		}
	},
	
	
	
	/**
		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
	**/
	
	
	storeTiles : function(theData){
		this.gameDataCache.storeTiles(theData.megatile);
	},
	
	onGetUserPlayers : function(theData){
		globalNames.DATA_CONTROLLER.gameDataCache.setUserPlayers(theData.players);
		globalNames.IMPACT.onGetUserPlayers(theData.players);
	},
	
	
	onLogIn : function(theData){
		globalNames.DATA_CONTROLLER.serverAPI._auth_token = theData.auth_token;
		globalNames.DATA_CONTROLLER.serverAPI._userId = theData.id;
		globalNames.DATA_CONTROLLER.serverAPI.getUserPlayers();
		globalNames.IMPACT.onLogin();
	},
	
	onGetWorldData : function(theData){
		globalNames.HELPER_FUNCTIONS.addSimplePropertiesFromObjToObj(theData.world, globalNames.DATA_CONTROLLER.gameDataCache);
		globalNames.DATA_CONTROLLER.gameDataCache.initializeMap();
		globalNames.IMPACT.onGetWorldData(theData);
	},
	
	onGetTileChunk : function(startId){
		var theChunk = this.gameDataCache.getTileChunkWithStartId(startId);
		globalNames.IMPACT.onGetTileChunk(theChunk);
	},
	
};

