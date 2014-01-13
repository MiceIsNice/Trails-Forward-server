class TimeManager

  # Time logic for performing all actions
  #

  def self.can_perform_action? options
    options.required_keys! :player, :cost

    # Need a positive balance before considering cost.
    #return false if options[:player].time_remaining_this_turn <= 0

    # Can drop balance to 0
    puts "TimeManager.can_perform_action? player time left: #{options[:player].time_remaining_this_turn}, cost: #{options[:cost]}"
    (options[:player].time_remaining_this_turn - options[:cost]) >= 0
  end



  # REPLINISH ############################
  #

  def self.replenish_players_time! world
    world.players.each do |player|
      player.time_remaining_this_turn = Player.default_time_remaining
      player.save!
    end
  end
  def self.replenish_players_turns_for_all_worlds
    @players = Player.all
    @players.each do |player|
      player.time_remaining_this_turn += Player.turns_gained_per_tick
      if(player.time_remaining_this_turn > player.max_turns)
        player.time_remaining_this_turn = player.max_turns
      player.save!
    end
  end


  # CLEARCUT #############################
  #
  
    #  For all objects in the array accessed through the :tiles key in the options hash
    #    1. produce the union of a copy of options without :tiles (the player in question) 
    #        and a hash where the given object is assigned to the key tile:
    #    2. send message clearcut_cost_for_tile to self with that argument  
    #  return the sum of of the values of the resulting array 
  def self.clearcut_cost options
    options[:tiles].collect do |tile|
      clearcut_cost_for_tile options.except(:tiles).merge(tile: tile)
    end.sum
  end

    # Create an array of all tree sizes a LandTile can have
    # For each size:
    #   1. merge a hash with that size attached to key diameter: with the hash passed in 
    #   2. send clearcut_cost message to self with that argument 
  def self.clearcut_cost_for_tile options
    LandTile.tree_sizes.collect do |size|
      clearcut_cost_for_diameter options.merge(diameter: size)
    end.sum
  end

    # 1. Calculate the amount that the player can harvest at the given diameter 
    # 2. Ask the tile what its estimated volume at the given diameter is 
    # 3. Return what percentage of the player's harvest capacity would be used 
    #      for harvesting this tile at that diameter
  def self.clearcut_cost_for_diameter options
    harvest_ability = LoggingEquipment.harvest_volume_for(diameter: options[:diameter], equipment: options[:player].logging_equipment)

    volume = options[:tile].send("estimated_#{options[:diameter]}_inch_tree_volume")
    puts "clearcut_cost_for_diameter tile #{options[:tile].id} harvest_ability = #{harvest_ability}, volume = #{volume}"
    
    return 0.0 if volume == 0.0
    return 0.0 if harvest_ability == 0.0
    volume / harvest_ability
  end



  # PARTIAL SELECTION ####################
  #

  def self.partial_selection_cost options
    options[:tiles].collect do |tile|
      partial_selection_cost_for_tile options.except(:tiles).merge(tile: tile)
    end.sum
  end

  def self.partial_selection_cost_for_tile options
    LandTile.tree_sizes.collect do |size|
      partial_selection_cost_for_diameter options.merge(diameter: size)
    end.sum
  end

  def self.partial_selection_cost_for_diameter options
    harvest_ability = LoggingEquipment.harvest_volume_for(diameter: options[:diameter], equipment: options[:player].logging_equipment)

    volume = options[:tile].send("estimated_#{options[:diameter]}_inch_tree_volume")
    puts "partial_selection_cost_for_diameter tile #{options[:tile].id} harvest_ability = #{harvest_ability}, volume = #{volume}"


    return 0.0 if volume == 0.0
    return 0.0 if harvest_ability == 0.0
    volume / harvest_ability
  end



  # DIAMETER LIMIT #######################
  #

  def self.diameter_limit_cost options
    options[:tiles].collect do |tile|
      diameter_limit_cost_for_tile options.except(:tiles).merge(tile: tile)
    end.sum
  end

  def self.diameter_limit_cost_for_tile options
    LandTile.tree_sizes.collect do |size|
      diameter_limit_cost_for_diameter options.merge(diameter: size)
    end.sum
  end

  def self.diameter_limit_cost_for_diameter options
    harvest_ability = LoggingEquipment.harvest_volume_for(diameter: options[:diameter], equipment: options[:player].logging_equipment)

    volume = options[:tile].send("estimated_#{options[:diameter]}_inch_tree_volume")
    puts "diameter_limit_cost_for_diameter tile #{options[:tile].id} harvest_ability = #{harvest_ability}, volume = #{volume}"

    return 0.0 if volume == 0.0
    return 0.0 if harvest_ability == 0.0
    volume / harvest_ability
  end


  # PLANT SAPPLINGS #######################
  #
  def self.plant_sapplings tiles
      return tiles.length
  end
end







