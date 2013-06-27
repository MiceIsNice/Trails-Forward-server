/* GlobalNames.js
 * Definition for GlobalNames object
 * 
 */

function GlobalNames(){

}

  // This object exists in part to prevent errors and in part 
  //  to see how useful it would be to store everything here. 
GlobalNames.prototype = {

	constructor : GlobalNames,
	
	/* SHARED STRINGS */
	ID : "id",
	UPDATED_AT : "updated_at",
	X : "x",
	Y : "y",
	
	/* STRINGS FOR WORLD DATA OBJECT */
	NAME : "name",
	YEAR_START : "year_start",
	YEAR_CURRENT : "year_current",
	HEIGHT : "height",
	WIDTH : "width",
	MEGATILE_WIDTH : "megatile_width",
	MEGATILE_HEIGHT : "megatile_height",
	CREATED_AT : "created_at",
	PLAYERS :"players",
 	USER_ID : "user_id",
 	TYPE : "type",
	WORLD_ID : "world_id",
 	WORLD_NAME :"world_name",
	TURN_STARTED_AT : "turn_started_at",
	CURRENT_TURN : "current_turn",
	MARTEN_SUITABLE_TILE_COUNT : "marten_suitable_tile_count",
	HUMAN_POPULATION : "human_population",
	LIVEABLE_TILES : "livable_tiles_count",
	
	/* STRINGS FOR MEGATILE OBJECT */
	OWNER : "owner",


	/* STRINGS FOR RESOURCETILE OBJECT */
	RESOURCE_TILE_TYPE : "type",
	BASE_COVER_TYPE :"base_cover_type",
	PERMITTED_ACTIONS : "permitted_actions",
	ZONE_TYPE : "zone_type",
	ZONING_CODE : "zoning_code", // DIFFERENT THAN TYPE?
	LOCAL_DESIRABILITY_SCORE : "local_desirability_score",
	TOTAL_DESIRABILITY_SCORE : "total_desirability_score",
	CAN_BE_SURVEYED : "can_be_surveyed",
	IS_SURVEYED : "is_surveyed", // WOULD YOU ALWAYS KNOW IF ANYONE HAD? DOUBTFUL
	BOUGHT_BY_DEVELOPER : "bought_by_developer",
	BOUGHT_BY_TIMBER_COMPANY : "bought_by_timber_company",
	OUTPOST_REQUESTED : "outpost_requested",
	SURVEY_REQUESTED : "survey_requested",
	MARTEN_SUITABLE : "is_marten_suitable",
	PRIMARY_USE : "primary_use",
	TREE_DENSITY : "tree_density",
	LAND_COVER_TYPE : "land_cover_type",
	TREE_SIZE : "tree_size",
	DEVELOPMENT_INTENSITY : "development_intensity",
	IMPERVIOUSNESS : "imperviousness",
	TREE_COUNT_2_INCH : "num_2_inch_diameter_trees",
	TREE_COUNT_4_INCH : "num_4_inch_diameter_trees",
	TREE_COUNT_6_INCH : "num_6_inch_diameter_trees",
	TREE_COUNT_8_INCH : "num_8_inch_diameter_trees",
	TREE_COUNT_10_INCH : "num_10_inch_diameter_trees",
	TREE_COUNT_12_INCH : "num_12_inch_diameter_trees",
	TREE_COUNT_14_INCH : "num_14_inch_diameter_trees",
	TREE_COUNT_16_INCH : "num_16_inch_diameter_trees",
	TREE_COUNT_18_INCH : "num_18_inch_diameter_trees",
	TREE_COUNT_20_INCH : "num_20_inch_diameter_trees",
	TREE_COUNT_22_INCH : "num_22_inch_diameter_trees",
	TREE_COUNT_24_INCH : "num_24_inch_diameter_trees",
	HOUSING_CAPACITY : "housing_capacity",
	HOUSING_OCCUPANCY : "housing_occupants",
	HOUSING_TYPE : "housing_type",
	HARVEST_AREA : "harvest_area",
	SUPPORTED_SAPLINGS : "supported_saplings",
	TREE_TYPE : "tree_type",
	OUTPOST : "outpost",
	MARTEN_POPULATION : "marten_population",
	VOLE_POPULATION : "vole_population",

};
