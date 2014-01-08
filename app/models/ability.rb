class Ability
  include CanCan::Ability

  def initialize(user)
    can :fail, String do |s|
      # puts s
      false
    end

   can :authorize_user_for_rosebud, Player do
    true
   end
   can :authorize_player_for_action, Player do
    true
   end
    can :view_contract, ResourceTile, Player do |tile, player|
      (tile.owner_id == player.id || tile.owner_id == nil) && tile.world_id == player.world_id
    end

    can :index_worlds, World do
      true
    end

    can :show_world, World do
      true
    end

    can :update_world, World do
      true
    end

    can :god_mode, ResourceTile do |tile, god_mode|
      false
    end
    
    can :access_private_data, Player, :user_id => user.id
    can :access_private_data, User, :id => user.id

    can :create_player, User
    can :update_player, Player do |player|
      user.players.include? player
      # FIXME This is already kind of covered by finding them with player for user?
    end

    can :index_user_players, :all
    can :show_player, :all

    # users can only do things in worlds they inhabit
    can :do_things, World do |world|
      true || world.player_for_user(user)
    end

    can :index_listings, World do |world|
      can? :do_things, world
    end

    can :list_megatiles_for_sale, World do |world|
      can? :do_things, world
    end

    can :list_for_sale, Megatile do |megatile|
      megatile.world.player_for_user(user) == megatile.owner
    end

    can :bid, Listing, do |listing|
      (can? :do_things, listing.world) && (listing.owner != listing.world.player_for_user(user))
    end

    can :bid, Megatile do |megatile|
      # the user doesn't already own the tile
      (can? :do_things, megatile.world) and ( megatile.owner != megatile.world.player_for_user(user) )
    end

    can :see_bids, Megatile do |megatile|
      (megatile.world.player_for_user(user) == megatile.owner) or (megatile.owner == nil)
    end

    can :see_bids, Listing do |listing|
      (listing.world.player_for_user(user) == listing.owner) or (listing.owner == nil)
    end

    can :see_bids, Player, :user_id => user.id

    can :see_contracts, Player do |player|
      player.user == user
    end

    can :accept_contract, Contract do |contract|
      puts "verifying player's ability to accept contract with id: #{contract.id}"
      player = contract.world.player_for_user(user)

      true

      if Contract.where(player_id: player.id, successful: nil).length > 2
        raise CanCan::AccessDenied.new("A player is allowed only three contracts at a time.", :accept_contract, contract)
      elsif !player.available_contracts.include?(contract)
        raise CanCan::AccessDenied.new("This contract is not available for the player.", :accept_contract, contract)
      else 
        true
      end 
        
    end

    can :attach_megatiles, Contract do |contract|
      player_for_user = contract.world.player_for_user(user)
      player_for_user == contract.player
    end

    can :deliver, Contract do |contract|
      player_for_user = contract.world.player_for_user(user)
      player_for_user == contract.player
    end

    can :attach_to_contract, Megatile, do |megatile|
      player = megatile.world.player_for_user(user)
      megatile.owner == player # TODO: have more sophistication here around rights
    end

    can :accept_bid, Bid do |bid|
      # assumes that all requested land in the bid has the same owner
      megatiles = bid.requested_land.megatiles
      megatile  = megatiles.first
      player    = megatile.world.player_for_user(user)

      player == megatile.owner
    end

    can :accept_listing_bid, Bid, Listing do |bid, listing|
      player = listing.world.player_for_user(user)
      player == listing.owner && listing == bid.listing
    end

    can :bulldoze, ResourceTile do |rt|
      rt.megatile.world.player_for_user(user) == rt.megatile.owner
    end
    
    can :build, ResourceTile do |rt|
      player = rt.megatile.world.player_for_user(user)
      player == rt.megatile.owner && player.class == Developer
    end
      
    can :build_outpost, ResourceTile do |rt|
      #TODO: put this back
      #rt.world.player_for_user(user).class == Developer &&
      [21,22,23,24].include?(rt.landcover_class_code) &&
      rt.zoning_code >= 3 && ![6,10,16, 255].include?(rt.zoning_code)
    end
    
    can :see_player_tiles, Player, Megatile do |player, mt|
     if mt.owner_id = player.id
       true
    else
       raise CanCan::AccessDenied.new("Player does not own this tile and therefore can't see who does.")
     end
    end 

    can :harvest, ResourceTile do |rt|
      player = rt.megatile.world.player_for_user(user)
#     puts "resrouce tile with id: #{rt.megatile.id} lives in world: #{rt.megatile.world.id} and has owner #{rt.megatile.owner}"
#     puts "requesting player has id: #{player.id}"
      if !player
        raise CanCan::AccessDenied.new("Cannot find a player for user #{user.id} in world #{rt.megatile.world.id}", :harvest, rt)
      elsif player != rt.megatile.owner
        raise CanCan::AccessDenied.new("Player does not have harvest rights for resource tile id #{rt.id}", :harvest, rt)
      else
        true
      end
    end

    can :plant_trees, ResourceTile do |rt|
      player = rt.megatile.world.player_for_user(user)
      if !player
        raise CanCan::AccessDenied.new("Cannot find a player for user #{user.id} in world #{rt.megatile.world.id}", :harvest, rt)
      elsif player.id != rt.megatile.owner_id
        raise CanCan::AccessDenied.new("Player does not have planting rights for resource tile id #{rt.id}", :harvest, rt)
      else
        true
      end 
    end

    can :player_info, Player do |player|
      Player.where("user_id = ? AND id= ? ", user.id, player.id).length == 1
    end

    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user permission to do.
    # If you pass :manage it will apply to every action. Other common actions here are
    # :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on. If you pass
    # :all it will apply to every resource. Otherwise pass a Ruby class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details: https://github.com/ryanb/cancan/wiki/Defining-Abilities
  end
end
