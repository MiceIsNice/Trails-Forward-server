/**
	TODO:
		> Make note of where/how to make GET requests failure tolerant
		> Consider revising logging system to be more helpful:
			- more modes than FULL or not
			- on FULL debug, limit request loops to prevent tons of printing?
		> expand server request capabilities, including PUT
**/




function TrailsForwardDataControllerTester(aTrailsForwardDataController){
	this.dataController = aTrailsForwardDataController;
//	this._email = "aarontietz@gmail.edu";
	this._email = "aaron.tietz@tufts.edu";
	this._password = "letmein";
}

TrailsForwardDataControllerTester.prototype = {

	constructor : TrailsForwardDataControllerTester,
	
	testLogin : function(){
		this.dataController.logInUserWithEmailAndPassword(this._email, this._password);
	},
	
	testLoginWithEmailAndPassword : function(email, password){
		this.dataController.logInUserWithEmailAndPassword(email, password);
	},
	
	getWorldDataForChosenPlayer : function(){
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
		TFglobals.IMPACT.askForMap();
	},
	
	getPlayers : function(){
		this.dataController.getUserPlayers();
	},
	
	loadAvailableContractsForChosenPlayer : function(){
		this.dataController.getAvailableContractsForPlayer();
	},
	
	loadAvailableUpgradesForChosenPlayer : function(){
		this.dataController.getAvailableUpgradesForPlayer();
	},
	
	tryToPurchaseUpgrade : function(){
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
			console.log("tester.tryToPurchaseUpgrade called without an upgrade selected");
	},
	
	acceptContract : function(){
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
			console.log("tester.tryToPurchaseUpgrade called without an upgrade selected");
	},

};

/* Set up the DataController and the objects it interacts with */
var helperFunctions = new TrailsForwardHelperFunctions();
var dataController = new TrailsForwardDataController();
var TFglobals = new TrailsForwardGlobals();
var impactDummy = new ImpactDummy();
TFglobals.initialize(dataController, helperFunctions, impactDummy);


/* Make and use a tester object */
var tester = new TrailsForwardDataControllerTester(dataController);
//tester.testLogin();


 /* called when user clicks "Log In" */
function logIn(){
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	
	tester.testLoginWithEmailAndPassword(email, password);
}


 /* automatically fill in login info */
function init(){
	document.getElementById("submitButton").addEventListener("click", logIn);
//	document.getElementById("email").value = "aarontietz@gmail.com";
	document.getElementById("email").value = "aaron.tietz@tufts.edu";
	document.getElementById("password").value = "letmein";
}

window.onload = init;


