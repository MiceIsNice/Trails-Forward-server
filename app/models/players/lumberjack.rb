class Lumberjack < Player

  attr_accessible :saw_timber, :pole_timber

  has_many :logging_equipment

  before_create :create_default_sawyer_crew_logging_equipment

  after_initialize do 
    self.type        = self.class.player_type
    #self.pole_timber = self.class.default_pole_timber
    #self.saw_timber  = self.class.default_saw_timber
  end

  def self.player_type
    "Lumberjack"
  end

  def self.default_pole_timber
    0
  end

  def self.default_saw_timber
    0 
  end 


  # EQUIPMENT ############################
  #

  def create_default_sawyer_crew_logging_equipment
    unless self.logging_equipment.detect{|equipment| equipment.name == "Sawyer Crew"} # atomic
      crew = LoggingEquipment.sawyer_crew
      if crew
        crew.player = self
        crew.world = self.world
        self.logging_equipment << crew
      end
    end
  end

end
