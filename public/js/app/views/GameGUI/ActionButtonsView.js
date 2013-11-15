var TFApp = window.TFApp || {};

TFApp.ActionButtonsView = Backbone.View.extend({
	
	//-----------------------------------------------
	el: ".action-bar",
	events:{
		"click .buy-button": "setActionToBuyTile",
		"click .survey-button": "setActionToSurvey",
		"click .clear-cut-button": "setActionToClearCut",
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

	setActionToBuyTile: function(){
		TFApp.views.worldView.clickAction = this.attemptToBuyTile;
		//TFApp.views.worldView.materials.highlight.color = new THREE.Color( 0x006600 );
		//TFApp.views.worldView.materials.highlight.map = THREE.ImageUtils.loadTexture("/img/game-icons/actions/dollar.png");
		TFApp.views.worldView.materials.highlight.uniforms.texture.value = THREE.ImageUtils.loadTexture("/img/game-icons/actions/dollar.png");
		TFApp.views.worldView.materials.highlight.needsUpdate = true;
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
						TFApp.models.currentWorldModel.get("dirtyTiles").push({x: tile_x, z: tile_y});
						TFApp.models.currentWorldModel.trigger("change:dirtyTiles");

						//TFApp.views.worldView.redrawTile({x: tile_x, z: tile_y});
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
	setActionToSurvey: function(){
		TFApp.views.worldView.clickAction = this.attemptToSurveyTile;
		//TFApp.views.worldView.materials.highlight.color = new THREE.Color( 0x000066 );
		TFApp.views.worldView.materials.highlight.uniforms.texture.value = THREE.ImageUtils.loadTexture("/img/game-icons/actions/eye.png");
		TFApp.views.worldView.materials.highlight.needsUpdate = true;
	},
	attemptToSurveyTile: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		console.log(selectedTileCoords);
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


	setActionToClearCut: function(){
		TFApp.views.worldView.clickAction = this.attemptClearCut;
		//TFApp.views.worldView.materials.highlight.color = new THREE.Color( 0x660000 );
		TFApp.views.worldView.materials.highlight.uniforms.texture.value = THREE.ImageUtils.loadTexture("/img/game-icons/actions/saw.png");
		TFApp.views.worldView.materials.highlight.needsUpdate = true;
	},
	attemptClearCut: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		// POST /worlds/:world_id/resource_tiles/:UNUSED/clearcut
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
					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].large_tree_basal_area = 0;
					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].small_tree_basal_area = 0;
					TFApp.models.currentWorldModel.get("dirtyTiles").push({x: tile_x, z: tile_y});
					TFApp.models.currentWorldModel.trigger("change:dirtyTiles");
					//update the player data
					TFApp.models.currentPlayerModel.loadPlayerData();
					
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