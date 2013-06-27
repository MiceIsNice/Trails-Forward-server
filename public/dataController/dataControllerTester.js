/**
	TODO:
		> Comment
		> Make Get requests failure tolerant
		> revise logging system
		> expand server request capabilities, including PUT
		> ? 

**/





function TrailsForwardDataControllerTester(aTrailsForwardDataController){
	this.dataController = aTrailsForwardDataController;
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
	
	showResponse : function(theResponse){
		console.log(theResponse);
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

function logIn(){
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	
	tester.testLoginWithEmailAndPassword(email, password);
}

function init(){
	document.getElementById("submitButton").addEventListener("click", logIn);
	document.getElementById("email").value = "aaron.tietz@tufts.edu";
	document.getElementById("password").value = "letmein";
}

window.onload = init;


