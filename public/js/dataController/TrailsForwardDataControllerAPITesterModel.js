

function TrailsForwardDataControllerAPITesterModel(){
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
		{	name: "attemptToPurchaseMegatileIncludingResourceTileId",
		 	address: TFglobals.DATA_CONTROLLER.attemptToPurchaseMegatileIncludingResourceTileId,
		 	parameter_names: ["tile_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "conductSurveyOfTileWithId",
		 	address: TFglobals.DATA_CONTROLLER.conductSurveyOfTileWithId,
		 	parameter_names: ["tile_id"],
		 	parameter_types: ["int"]
		 },
		{	name: "viewExistingSurveyOfTileWithId",
		 	address: TFglobals.DATA_CONTROLLER.viewExistingSurveyOfTileWithId,
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

TrailsForwardDataControllerAPITesterModel.prototype = {

	constructor : TrailsForwardDataControllerAPITesterModel,
	
	/* returns new length of testSuite */
	appendTest : function(test_name, the_args){
		if(test_name && the_args){
			for(var i = 0; i < this.methods.length; i++){
					if(this.methods[i].name == test_name){
						this.testSuite.push({index: i, args: the_args});
						return this.testSuite.length;
					}
			}
			console.log("COULDN'T FIND TEST TO APPEND BY NAME: " + test_name);
		}
		else console.log("bad input");
	},
	
	startTesting : function(){
		this.runNextTest();
	},
	
	runNextTest : function(){
		var index = ++this.test_counter;
		if(index < this.testSuite.length)
			this.methods[testSuite[index].test_id].apply(this, this.testSuite[index].args)
	},
	
	resetTestCounter : function(){
		this.test_counter = 0;
	},
	
	clearTests : function(){
		this.testSuite = [];
	},
	
	  /* called with first test in position 1 */
	removeTest : function(test_position){
		if(test_position)
			this.testSuite.splice(test_position - 1, 1);
		else console.log("bad input");
	},
	
	updateArgsForTest : function(test_position, new_args){
		if(test_position && new_args){
			if(test_position - 1 <= this.testSuite.length)
				this.testSuite[test_position - 1].args = new_args;
			else console.log("bad test_position (from 0): " + test_position - 1);
		}
		else console.log("bad input");
	},
	
	getDetailsForTestInTestListAtPosition : function(test_position){
		if(test_position){
			var pos = test_position - 1;
			if(pos <= this.testSuite.length){
				return { name: this.methods[pos].name,
						 parameter_names: this.methods[pos].parameter_names,
						 argument_values: this.testSuite[pos].args
						};
			}
			else console.log("bad test_position (from 0): " + pos);
		}
		else console.log("bad input");	
	},
	
	getFullStringForTestAtPosition : function(test_position){
		var the_method = this.getDetailsForTestInTestListAtPosition(test_position);
		return the_method.name + TFglobals.HELPER_FUNCTIONS.functionArgumentsToStringFromNamesListAndValuesList(the_method.parameter_names,
											the_method.argument_values);
	},
	
	getMethods : function(){
		return this.methods;
	},
	
	getMethodByName : function(method_name){
		if(method_name){
			for(var i = 0; i < this.methods.length; i++){
				if(method_name == this.methods[i].name)
				  return this.methods[i];
			}
		}
		else console.log("bad input");
		
		return null;
	},
	
};







