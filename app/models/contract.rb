class Contract < ActiveRecord::Base
  acts_as_api

  belongs_to :contract_template
  belongs_to :world
  belongs_to :player
  has_and_belongs_to_many :included_megatiles, :join_table => 'contract_included_megatiles', :association_foreign_key => :megatile_id, :class_name => 'Megatile'
  has_and_belongs_to_many :attached_megatiles, :join_table => 'contract_attached_megatiles', :association_foreign_key => :megatile_id, :class_name => 'Megatile'

  validates :world, presence: true
  validates :contract_template_id, presence: true

  api_accessible :contract do |template|
    template.add :id
    template.add :world_id
    template.add :player_id
    template.add :month_started
    template.add :month_ended
    template.add :ended
    template.add :successful
    template.add :on_time
    template.add :volume_harvested_of_required_type
    template.add :points_earned
    template.add :created_at
    template.add :updated_at
  end

end


t.integer  "contract_template_id"
t.integer  "world_id"
t.integer  "player_id"
t.integer  "month_started"
t.integer  "month_ended"
t.boolean  "ended"
t.boolean  "successful"
t.boolean  "on_time"
t.integer  "volume_harvested_of_required_type"
t.datetime "created_at"
t.datetime "updated_at"
t.integer  "points_earned"