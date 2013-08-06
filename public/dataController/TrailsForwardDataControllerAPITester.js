

function TrailsForwardDataControllerAPITester(){
	this.methods = [
		{	name: "logInUserWithEmailAndPassword",
			address: TFglobals.DATA_CONTROLLER.logInUserWithEmailAndPassword,
			parameter_names: ["an_email", "a_password"],
			parameter_types: ["string", "string"]
		},
		{	name: "getWorldDataForPlayerId",
		 	address: TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId,
		 	parameter_names: ["player_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "getUserPlayers",
		 	address: TFglobals.DATA_CONTROLLER.getUserPlayers,
		 	parameter_names: [],
		 	parameter_types: []
		 },
		{	name: "getTilesInRect",
		 	address: TFglobals.DATA_CONTROLLER.getTilesInRect,
		 	parameter_names: ["x_min", "x_max", "y_min", "y_max"],
		 	parameter_types: ["int", "int", "int", "int"]
		 },
		{	name: "getAvailableContractsForPlayer",
		 	address: TFglobals.DATA_CONTROLLER.getAvailableContractsForPlayer,
		 	parameter_names: [],
		 	parameter_types: []
		 },
		{	name: "getPlayerStats",
		 	address: TFglobals.DATA_CONTROLLER.getPlayerStats,
		 	parameter_names: [],
		 	parameter_types: []
		 },
		{	name: "getAvailableUpgradesForPlayer",
		 	address: TFglobals.DATA_CONTROLLER.getAvailableUpgradesForPlayer,
		 	parameter_names: [],
		 	parameter_types: []
		 },
		{	name: "attemptToPurchaseUpgradeWithId",
		 	address: TFglobals.DATA_CONTROLLER.attemptToPurchaseUpgradeWithId,
		 	parameter_names: ["equipment_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "attemptToAcceptContractWithId",
		 	address: TFglobals.DATA_CONTROLLER.attemptToAcceptContractWithId,
		 	parameter_names: ["contract_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "attemptToClearCutTileWithId",
		 	address: TFglobals.DATA_CONTROLLER.attemptToClearCutTileWithId,
		 	parameter_names: ["tile_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "attemptToPurchaseTileWithId",
		 	address: TFglobals.DATA_CONTROLLER.attemptToPurchaseTileWithId,
		 	parameter_names: ["tile_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "requestSurveyForTileWithId",
		 	address: TFglobals.DATA_CONTROLLER.requestSurveyForTileWithId,
		 	parameter_names: ["tile_id"],
		 	parameter_types: ["int"]
		 },
	];
	
	this.testSuite = [];
	this.test_counter = 0;
	
/** TEMPLATE:
		{	name: "",
		 	address: TFglobals.DATA_CONTROLLER.,
		 	parameter_names: [""],
		 	parameter_types: []
		 },
**/
}

TrailsForwardDataControllerAPITester.prototype = {

	constructor : TrailsForwardDataControllerAPITester,
	
	appendTest : function(a_test_id, some_args){
		testSuite.push({test_id: a_test_id, args: some_args});
	},
	
	startTesting : function(){
		this.runNextTest();
	},
	
	runNextTest : function(){
		var index = ++TrailsForward_DC_API_Tester.test_counter;
		if(index < TrailsForward_DC_API_Tester.testSuite.length)
			TrailsForward_DC_API_Tester.methods[testSuite[index].test_id].apply(this, TrailsForward_DC_API_Tester.testSuite[index].args)
	},
	
	resetTestCounter : function(){
		TrailsForward_DC_API_Tester.test_counter = 0;
	},
	
	clearTests : function(){
		TrailsForward_DC_API_Tester.testSuite = [];
	},
	
};
