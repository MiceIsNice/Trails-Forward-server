var TFApp = window.TFApp || {};
//var TFglobals = new TrailsForwardGlobals();

var GameModel = Backbone.Model.extend({
	defaults:{
		currentWorldId: 0,
	},



	initialize: function(){
		var that = this;
		this.on("change:selectedTileCoords", function(){
			//console.log(that.get("selectedTileCoords"));
		});
	}

});
