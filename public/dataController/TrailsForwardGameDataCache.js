/* 
 *  TrailsForwardGameDataCache object:
 *		- Local game state and methods for access
 * 
 */

function TrailsForwardGameDataCache(){
	if(TFglobals.FULL_DEBUGGING || TFglobals.GDC_DEBUGGING) console.log("TrailsForwardGameDataCache()");

	this.user_players = new Array();
	this.availableContracts = new Array();
	this.chunkQueue = new TrailsForwardChunkQueue();
}

TrailsForwardGameDataCache.prototype = {
	
	constructor : TrailsForwardGameDataCache,
	
/*****

		'PUBLIC' FUNCTIONS CALLED BY TrailsForwardDataController OBJECT
	
*****/
	
/***	MAP FUNCTIONS	***/

	initializeMap : function(){
        if (TFglobals.FULL_DEBUGGING) console.log("GDC.initializeMap: Initializing map of size (width, height): (" + this.width + ", " + this.height +")");
        this.chunksPerRow = Math.ceil(this.width / TFglobals.CHUNK_WIDTH);
        this.chunksPerColumn = Math.ceil(this.height / TFglobals.CHUNK_WIDTH);        
        this.tilesPerChunk = TFglobals.CHUNK_WIDTH * TFglobals.CHUNK_WIDTH;
        this.totalChunks = this.chunksPerRow * this.chunksPerColumn;
        
        this.gameMap = new Array(this.totalChunks);
        
		for(var i = 0; i < this.totalChunks; i++)
			this.gameMap[i] = (null);
	},
	
	getMapChunkWithId : function(anId){
		var tilesPerChunk = TFglobals.CHUNK_WIDTH * TFglobals.CHUNK_WIDTH;
		var chunk = Math.floor(anId / this.tilesPerChunk);
		if(this.chunkIdIsValid()){
			if(TFglobals.FULL_DEBUGGING == true)console.log("GDC.getMapChunkWithId: requested chunk with id: " + chunk);
			return this.gameMap[chunk];
		}
		else 
			console.log("GDC.getMapChunkWithId: called with invalid id: " + anId);
	},
	
	storeTiles : function(aMegatile){
		var num = aMegatile.id;
		var chunk = Math.floor(num / this.tilesPerChunk);
		
		if(this.gameMap[chunk] == null)
			this.gameMap[chunk] = new Array(this.tilesPerChunk);
		
		var positionInChunk = Math.floor(num % this.tilesPerChunk) - 1;
		if(TFglobals.FULL_DEBUGGING == true) console.log("storing tile section in this.gameMap [" + chunk + "][" + positionInChunk + "]");
		this.gameMap[chunk][positionInChunk] = aMegatile;
	},
	
	/* assumes a rectangular map */
	chunkTileBelongsTo : function(x,y){
		var blocksDown = this.chunksPerRow * Math.floor(y / TFglobals.CHUNK_WIDTH);
		var blocksAcross = Math.floor(x / TFglobals.CHUNK_WIDTH);
		return blocksDown + blocksAcross; 
	},
	
	chunkIdIsValid : function(anId){
		return anId >= 0 && anId < this.totalChunks;
	},
	
	chunkIsFresh : function(chunkId){
		if(chunkId < this.totalChunks && chunkId >= 0){
			if(TFglobals.FULL_DEBUGGING == true) console.log("GDC.chunkIsValid: chunk with id " + chunkId + " is " +
																 (this.gameMap[chunkId] != null ? "valid" : "not valid"));
			return this.gameMap[chunkId] != null;
		}
		else
			console.log("GDC.chunkIsValid: invalid chunk id: " + chunkId);
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
			console.log("GDC.getPlayerById: no player found with id: " + anId);
		}
		else
			console.log("GDC.getPlayerById: user_players undefined!");
	},

	getAvailableContractsForPlayer : function(){
		return this.availableContracts;
	},
	
	  /* WILL NEED TO TEST THE FORMAT COMING IN */
	setAvailableContractsForPlayer : function(someContracts){
		this.availableContracts = someContracts;
	},

	setAvailableUpgradesForPlayer : function(someUpgrades){
	
	},
	
	setPlayerStats : function(theStats){
	
	},
	
};

	/* remembers the most recently saved chunks */
function TrailsForwardChunkQueue(){
	this.QUEUE_SIZE = 18;
	this.storedChunks = new Array(this.QUEUE_SIZE);
	this.lastAdded = 0;
	this.nextAvailable = 0;
}

TrailsForwardChunkQueue.prototype = {

	constructor : TrailsForwardChunkQueue,

			/* returns -1 if no chunk should be dropped, else chunkId */
	push : function(chunkId){
		var chunkToDrop = -1;
		this.nextAvailable = this.nextAvailable + 1 == this.QUEUE_SIZE ? 0 : this.nextAvailable + 1;
		if(this.nextAvailable == this.lastAdded){
			chunkToDrop = this.storedChunks[lastAdded];
			this.lastAdded = this.lastAdded + 1 == this.QUEUE_SIZE ? 0 : this.lastAdded + 1;
		}
		this.storedChunks[this.nextAvailable] = chunkId;
		return chunkToDrop;						
	}
};


