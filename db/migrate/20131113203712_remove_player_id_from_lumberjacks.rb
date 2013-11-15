class RemovePlayerIdFromLumberjacks < ActiveRecord::Migration
  def change
    remove_column :lumberjacks, :player_id
  end
end
