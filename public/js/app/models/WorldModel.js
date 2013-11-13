var TFApp = window.TFApp || {};

TFApp.WorldModel = Backbone.Model.extend({
	tiles: [],
	defaults:{
		world_id: -1,
		name: "",
		width: 0,
		height: 0,
		contractCollection: {},
		upgradeCollection: {},
		dirtyTiles: [],
		staleTiles: []

	},
	initialize: function(){
		//this.on("change:world_id", this.loadWorldTiles);

		//this.loadWorld();


	},
	loadWorld: function(worldId){
		var that = this;
		//get the world data
		//http://localhost:3000/worlds/3.json
		$.ajax({
			type: "get",
			url: "/worlds/" + worldId + ".json" + TFApp.models.userModel.get("authQueryString"),
			dataType: "json",
			success: function(data){
				var world = data.world;
				that.set({
					world_id: worldId,
					height: world.height,
					width: world.width,
					name: world.name,
					year_current: world.year_current,
					current_turn: world.current_turn,
					players: world.players
				});


				var contractsUrl = 	"/worlds/" + 
						  			that.get("world_id") + 
						  			"/contracts.json" + TFApp.models.userModel.get("authQueryString") +
						  			"&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
				that.set("contractCollection", new TFApp.ContractCollection({url: contractsUrl}));


				// /worlds/:world_id/logging_equipment
				var upgradesUrl = 	"/worlds/" + 
						  			that.get("world_id") + 
						  			"/logging_equipment.json" + TFApp.models.userModel.get("authQueryString") +
						  			"&player_id=" + TFApp.models.currentPlayerModel.get("player_id");
				that.set("upgradeCollection", new TFApp.UpgradeCollection({url: upgradesUrl}));



				for(var x = 0;x<64;x++){
					that.tiles[x]=[];
				}

				that.getBasicInfoForTiles({x: 0, y: 0, width: 64, height: 64});
				that.getSurveyDataForTiles();


			},
			error: function(data){
				console.log("Login Error: ", data);
			}
		});
	},
	getBasicInfoForTiles: function(rect){
		var that = this;
		var someUrl = "/worlds/" + that.get("world_id") + 
				  "/resource_tiles/" +
				  TFApp.models.userModel.get("authQueryString") +
				  "&x_min=" + rect.x +
				  "&y_min=" + rect.y + 
				  "&x_max=" + (rect.x + rect.width) + 
				  "&y_max=" + (rect.y + rect.height);

		$.ajax({
			type: "get",
			url: someUrl,
			dataType: "json",
			success: function(data){

				for(var i = 0;i<data.length;i++){
					var someTile = data[i].table;
					that.tiles[someTile.x] = that.tiles[someTile.x] || [];
					that.tiles[someTile.x][someTile.y] = someTile;
				}
				that.set("tiles", that.tiles);

				//that.set({tiles: data});
			},
			error: function(data){
				console.error("Login Error: ", data);
			}
		});	
	},
	getSurveyDataForTiles: function(){
		var that = this;
		var someUrl = 
				  "/players/" + TFApp.models.currentPlayerModel.get("player_id") + 
				  "/surveys_for_player" +
				  TFApp.models.userModel.get("authQueryString");

		$.ajax({
			type: "get",
			url: someUrl,
			dataType: "json",
			success: function(data){

				///TODO: reduce the surveys, only keeping the most recent for a given x y

				for(var i = 0; i<data.surveys.length;i++){
					var siblingPositions = that.getTileSiblings({x: data.surveys[i].table.x, y:data.surveys[i].table.y});
					for(var j = 0; j<siblingPositions.length; j++){
						var pos = siblingPositions[j];
						
						///TODO: This shouldn't be survey.survey
						if(that.tiles[pos.x] && that.tiles[pos.x][pos.y]){
							that.tiles[pos.x][pos.y].surveyData = data.surveys[i].table.survey.survey;
						}
					}
				}
				//that.set({tiles: data});
			},
			error: function(data){
				console.error("Getting surveys Error: ", data);
			}
		});	



	},

	//in: pos {x: ?, y: ?}
	//out: the positions of all tiles in the megatile at given pos
	getTileSiblings: function(pos){
		var that = this;

		//TODO: Use megatile.size instead of 3
		var megatileRootPos = {x: Math.floor(pos.x/3)*3, y: Math.floor(pos.y/3)*3};
		var siblings = [];

		for(var tx = megatileRootPos.x; tx<megatileRootPos.x+3;tx++){
			for(var ty = megatileRootPos.y; ty<megatileRootPos.y+3; ty++){
				siblings.push({x: tx, y: ty});
			}
		}

		return siblings;

	}



});