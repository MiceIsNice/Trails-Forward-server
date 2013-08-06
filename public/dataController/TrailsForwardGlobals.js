/* 
 *  TrailsForwardGlobals object:
 *		- References to major objects for reliable communication
 *  	- shared values
 * 
 */


function TrailsForwardGlobals(){
	console.log("TrailsForwardGlobals");
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
 		  
 		  // debugging status codes: 
 		this.FULL_DEBUGGING = false;
 		this.FULL_DEBUGGING_VERBOSE = false;
 		this.DC_DEBUGGING = true;
 		this.DC_DEBUGGING_VERBOSE = false;
 		this.HF_DEBUGGING = false;
 		this.HF_DEBUGGING_VERBOSE = false;
 		this.GDC_DEBUGGING = false;
 		this.GDC_DEBUGGING_VERBOSE = false;
 		this.S_API_DEBUGGING = false;
 		this.S_API_DEBUGGING_VERBOSE = false;
 		this.I_DUMMY_DEBUGGING = false;
 		this.I_DUMMY_DEBUGGING_VERBOSE = false;
 		this.DC_TESTER_DEBUGGING = false;
 		this.DC_TESTER_DEBUGGING_VERBOSE = false;
 		
 		this.CHUNK_WIDTH = 16;
 		this.SUCCESS = 1;
 		this.FAILURE = 2;
 	}
 
};

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};
