
function callLoadMapTest(){
	tester.getMapDataForChosenWorld();
}


function ImpactDummy(){

}

ImpactDummy.prototype = {

	constructor : ImpactDummy,
	
			
		/* This is extremely naive.  I don't know what order blocks are stored on 
			the server yet, and ultimately we'll likely write a new method to return 
			blocks the way we want */		
	askForMap : function(){
			
		var length = TFglobals.DATA_CONTROLLER.gameDataCache.height;
		var width = TFglobals.DATA_CONTROLLER.gameDataCache.width;	
			
		var block_width = TFglobals.CHUNK_WIDTH;
		var total_blocks = block_width * block_width;
		
		/* 	FOR TESTING - IT DOESN'T WORK WHEN ASKING FOR THEM ALL */
		total_blocks = 1;
		
		for(var i = 1; i <= total_blocks; i += block_width)
			TFglobals.DATA_CONTROLLER.getTileChunkWithStartId(i);
	},
	
	onGetUserPlayers : function(players){

		var theForm = document.getElementById("playerForm");
		var element;
		var text;
		
		for(var i = 0; i < players.length; i++){
			element = document.createElement("input");
			element.value = players[i].id;
			element.setAttribute("type", "radio");
			element.setAttribute("class", "playerChoice");
			theForm.appendChild(element);
			
			theForm.innerHTML += " " + players[i].name + " " + players[i].type + "<br/>"
		}
		
		theForm.innerHTML += "<br/>";
		
		element = document.createElement("input");
		element.setAttribute("type", "submit");
		element.setAttribute("value", "load game");
		element.setAttribute("id", "submitPlayer");
		element.addEventListener("click", tester.getWorldDataForChosenPlayer);
		theForm.appendChild(element);
		
		document.getElementById("playerChoiceDiv").style.display = "inline";
	},
	
	onLogin : function(){
		var messageP = document.getElementById("message");
		var loginDiv = document.getElementById("loginDiv");
		
		loginDiv.style.display = "none";
	},
	
	onGetWorldData : function(theData){
		document.getElementById("playerChoiceDiv").style.display = "none";
		var messageP = document.getElementById("message");
		messageP.innerHTML = "We found your world. Click below to load the map and get started.<br/>";
		
		var element = document.createElement("input");
		element.setAttribute("type", "submit");
		element.setAttribute("value", "load map");
		element.setAttribute("id", "submitMap");
		element.addEventListener("click", callLoadMapTest);
		messageP.appendChild(element);
	},
	
	onGetTileChunk : function(theData){
		console.log("ImpactDummy received map block ");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theData[0]);
	},

};
