class ChangePlayerLumberDefault < ActiveRecord::Migration
  def change
    change_column :players, :lumber, :integer, :default => 0
  end
end
