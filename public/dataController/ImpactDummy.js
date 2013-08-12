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

		if(TFglobals.DATA_CONTROLLER.CHOOSE_LUMBERJACK){
			TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId(TFglobals.DATA_CONTROLLER.AARONS_PLAYER_ID);
			return;
		}


/**
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
			element.addEventListener("click", TFtestingGlobals.TESTER.getWorldDataForChosenPlayer);
			theForm.appendChild(element);
		
			document.getElementById("playerChoiceDiv").style.display = "inline";
		}
		else console.log("bad input");
**/
	},
	
	onLogin : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onLogin", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
/**
		var messageP = document.getElementById("message");
		var loginDiv = document.getElementById("loginDiv");
		loginDiv.style.display = "none";
**/
	},
	
	onGetWorldData : function(theData){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetWorldData", ["theData"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		TF_DC_API_TESTER.showAvailableTests();
/**
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
**/
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
			element.addEventListener("click", TFtestingGlobals.TESTER.acceptContract);
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
			element.addEventListener("click", TFtestingGlobals.TESTER.tryToPurchaseUpgrade);
			theForm.appendChild(element);
		
			document.getElementById("playerChoiceDiv").style.display = "inline";
		}
		else console.log("bad input");
	},
	
	onAttemptToPurchaseMegatileIncludingResourceTileXY : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToPurchaseMegatileIncludingResourceTileXY", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
		if(this.serverResponseWasPositive(theResponse)){
			console.log("onAttemptToPurchaseMegatileIncludingResourceTileXY successfully purchased resource tile with origin x, y: " + theResponse.megatile_upper_left_xy.x + ", " + theResponse.megatile_upper_left_xy.y);
		}
		else{
			console.log("onAttemptToPurchaseMegatileIncludingResourceTileXY failure!" + theResponse.errors.join(", "));
		}
	},
	
	onAttemptToPurchaseUpgradeResponse : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToPurchaseUpgradeResponse", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
		if(this.serverResponseWasPositive(theResponse)){
			console.log("onAttemptToPurchaseUpgradeResponse successfully purchased equipment with id: " + theResponse.logging_equipment_id);
		}
		else{
			console.log("onAttemptToPurchaseUpgradeResponse failure!" + theResponse.errors.join(", "));
		}
	},
	
	onAttemptToAcceptContract : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToAcceptContract", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.serverResponseWasPositive(theResponse)){
			console.log("onAttemptToAcceptContract accepted contract with id: " + theResponse.contract_id);
		}
		else{
			console.log("onAttemptToAcceptContract failure with message: " + theResponse.errors.join(", "));
		}
	},
	
	onAttemptToClearCutTileWithXY : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onAttemptToClearCutTileWithXY", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.serverResponseWasPositive(theResponse)){
			console.log("onAttemptToClearCutTileWithId success!");
		}
		else{
			console.log("onAttemptToClearCutTileWithId failure with message: " + theResponse.errors.join(", "));
		}			
	},
	
	onGetEstimateForClearCutTileWithXY : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetEstimateForClearCutTileWithXY", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.serverResponseWasPositive(theResponse)){
			console.log("onGetEstimateForClearCutTileWithXY success!");
		}
		else{
			console.log("onGetEstimateForClearCutTileWithXY failure with message: " + theResponse.errors.join(", "));
		}			
	},
	
	onConductSurveyOfTileWithXY : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onConductSurveyOfTileWithXY", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.serverResponseWasPositive(theResponse)){
			console.log("onConductSurveyOfTileWithXY success!");
		}
		else{
			console.log("onConductSurveyOfTileWithXY failure with message: " + theResponse.errors.join(", "));
		}		
	},

	onViewExistingSurveyOfTileWithXY : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onViewExistingSurveyOfTileWithXY", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));
	
		if(this.serverResponseWasPositive(theResponse)){
			console.log("onViewExistingSurveyOfTileWithXY success!");
		}
		else{
			console.log("onViewExistingSurveyOfTileWithXY failure with message: " + theResponse.errors.join(", "));
		}		
	},

	onGetPlayerStats : function(theResponse){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetPlayerStats", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(this.serverResponseWasPositive(theResponse)){
			console.log("onGetPlayerStats received balance: " + theResponse.balance + ", turn points: " + theResponse.turn_points + ", political capital: " + theResponse.political_capital);
		}
		else{
			console.log("onGetPlayerStats failure with message: " + theResponse.errors.join(", "));
		}		
	},
	
/**
	respondPositivelyToRequestResult : function(theResponse, theFunctionName, successMessagePrefix, failureMessagePrefix){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.respondPositivelyToRequestResult", ["theResponse", "theFunctionName", "successMessagePrefix", "failureMessagePrefix"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

		if(theResponse.status == TFglobals.SUCCESS){
			console.log("ImpactDummy." + theFunctionName + ": " + successMessagePrefix + theResponse.message);
			return true;
		}
		
		if(theResponse.status == TFglobals.FAILURE)
			console.log("ImpactDummy." + theFunctionName + ": " + failureMessagePrefix + ". Message is: " + theResponse.errors.join(", "));
		else
			console.log("ImpactDummy." + theFunctionName + ": received bad status code: " + theResponse.status);
		return false;
	},
**/

	serverResponseWasPositive : function(theResponse){
		if(theResponse.status == TFglobals.SUCCESS) 	
			return true;
		else if(theResponse.status = TFglobals.FAILURE) 
			return false;
		else{ 
			console.log("bad status code: " + theResponse.status); 
			return false;
		}
	},
};
