var TFApp = window.TFApp || {};

TFApp.SidebarView = Backbone.View.extend({

	el: ".other-info",

	events:{

	},


	initialize: function(){
		var that = this;
		//cache some elements
		this.$contracts = this.$el.find(".contracts");
		this.$myContracts = this.$el.find(".my-contracts");


		//handling 'nested collections' is less than glamorous
		TFApp.models.currentWorldModel.on("change:contractCollection", function(){
			var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
			console.log(contractCollection);
			contractCollection.on("reset", that.updateContracts, that);
		});

	},
	render: function(){
		//TODO
	},
	start: function(){
		console.log("Starting Sidebar View");
	},
	updateContracts: function(){
		// var contracts = TFApp.models.currentWorldModel.get("contractCollection");
		// console.log("updateContracts", contracts);
		// this.$contracts.find("table").empty();
		// this.$myContracts.find("table").empty();
		// for(var i = 0;i<contracts.models.length;i++){

		// 	var contract = contracts.models[i].get("contract");
		// 	if(contract.player_id == TFApp.models.currentPlayerModel.get("player_id")){

		// 	}else{
		// 		var $tr = $('<tr class="contract white-bar"></tr>');
		// 		var $nameTd = $('<td class="contract-name">'+contract.id+'</td>');
		// 		var $lumberTd = $('<td class="lumber lumber-icon">'+contract.id+'</td>');
		// 		// <tr class="contract white-bar hoverable" data-contract-id="1">
		// 		// 	<td class="contract-name">Contract 01</td>
		// 		// 	<td class="lumber lumber-icon">400</td>
		// 		// 	<td class="money currency-icon">2000</td>
		// 		// </tr>
		// 	}
		// 	console.log(contract);

		// }
	},
	updatePlayerValues: function(){

	}





});