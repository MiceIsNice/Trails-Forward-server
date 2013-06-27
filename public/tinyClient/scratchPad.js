tileData.megatile.resource_tiles.forEach(parse_resource_tile);

function parse_resource_tile(tile){
	for(var key in tile)
		console.log(key + ": " + tile[key]);
}

/**
  		console.log("worldData:");
  		for(var key in theWorldData)
			console.log(key);

  		console.log("tileData:");
  		for(var key in theTileData)
			console.log(key);
**/  

/**
	TODO: 
		2. pull latest Client 
		3. add script tags to index page
		4. test 
		5. push 
**/
