var TFApp = window.TFApp || {};

TFApp.TileDetailsView = Backbone.View.extend({

	el: ".tile-details",
	events:{
		
		//"click .accordian-section h1": "toggleAccordianSection"
	},


	initialize: function(){
		var that = this;

		this.$baseCoverType = this.$el.find(".base-cover-type");
		this.$owner = this.$el.find(".owner");



		this.$surveyData = this.$el.find(".survey-data");
		this.$lastSurveyed = this.$el.find(".last-surveyed");

		TFApp.models.gameModel.on("change:selectedTileCoords", that.update, this);

	},
	render: function(){

	},
	start: function(){


	},
	update: function(){
		//TODO
		var that = this;

		var selectedTileCoords = TFApp.models.gameModel.get("selectedTileCoords");
		var tile_x = selectedTileCoords[0],
			tile_y = selectedTileCoords[1];

		var theTile = TFApp.models.currentWorldModel.tiles[tile_x][tile_y];

		console.log(theTile);
		if(theTile!==undefined){


			//basic info
			that.$baseCoverType.text(theTile.base_cover_type);
			that.$owner.text(theTile.owner);


			if(theTile.surveyData){
				var lastSurveyedDate = new Date(theTile.surveyData.created_at);
				//lastSurveyedDate.format("dddd, MMMM Do YYYY, h:mm:ss a");
				that.$lastSurveyed.text(lastSurveyedDate.toLocaleString());


				that.$surveyData.show();

			}else{
				that.$surveyData.hide();
			}

		}else{
			console.warn("Strange, but you selected a tile that doesn't exist...");
		}

	}

	

});