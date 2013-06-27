/* HelperFunctions.js
 * Definition for HelperFunctions object 
 * 
 */

HelperFunctions.prototype = {

	constructor: HelperFunctions,
	
	SET : 'set_',
	GET : 'get_',

	addPropertiesFromObjToObj : function(fromObj, toObj){
		for(var key in fromObj){
			//console.log("adding " + key + " : " + fromObj[key]);
			toObj[key] = fromObj[key];
		}
	},
	
		// add a get_ and set_ function for all non-function properties of an obj
	buildGettersAndSettersFromPropertiesForObj : function(anObj){
		for(var key in anObj){
			if(typeof(anObj[key]) != 'function'){
				anObj.constructor.prototype[this.GET + key] = function(){return this.key;};
				anObj.constructor.prototype[this.SET + key] = function(aValue){this.key = aValue;};
			}
		}
/**
		console.log("completed object: " + anObj);
		for(var key in anObj)
			console.log(key + ": " + anObj[key]);
**/	
	},

	  // property: type string	
	  // relies on our method of building getters and setter using GET and SET strings
	  // ... perhaps at this point the strings could be avoided entirely 
	getPropertyFromObj : function(property, obj){
		if(obj[this.GET + property])
			return obj[this.GET + property]();
		else
			console.log("HelperFunctions.getPropertyFromObj: no property: " + property + " for object: " + obj);
	},
	
	  // property: type string
	setPropertyWithValueForObject : function(property, value, obj){
		if(obj && value && property)
			obj[this.SET + property](value);
		else
			console.log("HelperFunctions.setPropertyWithValueForObject: failure setting property: " 
							+ property + " to value: " + value + " for object: " + obj);
		
	},

};

function HelperFunctions(){

}

var helperFunctions = new HelperFunctions();

