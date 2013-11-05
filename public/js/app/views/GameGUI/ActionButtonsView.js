var TFApp = window.TFApp || {};

TFApp.ActionButtonsView = Backbone.View.extend({
	
	//-----------------------------------------------
	el: ".action-bar",
	events:{
		"click .buy-button": "attemptToBuyTile",
		"click .survey-button": "attemptToSurveyTile",
		"click .clear-cut-button": "attemptClearCut",
		"click .diameter-cut-button": "attemptDiameterCut"
	},
	//-----------------------------------------------

	//-----------------------------------------------
	initialize: function(){
		var that = this;
		//cache some elements
		this.$worldName = this.$el.find(".world-name");
	},
	render: function(){
	},
	start: function(){
	},
	attemptToBuyTile: function(){
		
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];



		if(selectedTileCoords!==undefined){
			$.ajax({
				type: "put",
				url: "/worlds/" + TFApp.models.currentWorldModel.get("world_id") 
				+ "/megatiles/2/buy/" 
				+ TFApp.models.userModel.get("authQueryString") 
				+ "&tile_x=" + tile_x + "&tile_y=" + tile_y
				+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id"),
				dataType: "json",
				success: function(data){
					
					if(data.errors){
						console.log("Buy Tile Error: ", data);

					}
					else{
						console.log("Buy Tile Success: ", data);
						//update the player data
						TFApp.models.currentPlayerModel.loadPlayerData();
						
						var x = data.megatile_upper_left_xy.x,
							y = data.megatile_upper_left_xy.y;

						TFApp.models.currentWorldModel.tiles[tile_x][tile_y].owner = TFApp.models.currentPlayerModel.get("player_id");
						TFApp.views.worldView.redrawTile({x: tile_x, z: tile_y});
					}


					// for(var tx = x; tx<x+3; tx++){
					// 	for(var ty = y; ty<y+3; ty++){
					// 		TFglobals.IMPACT.ownedTiles = TFglobals.IMPACT.ownedTiles || [];
					// 		TFglobals.IMPACT.ownedTiles[tx] = TFglobals.IMPACT.ownedTiles[tx] || [];
					// 		TFglobals.IMPACT.ownedTiles[tx][ty] = true;		
					// 	}
					// }


				},
				error: function(data){
					console.log("Buy Tile Error: ", data);
				}
			});

		}else{
			console.warn("No tile selected. Doing nothing.");
		}
	},
	attemptToSurveyTile: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");

		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		if(selectedTileCoords!==undefined){
			$.ajax({
				type: "post",
				url: "/worlds/" + TFApp.models.currentWorldModel.get("world_id") 
				+ "/megatiles/2/surveys.json" 
				+ TFApp.models.userModel.get("authQueryString") 
				+ "&tile_x=" + tile_x + "&tile_y=" + tile_y
				+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id"),
				dataType: "json",
				success: function(data){
					console.log("Survey Tile Success: ", data);
					if(data.errors){
						TFApp.views.gameView.showErrorModal(data.errors[0]);
					}
					else{
						var siblingPositions = TFApp.models.currentWorldModel.getTileSiblings({x: tile_x, y: tile_y});
						for(var j = 0; j<siblingPositions.length; j++){
							var pos = siblingPositions[j];
							
							///TODO: This shouldn't be survey.survey
							if(TFApp.models.currentWorldModel.tiles[pos.x] && TFApp.models.currentWorldModel.tiles[pos.x][pos.y]){
								TFApp.models.currentWorldModel.tiles[pos.x][pos.y].surveyData = data.survey;
							}
						}

						//update the player data
						TFApp.models.currentPlayerModel.loadPlayerData();
						
						//kind of hacky, triggering a change of the current tile coords
						//to trigger a redraw of some ui elements
						TFApp.models.gameModel.trigger("change:selectedTileCoords");
					}

				},
				error: function(data){
					console.error("Survey Tile Error: ", data);
				}
			});

		}else{
			console.warn("No tile selected. Doing nothing.");
		}
	},
	attemptClearCut: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		// POST /worlds/:world_id/resource_tiles/:id/clearcut
		$.ajax({
			type: "post",
			url: "/worlds/" + TFApp.models.currentWorldModel.get("world_id") 
			+ "/resource_tiles/2/clearcut" 
			+ TFApp.models.userModel.get("authQueryString") 
			+ "&tile_x=" + tile_x + "&tile_y=" + tile_y
			+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id"),
			dataType: "json",
			success: function(data){
				console.log("Clear Cut Tile Success: ", data);
				if(data.errors){
					TFApp.views.gameView.showErrorModal(data.errors[0]);
				}
				else{
					//update the player data
					TFApp.models.currentPlayerModel.loadPlayerData();
					
					var rect = {x_min : tile_x-1, x_max : tile_x+1, y_min : tile_y-1, y_max : tile_y+1};
					// TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
					// TFglobals.IMPACT.onInvalidateTile(tile_x, tile_y);
					//kind of hacky, triggering a change of the current tile coords
					//to trigger a redraw of some ui elements
					TFApp.models.gameModel.trigger("change:selectedTileCoords");
				}





			},
			error: function(data){
				TFApp.views.gameView.showErrorModal(data);
				console.error("Clear Cut Error: ", data);
			}
		});
	},
	attemptDiameterCut: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		// POST /worlds/:world_id/resource_tiles/:id/clearcut
		$.ajax({
			type: "post",
			url: "/worlds/" + TFApp.models.currentWorldModel.get("world_id") 
			+ "/resource_tiles/2/diameter_limit_cut" 
			+ TFApp.models.userModel.get("authQueryString") 
			+ "&tile_x=" + tile_x + "&tile_y=" + tile_y
			+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id"),
			dataType: "json",
			success: function(data){
				console.log("Clear Cut Tile Success: ", data);
				if(data.errors){
					TFApp.views.gameView.showErrorModal(data.errors[0]);
				}
				else{
					//update the player data
					TFApp.models.currentPlayerModel.loadPlayerData();
					
					//kind of hacky, triggering a change of the current tile coords
					//to trigger a redraw of some ui elements
					TFApp.models.gameModel.trigger("change:selectedTileCoords");
				}





			},
			error: function(data){
				TFApp.views.gameView.showErrorModal(data);
				console.error("Clear Cut Error: ", data);
			}
		});
	}
	//-----------------------------------------------

});