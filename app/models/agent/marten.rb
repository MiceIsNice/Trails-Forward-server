class Marten < Agent
  include Behavior::HabitatSuitability

# needs access to:
  # hour? - currently each marten does all hours of activity at once (then next marten, etc)
  # needs 'face' function (to face a tile)
  # needs concept of 'previous_patch' (return to previous location if there is nothing better - line 93)
  # need a 'tile_here' type function to access attributes on local tile (may exist?)

# ISSUES
  # calculate_maximum_distance - need to figure out how to do a beta distribution AND find a better implementation of the distance function (speed ~ hunger?)

# TODO
  # scent marking

  MAX_ENERGY = 3334.8
  PATCH_ENTRANCE_PROBABILITY = 0.03
  
   # approximate max energy (Kj) storage in reserves
   # body fat contains 39.7 kj/g - Buskirk and Harlow 1989
   # body composition mean 5.6% fat - Buskirk and Harlow 1989
   # assume maximum body weight of 1500 g, approximated from Gilbert et al 2009
   # 1500 * 0.056 * 39.7 = 3334.8 kj max energy reserves  # territory_size
  # energy = max_energy #TODO: only during initialization

# NEED TO ADD PERSISTENT VARIABLES:
  attr_accessor :age, :energy
 
  

habitat_suitability barren_land: 0,
                    coniferous_forest: 1,
                    cultivated_crops: 0,
                    deciduous_forest: 1,
                    developed_high_intensity: 0,
                    developed_low_intensity: 0,
                    developed_medium_intensity: 0,
                    developed_open_space: 0,
                    emergent_herbaceous_wetlands: 0,
                    excluded: 0,
                    grassland_herbaceous: 0,
                    mixed_forest: 1,
                    open_water: 0,
                    pasture_hay: 0,
                    shrub_scrub: 0,
                    woody_wetlands: 1

  def day_of_year 
    world.current_date.yday
  end

  def forage
    h = 0
    case day_of_year 
    when 80..355
      active_hours = 12
    else
      active_house = 8
    end
    while h < active_hours
      force_move_distance
      check_predation
      h += 1
    end
  end



      def force_move_distance
        actual_dist = 0
        maximum_distance = calculate_maximum_distance
        while actual_dist < maximum_distance
          move_one_patch
          hunt
          actual_dist += 1
          if energy > MAX_ENERGY * 1.5
            set energy MAX_ENERGY
            break #TODO: make sure this is doing what I think it's doing
          end
        end
      end



          def calculate_maximum_distance
            1000 / 63.61 
            # maximum_distance = (beta(2 7) * 1750).round # approximates median distance value of 133m (from Hickey et al 1999)
          end



          def select_forage_patch
            set_neighborhood
            if neighborhood.empty?
              face previous_patch
            else
              # example for 'select' function:
              # vole_pop_neighborhood = neighborhood.select {tile.residue[:marten_id].nil? or tile.residue[:marten_id]==self.id}
              face neighborhood.shuffle.max_by(&:vole_max_pop)

            end  
          end



          def hunt
             # assumes 1.52712 encounters per step - equivalent to uncut forest encounter rate from Andruskiw et al 2008
             # probability of kill in uncut forest 0.05 (calculated from Andruskiw's values; 0.8 kills/24 encounters)
             # probability of kill in 1 step = 1.52712 * 0.05 = 0.076356
             p_kill = 0.076356
             
             # modify p_kill based on vole population
             if tile_here.vole_population < 1 #TODO need to access "tile_here" data
               p_kill = 0
             else
               # discount p_kill based on proportion of vole capacity in patch
               p_kill = (p_kill * (tile_here.vole_population / tile_here.vole_max_pop))
             end

             if rand > (1 - p_kill)
               energy = (energy + 140)
               tile_here.vole_population = (tile_here.vole_population - 1)
             end

           end



      def check_predation
        if habitat_suitlability_for (tile.here) == 1 #TODO: double check this arg
          p_mort = Math.exp(Math.log(0.99897) / active_hours) # based on daily predation rates decomposed to hourly rates (from Thompson and Colgan (1994))
        else
          p_mort = Math.exp(Math.log(0.99555) / active_hours)
        end

        if rand > p_mort 
          die #TODO: make sure 'die' works
        end
      end



 def metabolize
      case day_of_year
      when 80..355
        energy -= 857 # field metabolic rate (above)
      else
        energy -= 227 
    end

    if energy > MAX_ENERGY
      energy = MAX_ENERGY
    end
  end



  def check_death
    if energy < 0
      die
    end
  end



end