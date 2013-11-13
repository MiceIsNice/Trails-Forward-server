var TFAPP = window.TFAPP || {};

TFApp.UpgradeCollection = Backbone.Collection.extend({

	//model: TFApp.ContractModel,

	initialize: function(args){
		this.url = args.url;
		this.fetch({reset: true});
	},
	fetch: function(args){
		var that=this;
		console.log(this.url);
		$.ajax({
			type: "get",
			url: this.url,
			dataType: "json",
			success: function(data){
				console.log("Upgrade Collection fetch success!! ", data);
				that.reset(data.logging_equipment_list);
				//that.trigger("change");
			},
			error: function(data){
				console.log(that.url);
				console.error("Error fetching Upgrade Collection: ", data);
			}
		});
	}
});