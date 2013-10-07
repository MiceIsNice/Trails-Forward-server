

function TrailsForwardDataControllerAPITester(aTrailsForwardDataController){
	if(TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING) console.log("TrailsForwardDataControllerDC_API_TESTER()");
	
	this.MODEL = new TrailsForwardDataControllerAPITesterModel();
	this.VIEW = new TrailsForwardDataControllerAPITesterView();
	
	this.dataController = aTrailsForwardDataController;
	this._email = "aaron.tietz@tufts.edu";
	this._password = "letmein";
}

TrailsForwardDataControllerAPITester.prototype = {

	constructor : TrailsForwardDataControllerAPITester,
	
	showAvailableTests : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.showAvailableTests", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

		this.VIEW.setMessageParagraphTextTo(this.SELECT_TESTS_TO_RUN);
	
		var theMethods = this.MODEL.getMethods();
		for(var i = 0; i < theMethods.length; i++)
			this.VIEW.appendMethodToMethodsDiv(theMethods[i]);
	},
	
	userClickedMethod : function(method_name){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.userClickedMethod", ["method_name"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));
		if(method_name){
			var the_method = this.MODEL.getMethodByName(method_name);			
			this.VIEW.showMethodDetailsDisplayForMethod(the_method);
		}
		else console.log("bad input");
	},
	
	backToTestSelection : function(){
		this.VIEW.backToTestSelection();		
	},

	appendTestToTestList : function(method_name){
		var the_args = TF_DC_API_TESTER.VIEW.getMethodArgumentsFromDetailsDiv();
		if(the_args){
			var pos = TF_DC_API_TESTER.MODEL.appendTest(method_name, the_args);
			var full_func_string = TF_DC_API_TESTER.MODEL.getFullStringForTestAtPosition(pos);
			TF_DC_API_TESTER.VIEW.appendTestToTestDisplayWithName(full_func_string);
		}
		else
			alert("Need a value for each parameter");
	},
	
	updateSelectedTestWithName : function(method_name){
		console.log("user clicked method: " + method_name);
	},
	
	
/******

	PREVIOUSLY USED TESTS 

******/

	testLoginWithEmailAndPassword : function(email, password){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.testLoginWithEmailAndPassword", ["email", "password"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		if(email && password)
			this.dataController.logInUserWithEmailAndPassword(email, password);
		else console.log("bad input");
	},
	
	getWorldDataForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getWorldDataForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		var options = document.getElementsByClassName("playerChoice");
		for(var i = 0 ; i < options.length; i++){
				if(options[i].checked == true){
					TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId(options[i].value);
					return;
				}
		}
		console.log("TrailsForwardDataControllerDC_API_TESTER.getWorldDataForChosenPlayer: called with no player chosen.");
	},
	
	getMapDataForChosenWorld : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getMapDataForChosenWorld", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		TFglobals.IMPACT.askForMap();
	},
	
	getPlayers : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.getPlayers", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getUserPlayers();
	},
	
	loadAvailableContractsForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.loadAvailableContractsForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getAvailableContractsForPlayer();
	},
	
	loadAvailableUpgradesForChosenPlayer : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.loadAvailableUpgradesForChosenPlayer", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

		this.dataController.getAvailableUpgradesForPlayer();
	},
	
	tryToPurchaseUpgrade : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.tryToPurchaseUpgrade", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

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
			console.log("DC_DC_API_TESTER.tryToPurchaseUpgrade called without an upgrade selected");
	},
	
	acceptContract : function(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("DC_T.acceptContract", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_API_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_API_TESTER_DEBUGGING_VERBOSE));

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
			console.log("DC_DC_API_TESTER.tryToPurchaseUpgrade called without an upgrade selected");
	},

};


