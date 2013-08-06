
/* Set up the DataController and the objects it interacts with */
var TFglobals = new TrailsForwardGlobals();
var helperFunctions = new TrailsForwardHelperFunctions();
var dataController = new TrailsForwardDataController();
var impactDummy = new ImpactDummy();
TFglobals.initialize(dataController, helperFunctions, impactDummy);

/* Make and use a tester object */
var tester = new TrailsForwardDataControllerTester(dataController);
var TrailsForward_DC_API_Tester = new TrailsForwardDataControllerAPITester();

 /* automatically fill in login info */
function init(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("dataControllerTester.js::init", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

	document.getElementById("submitButton").addEventListener("click", logIn);
	document.getElementById("email").value = "aaron.tietz@tufts.edu";
	document.getElementById("password").value = "letmein";
}

window.onload = init;


/*** 

	TESTING HELPER FUNCTIONS 
	
***/

 /* called when user clicks "Log In" */
function logIn(){
		TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("dataControllerTester.js::logIn", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.DC_TESTER_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.DC_TESTER_DEBUGGING_VERBOSE));

	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	
	tester.testLoginWithEmailAndPassword(email, password);
}


function callLoadMapTest(){
	TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("ImpactDummy.js::callLoadMapTest", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

	tester.getMapDataForChosenWorld();
}

function callLoadAvailableContractsTest(){
	TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("ImpactDummy.js::callLoadAvailableContractsTest", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

	tester.loadAvailableContractsForChosenPlayer();
}

function callLoadAvailableUpgradesTest(){
	TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("ImpactDummy.js::callLoadAvailableUpgradesTest", [], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

	tester.loadAvailableUpgradesForChosenPlayer();
}
