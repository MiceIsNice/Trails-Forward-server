When /^I bulldoze a resource tile on the megatile that I own$/ do
  @my_resource_tile = get_bulldozable_tile @my_megatile
  @response = post bulldoze_world_resource_tile_path(@world, @my_resource_tile),
    :format => :json,
    :auth_token => @user.authentication_token
  decoded = ActiveSupport::JSON.decode(@response.body)
  decoded.has_key?("resource_tile").should be true
  decoded["resource_tile"].has_key?("id").should be true
end

Then /^that megatile should be empty$/ do
  @my_resource_tile.reload
  @my_resource_tile.tree_density.should be nil
  @my_resource_tile.housing_density.should be nil
end

When /^I bulldoze a resource tile on the owned megatile Then I should get an error$/ do
  @owned_resource_tile = get_bulldozable_tile @owned_megatile
  lambda {post bulldoze_world_resource_tile_path(@world, @owned_resource_tile), :format => :json, :auth_token => @user.authentication_token}.should raise_error
end

When /^I bulldoze a list containing that resource tile on the megatile that I own$/ do
  @my_resource_tile = get_bulldozable_tile @my_megatile

  @response = post bulldoze_world_resource_tiles_path(@world),
    :format => :json,
    :auth_token => @user.authentication_token,
    :resource_tile_ids => [@my_resource_tile.id]
  decoded = ActiveSupport::JSON.decode(@response.body)
  decoded.has_key?("resource_tiles").should be true
  #decoded["resource_tiles[0]"].has_key?("id").should be true

end

Then /^the list containing that megatile should be empty$/ do
  @my_resource_tile.reload
  @my_resource_tile.tree_density.should be nil
  @my_resource_tile.housing_density.should be nil
end

When /^I bulldoze a list containing that resource tile on the owned megatile Then I should get an error$/ do
  @owned_resource_tile = @owned_megatile.resource_tiles.first
  lambda {post bulldoze_world_resource_tiles_path(@world), :format => :json, :auth_token => @user.authentication_token, :resource_tile_ids => [@owned_resource_tile.id]}.should raise_error
end

def get_bulldozable_tile megatile
  resource_tile = megatile.resource_tiles.select(&:can_bulldoze?).first
  resource_tile.should be
  resource_tile
end
