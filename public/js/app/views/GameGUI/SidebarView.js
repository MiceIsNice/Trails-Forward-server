var TFApp = window.TFApp || {};

TFApp.SidebarView = Backbone.View.extend({

	el: ".other-info",

	events:{
		"click .contracts tr": "confirmAcceptContract",
		"click .my-contracts tr": "completeContract",
		"click .upgrades tr": "purchaseUpgrade",
	},


	initialize: function(){
		var that = this;
		//cache some elements
		this.$contracts = this.$el.find(".contracts");
		this.$myContracts = this.$el.find(".my-contracts");

		this.$upgrades = this.$el.find(".upgrades");
		this.$myUpgrades = this.$el.find(".my-upgrades");

		//handling 'nested collections' is less than glamorous
		TFApp.models.currentWorldModel.on("change:contractCollection", function(){
			var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
			contractCollection.on("reset", that.updateContracts, that);
		});

		TFApp.models.currentWorldModel.on("change:upgradeCollection", function(){
			var upgradeCollection = TFApp.models.currentWorldModel.get("upgradeCollection");
			upgradeCollection.on("reset", that.updateWorldUpgrades, that);
		});

		TFApp.models.currentPlayerModel.on("change:upgradeCollection", function(){
			var upgradeCollection = TFApp.models.currentPlayerModel.get("upgradeCollection");
			upgradeCollection.on("reset", that.updatePlayerUpgrades, that);
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
				if(contract.get("successful")){

				}else{
					var $tr = $('<tr class="contract white-bar hoverable" data-contract-id="'+contract.get("id")+'"></tr>');
					var $nameTd = $('<td class="contract-name">'+contract.get("codename")+'</td>');
					var $lumberTd = $('<td class="lumber lumber-icon">'+contract.get("volume_required")+'</td>');
					var $rewardTd = $('<td class="money currency-icon">'+contract.get("earnings")+'</td>');
					$tr.append($nameTd);
					$tr.append($lumberTd);
					$tr.append($rewardTd);
					$myContractsTable.append($tr);
					myContractCount++;
				}

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
	confirmAcceptContract: function(e){
		var that = this;
		var cid = $(e.currentTarget).data("contract-id");

		TFApp.views.gameView.showConfirmationModal(

			that.acceptContract,
			cid,
			"Accept this contract?",
			"Press confirm to accept this contract"

		);



	},
	acceptContract: function(cid, successCallback, ctx){
		
		//rails route: /worlds/:world_id/players/:player_id/available_contracts/:available_contract_id/accept
		var url = "/worlds/" + TFApp.models.currentWorldModel.get("world_id") + 
				  "/players/" + TFApp.models.currentPlayerModel.get("player_id") + 
				  "/available_contracts/" + cid +
				  "/accept" + TFApp.models.userModel.get("authQueryString") +
				  "&contract_id=" + cid;


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
					if(successCallback && ctx){
						successCallback.call(ctx);
					}
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


		$.ajax({
			type: "post",
			url: url,
			dataType: "json",
			success: function(data){
				var contractCollection = TFApp.models.currentWorldModel.get("contractCollection");
				contractCollection.fetch();
				console.log("Complete Contract Success: ", data);
				TFApp.models.currentPlayerModel.loadPlayerData();
			},
			error: function(data){
				console.log("Complete Contract Error: ", data);
				TFApp.views.gameView.showErrorModal("Unable to complete contract");
			}
		});
	},
	updateWorldUpgrades: function(e){
		var upgrades = TFApp.models.currentWorldModel.get("upgradeCollection");
		var $upgradesTable = this.$upgrades.find("table");

		$upgradesTable.empty();

		for(var i = 0;i<upgrades.models.length;i++){
			var upgrade = upgrades.models[i];



            // <tr class="upgrade white-bar hoverable" data-upgrade-id="3">
            //     <td class="upgrade-name">upgrade 03</td>
            //     <td class="lumber">400</td>
            //     <td class="money currency-icon">2000</td>
            // </tr>

			var $tr = $('<tr class="upgrade white-bar hoverable" data-upgrade-id="'+upgrade.get("id")+'"></tr>');
			var $nameTd = $('<td class="upgrade-name">'+upgrade.get("name")+'</td>');
			var $lumberTd = $('<td class="harvest-volume axe-icon">'+upgrade.get("harvest_volume")+'</td>');
			var $costTd = $('<td class="initial-cost currency-icon">'+upgrade.get("initial_cost")+'</td>');
			$tr.append($nameTd);
			$tr.append($lumberTd);
			$tr.append($costTd);
			$upgradesTable.append($tr);

		}


	},
	updatePlayerUpgrades: function(e){
		var upgrades = TFApp.models.currentPlayerModel.get("upgradeCollection");
		var $myUpgradesTable = this.$myUpgrades.find("table");

		$myUpgradesTable.empty();

		for(var i = 0;i<upgrades.models.length;i++){
			var upgrade = upgrades.models[i];



            // <tr class="upgrade white-bar hoverable" data-upgrade-id="3">
            //     <td class="upgrade-name">upgrade 03</td>
            //     <td class="lumber">400</td>
            //     <td class="money currency-icon">2000</td>
            // </tr>

			var $tr = $('<tr class="upgrade white-bar hoverable" data-upgrade-id="'+upgrade.get("id")+'"></tr>');
			var $nameTd = $('<td class="upgrade-name">'+upgrade.get("name")+'</td>');
			var $lumberTd = $('<td class="harvest-volume axe-icon">'+upgrade.get("harvest_volume")+'</td>');
			var $costTd = $('<td class="initial-cost currency-icon">'+upgrade.get("initial_cost")+'</td>');
			$tr.append($nameTd);
			$tr.append($lumberTd);
			$tr.append($costTd);
			$myUpgradesTable.append($tr);

		}


	},
	purchaseUpgrade: function(e){
		var uid = $(e.currentTarget).data("upgrade-id");
		
		//rails route: /worlds/:world_id/logging_equipment/:id/buy
		var url = "/worlds/" + TFApp.models.currentWorldModel.get("world_id") + 
				  "/logging_equipment/" + uid + 
				  "/buy.json" + TFApp.models.userModel.get("authQueryString");


		$.ajax({
			type: "put",
			url: url,
			dataType: "json",
			success: function(data){
				var myUpgradeCollection = TFApp.models.currentPlayerModel.get("upgradeCollection");
				myUpgradeCollection.fetch();
				var worldUpgradeCollection = TFApp.models.currentWorldModel.get("upgradeCollection");
				worldUpgradeCollection.fetch();
				TFApp.models.currentPlayerModel.loadPlayerData();
				
			},
			error: function(data){
				console.log("Complete Contract Error: ", data);
				TFApp.views.gameView.showErrorModal("Unable to complete contract");
			}
		});
	}





});