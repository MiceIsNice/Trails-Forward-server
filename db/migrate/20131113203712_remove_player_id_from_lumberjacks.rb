class RemovePlayerIdFromLumberjacks < ActiveRecord::Migration
  def change
    remove_column :player_id
  end
end
