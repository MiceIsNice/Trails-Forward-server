class SurveysController < ApplicationController
  before_filter :authenticate_user!

  def index
    world = World.find(params[:world_id])
    resource_tile = ResourceTile.where("x = ? AND y = ? AND world_id = ?", params[:tile_x], params[:tile_y], params[:world_id])[0]
    megatile = Megatile.find(resource_tile.megatile_id)
    authorize! :do_things, world

    player = megatile.world.player_for_user(current_user)
	@surveys = Survey.where("megatile_id = ? AND player_id = ?", megatile.id, player.id)
#    @surveys = megatile.surveys.where(player_id: player.id)

    if @surveys.empty?
      render json: {:errors => ["You haven't conducted a survey of this tile yet"]}
      return
   #   @surveys = [DefaultSurvey.of(megatile: megatile)]
    end

    respond_to do |format|
      format.xml  { render_for_api :survey,  xml: @surveys }
      format.json { render_for_api :survey, json: @surveys }
    end
  end




  def create
    world = World.find(params[:world_id])
    resource_tile = ResourceTile.where("x = ? AND y = ? AND world_id = ?", params[:tile_x], params[:tile_y], params[:world_id])[0]
    megatile = Megatile.find(resource_tile.megatile_id)
    authorize! :do_things, world

    player = megatile.world.player_for_user(current_user)
=begin
	exsiting_survey Survey.where
	if megatile.world.year_current != 
=end
	if player.balance < Survey.cost
	  render json: {:errors => ["Not enough money to conduct a survey. You need #{Survey.cost}"]}
	  return
	end
	
    if megatile == nil || player == nil
      puts "metaile or player is nil"
    end
    @survey = Survey.of megatile: megatile, player: player

    player.balance -= Survey.cost

    begin
      ActiveRecord::Base.transaction do
        @survey.save!
        player.save!
      end
      respond_to do |format|
        #format.xml  { render_for_api :survey,  xml: @survey, status: :created }
        format.json { render_for_api :survey, json: @survey}
      end
    rescue ActiveRecord::RecordInvalid
      render json: {:errors => ["Trouble making new survey."]}
=begin
      respond_to do |format|
        format.xml  { render  xml: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
        format.json { render json: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
      end
=end
    end
  end
end
