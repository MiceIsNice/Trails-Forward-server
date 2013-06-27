/* 
 *  TrailsForwardGlobals object:
 *		- References to major objects for reliable communication
 *  	- shared values
 * 
 */


function TrailsForwardGlobals(){

}
 
TrailsForwardGlobals.prototype = {
 
 	constructor : TrailsForwardGlobals,
 
 	initialize : function(dataControllerRef, helperFunctionsRef, impactRef){
 	
 		  /* references to objects */
 		this.DATA_CONTROLLER = dataControllerRef;
 		this.SERVER_API = this.DATA_CONTROLLER.serverAPI;
 		this.HELPER_FUNCTIONS = helperFunctionsRef;
 		this.IMPACT = impactRef;
 		
 		  /* shared values */
 		this.FULL_DEBUGGING = false;
 		this.CHUNK_WIDTH = 16;
 	},
 
};
 