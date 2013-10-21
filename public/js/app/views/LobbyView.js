var TFApp = window.TFApp || {};

TFApp.LobbyView = Backbone.View.extend({

	el: ".lobby-wrapper",
	events:{
		//"mousewheel .three-container": "handleScroll"
		"click .join": "attemptJoin"
	},


	initialize: function(){
		var that = this;
		console.log("LobbyView.initialize");
		this.$myPlayerList = this.$el.find(".my-player-list");
		this.$myWorldList = this.$el.find(".my-world-list");
		this.$myWorldTableBody = this.$el.find(".my-world-table tbody");
		this.$allWorldTableBody = this.$el.find(".all-world-table tbody");


		TFApp.collections.userPlayers.on("change reset", that.updateUserPlayerList, this);
		TFApp.collections.allWorlds.on("change reset", that.updateUserWorldList, this);
		TFApp.collections.allWorlds.on("change reset", that.updateAllWorldList, this);

	},
	render: function(){
		//TODO
	},
	start: function(){
		
	},
	updateUserPlayerList: function(){

		var that = this;

		this.$myPlayerList.empty();
		var userPlayers = TFApp.collections.userPlayers;

		if(userPlayers!=undefined){
			_.each(userPlayers.models, function(p){
				var li = $("<li>" + p.get("type") + "</li>");
				that.$myPlayerList.append(li);

			});

		}else{
			console.warn("userPlayers was undefined");

		}
	},
	updateUserWorldList: function(){
		var that = this;


		var allWorlds = TFApp.collections.allWorlds;
		var userPlayers = TFApp.collections.userPlayers;
		var userWorldsWithPlayer = [];

		_.each(userPlayers.models, function(player){
			_.each(allWorlds.models, function(world){
				if(player.get("world_id")==world.get("id")){
					userWorldsWithPlayer.push({"world": world, "player": player});
				}
			});
		});


		that.$myWorldTableBody.empty();

		_.each(userWorldsWithPlayer, function(worldWithPlayer){
			var tr = $("<tr></tr>");
			var worldIdTd = $("<td>" + worldWithPlayer.world.get("id") + "</td>");
			var worldNameTd = $("<td>" + worldWithPlayer.world.get("name") + "</td>");
			var classTd = $("<td>" + worldWithPlayer.player.get("type") + "</td>");
			var timeReminingTd = $("<td>" + worldWithPlayer.player.get("time_remaining_this_turn") + "</td>");

			//view button
			var goTd = $("<td class=\"go\"></td>");
			var goAnchor = $("<a href=#world/" + worldWithPlayer.world.get("id") + ">GO!!!</a>");
			goTd.append(goAnchor);

			tr.append(worldIdTd);
			tr.append(worldNameTd);
			tr.append(classTd);
			tr.append(timeReminingTd);
			tr.append(goTd);

			that.$myWorldTableBody.append(tr);
		});

	},
	updateAllWorldList: function(){
		var that = this;


		var allWorlds = TFApp.collections.allWorlds;

		_.each(allWorlds.models, function(world){
			
			var tr = $("<tr></tr>");

			var worldIdTd = $("<td>" + world.get("id") + "</td>");
			var worldNameTd = $("<td>" + world.get("name") + "</td>");

			//join button
			///TODO: test players ability to join before showing
			var joinTd = $("<td></td>");
			var joinAnchor = $("<input type=\"button\" value=\"join\" class=\"join\" data-world-id=\""+ world.get("id") +"\">");
			joinTd.append(joinAnchor);

			//view button
			var viewTd = $("<td class=\"view\"></td>");
			var viewAnchor = $("<a href=#world/" + world.get("id") + ">View</a>");
			viewTd.append(viewAnchor);

			tr.append(worldIdTd);
			tr.append(worldNameTd);
			tr.append(joinTd);
			tr.append(viewTd);

			that.$allWorldTableBody.append(tr);
		});

	},
	attemptJoin: function(e){
		e.preventDefault();
		var $target = $(e.target);
		TFApp.models.userModel.joinWorld($target.data("world-id"));
		return false;


	}
});