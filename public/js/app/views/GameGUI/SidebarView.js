var TFApp = window.TFApp || {};

TFApp.SidebarView = Backbone.View.extend({

	el: ".other-info",

	events:{
		"click .contracts tr": "acceptContract",
		"click .my-contracts tr": "completeContract"
	},


	initialize: function(){
		var that = this;
		//cache some elements
		this.$contracts = this.$el.find(".contracts");
		this.$myContracts = this.$el.find(".my-contracts");


		//handling 'nested collections' is less than glamorous
		TFApp.models.currentWorldModel.on("change:contractCollection", function(){
			var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
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
		var contracts = TFApp.models.currentWorldModel.get("contractCollection");
		var $contractsTable = this.$contracts.find("table");
		var $myContractsTable = this.$myContracts.find("table");

		$contractsTable.empty();
		$myContractsTable.empty();


		var myContractCount = 0;
		var availableContractCount = 0;
		for(var i = 0;i<contracts.models.length;i++){
			var contract = contracts.models[i];


			if(contract.get("player_id") == TFApp.models.currentPlayerModel.get("player_id")){
				var $tr = $('<tr class="contract white-bar hoverable" data-contract-id="'+contract.get("id")+'"></tr>');
				var $nameTd = $('<td class="contract-name">'+contract.get("codename")+'</td>');
				var $lumberTd = $('<td class="lumber lumber-icon">'+contract.get("volume_required")+'</td>');
				var $rewardTd = $('<td class="money currency-icon">'+contract.get("earnings")+'</td>');
				$tr.append($nameTd);
				$tr.append($lumberTd);
				$tr.append($rewardTd);
				$myContractsTable.append($tr);
				myContractCount++;
			}else{
				var $tr = $('<tr class="contract white-bar hoverable" data-contract-id="'+contract.get("id")+'"></tr>');
				var $nameTd = $('<td class="contract-name">'+contract.get("codename")+'</td>');
				var $lumberTd = $('<td class="lumber lumber-icon">'+contract.get("volume_required")+'</td>');
				var $rewardTd = $('<td class="money currency-icon">'+contract.get("earnings")+'</td>');
				$tr.append($nameTd);
				$tr.append($lumberTd);
				$tr.append($rewardTd);
				$contractsTable.append($tr);
				availableContractCount++;
			}

		}
	},
	updatePlayerValues: function(){

	},
	acceptContract: function(e){
		var cid = $(e.currentTarget).data("contract-id");
		
		//rails route: /worlds/:world_id/players/:player_id/available_contracts/:available_contract_id/accept
		var url = "/worlds/" + TFApp.models.currentWorldModel.get("world_id") + 
				  "/players/" + TFApp.models.currentPlayerModel.get("player_id") + 
				  "/available_contracts/" + cid +
				  "/accept" + TFApp.models.userModel.get("authQueryString");

		console.log(url);

		$.ajax({
			type: "post",
			url: url,
			dataType: "json",
			success: function(data){
				
				if(data.errors){
					console.log("Accepting Contract Error: ", data);
					TFApp.views.gameView.showErrorModal(data.errors);


				}else{
					var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
					contractCollection.fetch();
					console.log("Accepting Contract Success: ", data);
				}
			},
			error: function(data){
				console.log("Accepting Contract Error: ", data);
				TFApp.views.gameView.showErrorModal(data.responseJSON.errors);

			}
		});



	},
	completeContract: function(e){
		var cid = $(e.currentTarget).data("contract-id");
		
		//rails route: /worlds/:world_id/players/:player_id/contracts/:contract_id/deliver(.:format) POST
		var url = "/worlds/" + TFApp.models.currentWorldModel.get("world_id") + 
				  "/players/" + TFApp.models.currentPlayerModel.get("player_id") + 
				  "/contracts/" + cid +
				  "/deliver" + TFApp.models.userModel.get("authQueryString");

		console.log(url);

		$.ajax({
			type: "post",
			url: url,
			dataType: "json",
			success: function(data){
				var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
				contractCollection.fetch();
				console.log("Complete Contract Success: ", data);
			},
			error: function(data){
				console.log("Complete Contract Error: ", data);
				TFApp.views.gameView.showErrorModal(data.responseJSON.errors);
			}
		});



	}





});