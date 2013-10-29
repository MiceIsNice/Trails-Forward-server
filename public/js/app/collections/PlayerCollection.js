var TFAPP = window.TFAPP || {};

var PlayerCollection = Backbone.Collection.extend({

	model: PlayerModel,

	initialize: function(args){
	},
	fetch: function(args){
		var that=this;
		$.ajax({
			type: "get",
			url: this.url,
			dataType: "json",
			success: function(data){
				console.log("Player collection fetch success!! ", data.players);
				that.reset(data.players);
			},
			error: function(data){
				console.error("Error fetching Users Player Collection: ", data);
			}
		});
	}
});