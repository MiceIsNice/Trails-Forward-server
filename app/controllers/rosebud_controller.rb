class RosebudController < ApplicationController
  include TFClientResponder

#ActiveRecord helpers 

  def clear_my_owned_land
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])

  	player_id = params[:player_id]
  	puts "passed in player id: #{params[:player_id]}"
  	Megatile.update_all("owner_id = NULL", "owner_id = #{player_id}")
  	render json: {:message => "might have worked - change this message soon"}
  end

  def clear_all_owned_land
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])

  	player_id = params[:player_id]
  	player = Player.find(player_id)
  	world = player.world_id
  	Megatile.update_all("owner_id = NULL", "world_id = #{world}")
  	render json: {:message => "might have worked - change this message soon"}
  end

  def clear_survey_data
    authorize! :authorize_user_for_rosebud, Player.find(params[:player_id])

  	player = params[:player_id]
  	Survey.delete_all("player_id = #{player}")
  	render json: {:message => "might have worked - change this message soon"}
  end

end
