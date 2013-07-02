/* 
 *  TrailsForwardHelperFunctions object:
 *		- Contains printing and property assignment methods
 * 
 */
function TrailsForwardHelperFunctions(){

}

TrailsForwardHelperFunctions.prototype = {

	constructor : TrailsForwardHelperFunctions,

	prettyPrintObject : function(theObj){
 		for (var key in theObj){
			if (Array.isArray(theObj[key]) && !typeof theObj[key] === 'string'){
				for (var i = 0; i < theObj[key].length; i++){
					console.log(key + "[" + i + "] = " + theObj[key][i]);	
				}
			}
			else if(typeof theObj[key] === 'object'){
				console.log(key);
				this.prettyPrintObject(theObj[key]);
			}
			else 
				console.log(key + " : " + theObj[key]);
		}
 	},
 	
 	/* doesn't make a deep copy of arrays and objects, but may not be an issue since it's 
 		being used with a freshly parsed JSON string from the server each time */
 	addPropertiesFromObjToObj : function(fromObj, toObj){
		for (var key in fromObj){
			if (TFglobals.FULL_DEBUGGING == true) console.log("adding " + key + " : " + fromObj[key]);
			toObj[key] = fromObj[key];
		}
	},
	
	 /* copy non-object and non-array properties and their values from from obj to another */
	addSimplePropertiesFromObjToObj : function(fromObj, toObj){
		for (var key in fromObj){
			if ((typeof fromObj[key] !== 'object' && !Array.isArray(fromObj[key])) || typeof fromObj[key] === 'string'){
			    if (TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardHelperFunctions.addSimplePropertiesFromObjToObj: adding " + key + " : " + fromObj[key]);
			    	toObj[key] = fromObj[key];
			    }
			else
			    if (TFglobals.FULL_DEBUGGING == true) console.log("TrailsForwardHelperFunctions.addSimplePropertiesFromObjToObj: not adding " + key + " : " + fromObj[key]);
		}
	},
	
};
