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
	
	/*
	getMapSectionWithXYOriginAndLengthWidth : function(x, y, length, width){
		var mapSection = this.gameDataCache.getMapSectionWithXYOriginAndLengthWidth(x,y,length,width);
		
		if(mapSection != null){
			if(globalNames.FULL_DEBUGGING) console.log("requested map data was cached");		
			globalNames.IMPACT.onMapSectionLoad(mapSection);
		}
		else{
			if(globalNames.FULL_DEBUGGING) console.log("calling serverAPI.loadMapSectionWithXYOriginAndLengthWidth");
			this.serverAPI.loadMapSectionWithXYOriginAndLengthWidth(x, y, length, width);
		}
	},
	*/
	
	getTileBlockWithStartId : function(anId){
		var theBlock = this.gameDataCache.getTileBlockWithStartId(anId);
		if(theBlock[0] != null){
			if(globalNames.FULL_DEBUGGING) console.log("getTileBlockWithStartId: requested map data was cached");	
			globalNames.IMPACT.onGetMapPiece(theBlock);
		}
		else{
			if(globalNames.FULL_DEBUGGING) console.log("getTileBlockWithStartId: calling serverAPI.getTileBlockWithStartId");
			this.serverAPI.getTileBlockWithStartId(anId);
		}
	},
	
	/**
		CALLBACK FUNCTIONS TO UPDATE gameDataCache AND SEND DATA TO IMPACT
	
	**/
	
	
	storeTileSection : function(theData){
		this.gameDataCache.storeTileSection(theData.megatile);
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
	
	onGetTileBlock : function(startId){
		var theBlock = this.gameDataCache.getTileBlockWithStartId(startId);
		globalNames.IMPACT.onGetMapBlock(theBlock);
	},
	
};

