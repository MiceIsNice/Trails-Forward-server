class PlayersController < ApplicationController
  before_filter :authenticate_user!

  # GET /users/:id/players
  def index
    @user = User.find(params[:user_id])
    @players = @user.players

    authorize! :index_user_players, @user

    # temporary for GLS
    template_to_use = :player_private

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render_for_api template_to_use, :xml  => @players, :root => :players  }
      format.json  { render_for_api template_to_use, :json  => @players, :root => :players  }
    end
  end
  
  # GET /users/:user_id/players/new(.:format)
    #settings[:world_id]
    #settings[:user_id]
    #settings[:player_type]
  def new
    puts "Player.new 1"
    @player = Player.new(params)
    @player.save
    puts "Player.new 2 made player with id: #{@player.id}"
    respond_to do |format|
      format.html
      format.xml  { render :xml => @player }
    end
    puts "Player.new 3"
  end
  
  def create
    puts "Player.create"
    @player = Player.new(params)
    puts "Player.create 2 made player with id: #{@player.id}"
    respond_to do |format|
      format.html
      format.xml  { render :xml => @player }
    end
  end 

  # GET /users/:user_id/players/:id
  def show
    @user = User.find params[:user_id]
    @player = @user.players.where(:id => params[:id]).first

    authorize! :show_player, @player

    # temporary for GLS
    template_to_use = :player_private_with_megatiles

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render_for_api template_to_use, :xml  => @player, :root => :player }
      format.json  { render_for_api template_to_use, :json  => @player, :root => :player }
    end
  end

  # GET /players/1/edit
  def edit
    @user = User.find params[:user_id]
    @player = Player.find(params[:id])
    authorize! :update_player, @player
  end

  def bids_placed
    @player = Player.find(params[:player_id])
    authorize! :see_bids, @player

    @bids = @player.bids_placed
    if params.has_key? :active
      @bids = @bids.where(:status => Bid.verbiage[:active])
    end

    respond_to do |format|
      format.json { render_for_api :bid_private, :json => @bids, :root => :bids }
      format.xml  { render_for_api :bid_private, :xml  => @bids, :root => :bids }
    end
  end
  
  def player_stats 
    if params[:user_id] && params[:player_id]
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
    else
      render json: {:errors => ["need a valid user id and player id combination"]}
    end 
    
    authorize! :player_info, player
    
    render json: {:balance => player.balance, :turn_points => player.time_remaining_this_turn, :political_capital => 5}
  end
  
  def player_equipment
    if params[:user_id] && params[:player_id]
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
      equipment = LoggingEquipment.where("player_id = ? AND world_id = ?", params[:player_id], player.world_id)[0]
    else
      render json: {:errors => ["need a valid world id and player id combination"]}
    end 
    
    authorize! :player_info, player
    
    render json: {:playersEquipment => equipment}  
  end

  def owned_resource_tiles
      player = Player.find(params[:player_id])
      players_megatiles = nil
      
    if player != nil
      players_megatiles = Megatile.where("owner_id = ? AND world_id = ?", player.id, player.world_id)
    else
      render json: { :errors => ["No player found for given player id and user id."] }
      return
    end
    
    response = nil
    if players_megatiles != nil && players_megatiles.length > 0
      resource_tiles = players_megatiles.collect { |megatile| megatile.resource_tile_xys}
      resource_tiles = resource_tiles.flatten
      begin
        players_megatiles.each do |mt| authorize! :see_player_tiles, player, mt end
      rescue CanCan::AccessDenied => e
        render json: {:errors => [e.message] }
        return
      end
      response = { :message => "Found #{resource_tiles.length} resource_tiles for given player id", :resource_tiles => resource_tiles}
    else
      response = { :message => "No tiles found for given player id." }
    end
    
    render json: response
  end 

  def update
    @user = User.find params[:user_id]
    @player = Player.find(params[:id])
    authorize! :update_player, @player

    respond_to do |format|
      if @player.update_attributes(params[:player])
        format.html { redirect_to(edit_user_player_url(@user, @player), :notice => 'Player was successfully updated.') }
        format.xml  { render_for_api :player_private, :xml  => @player }
        format.json { render_for_api :player_private, :json => @player }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml  => @player.errors, :status => :unprocessable_entity }
        format.json { render :json => @player.errors, :status => :unprocessable_entity }
      end
    end
  end
  
end
