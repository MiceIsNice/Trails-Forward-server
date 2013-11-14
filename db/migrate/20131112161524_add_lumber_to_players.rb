class AddLumberToPlayers < ActiveRecord::Migration
  def change
    add_column :players, :lumber, :int
  end
end
