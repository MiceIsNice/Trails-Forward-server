var TFAPP = window.TFAPP || {};
var WorldCollection = Backbone.Collection.extend({
	model: TFApp.WorldModel,
	fetch: function(args){
		var that=this;
		$.ajax({
			type: "get",
			url: this.url,
			dataType: "json",
			success: function(data){
				//console.log("World collection fetch success!! ", data.worlds);
				that.reset(data.worlds);
			},
			error: function(data){
				console.error("Error fetching Users Player Collection: ", data);
			}
		});
	}
});