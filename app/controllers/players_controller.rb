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

  def get_player_with_userid_and_playerid_with_message params
    {:objects => Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id]), 
     :not_found_message => "No player_id #{params[:player_id]} found for user_id #{params[:user_id]}"}
  end
  
  def get_megatiles_with_playerid_and_worldid params
    {:objects => Megatile.where("owner_id = ? AND world_id = ?", params[:player_id], params[:world_id]), 
     :not_found_message => "No tiles found for given player id.", :resource_tiles => []}  
  end 
  
  def try_to_save! object
    begin
      object.save!
    rescue ActiveRecord::RecordInvalid => invalid
      result[:client_response] = client_response_with_errors_array_from_response response, [invalid.record.errors]
      result[:success] = false
    end
    
    return result
  end


  # returns all resource tiles owned by a player 
  def owned_resource_tiles
     result = can_perform_action params, [:user_id, :player_id], 
               get_player_with_userid_and_playerid, Object_required, :player_info 
      
    if result[:success] && result[:objects].length > 0
      can_perform_action nil, {:player_id => result[:objects][0].id, :world_id => result[:objects][0].world_id}, 
                          get_megatiles_with_playerid_and_worldid, Object_not_required, :see_player_tiles                    
      if players_megatiles != nil
        resource_tiles = players_megatiles.collect { |megatile| megatile.resource_tile_xys}
        response = client_response_with_message_array_from_response result[:client_response], ["Found #{resource_tiles.length} resource_tiles for given player id"]
        response = client_response_from_response response, :resource_tiles, resource_tiles.flatten
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
    all_params = all_parameters_given params, [:user_id, :player_id] 
    
    if all_params[:status] == true
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
      authorize! :player_info, player
      if player 
        Contracts.where('player_id = ? ', player.id).update_all(:player_id => nil)
        response = client_response_with_message_array_from_response response, ["player #{player.id} now has no contracts}"]    
      else
        response = client_response_with_errors_array_from_response response, 
          "No player_id #{params[:player_id]} found for user_id #{params[:user_id]}"
      end
    else
      response = all_params[:client_response]
    end 
    
    render json: response
  end 

  def set_player_balance_and_turn_points
    result = can_perform_action params, [:user_id, :player_id, :balance, :turn_points], 
               get_player_with_userid_and_playerid, Object_required, :player_info
	
	if result[:success]
      player.balance = params[:balance].to_i
      player.time_remaining_this_turn =  params[:turn_points].to_i
      result[:client_response] = client_response_with_message_array_from_response(result[:client_response], ["Set player balance to #{params[:balance]} and turn points to #{params[:turn_points]}"]) 
      result = try_to_save! player, result
      #player.save!
    end
    
    render json: result[:client_response]
  end
# For development convenience 
# Comment out in production 
##########
##########

end
