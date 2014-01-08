class RosebudController < ApplicationController
  include TFClientResponder
    #skip_authorization_check

#ActiveRecord helpers 
  def new_response
    return {:messages => [], :errors => []}
  end

  def try_active_record_block success_message, response, activerecordproc
    begin 
      activerecordproc.call
    rescue ActiveRecord::ActiveRecordError => e 
      return response[:errors].push e.message
    end 
      return response[:messages].push success_message 
  end 

  def clear_player_owned_land response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
  	if response == nil 
      response = new_response
    end
    player_id = values[:player_id]
    response = try_active_record_block "cleared player land", response, lambda {Megatile.update_all("owner_id = NULL", "owner_id = #{player_id}")}
  	render json: response 
  end

  def clear_all_owned_land response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
  	player_id = values[:player_id]
  	player = Player.find(player_id)
  	world = player.world_id
  	response = try_active_record_block "cleared all owned land", response, lambda {Megatile.update_all("owner_id = NULL", "world_id = #{world}")}
  	render json: response 
  end

  def clear_survey_data response = nil, values = nil 
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
  	player = values[:player_id]
  	response = try_active_record_block "cleared survey data", response,  lambda {Survey.delete_all("player_id = #{player}")}
  	render json: response
  end

  def clear_player_contracts response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
  	player = values[:player_id]
  	response = try_active_record_block "cleared player contracts", response, lambda {Contract.delete_all("player_id = #{player}")}
  	render json: response 
  end

    # for now, everything but player sawyer crew
  def clear_player_upgrades response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
  	player = values[:player_id]
  	response = try_active_record_block "cleared player upgrades", response, lambda {LoggingEquipment.delete_all("player_id = #{player} AND name != 'Sawyer Crew'")}
  	render json: response 
  end 

  #def set_player_lumber
  #  player = params[:player_id]
  # 
  #end 

  def set_player_balance response = nil, values = nil 
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
    player = values[:player_id]
    new_balance = values[:balance]
    response  = try_active_record_block "set player balance", response, lambda {Player.update(player, :balance => new_balance)}
    render json: response
  end

  def set_player_turn_points response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
    player = values[:player_id]
    new_turn_points = values[:turn_points]
    response = try_active_record_block "set player turn points", response, lambda {Player.update(player, :time_remaining_this_turn => new_turn_points)}
    render json: response
  end 

    # clear_player_upgrades, contracts, and lumber. Reset to starting 
    #  turn points and money values.
  def reset_player_stats response = nil, values = nil
    if values == nil
      values = params
    end
    authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
    if response == nil 
      response = new_response
    end
    player = values[:player_id]
    new_balance = Player.default_balance
    new_turn_points = Player.default_time_remaining
    response = set_player_balance nil, {:player_id => player, :balance => new_balance}  
    response = set_player_turn_points response, {:player_id => player, :turn_points => new_turn_points}
    response = clear_player_upgrades response, values 
    response = clear_player_contracts response, values 
    response = clear_survey_data response, values
    response = clear_player_owned_land response, values
    render json: response

  end 


  def end_round
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])

    world = World.find(params[:world_id])
    the_players = Player.where('world_id' => params[:world_id])

    the_players.each { |p|
      p.time_remaining_this_turn = 50
      p.save!
    }

    render json: the_players
  end















#   def plant_new_trees response = nil values = nil
#     if values == nil
#       values = params
#     end
#     authorize! :authorize_user_for_rosebud, Player.find(values[:player_id])
#     if response == nil 
#       response = new_response
#     end
#     player = values[:player_id]
#     trees = values[:new_trees]
#     diameter = values[:diameter]
#     response = try_active_record_block "plant #{trees} trees", response, lambda {Tile.update(player, :player_id => player )} 
# end

end
