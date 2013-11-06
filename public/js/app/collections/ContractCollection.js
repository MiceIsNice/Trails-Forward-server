var TFAPP = window.TFAPP || {};

TFApp.ContractCollection = Backbone.Collection.extend({

	//model: TFApp.ContractModel,

	initialize: function(args){
		this.url = args.url;
		this.fetch({reset: true});
	},
	fetch: function(args){
		var that=this;
		$.ajax({
			type: "get",
			url: this.url,
			dataType: "json",
			success: function(data){
				console.log("Contract Collection fetch success!! ", data);
				that.reset(data);
				//that.trigger("change");
			},
			error: function(data){
				console.log(that.url);
				console.error("Error fetching Contract Collection: ", data);
			}
		});
	}
});