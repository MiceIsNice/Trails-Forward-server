
function TrailsForwardGlobalNames(){

}
 
TrailsForwardGlobalNames.prototype = {
 
 	constructor : TrailsForwardGlobalNames,
 
 	initialize : function(dataControllerRef, helperFunctionsRef, impactRef){
 		this.DATA_CONTROLLER = dataControllerRef;
 		this.SERVER_API = this.DATA_CONTROLLER.serverAPI;
 		this.HELPER_FUNCTIONS = helperFunctionsRef;
 		this.IMPACT = impactRef;
 		//this.FULL_DEBUGGING = false;
 		this.BLOCK_SIZE = 16;
 	},
 
};
 
