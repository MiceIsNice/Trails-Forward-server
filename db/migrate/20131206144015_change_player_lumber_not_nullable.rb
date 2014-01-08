class ChangePlayerLumberNotNullable < ActiveRecord::Migration
  def self.up
    Player.connection.execute("update players set lumber=0 WHERE lumber IS NULL")
    change_column :players, :lumber, :integer, :null => false
  end

  def self.down
  end
end
