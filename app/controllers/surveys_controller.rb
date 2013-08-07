class SurveysController < ApplicationController
  before_filter :authenticate_user!

  def index
    world = World.find(params[:world_id])
    id = params[:resource_tile] ? ResourceTile.find(params[:resource_tile]).megatile_id : params[:megatile_id]
    puts "index survey for megatile id #{id}"
#    megatile = world: world.megatiles.find(id)
    megatile = Megatile.find(id)
    authorize! :do_things, world

    player = megatile.world.player_for_user(current_user)

	@surveys = Survey.where("megatile_id = ? AND player_id = ?", id, player.id)
#    @surveys = megatile.surveys.where(player_id: player.id)
    puts "SurveysController.index found this many surveys for this tile from this user: #{@surveys.length}"

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
    id = params[:resource_tile] ? ResourceTile.find(params[:resource_tile]).megatile_id : params[:megatile_id]
    puts "create survey for megatile id #{id}"
#    megatile = world: world.megatiles.find(id)
    megatile = Megatile.find(id)
    authorize! :do_things, world

    player = megatile.world.player_for_user(current_user)

    @survey = Survey.of megatile: megatile, player: player

    player.balance -= Survey.cost

    begin
      ActiveRecord::Base.transaction do
        @survey.save!
        player.save!
      end
      respond_to do |format|
        format.xml  { render_for_api :survey,  xml: @survey, status: :created }
        format.json { render_for_api :survey, json: @survey, status: :created }
      end
    rescue ActiveRecord::RecordInvalid
      respond_to do |format|
        format.xml  { render  xml: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
        format.json { render json: { errors: ["Transaction Failed"] }, status: :unprocessable_entity }
      end
    end
  end
end
