
function TrailsForwardGameDataCache(){
	this.user_players = new Array();
	this.gameMap = new Array();
}

TrailsForwardGameDataCache.prototype = {
	
	constructor : TrailsForwardGameDataCache,
	
	initializeMap : function(){
		var count = this.height * this.width;
		for(var i = 0; i < count; i++){
			var a = new Array(count);
			a[0] = null;
			this.gameMap.push(a);
		}
	},
	
	getUserPlayers : function(){
		return this.user_players;
	},	
	
	setUserPlayers : function(players){
		this.user_players = players;
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
	
	getMapSectionWithXYOriginAndLengthWidth : function(x, y, length, width){
		return null;
	},
	
	getTileBlockWithStartId : function(anId){
		var tiles_per_block = globalNames.BLOCK_SIZE * globalNames.BLOCK_SIZE;
		var block = Math.floor(anId / tiles_per_block);
		if(globalNames.FULL_DEBUGGING)console.log("TrailsForwardGameDataCache.getTileBlockWithStartId: requested block starts at id: " 
													+ anId + ", which maps to block: " + block);
		return this.gameMap[block];
	},
	
	storeTileSection : function(aTileSection){
		var num = aTileSection.id;
		var tiles_per_block = globalNames.BLOCK_SIZE * globalNames.BLOCK_SIZE;
		var block = Math.floor(num / tiles_per_block);
		var positionInBlock = Math.floor(num % tiles_per_block) - 1;
		if(globalNames.FULL_DEBUGGING) console.log("storing tile section in this.gameMap [" + block + "][" + positionInBlock + "]");
		this.gameMap[block][positionInBlock] = aTileSection;
	},
	
};

