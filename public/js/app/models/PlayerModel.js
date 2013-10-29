var TFApp = window.TFApp || {};
TFApp.PlayerModel = Backbone.Model.extend({
	defaults:{
		user_id: "",
		world_id: "",
		type: "",
		time_remaining_this_turn: 0,
		balance: "0",
		currency: "0",
		player_id: 0
	},
	initialize: function(){
		var that = this;

		this.on("change:player_id", that.loadPlayerData);
	},
	getPlayerId: function(worldId){
		that = this;

		var user_id = TFApp.models.userModel.get("user_id");
		var worldPlayers = TFApp.models.currentWorldModel.get("players");

		for(var i = 0;i<worldPlayers.length;i++){
			if (worldPlayers[i].user_id == user_id){
				this.set("player_id", worldPlayers[i].id);

				//found, break the cycle!
				i = worldPlayers.length;
			}
		}



	},
	loadPlayerData: function(){
		var player_id = this.get("player_id");
		var user_id = TFApp.models.userModel.get("user_id");

		$.ajax({
			type: "get",
			url: "/users/" + user_id + "/players/" + player_id + ".json" + TFApp.models.userModel.get("authQueryString"),
			dataType: "json",
			success: function(data){
				var player = data.player;
				console.debug(player);
				that.set({
					balance: player.balance,
					time_remaining_this_turn: player.time_remaining_this_turn,
					type: player.type
				});


				console.log("Getting Player Data Success: ", data);
			},
			error: function(data){
				console.log("Getting Player Data Error: ", data);
			}
		});

	}

});