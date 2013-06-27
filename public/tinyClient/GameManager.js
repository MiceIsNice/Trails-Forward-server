/* GameManager.js
 * Definition for GameManager object
 * 
 */
 


GameManager.prototype = {

	constructor : GameManager,

	initialize : function(){
		this.currentPlayer = null; 
		this.worldData = new WorldData();
		this.worldData.initializeWithData();
	},	
};

function GameManager (){
	
}
