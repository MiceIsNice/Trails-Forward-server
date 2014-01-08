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
  include TFClientResponder
  respond_to :xml, :json
  self.responder = HarvestResponder

  before_filter :authenticate_user!
  skip_authorization_check :only => :permitted_actions

  # before_filter :check_harvest_rights, only: [:clearcut_list, :diameter_limit_cut_list, :partial_selection_cut_list]

  expose(:world) { World.find params[:world_id] }
  expose(:resource_tiles) do 
    if params[:tile_ids]
       ResourceTile.find(params[:tile_ids])
    else 
      []
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

  def get_player_with_userid_and_playerid_with_message params
    {:objects => Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id]), 
     :not_found_message => "No player_id #{params[:player_id]} found for user_id #{params[:user_id]}"}
  end

  def build
    result = can_perform_action params, [:type], 
               Proc.new { |args| {:objects => resource_tiles, :not_found_message => "No valid tiles given"}},
               Object_required, :build 
    response = client_response_with_known_symbol_given_from_response result[:client_response],
                        ["simgle family", "vacation", "apartment"], params[:type] 

    if response[:success]
      result[:objects].map { |tile| 
           case params[:type]
             when "single family"
               Craftsman.new.build_single_family_home! tile
             when "vacation"
               Craftsman.new.build_vacation_home! tile
             when "apartment"
               Craftsman.new.build_apartment! tile
           end 
         }
    end     


#        format.json { render_for_api :resource, :json => resource_tile, :root => :resource_tile  }
      render json: response
  end 

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

  def check_if_player_has_time_and_money_for_action player, time_needed, money_needed, response
      if !TimeManager.can_perform_action?(player: player, cost: time_needed)
        response = client_response_with_errors_array_from_response response, ["Not enough time left to perform harvest"]
      end
      if player.balance < money_needed
        response = client_response_with_errors_array_from_response response, ["Not enough money to perform harvest, you need #{money_cost}"]
      end
      return response  
  end


  def clearcut_list  
    response = can_perform_action params, [:estimate], Proc.new{|args| {:objects => resource_tiles, 
     :not_found_message => "No valid resource tiles found to perform clearcut on."} }, true, :harvest

    if response[:success]

        time_cost = 1  #TimeManager.clearcut_cost(tiles: harvestable_tiles, player: player).to_i
        money_cost = 100 #Pricing.clearcut_cost(tiles: harvestable_tiles, player: player).to_i

        if params[:estimate] == false 
            response = check_if_player_has_time_and_money_for_action player, time_cost, money_cost, response
        end

        if response[:success]
            player.balance -= money_cost
            player.time_remaining_this_turn -= time_cost

            results = harvestable_tiles.collect(&:clearcut)
            results.each { |result| player.lumber += (result[:sawtimber_volume] + result[:poletimber_volume]).to_i }

            summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)
            response = client_response_with_details_hash_from_response response, summary
        end

        if params[:estimate] == false
            begin
              ActiveRecord::Base.transaction do
                player.save!
                harvestable_tiles.each(&:save!)

                # Update the market for viable tiles
                harvestable_tiles.each_with_index do |tile, index|
                  tile.update_market! results[index]
                end
              end
            rescue ActiveRecord::RecordInvalid => e
        	    response = client_response_with_errors_array_from_response response, ["Transaction Failed: #{e.message}"]      
            end
        end

    end
      render json: reponse
  end


  def diameter_limit_cut_list
    response = can_perform_action params, [:above, :below, :estimate], Proc.new{|args| {:objects => resource_tiles, 
     :not_found_message => "No valid resource tiles found to perform diameter_limit_cut on."} }, true, :harvest

    if response[:success]
        time_cost = TimeManager.diameter_limit_cost(tiles: harvestable_tiles, player: player).to_i
        money_cost = Pricing.diameter_limit_cost(tiles: harvestable_tiles, player: player).to_i
        

        if params[:estimate] == false 
            response = check_if_player_has_time_and_money_for_action player, time_cost, money_cost, response
        end

        if reponse[:success]
            player.balance -= money_cost
            player.time_remaining_this_turn -= time_cost

            results = harvestable_tiles.collect{|tile| tile.diameter_limit_cut!(above: params[:above], below: params[:below])}
            results.each { |result| player.lumber += (result[:sawtimber_volume] + result[:poletimber_volume]).to_i }

            summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)
            response = client_response_with_details_hash_from_response response, summary
        end

        if params[:estimate] == false
            begin
              ActiveRecord::Base.transaction do
              player.save!
              harvestable_tiles.each(&:save!)

              # Update the market for viable tiles
              harvestable_tiles.each_with_index do |tile, index|
                tile.update_market! results[index]
              end
            end
          rescue ActiveRecord::RecordInvalid => e
              response = client_response_with_errors_array_from_response response, ["Transaction Failed: #{e.message}"]      
          end
        end
    end

    render json: response
  end

  def plant_saplings
      response = can_perform_action params, [:tree_count], Proc.new{|args| {:objects => resource_tiles, 
        :not_found_message => "No valid resource tiles found to perform diameter_limit_cut on."} }, true, :plant_trees

      if response[:success]
          time_cost  = TimeManager.plant_saplings(tiles: harvestable_tiles)
          money_cost = Pricing.plant_saplings
      
          begin
            resource_tiles.each do |tile|
              tile.plant_2_inch_diameter_trees! params[:tree_count]
            end
          rescue ActiveRecord::RecordInvalid => e
            response = client_response_with_errors_array_from_response(response, ["Transaction Failed: #{e.message}"])
          end
      end
      render json: response 
  end 

  def partial_selection_cut_list
      response = can_perform_action params, [:qratio, :target_basal_area, :estimate], Proc.new{|args| {:objects => resource_tiles, 
        :not_found_message => "No valid resource tiles found to perform partial_selection_cut on."} }, true, :harvest
  
      if response[:success]
          time_cost = TimeManager.partial_selection_cost(tiles: harvestable_tiles, player: player).to_i
          money_cost = Pricing.partial_selection_cost(tiles: harvestable_tiles, player: player).to_i

          if params[:estimate] == false 
              response = check_if_player_has_time_and_money_for_action player, time_cost, money_cost, response
          end

          if reponse[:success]
              player.balance -= money_cost
              player.time_remaining_this_turn -= time_cost

              results = harvestable_tiles.collect{|tile| tile.partial_selection_cut!(qratio: params[:qratio], target_basal_area: params[:target_basal_area])}
              results.each { |result| player.lumber += (result[:sawtimber_volume] + result[:poletimber_volume]).to_i }

              summary = results_hash(results, harvestable_tiles).merge(time_cost: time_cost, money_cost: money_cost)
              response = client_response_with_details_hash_from_response response, summary
          end

          if params[:estimate] == false
              begin
                ActiveRecord::Base.transaction do
                  player.save!
                  harvestable_tiles.each(&:save!)

                  # Update the market for viable tiles
                  harvestable_tiles.each_with_index do |tile, index|
                    tile.update_market! results[index]
                  end
                end
              rescue ActiveRecord::RecordInvalid => e
                response = client_response_with_errors_array_from_response response, ["Transaction Failed: #{e.message}"]      
              end
          end
      end

      render json: response
    end


  private

  def results_hash(results, resource_tiles)
    puts "results length: #{results.length} first one #{results[0]}"
    poletimber_value  = results.collect{|result| result[:poletimber_value ]}.sum
    poletimber_volume = results.collect{|result| result[:poletimber_volume]}.sum
    sawtimber_value   = results.collect{|result| result[:sawtimber_value  ]}.sum
    sawtimber_volume  = results.collect{|result| result[:sawtimber_volume ]}.sum

    { poletimber_value: poletimber_value, poletimber_volume: poletimber_volume,
       sawtimber_value: sawtimber_value,   sawtimber_volume: sawtimber_volume,
        resource_tiles: resource_tiles.as_api_response(:resource)
    }
  end

end
