class PlayersController < ApplicationController
  before_filter :authenticate_user!
  skip_authorization_check :only => [:surveys_for_player]
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
      equipment = LoggingEquipment.where("player_id = ? AND world_id = ?", params[:player_id], player.world_id)
    else
      render json: {:errors => ["need a valid world id and player id combination"]}
    end 
    
    authorize! :player_info, player
    render json: {:playersEquipment => equipment}  
  end

=begin
  def player_contracts
    if params[:user_id] && params[:player_id]
    
    else
      render json: {ClientResponseHandler.new_error_message ""}
    end
    
    authorize! :player_info, player
    render json: {:active_contracts => active, :satisfied_contracts => satisfied}     
  end
=end  

  def get_player_with_userid_and_playerid params
    Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
  end
  
  # Returns an array of errors.  If empty, player is valid and authorized for :player_info
  def check_for_userid_and_playerid_params_and_authorize_player given_parameters
    errors = []
    required_params = [:user_id, :player_id]

    unless ClientResponseHandler.all_parameters_given params, required_params
      errors.push "user_id and player_id needed as parameters"
    end 
    
    player = get_player_with_userid_and_playerid given_parameters
    
    if player
      begin 
        authorize! :player_info, player
      rescue CanCan::AccessDenied => e
        errors.push e.message
      end
    else 
      errors.push "No player matches user id #{params[:user_id]} and player id #{params[:player_id]}" 
    end    
    return errors
  end 

  def owned_resource_tiles
    response = nil
    errors = check_for_userid_and_playerid_params_and_authorize_player params
    if errors.length != 0
      response = ClientResponseHandler.new_error_message errors
    end
      
    player = get_player_with_userid_and_playerid params
    if response == nil 
      players_megatiles = Megatile.where("owner_id = ? AND world_id = ?", player.id, player.world_id)
      if players_megatiles != nil && players_megatiles.length > 0
        resource_tiles = players_megatiles.collect { |megatile| megatile.resource_tile_xys}
        resource_tiles = resource_tiles.flatten
        begin
          players_megatiles.each do |mt| authorize! :see_player_tiles, player, mt end
        rescue CanCan::AccessDenied => e
          response = ClientResponseHandler.new_error_message e.message 
        end
        response = { :message => "Found #{resource_tiles.length} resource_tiles for given player id", :resource_tiles => resource_tiles}
      else
        response = { :message => "No tiles found for given player id." }
      end
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
  
  
  #---------------------------------
  def surveys_for_player

    player = Player.find(params[:player_id])
    
    if(player)
      surveys = Survey.where("player_id = ?", params[:player_id])
      foo = surveys.map { |survey| 
        m = Megatile.find(survey.megatile_id);
        OpenStruct.new(:x => m.x, :y => m.y, :survey => survey)
      }

      response = { :surveys => foo}
    
    else
      response = { :errors => ["No player found or... something"] }

    end

    render json: response
    return
  end
  #---------------------------------




##########
##########
# For development convenience 
# Comment out in production
  
  def clear_player_tiles
    required_params = [:user_id, :player_id]
  end
  
  def clear_player_upgrades
    required_params = [:user_id, :player_id]  
  end
  
  def clear_player_contracts 
    response = nil
    required_params = [:user_id, :player_id] 
    
    if ClientResponseHandler.all_parameters_given params, required_params
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
      authorize! :player_info, player
      if player 
        Contracts.where('player_id = ? ', player.id).update_all(:player_id => nil)
        response = ["player #{player.id} now has no contracts}"]    
      else
        response = ClientResponseHandler.new_error_message "No player_id #{params[:player_id]} found for user_id #{params[:user_id]}"
      end
    else
      response = ClientResponseHandler.new_error_message ClientResponseHandler.missing_parameters_message(params, required_params)
    end 
    
    render json: response
  end 

  def set_player_balance_and_turn_points
    response = nil
    required_params = [:user_id, :player_id, :balance, :turn_points]
    
    if ClientResponseHandler.all_parameters_given params, required_params
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
      authorize! :player_info, player
      if player 
        #player.set_balance params[:balance].to_i
        #player.set_turn_points params[:turn_points].to_i
        player.balance = params[:balance].to_i
        player.time_remaining_this_turn =  params[:turn_points].to_i
        player.save!
        response = ["Set player balance to #{params[:balance]} and turn points to #{params[:turn_points]}"]    
      else
        response = ClientResponseHandler.new_error_message "No player_id #{params[:player_id]} found for user_id #{params[:user_id]}"
      end
    else
      response = ClientResponseHandler.new_error_message ClientResponseHandler.missing_parameters_message(params, required_params)
    end 
    
    render json: response
  end
# For development convenience 
# Comment out in production 
##########
##########
  
end
