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
		if(theObj){					
			for (var key in theObj){
				if (Array.isArray(theObj[key]) && !typeof theObj[key] === 'string'){
					for (var i = 0; i < theObj[key].length; i++){
						//console.log(key + "[" + i + "] = " + theObj[key][i]);	
					}
				}
				else if(typeof theObj[key] === 'object'){
					//console.log(key);
					//console.log("typeof theObj[key]: " + typeof theObj[key]);
					if(typeof theObj[key] === 'function' && !TFglobals.VERBOSE_FUNCTION_PRINTING)
						return;
					
					this.prettyPrintObject(theObj[key]);
				}
				else{
					//console.log(key + " : " + theObj[key]);

				}
			}
		}
 	},
	
	 /* copy non-object and non-array properties and their values from from obj to another */
	addSimplePropertiesFromObjToObj : function(fromObj, toObj){									
		if(fromObj && toObj){
			for (var key in fromObj){
				if ((typeof fromObj[key] !== 'object' && !Array.isArray(fromObj[key])) || typeof fromObj[key] === 'string'){					
					toObj[key] = fromObj[key];
				}
				else ;
			}
		}
	},
	
 	  /*  */
 	buildObjectFromNamesListAndValuesList : function(aNamesList, aValuesList){
		if(aNamesList && aValuesList && aNamesList.length == aValuesList.length){
 	  		var obj = {};
			for (var i = 0; i < aNamesList.length; i++)
				obj[aNamesList[i]] = aValuesList[i];
			return obj;
		}
		else console.log("bad input");
 	},
	
	  /* regular and verbose debugging statements for a function and it's parameters and arguments as desired */
	printDesiredDebugInfo : function(functionName, argumentNames, argumentValues, regularDebugging, verboseDebugging){
		if(functionName && argumentNames && argumentValues && (regularDebugging || regularDebugging == false) &&
										verboseDebugging || verboseDebugging == false){
			if(regularDebugging)
				console.log(functionName + this.functionArgumentsToStringFromNamesListAndValuesList(argumentNames, argumentValues));
			if(verboseDebugging)
				this.prettyPrintObjectsListWithOptionalHeadersList(argumentValues, argumentNames);
		}
		else ;
	},
	
	 /* verbose debugging statement */
	prettyPrintObjectsListWithOptionalHeadersList : function(theObjects, theHeaders){	
		var length =  theHeaders ? Math.max(theObjects.length, theHeaders.length) : theObjects.length;
		for(var i = 0; i < length; i++){
			if(theHeaders) console.log(i < theHeaders.length ? theHeaders[i] : "NoHeaderGivenError");
			i < theObjects.length ? this.prettyPrintObject(theObjects[i]) : "NoObjectGivenError";
		}
	},
	
	  /* example: (["num", "name"],[4, "Jim"]) => "(num = 4, name = Jim)" */
	functionArgumentsToStringFromNamesListAndValuesList : function(namesList, valuesList){		
		if(namesList.length == 0 && valuesList.length == 1 && valuesList[0] instanceof Event)
			return " called with event object";
	
		var length = Math.max(namesList.length, valuesList.length);
		var theString = "(";
		for(var i = 0; i < length; i++){
			theString += namesList.length > i ? namesList[i] : "NoNameGivenError";
			theString += " = ";
			if(valuesList.length <= i)
				theString += "NoValueGivenError";
			else if(typeof valuesList[i] === 'function' && !TFglobals.VERBOSE_FUNCTION_PRINTING)
				theString += "()";
			else
				theString += valuesList[i];
			if (i < length - 1) theString += ", ";
		}
		return theString + ")";
	},
	
};
