#!/usr/bin/env ./script/rails runner
require 'benchmark'
require "tattletail"

num_ticks = ARGV[1] || 10
num_ticks = num_ticks.to_i
num_red_foxes = ARGV[2] || 1000
num_red_foxes = num_red_foxes.to_i
world_width = 198
world_height = 198
tick_tiles = true
generate_pngs = ARGV[3]

def file_prefix world
  "doc/world_pngs/#{world.id}-#{world.name.gsub(/\s/, '_')}"
end

def clear_old_pngs world
  files = Dir.glob("#{file_prefix world}*.png")
  files.each do |file|
    File.delete(file)
  end
end

def create_png world, tick_count
  file_name = "#{file_prefix world}-%03d.png" % tick_count
  world.generate_png file_name
end

def create_gif world
  file_name = "#{file_prefix world}.gif"
  File.delete(file_name) if File.exists?(file_name)
  system "convert #{file_prefix world}-*.png #{file_name}"
end

def set_progress_title tick_progress_bar, tick_count, agent_count
  tick_progress_bar.title = "Tick #{tick_count + 1} - #{agent_count} Red Foxes" if Rails.env.development?
end

def red_foxes_in_world world
  RedFox.with_world_and_tile.where(world_id: world.id)
end

world = if ARGV[0]
          World.find(ARGV[0])
        else
          Factory :world_with_resources, width: world_width, height: world_height
        end
Agent.delete_all(world_id: world.id)

world_width = world.width
world_height = world.height
tick_count = 0
ind_tick_count = 0

ProgressBar.color_status
ProgressBar.iter_rate_mode
ProgressBar.disable_output unless Rails.env.development?

red_fox_pb = ProgressBar.new('Red foxes', num_red_foxes)

num_red_foxes.times do
  location = []
  resource_tile = ''
  begin
    location = [rand * world_width, rand * world_height]
    resource_tile = world.resource_tile_at(*location.map(&:floor))
  end until resource_tile.type == 'LandTile' && resource_tile.tree_density > 0.4
  red_fox = FactoryGirl.create :red_fox,
                            world: world,
                            location: location,
                            heading: rand(360).round,
                            age: [Agent.normal_dist(2,5), 0].max.floor
  red_fox_pb.inc
end
red_fox_pb.finish

clear_old_pngs world
create_png(world, tick_count) if generate_pngs

puts

tile_count = LandTile.where(world_id: world.id).where('tree_density IS NOT NULL').count

num_ticks.times do |n|
  tick_pb = ProgressBar.new("Tick #{tick_count + 1}", red_foxes_in_world(world).count)
  world.tick
  tick_pb.finish

  tick_count += 1

  if generate_pngs
    create_png(world, tick_count)
    create_gif world
  end
  puts
end
