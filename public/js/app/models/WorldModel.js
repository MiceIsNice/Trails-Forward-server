var TFApp = window.TFApp || {};

TFApp.WorldModel = Backbone.Model.extend({
	defaults:{
		world_id: -1,
		name: "",
		width: 0,
		height: 0

	},
	initialize: function(){
		//this.on("change:world_id", this.loadWorldTiles);

		//this.loadWorld();

	},
	loadWorld: function(worldId){
		that = this;
		//get the world data
		//http://localhost:3000/worlds/3.json
		$.ajax({
			type: "get",
			url: "/worlds/" + worldId + ".json" + TFApp.models.userModel.get("authQueryString"),
			dataType: "json",
			success: function(data){
				var world = data.world;
				console.debug(world);
				that.set({
					world_id: worldId,
					height: world.height,
					width: world.width,
					name: world.name,
					year_current: world.year_current,
					current_turn: world.current_turn,
					players: world.players
				});

				console.log("Getting World Data Success: ", data);
			},
			error: function(data){
				console.log("Login Error: ", data);
			}
		});



	},
	loadWorldTiles: function(){
		var that = this;

		var theWidth = 32;//that.get("width")-1;
		var theHeight = 32;//that.get("height")-1;

		var someUrl = "/worlds/" + that.get("world_id") + 
					  "/resource_tiles/?x_min=1&y_min=1" + 
					  "&x_max=" + theWidth + "&y_max=" + theHeight;

		$.ajax({
			type: "get",
			url: someUrl,
			dataType: "json",
			success: function(data){
				that.set({tiles: data});
				//that.set(tiles: data);
			},
			error: function(data){
				console.error("Login Error: ", data);
			}
		});
		//get it's tiles
		//http://localhost:3000/worlds/3/resource_tiles/?x_min=1&x_max=125&y_min=1&y_max=125



	}
});