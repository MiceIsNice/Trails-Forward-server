class ActionsController < ApplicationController
	skip_authorization_check
	#before_filter :authenticate_user!
	
	expose(:player) do
		if params[:player_id]
			Player.find params[:player_id]
		else
			#TODO: return current player
		end
	end
	expose(:world) { World.find player.world_id }
	expose(:resource_tiles) do 
		if params[:tile_ids]
		   ResourceTile.find(params[:tile_ids])
		else 
		  []
		end
	end

	$cutting_time_cost = 1
	$clearcut_cost = 100


	#TODO: Modify this by player stats
	#time cost for all planting actions per tile 
	$planting_time_cost = 1
	#monetary cost for planting saplings per tile 
	$plant_sapling_money_cost = 0
	#lumber cost for planting saplings per tile 
	$plant_sapling_lumber_cost = 20


	def index
		#TODO: List all actions available to current player
	end

	def clearcut
		authorize! :authorize_player_for_action, Player.find(params[:player_id])
		response = {}

		totalTimeCost = resource_tiles.length * 1
		totalMoneyCost = resource_tiles.length * $clearcut_cost
		lumberTotal = 0


		if(player.time_remaining_this_turn>=totalTimeCost)
			if player.balance > totalMoneyCost
				
				resource_tiles.each { |tile| 
					lumberTotal += (tile.small_tree_basal_area + tile.large_tree_basal_area)
					tile.clear_trees!
				}
				
				puts lumber: player.lumber
				player.time_remaining_this_turn-=totalTimeCost
				player.balance -= totalMoneyCost


				player.lumber += lumberTotal
				player.save!
				puts lumber: player.lumber

				response[:success] = true
				response[:lumber] = lumberTotal
			else
				response[:error] = "And how do you expect to pay for that?"
			end
		else
			response[:error] = "Ain't nobody got time for that!"
		end

		render json: response
		#render json: {:message => "clearcutting"}
	end

	def clearcut
		authorize! :authorize_player_for_action, Player.find(params[:player_id])
		response = {}

		totalTimeCost = resource_tiles.length * $planting_time_cost
		totalMoneyCost = resource_tiles.length * $clearcut_cost
		lumberTotal = 0

		if(player.time_remaining_this_turn>=totalTimeCost)
			if player.balance > totalMoneyCost
				
				resource_tiles.each { |tile| 
					lumberTotal += (tile.small_tree_basal_area + tile.large_tree_basal_area)
					tile.clear_trees!
				}
				
				player.time_remaining_this_turn-=totalTimeCost
				player.balance -= totalMoneyCost


				player.lumber += lumberTotal
				player.save!

				response[:success] = true
				response[:lumber] = lumberTotal
			else
				response[:error] = "And how do you expect to pay for that?"
			end
		else
			response[:error] = "Ain't nobody got time for that!"
		end

		render json: response
		#render json: {:message => "clearcutting"}
	end
	def plant_saplings
		authorize! :authorize_player_for_action, Player.find(params[:player_id])
		response = {}

		totalTimeCost = resource_tiles.length * $planting_time_cost
		totalMoneyCost = resource_tiles.length * $plant_sapling_money_cost
		totalLumberCost = resource_tiles.length * $plant_sapling_lumber_cost
		lumberTotal = 0


		if(player.time_remaining_this_turn>=totalTimeCost)
			if player.balance >= totalMoneyCost
				if player.lumber >= totalLumberCost
					resource_tiles.each { |tile| 
						lumberTotal += (tile.small_tree_basal_area + tile.large_tree_basal_area)
						#tile.clear_trees!
						tile.plant_2_inch_diameter_trees! params[:tree_count]
					}
					
					player.time_remaining_this_turn-=totalTimeCost
					player.balance -= totalMoneyCost
					player.lumber -= totalLumberCost
					player.save!

					response[:success] = true

				else
					response[:error] = "You need lumber if you're going to plant!"
				end
			else
				response[:error] = "And how do you expect to pay for that?"
			end
		else
			response[:error] = "Ain't nobody got time for that!"
		end

		render json: response
		#render json: {:message => "clearcutting"}
	end


	def create

	end

	def update

	end
	def show
		render json: {:message => "show"}
	end

end