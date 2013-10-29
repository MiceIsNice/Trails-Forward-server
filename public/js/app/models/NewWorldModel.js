var WorldModel = Backbone.Model.extend({
	defaults:{
		world_id: -1,
		created_at: "",
		current_turn: 1,
		height: 64,
		width: 64,
		human_population: 0,
		livable_tiles_count: 0,
		marten_suitable_tile_count: 2840,
		megatile_height: 3,
		megatile_width: 3,
		name: "",
		players: [],
		turn_started_at: "",
		updated_at: "",
		year_current: 1800,
		year_start: 1800,
		tiles: []

	},
	initialize: function(){
		this.on("change:world_id", this.loadWorldTiles);
	},
	loadWorld: function(worldId){
		that = this;

		//get the world data
		//http://localhost:3000/worlds/3.json
		$.ajax({
			type: "get",
			url: "/worlds/" + worldId + ".json",
			dataType: "json",
			success: function(data){
				var world = data.world;

				that.set({
					world_id: worldId,
					height: world.height,
					width: world.width,
					name: world.name
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