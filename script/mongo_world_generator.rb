#!/usr/bin/env ./script/rails runner

require 'trails_forward/mongo_world_importer'

DEFAULT_FILE = "script/data/vilas_conserv_game_spatial_1_acre_inputs_combined.csv"
filename = ARGV[0] || DEFAULT_FILE

class TrailsForwardImporter
  include TrailsForward::MongoWorldImporter
end

TrailsForwardImporter.new.import_world filename