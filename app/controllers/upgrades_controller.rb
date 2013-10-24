class UpgradesController < ApplicationController
  
  # GET /worlds/:world_id/players/:player_id ??
  def index
    if(params[:world_id] && params[:player_id])
      case Player.find(params[:player_id]).type
        when "Lumberjack"
          render json: LoggingEquipment.where(world_id: params[:world_id])
        when "Conservationist"
          puts "UpgradesController.index: looking for Conservationist upgrades"
        when "Developer"
          puts "UpgradesController.index: looking for Developer upgrades"
        else
          puts "UpgradesController.index: looking for unknown upgrades"
      end 
    else
      puts "upgrades_controller called without a world or player id"
    end 
  end 
  
end
