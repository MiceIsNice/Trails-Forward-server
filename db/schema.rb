# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111227161252) do

  create_table "agent_settings", :force => true do |t|
    t.integer "agent_id", :null => false
    t.string  "name",     :null => false
    t.string  "value"
  end

  add_index "agent_settings", ["agent_id", "name"], :name => "index_agent_settings_on_agent_id_and_name", :unique => true

  create_table "agents", :force => true do |t|
    t.string  "type"
    t.integer "world_id"
    t.integer "resource_tile_id"
    t.float   "x"
    t.float   "y"
    t.integer "heading"
    t.string  "state"
    t.integer "age",              :default => 0
  end

  add_index "agents", ["resource_tile_id"], :name => "index_agents_on_resource_tile_id"
  add_index "agents", ["type"], :name => "index_agents_on_type"
  add_index "agents", ["world_id"], :name => "index_agents_on_world_id"
  add_index "agents", ["x"], :name => "index_agents_on_x"
  add_index "agents", ["y"], :name => "index_agents_on_y"

  create_table "bids", :force => true do |t|
    t.integer  "listing_id"
    t.integer  "bidder_id"
    t.integer  "current_owner_id"
    t.integer  "money"
    t.integer  "offered_land_id"
    t.integer  "requested_land_id"
    t.string   "status",             :default => "Offered"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "rejection_reason"
    t.integer  "counter_to_id"
    t.boolean  "execution_complete", :default => false
  end

  add_index "bids", ["listing_id"], :name => "index_bids_on_listing_id"

  create_table "change_requests", :force => true do |t|
    t.string   "type"
    t.integer  "target_id"
    t.string   "target_type"
    t.string   "development_type"
    t.string   "development_quality"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "complete",            :default => false
    t.integer  "world_id"
  end

  add_index "change_requests", ["complete"], :name => "index_change_requests_on_complete"
  add_index "change_requests", ["world_id"], :name => "index_change_requests_on_world_id"

  create_table "geometry_columns", :id => false, :force => true do |t|
    t.string  "f_table_catalog",   :limit => 256, :null => false
    t.string  "f_table_schema",    :limit => 256, :null => false
    t.string  "f_table_name",      :limit => 256, :null => false
    t.string  "f_geometry_column", :limit => 256, :null => false
    t.integer "coord_dimension",                  :null => false
    t.integer "srid",                             :null => false
    t.string  "type",              :limit => 30,  :null => false
  end

  create_table "listings", :force => true do |t|
    t.integer  "owner_id"
    t.integer  "megatile_grouping_id"
    t.integer  "price"
    t.string   "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "status",               :default => "Active"
    t.integer  "bid_id"
  end

  add_index "listings", ["owner_id"], :name => "index_listings_on_owner_id"

  create_table "megatile_groupings", :force => true do |t|
  end

  create_table "megatile_groupings_megatiles", :force => true do |t|
    t.integer "megatile_id"
    t.integer "megatile_grouping_id"
  end

  create_table "megatiles", :force => true do |t|
    t.integer "world_id"
    t.integer "x"
    t.integer "y"
    t.integer "owner_id"
  end

  create_table "players", :force => true do |t|
    t.integer "user_id"
    t.integer "world_id"
    t.integer "balance"
    t.string  "type"
  end

  create_table "resource_tiles", :force => true do |t|
    t.integer "megatile_id"
    t.integer "x"
    t.integer "y"
    t.string  "type"
    t.string  "zoned_use"
    t.integer "world_id"
    t.string  "primary_use"
    t.float   "people_density"
    t.float   "housing_density"
    t.float   "tree_density"
    t.string  "tree_species"
    t.float   "development_intensity"
    t.float   "tree_size"
    t.float   "imperviousness"
    t.float   "frontage"
    t.float   "lakesize"
    t.integer "soil"
    t.integer "landcover_class_code"
  end

  add_index "resource_tiles", ["x", "y", "world_id"], :name => "index_resource_tiles_on_x_and_y_and_world_id"

  create_table "spatial_ref_sys", :id => false, :force => true do |t|
    t.integer "srid",                      :null => false
    t.string  "auth_name", :limit => 256
    t.integer "auth_srid"
    t.string  "srtext",    :limit => 2048
    t.string  "proj4text", :limit => 2048
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                                 :default => "", :null => false
    t.string   "encrypted_password",     :limit => 128, :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                         :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "authentication_token"
  end

  add_index "users", ["authentication_token"], :name => "index_users_on_authentication_token", :unique => true
  add_index "users", ["email"], :name => "index_users_on_email"
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "worlds", :force => true do |t|
    t.string   "name"
    t.integer  "height"
    t.integer  "width"
    t.integer  "megatile_width"
    t.integer  "megatile_height"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "start_date"
    t.date     "current_date"
  end

end
