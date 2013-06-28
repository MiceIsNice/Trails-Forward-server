/* 
 *  TrailsForwardGameDataCache object:
 *		- Local game state and methods for access
 * 
 */

function TrailsForwardGameDataCache(){
	this.user_players = new Array();
	this.gameMap = new Array();
	this.availableContracts = new Array();
}

TrailsForwardGameDataCache.prototype = {
	
	constructor : TrailsForwardGameDataCache,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY TrailsForwardDataController OBJECT
	
*****/
	
	initializeMap : function(){
		var count = this.height * this.width;
        this.tiles_per_chunk = TFglobals.CHUNK_WIDTH * TFglobals.CHUNK_WIDTH;
		for(var i = 0; i < count; i++){
			var a = new Array(this.tiles_per_chunk);
			a[0] = null;
			this.gameMap.push(a);
		}
	},
	
	getUserPlayers : function(){
		return this.user_players;
	},	
	
	setUserPlayers : function(thePlayers){
		this.user_players = thePlayers;
	},
	
	getPlayerById : function(anId){
		if(this.user_players){
			for(var i = 0; i < this.user_players.length; i++){
				if(this.user_players[i].id == anId){
					return this.user_players[i];
				}
			}
			console.log("TrailsForwardGameDataCache.getPlayerById: no player found with id: " + anId);
		}
		else
			console.log("TrailsForwardGameDataCache.getPlayerById: user_players undefined!");
	},
	
	getTileChunkWithStartId : function(anId){
		var chunk = Math.floor(anId / this.tiles_per_chunk);
		if(TFglobals.FULL_DEBUGGING == true)console.log("TrailsForwardGameDataCache.getTileBlockWithStartId: requested block starts at id: " 
													+ anId + ", which maps to block: " + chunk);
		return this.gameMap[chunk];
	},
	
	storeTiles : function(aMegatile){
		var num = aMegatile.id;
		var chunk = Math.floor(num / this.tiles_per_chunk);
		var positionInChunk = Math.floor(num % this.tiles_per_chunk) - 1;
		if(TFglobals.FULL_DEBUGGING == true) console.log("storing tile section in this.gameMap [" + chunk + "][" + positionInChunk + "]");
		this.gameMap[chunk][positionInChunk] = aMegatile;
	},
	
	getAvailableContractsForPlayer : function(){
		return this.availableContracts;
	},
	
	  /* WILL NEED TO TEST THE FORMAT COMING IN */
	setAvailableContractsForPlayer : function(someContracts){
		this.availableContracts = someContracts;
	},
	
};

