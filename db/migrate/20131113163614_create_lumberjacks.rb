class CreateLumberjacks < ActiveRecord::Migration
  def change
    create_table :lumberjacks do |t|
      t.integer :player_id
      t.integer :pole_timber
      t.integer :saw_timber

      t.timestamps
    end
  end
end
