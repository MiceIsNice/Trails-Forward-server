/* 
 *  ImpactDummy object:
 *		- simulates Impact sending to and receiving from TrailsForwardDataController
 * 
 */


function callLoadMapTest(){
	tester.getMapDataForChosenWorld();
}

function callLoadAvailableContractsTest(){
	tester.loadAvailableContractsForChosenPlayer();
}

function callLoadAvailableUpgradesTest(){
	tester.loadAvailableUpgradesForChosenPlayer();
}

function ImpactDummy(){

}

ImpactDummy.prototype = {

	constructor : ImpactDummy,
	
			
		/* This is extremely naive.  I don't know what order blocks are stored on 
			the server yet, and ultimately we'll likely write a new method to return 
			blocks the way we want */		
	askForMap : function(){
		
		/**
		var length = TFglobals.DATA_CONTROLLER.gameDataCache.height;
		var width = TFglobals.DATA_CONTROLLER.gameDataCache.width;	
			
		var block_width = TFglobals.CHUNK_WIDTH;
		var total_blocks = block_width * block_width;
		
		// FOR TESTING - IT DOESN'T WORK WHEN ASKING FOR THEM ALL
		total_blocks = 1;
		**/
		
		//TFglobals.DATA_CONTROLLER.getMapChunksWithIds([1,2,3,4,5,6,7,8,9]);
		var rect = {x_min : 0, x_max : 5, y_min : 0, y_max : 5};
		TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
		
		/**
		for(var i = 1; i <= total_blocks; i += block_width)
			TFglobals.DATA_CONTROLLER.getMapChunkWithStartId(i);
		**/
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
		element.setAttribute("value", "Load Map");
		element.setAttribute("id", "submitMap");
		element.addEventListener("click", callLoadMapTest);
		messageP.appendChild(element);
	},
	
	onGetMapChunk : function(theData){
		console.log("ImpactDummy received map block ");
		TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theData[0]);
		var button = document.createElement("input");
		button.setAttribute("value", "Get Contracts");
		button.setAttribute("type", "submit");
		//button.removeEventListener("click", callLoadMapTest);
		button.addEventListener("click", callLoadAvailableContractsTest);
		
		var button2 = document.createElement("input");
		button2.setAttribute("value", "Get Upgrades");
		button2.setAttribute("type", "submit");
		//button.removeEventListener("click", callLoadMapTest);
		button2.addEventListener("click", callLoadAvailableUpgradesTest);
		
		
		
		var messageP = document.getElementById("message");
		messageP.innerHTML = "Map section loaded.  Click below to see available contracts and upgrades.<br/>";
		messageP.appendChild(button);
		messageP.appendChild(button2);
	},
	
	onGetAvailableContracts : function(theContracts){
		console.log("ImpactDummy.onGetAvailableContracts received " + theContracts.lumberjack_contracts.length + " contracts");
	
		var messageP = document.getElementById("message");
		messageP.innerHTML = "Here are your available contracts:<br/>";
		
		var element;
		var theForm = document.getElementById("playerForm");
		
		theForm.innerHTML = "";
		
		for(var i = 0; i < theContracts.lumberjack_contracts.length; i++){
			element = document.createElement("input");
			element.value = theContracts.lumberjack_contracts[i].id;
			element.setAttribute("type", "radio");
			element.setAttribute("class", "contractChoice");
			theForm.appendChild(element);
			
			theForm.innerHTML += " " + theContracts.lumberjack_contracts[i].codename + ", fee: $" + theContracts.lumberjack_contracts[i].earnings + "<br/>"
		}
		
		theForm.innerHTML += "<br/>";
		
		element = document.createElement("input");
		element.setAttribute("type", "submit");
		element.setAttribute("value", "Accept contract");
		element.setAttribute("id", "viewContract");
		element.addEventListener("click", tester.acceptContract);
		theForm.appendChild(element);
		
		document.getElementById("playerChoiceDiv").style.display = "inline";
		
		//console.log("ImpactDummy received contracts: ");
		//TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theContracts);
	},
	
	onGetAvailableUpgradesForPlayer : function(theUpgrades){
		//console.log("ImpactDummy received upgrades: ");
		//TFglobals.HELPER_FUNCTIONS.prettyPrintObject(theUpgrades);	
		
		
		var messageP = document.getElementById("message");
		messageP.innerHTML = "Here are your available upgrades:<br/>";
		
		var element;
		var theForm = document.getElementById("playerForm");
		
		theForm.innerHTML = "";
		
		for(var i = 0; i < theUpgrades.length; i++){
			element = document.createElement("input");
			element.value = theUpgrades[i].id;
			element.setAttribute("type", "radio");
			element.setAttribute("class", "contractChoice");
			element.setAttribute("value", theUpgrades[i].logging_equipment.id);
			theForm.appendChild(element);
			
			theForm.innerHTML += " " + theUpgrades[i].logging_equipment.name + ", cost: $" + theUpgrades[i].logging_equipment.initial_cost + "<br/>"
		}
		
		theForm.innerHTML += "<br/>";
		
		element = document.createElement("input");
		element.setAttribute("type", "submit");
		element.setAttribute("value", "Purchase upgrade");
		element.setAttribute("id", "purchaseUpgrade");
	    element.addEventListener("click", tester.tryToPurchaseUpgrade);
		theForm.appendChild(element);
		
		document.getElementById("playerChoiceDiv").style.display = "inline";
	},
	
	onAttemptToPurchaseTile : function(theResult){
		console.log("ImpactDummy received tile purchase attempt: ");	
	},
	
	onAttemptToPurchaseUpgradeResponse : function(theResult){
		if(theResult.status == TFglobals.FAILURE){
			console.log("ImpactDummy.onAttemptToPurchaseUpgradeResponse: failure buying equipment.  Message is: " + theResult.message);
		}
		else if(theResult.status == TFglobals.SUCCESS){
			console.log("ImpactDummy.onAttemptToPurchaseUpgradeResponse: received upgrade purchase attempt: " + theResult.message);
		}
		else
			console.log("ImpactDummy.onAttemptToPurchaseUpgradeResponse: received bad status code: " + theResult.status);
	},
	
	onAttemptToAcceptContract : function(theResult){
		if(theResult.status == TFglobals.FAILURE){
			console.log("ImpactDummy.onAttemptToAcceptContract: failure accepting contract.  Message is: " + theResult.message);
		}
		else if(theResult.status == TFglobals.SUCCESS){
			console.log("ImpactDummy.onAttemptToAcceptContract: accepted contract: " + theResult.message);
		}
		else
			console.log("ImpactDummy.onAttemptToAcceptContract: received bad status code: " + theResult.status);
	},
	
	onRequestSurveyForTile : function(theResult){
		console.log("ImpactDummy received survey attempt: ");
	},

	onGetPlayerStats : function(theStats){
		console.log("ImpactDummy received player stats: ");
	},

};
