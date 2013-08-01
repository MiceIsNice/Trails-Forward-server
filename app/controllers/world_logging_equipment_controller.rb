class WorldLoggingEquipmentController < ApplicationController
  self.responder = ActsAsApi::Responder

  skip_authorization_check

  expose(:world)
  expose(:player) { world.player_for_user(current_user) }
  expose(:logging_equipment_list) { world.logging_equipment.unowned }
  expose(:logging_equipment) { world.logging_equipment.find(params[:id]) }

  respond_to :json, :xml

  def index
    respond_with logging_equipment_list, :api_template => :logging_equipment_base, :root => :logging_equipment_list
  end

  def owned
    respond_with world.logging_equipment.owned_by(player), :api_template => :logging_equipment_base, :root => :logging_equipment_list
  end

  # currently GET /worlds/:world_id/logging_equipment/:unused_int/available.json
  # TODO: fix routing to avoid the :unused_int
  def available
    render json: LoggingEquipment.where("player_id IS NULL AND world_id = ? AND initial_cost <= ?", 
    										params[:world_id], world.player_for_user(current_user).balance)
  end

  def buy
    if logging_equipment.player.present?
      render json: {message: "You tried to purchase equipment that has an owner"}
      #respond_to do |format|
       # format.xml  { render  xml: { errors: ["Already owned"] }, status: :unprocessable_entity }
       # format.json { render json: { errors: ["Already owned"] }, status: :unprocessable_entity }
      #end
    elsif player.balance < logging_equipment.initial_cost.to_i 
      render json: {message: "Sadly, you don't have enough money to buy that piece of equipment"}
    else
      logging_equipment.player = player
      player.balance -= logging_equipment.initial_cost.to_i

      begin
        ActiveRecord::Base.transaction do
          player.save!
          logging_equipment.save!
        end
        respond_to do |format|
          format.xml  { render_for_api :logging_equipment_base, :xml  => logging_equipment }
          format.json { render_for_api :logging_equipment_base, :json => logging_equipment }
        end
      rescue ActiveRecord::RecordInvalid
        respond_to do |format|
          format.xml  { render  xml: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
          format.json { render json: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
        end
      end
    end
  end
end
