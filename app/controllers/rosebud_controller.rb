class RosebudController < ApplicationController
  include TFClientResponder

#ActiveRecord helpers 
  def new_response
    return {:messages => [], :errors => []}
  end

  def try_active_record_block block, success_message, response
    begin 
      yield
    rescue ActiveRecord::ActiveRecordError => e 
      return response[:errors].push e.message
    end 
      return response[:messages].push success_message 
  end 

  def clear_player_owned_land response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
  	if response == nil 
      response = new_response
    end
    player_id = params[:player_id]
    response = try_active_record_block {Megatile.update_all("owner_id = NULL", "owner_id = #{player_id}")}, "cleared player land", response
  	render json: response 
  end

  def clear_all_owned_land response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
  	player_id = params[:player_id]
  	player = Player.find(player_id)
  	world = player.world_id
  	response = try_active_record_block {Megatile.update_all("owner_id = NULL", "world_id = #{world}")}, "cleared all owned land", response
  	render json: response 
  end

  def clear_survey_data response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
  	player = params[:player_id]
  	response = try_active_record_block {Survey.delete_all("player_id = #{player}")}, "cleared survey data", response
  	render json: response 
  end

  def clear_player_contracts response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
  	player = params[:player_id]
  	response = try_active_record_block {Contracts.delete_all("player_id = #{player}")}, "cleared player contracts", response
  	render json: response 
  end

    # for now, everything but player sawyer crew
  def clear_player_upgrades response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
  	player = params[:player_id]
  	response = try_active_record_block {LoggingEquipment.delete_all("player_id = #{player} AND name != 'Sawyer Crew'")}, "cleared player upgrades", response
  	render json: response 
  end 

  #def set_player_lumber
  #  player = params[:player_id]
  # 
  #end 

  def set_player_balance response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
    player = params[:player_id]
    new_balance = params[:balance]
    response  = try_active_record_block {Player.update(player, :balance => newbalance)}, "set player balance", response
    render json: response 
  end

  def set_player_turn_points response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
    player = params[:player_id]
    new_turn_points = params[:turn_points]
    response = try_active_record_block {Player.update(player, :time_remaining_this_turn => new_turn_points), "set player turn points", response
    render json: response   
  end 

    # clear_player_upgrades, contracts, and lumber. Reset to starting 
    #  turn points and money values.
  def reset_player_stats response = nil
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])
    if response == nil 
      response = new_response
    end
    player = params[:player_id]
    new_balance = Player.default_balance
    new_turn_points = Player.default_time_remaining
    response = set_player_balance params 
    response = set_player_turn_points params response
    response = clear_player_upgrades params response
    response = clear_player_contracts params response
    response = clear_survey_data params response
    response = clear_player_owned_land params response
    render json: response  

  end 

end
