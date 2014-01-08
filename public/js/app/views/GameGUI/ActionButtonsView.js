var TFApp = window.TFApp || {};

TFApp.ActionButtonsView = Backbone.View.extend({
	
	//-----------------------------------------------
	el: ".action-bar",
	events:{
		"click .buy-button": "setActionToBuyTile",
		"click .survey-button": "setActionToSurvey",
		"click .clear-cut-button": "setActionToClearCut",
		"click .diameter-cut-button": "attemptDiameterCut",
		"click .plant-button": "setActionToPlantSaplings",
		"click .build-button": "setActionToBuild",
		"click .end-round-button": "attemptToEndRound",
		"click button": "selectButton",
	},
	//-----------------------------------------------

	//-----------------------------------------------
	initialize: function(){
		var that = this;
		//cache some elements

		this.$worldName = this.$el.find(".world-name");
		this.$buyButton = this.$el.find(".buy-button");
		this.$surveyButton = this.$el.find(".survey-button");
		this.$clearcutButton = this.$el.find(".clear-cut-button");
		this.$buildButton = this.$el.find(".build-button");
		this.$actionButtons = this.$el.find("buttons");
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


		if(selectedTileCoords!==undefined){

			var tile_x = selectedTileCoords[0],
				tile_y = selectedTileCoords[1];

			var selectedTile = TFApp.models.currentWorldModel.tiles[tile_x][tile_y];

			console.log(selectedTile);

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
						// TFApp.views.gameView.showErrorModal(data.errors[0]);
						TFApp.views.consoleView.addError(data.errors[0]);
						TFApp.views.audioView.playError();
					}
					else{
						console.log("Buy Tile Success: ", data);
						//update the player data
						TFApp.models.currentPlayerModel.loadPlayerData();
						TFApp.views.audioView.playCashRegister();
						var x = data.megatile_upper_left_xy.x,
							y = data.megatile_upper_left_xy.y;
						TFApp.views.consoleView.addMessage("Successfully purchased tile at x: " + x + ", y: " + y);

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
					TFApp.views.consoleView.addError(data);
					TFApp.views.audioView.playError();
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
						TFApp.views.consoleView.addError(data.errors[0]);
						TFApp.views.audioView.playError();

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
					TFApp.views.consoleView.addError(data);
					TFApp.views.audioView.playError();
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

		var selectedTile = TFApp.models.currentWorldModel.tiles[tile_x][tile_y];
		var postData = {tile_ids: [selectedTile.id], estimate: false};

		var url = "/actions/clearcut/" 
			+ TFApp.models.userModel.get("authQueryString") 
			+ "&world_id="+TFApp.models.currentWorldModel.get("world_id") 
			+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id")
			+ "&tile_ids[]="+selectedTile.id;
		// 0.0.0.0:3000/actions/clearcut?world_id=2&player_id=13&tile_ids[]=1

		// POST /worlds/:world_id/resource_tiles/:UNUSED/clearcut
		$.ajax({
			type: "get",
			url: url,
			dataType: "json",
			data: postData,
			success: function(data){
				console.log("Clear Cut Tile Success: ", data);
				if(data.error){
					//TFApp.views.gameView.showErrorModal(data.errors[0]);
					TFApp.views.consoleView.addError(data.error);
					TFApp.views.audioView.playError();
				}else if(data.success===false){
					//TFApp.views.gameView.showErrorModal(data.key[0]);
					TFApp.views.consoleView.addError(data.key[0]);
					TFApp.views.audioView.playError();
					

				}
				else{

					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].large_tree_basal_area = 0;
					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].small_tree_basal_area = 0;
					TFApp.models.currentWorldModel.get("dirtyTiles").push({x: tile_x, z: tile_y});
					TFApp.models.currentWorldModel.trigger("change:dirtyTiles");
					TFApp.views.audioView.playWoodChopOnce();

					//update the player data
					console.log(data);
					TFApp.models.currentPlayerModel.loadPlayerData();
					TFApp.models.gameModel.trigger("change:selectedTileCoords");
					TFApp.views.consoleView.addMessage("Successfully clearcut tile at x: " + tile_x + ", y: " + tile_y);
					TFApp.views.consoleView.addMessage("Received " + Math.round(data.message.lumber) + " things of lumber.");

				}





			},
			error: function(data){
				//TFApp.views.gameView.showErrorModal(data.statusText);
				TFApp.views.consoleView.addError(data.statusText);
				TFApp.views.audioView.playError();
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
	},
	setActionToPlantSaplings: function(){
		TFApp.views.worldView.clickAction = this.attemptPlantSaplings;
		TFApp.views.worldView.materials.highlight.uniforms.texture.value = THREE.ImageUtils.loadTexture("/img/game-icons/actions/tree.png");
		TFApp.views.worldView.materials.highlight.needsUpdate = true;
	},
	attemptPlantSaplings: function(){
		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		var selectedTile = TFApp.models.currentWorldModel.tiles[tile_x][tile_y];
		var postData = {tile_ids: [selectedTile.id], estimate: false};

		var url = "/actions/plant_saplings/" 
			+ TFApp.models.userModel.get("authQueryString") 
			+ "&world_id="+TFApp.models.currentWorldModel.get("world_id") 
			+ "&player_id=" + TFApp.models.currentPlayerModel.get("player_id")
			+ "&tile_ids[]="+selectedTile.id;
		// GET 0.0.0.0:3000/actions/plant_saplings?world_id=2&player_id=13&tile_ids[]=1

		$.ajax({
			type: "get",
			url: url,
			dataType: "json",
			data: postData,
			success: function(data){
				console.log("Clear Cut Tile Success: ", data);
				if(data.error){
					//TFApp.views.gameView.showErrorModal(data.errors[0]);
					TFApp.views.consoleView.addError(data.error);
					TFApp.views.audioView.playError();
				}else if(data.success===false){
					//TFApp.views.gameView.showErrorModal(data.key[0]);
					TFApp.views.consoleView.addError(data.key[0]);
					TFApp.views.audioView.playError();
					

				}
				else{

					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].large_tree_basal_area = 0;
					TFApp.models.currentWorldModel.tiles[tile_x][tile_y].small_tree_basal_area = 0;
					TFApp.models.currentWorldModel.get("dirtyTiles").push({x: tile_x, z: tile_y});
					TFApp.models.currentWorldModel.trigger("change:dirtyTiles");
					//TFApp.views.audioView.playWoodChopOnce();

					//update the player data
					TFApp.models.currentPlayerModel.loadPlayerData();
					TFApp.models.gameModel.trigger("change:selectedTileCoords");
					TFApp.views.consoleView.addMessage("Successfully clearcut tile at x: " + tile_x + ", y: " + tile_y);
					TFApp.views.consoleView.addMessage("Received " + Math.round(data.message.lumber) + " things of lumber.");

				}





			},
			error: function(data){
				//TFApp.views.gameView.showErrorModal(data.statusText);
				TFApp.views.consoleView.addError(data.statusText);
				TFApp.views.audioView.playError();
				console.error("Clear Cut Error: ", data);
			}
		});
	},

	selectButton: function(e){
		console.log(e);
		var $currentTarget = $(e.currentTarget);
		$currentTarget.siblings().removeClass("active");
		$currentTarget.addClass("active");
	}
	//-----------------------------------------------

});