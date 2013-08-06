/**
	TODO:
		> Make note of where/how to make GET requests failure tolerant
**/




function TrailsForwardDataControllerTester(aTrailsForwardDataController){
	if(TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING) console.log("TrailsForwardDataControllerTester()");
	
	this.dataController = aTrailsForwardDataController;
	this._email = "aaron.tietz@tufts.edu";
	this._password = "letmein";
}

TrailsForwardDataControllerTester.prototype = {

	constructor : TrailsForwardDataControllerTester,
/*	
	testLogin : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.testLogin", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		this.dataController.logInUserWithEmailAndPassword(this._email, this._password);
	},
*/	
	testLoginWithEmailAndPassword : function(email, password){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.testLoginWithEmailAndPassword", ["email", "password"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		if(email && password)
			this.dataController.logInUserWithEmailAndPassword(email, password);
		else console.log("bad input");
	},
	
	getWorldDataForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getWorldDataForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		var options = document.getElementsByClassName("playerChoice");
		for(var i = 0 ; i < options.length; i++){
				if(options[i].checked == true){
					TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId(options[i].value);
					return;
				}
		}
			
		console.log("TrailsForwardDataControllerTester.getWorldDataForChosenPlayer: called with no player chosen.");
	},
	
	getMapDataForChosenWorld : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getMapDataForChosenWorld", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		TFglobals.IMPACT.askForMap();
	},
	
	getPlayers : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getPlayers", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getUserPlayers();
	},
	
	loadAvailableContractsForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.loadAvailableContractsForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getAvailableContractsForPlayer();
	},
	
	loadAvailableUpgradesForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.loadAvailableUpgradesForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getAvailableUpgradesForPlayer();
	},
	
	tryToPurchaseUpgrade : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.tryToPurchaseUpgrade", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		var selectors = document.getElementsByClassName("contractChoice");
		var equipment_id = -1;
		for(var i = 0; i < selectors.length; i++){
		  	if(selectors[i].checked == true){
		    	equipment_id = selectors[i].value;
		  	}
		}
		if(equipment_id != -1)
			TFglobals.DATA_CONTROLLER.attemptToPurchaseUpgradeWithId(equipment_id);
		else
			console.log("DC_TESTER.tryToPurchaseUpgrade called without an upgrade selected");
	},
	
	acceptContract : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.acceptContract", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		var selectors = document.getElementsByClassName("contractChoice");
		var contract_id = -1;
		for(var i = 0; i < selectors.length; i++){
		  	if(selectors[i].checked == true){
		    	contract_id = selectors[i].value;
		  	}
		}
		if(contract_id != -1)
			TFglobals.DATA_CONTROLLER.attemptToAcceptContractWithId(contract_id);
		else
			console.log("DC_TESTER.tryToPurchaseUpgrade called without an upgrade selected");
	},

};


