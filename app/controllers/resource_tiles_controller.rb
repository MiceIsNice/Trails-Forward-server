class HarvestResponder < ActionController::Responder # This can become a generic responder to replace respond_to
  def initialize(controller, resources, options={})
    super(controller, resources, options)
  end

  def display(resource, given_options={})
    controller.respond_to do |format|
      format.xml  { render  xml: resource } # status seems to work automagically without merging
      format.json { render json: resource }
    end
  end
end

class ResourceTilesController < ApplicationController
  respond_to :xml, :json
  self.responder = HarvestResponder

  before_filter :authenticate_user!
  skip_authorization_check :only => :permitted_actions

#  before_filter :check_harvest_rights, only: [:clearcut_list, :diameter_limit_cut_list, :partial_selection_cut_list]

  expose(:world) { World.find params[:world_id] }
  expose(:resource_tile) { ResourceTile.where("x = ? AND y = ? AND world_id = ?", params[:tile_x], params[:tile_y], params[:world_id])[0]}
 # expose(:resource_tile) { ResourceTile.find (params[:tile_id] ? params[:tile_id] : 1) }

  expose(:resource_tiles) do
    if params[:tile_x] && params[:tile_y]
      tile = ResourceTile.where("x = ? AND y = ? AND world_id = ?", params[:tile_x], params[:tile_y], params[:world_id])[0]
      tiles = ResourceTile.where("megatile_id = ?", tile.megatile_id)
      tiles = tiles.harvestable if @clearcut
      tiles
    else
      tiles = world.resource_tiles
      tiles = tiles.harvestable if @clearcut
      tiles.includes(:megatile => :owner).within_rectangle x_min: params[:x_min], y_min: params[:y_min], x_max: params[:x_max], y_max: params[:y_max]
    end
  end

  expose(:player) { world.player_for_user(current_user) }

  expose(:harvestable_tiles) { resource_tiles.select(&:can_harvest?) }


  # FIXME no longer used as an information layer on the client side 1/5/12
  def permitted_actions
    respond_to do |format|
      resource_tiles.each do |tile|
        tile.set_permitted_actions_method(player)
      end
      format.xml  { render_for_api :resource_actions, :xml  => resource_tiles, :root => :resource_tiles  }
      format.json { render_for_api :resource_actions, :json => resource_tiles, :root => :resource_tiles  }
    end
  end
  
  def index
    authorize! :do_things, World.find(params[:world_id]) #resource_tile.world
    
    if valid_rect_params? params
      @result = produce_tiles_in_rect params
     # @result.each { |x| puts x.id}
      puts "Sending #{@result.length} resource_tiles retrieved from the database"
      simple_tiles = @result.map {|tile| tile.to_simple_tile}
      render json: simple_tiles
    else
      render json: "Invalid request: must send x_min >= 0, < x_max; y_min >= 0, < y_max; x_max < world.width; y_max < world.height"
    end
  end 

  def valid_rect_params? params
    world = World.find(params[:world_id])
    return (params[:x_min] && params[:y_min] && params[:x_max] && params[:y_max] && 
             params[:x_min].to_i >= 0 && params[:x_min].to_i < params[:x_max].to_i && 
             params[:y_min].to_i >= 0 && params[:y_min].to_i < params[:y_max].to_i &&
             params[:x_max].to_i < world.width && params[:y_max].to_i < world.height)
  end

  # GET /worlds/:world_id/resource_tiles/1
  def show
    authorize! :do_things, resource_tile.world

    respond_to do |format|
      format.json { render_for_api :resource, :json => resource_tile, :root => :resource_tile  }
    end
  end

  def produce_tiles_in_rect params
    return ResourceTile.where("x <= #{params[:x_max]} AND y <= #{params[:y_max]} AND x >= #{params[:x_min]} AND y >= #{params[:y_min]} AND world_id = #{params[:world_id]}");
  end 

  def build
    authorize! :build, resource_tile
    construction_type = params[:type]

    if resource_tile.can_build?
      case construction_type
        when "single family"
          Craftsman.new.build_single_family_home! resource_tile
        when "vacation"
          Craftsman.new.build_vacation_home! resource_tile
        when "apartment"
          Craftsman.new.build_apartment! resource_tile
        else
          raise "Unknown build type requested!"
      end
      respond_to do |format|
        format.json { render_for_api :resource, :json => resource_tile, :root => :resource_tile  }
      end
    else
      respond_to do |format|
        format.json { render :status => :forbidden, :text => "Action illegal for this land" }
      end
    end
  end #build

  def build_outpost
    authorize! :build_outpost, resource_tile
    
    tiles = resource_tile.neighbors(20)
    tiles.update_all(:can_be_surveyed => true)

    bounding_box = { x_min: tiles.collect(&:x).min, x_max: tiles.collect(&:x).max, y_min: tiles.collect(&:y).min, y_max: tiles.collect(&:y).max }

    tiles.collect(&:megatile).uniq.each(&:invalidate_cache)

    resource_tile.reload
    resource_tile.outpost = true

    if resource_tile.save      
      respond_to do |format|
        format.xml  { render_for_api :resource, :xml  => resource_tiles, :root => :resource_tiles  }
        format.json { render_for_api :resource, :json => resource_tiles, :root => :resource_tiles  }
      end
    else
      format.xml  { render :xml =>  resource_tile.errors, :status => :unprocessable_entity }
      format.json { render :json => resource_tile.errors, :status => :unprocessable_entity }
    end
  end


  # TODO move the double logic into cancan, so it calls tiles can_bulldoze?
  def bulldoze_list
    a_ok = true
    resource_tiles.each do |tile|
      authorize! :bulldoze, tile
      if not tile.can_bulldoze?
        a_ok = false
      end
    end

    respond_to do |format|
      if not a_ok
        format.json { render :status => :forbidden, :json => {:text => "Action illegal for this land" }}
      else
        resource_tiles.each &:bulldoze!

        format.xml  { render_for_api :resource, :xml  => resource_tiles, :root => :resource_tiles  }
        format.json { render_for_api :resource, :json => resource_tiles, :root => :resource_tiles  }
      end
    end
  end

# changed from clearcut_list
  def clearcut
    begin 
      check_harvest_rights
    rescue CanCan::AccessDenied => e
      render json: {:errors => [e.message] }
      return
    end
    
    time_cost = TimeManager.clearcut_cost(tiles: harvestable_tiles, player: player).to_i
    money_cost = Pricing.clearcut_cost(tiles: harvestable_tiles, player: player).to_i

    unless params[:estimate] == true
	  unless TimeManager.can_perform_action?(player: player, cost: time_cost)
    	render json: {:errors => ["Not enough time left to perform harvest"]}
        #respond_with({errors: ["Not enough time left to perform harvest"]}, status: :unprocessable_entity)
        return
      end
    end

    player.balance -= money_cost
    player.time_remaining_this_turn -= time_cost
    results = harvestable_tiles.collect(&:clearcut)
    summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)

    if params[:estimate] == true
      respond_with summary
    else
      begin
        ActiveRecord::Base.transaction do
          player.save!

          harvestable_tiles.each(&:save!)

          # Update the market for viable tiles
          harvestable_tiles.each_with_index do |tile, index|
            tile.update_market! results[index]
          end

          if params[:contract_id]
            contract = Contract.find(params[:contract_id])
            if contract.contract_template.wood_type == "saw_timber"
              Contract.update_counters contract.id, volume_harvested_of_required_type: summary[:sawtimber_volume].to_i
            elsif contract.contract_template.wood_type == "pole_timber"
              Contract.update_counters contract.id, volume_harvested_of_required_type: summary[:poletimber_volume].to_i
            else
              #respond_with({errors: ["Don't know how to handle timber type: #{contract.contract_template.wood_type}"]}, status: :unprocessable_entity)
           	  render json: {:errors => ["Don't know how to handle timber type: #{contract.contract_template.wood_type}"]}       
            end
          end

          respond_with summary
        end
      rescue ActiveRecord::RecordInvalid => e
    	render json: {:errors => ["Transaction Failed: #{e.message}"]}       
        #respond_with({errors: ["Transaction Failed: #{e.message}"]}, status: :unprocessable_entity)
      end
    end
  end

  def build_list
    raise 'not yet implemented'
  end
  
  def owned_by_others
    if params[:player_id]
      world = World.find(params[:world_id])
      begin
        authorize! :do_things, world 
      rescue CanCan::AccessDenied => e
        render json: {:errors => [e.message] }
        return
      end
    else
      render json: { :errors => ["No player id query parameter given"] }
      return
    end

    player = Player.find(params[:player_id])
    owned_megatiles = Megatile.where("world_id = ? AND owner_id IS NOT NULL", world.id)
    owned_by_others = owned_megatiles.select {|mt| mt.owner_id != player.id} 
    rts_owned_by_others = owned_by_others.collect { |megatile| megatile.resource_tile_xys}
    rts_owned_by_others = rts_owned_by_others.flatten
    render json: { :message => "Found #{resource_tiles.length} resource_tiles owned by other players", :resource_tiles => rts_owned_by_others}
  end 

  def diameter_limit_cut_list
    begin 
      check_harvest_rights
    rescue CanCan::AccessDenied => e
      render json: {:errors => [e.message] }
      return
    end
  
    time_cost = TimeManager.diameter_limit_cost(tiles: harvestable_tiles, player: player).to_i
    money_cost = Pricing.diameter_limit_cost(tiles: harvestable_tiles, player: player).to_i

    unless params[:estimate] == true && TimeManager.can_perform_action?(player: player, cost: time_cost)
      render json: {:errors => ["Not enough time left to perform harvest"]}
      #respond_with({errors: ["Not enough time left to perform harvest"]}, status: :unprocessable_entity)
      return
    end

    player.balance -= money_cost
    player.time_remaining_this_turn -= time_cost
    results = harvestable_tiles.collect{|tile| tile.diameter_limit_cut!(above: params[:above], below: params[:below])}
    summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)

    if params[:estimate] == true
      respond_with summary
    else
      begin
        ActiveRecord::Base.transaction do
          player.save!

          harvestable_tiles.each(&:save!)

          # Update the market for viable tiles
          harvestable_tiles.each_with_index do |tile, index|
            tile.update_market! results[index]
          end

          if params[:contract_id]
            contract = Contract.find(params[:contract_id])
            Contract.update_counters contract.id, volume_harvested_of_required_type: (summary[:sawtimber_volume] + summary[:poletimber_volume]).to_i
          end

          respond_with summary
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: {:errors => ["Transaction Failed: #{e.message}"]}
        #respond_with({errors: ["Transaction Failed: #{e.message}"]}, status: :unprocessable_entity)
      end
    end
  end


  def partial_selection_cut_list
    begin 
      check_harvest_rights
    rescue CanCan::AccessDenied => e
      render json: {:errors => [e.message] }
      return
    end 
  
    time_cost = TimeManager.partial_selection_cost(tiles: harvestable_tiles, player: player).to_i
    money_cost = Pricing.partial_selection_cost(tiles: harvestable_tiles, player: player).to_i

      unless params[:estimate] == true && TimeManager.can_perform_action?(player: player, cost: time_cost)
        respond_with({errors: ["Not enough time left to perform harvest"]}, status: :unprocessable_entity)
        return
      end

    player.balance -= money_cost
    player.time_remaining_this_turn -= time_cost
    results = harvestable_tiles.collect{|tile| tile.partial_selection_cut!(qratio: params[:qratio], target_basal_area: params[:target_basal_area])}
    summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)

    if params[:estimate] == 'true'
      respond_with summary
    else
      begin
        ActiveRecord::Base.transaction do
          player.save!

          harvestable_tiles.each(&:save!)

          # Update the market for viable tiles
          harvestable_tiles.each_with_index do |tile, index|
            tile.update_market! results[index]
          end

          if params[:contract_id]
            contract = Contract.find(params[:contract_id])
            Contract.update_counters contract.id, volume_harvested_of_required_type: (summary[:sawtimber_volume] + summary[:poletimber_volume]).to_i
          end

          respond_with summary
        end
      rescue ActiveRecord::RecordInvalid => e
        respond_with({errors: ["Transaction Failed: #{e.message}"]}, status: :unprocessable_entity)
      end
    end
  end


  private

  def results_hash(results, resource_tiles)
    poletimber_value  = results.collect{|result| result[:poletimber_value ]}.sum
    poletimber_volume = results.collect{|result| result[:poletimber_volume]}.sum
    sawtimber_value   = results.collect{|result| result[:sawtimber_value  ]}.sum
    sawtimber_volume  = results.collect{|result| result[:sawtimber_volume ]}.sum

    { poletimber_value: poletimber_value, poletimber_volume: poletimber_volume,
       sawtimber_value: sawtimber_value,   sawtimber_volume: sawtimber_volume,
        resource_tiles: resource_tiles.as_api_response(:resource)
    }
  end


  def check_harvest_rights
    resource_tiles.each do |tile|
        authorize! :harvest, tile
    end
  end

end
