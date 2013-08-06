/* 
 *  ImpactDummy object:
 *		- simulates Impact sending to and receiving from TrailsForwardDataController
 * 
 */

function ImpactDummy(){
	if(TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING) console.log("ImpactDummy()");
}

ImpactDummy.prototype = {

	constructor : ImpactDummy,
			
	askForMap : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.askForMap", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		var rect = {x_min : 0, x_max : 5, y_min : 0, y_max : 5};
		TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
	},
	
	onGetUserPlayers : function(players){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetUserPlayers", ["players"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(players){
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
		}
		else console.log("bad input");
	},
	
	onLogin : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onLogin", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		var messageP = document.getElementById("message");
		var loginDiv = document.getElementById("loginDiv");
		loginDiv.style.display = "none";
	},
	
	onGetWorldData : function(theData){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetWorldData", ["theData"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(theData){
			document.getElementById("playerChoiceDiv").style.display = "none";
			var messageP = document.getElementById("message");
			messageP.innerHTML = "We found your world. Click below to load the map and get started.<br/>";
		
			var element = document.createElement("input");
			element.setAttribute("type", "submit");
			element.setAttribute("value", "Load Map");
			element.setAttribute("id", "submitMap");
			element.addEventListener("click", callLoadMapTest);
			messageP.appendChild(element);
		}
		else console.log("bad input");
	},
	
	onGetMapChunk : function(theData){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetMapChunk", ["theData"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(theData){
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
		}
		else console.log("bad input");
	},
	
	onGetAvailableContracts : function(theContracts){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetAvailableContracts", ["theContracts"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
	
		if(theContracts){
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
		}
		else console.log("bad input");
	},
	
	onGetAvailableUpgradesForPlayer : function(theUpgrades){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetAvailableUpgradesForPlayer", ["theUpgrades"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
		
		if(theUpgrades){
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
		}
		else console.log("bad input");
	},
	
	onAttemptToPurchaseTile : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToPurchaseTile", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
	},
	
	onAttemptToPurchaseUpgradeResponse : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToPurchaseUpgradeResponse", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.respondPositivelyToRequestResult(theResult, "onAttemptToPurchaseUpgradeResponse", 
													"received upgrade purchase attempt:", "failure buying equipment")){
			console.log("onAttemptToPurchaseUpgradeResponse success!");
		}
		else{
			console.log("onAttemptToPurchaseUpgradeResponse failure!");
		}
	},
	
	onAttemptToAcceptContract : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToAcceptContract", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.respondPositivelyToRequestResult(theResult, "onAttemptToAcceptContract", 
													"accepted contract:", "failure accepting contract")){
			console.log("onAttemptToAcceptContract success!");
		}
		else{
			console.log("onAttemptToAcceptContract failure!");
		}
	},
	
	onAttemptToClearCutTileWithId : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToClearCutTileWithId", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.respondPositivelyToRequestResult(theResult, "onAttemptToClearCutTileWithId", 
													"successfully clear-cut tile:", "failure clear-cutting tile")){
			console.log("onAttemptToClearCutTileWithId success!");
		}
		else{
			console.log("onAttemptToClearCutTileWithId failure!");
		}			
	},
	
	onRequestSurveyForTile : function(theResult){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onRequestSurveyForTile", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
	},

	onGetPlayerStats : function(theStats){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetPlayerStats", ["theResult"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
	},
	
	respondPositivelyToRequestResult : function(theResult, theFunctionName, successMessagePrefix, failureMessagePrefix){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.respondPositivelyToRequestResult", ["theResult", "theFunctionName", "successMessagePrefix", "failureMessagePrefix"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(theResult.status == TFglobals.SUCCESS){
			console.log("ImpactDummy." + theFunctionName + ": " + successMessagePrefix + " + theResult.message");
			return true;
		}
		
		if(theResult.status == TFglobals.FAILURE)
			console.log("ImpactDummy." + theFunctionName + ": " + failureMessagePrefix + ". Message is: " + theResult.message);
		else
			console.log("ImpactDummy." + theFunctionName + ": received bad status code: " + theResult.status);
		return false;
	},

};
