require 'spec_helper'

describe PlayersController do
  include Devise::TestHelpers
  render_views

  describe '#index' do
    let(:user) { player.user }
    let(:player) { create(:lumberjack) }
    let(:other_user) { other_player.user }
    let(:other_player) { create :developer }
    let(:json) { JSON.parse(response.body) }

    before do
      sign_in user_to_sign_in
      get :index, user_id: user.id, format: 'json'
    end

    context 'logged in as another user' do
      let(:user_to_sign_in) { other_user }

      it "returns a public JSON representation of the user's players" do
        json.should == {"players" => [ {"id"=>player.id,
                                        "name"=> player.user.name,
                                        "user_id"=>player.user.id,
                                        "type"=>"Lumberjack",
                                        "world_id"=>player.world.id,
                                        "world_name"=>player.world.name,
                                        # FIXME remove once player api is fixed
                                        "quest_points"=>player.quest_points,
                                        "pending_balance"=>player.pending_balance,
                                        "balance"=>player.balance,
                                        "time_remaining_this_turn"=>player.time_remaining_this_turn,
                                        "quests"=>{}} ] }
      end
    end

    context 'logged in as the requested user' do
      let(:user_to_sign_in) { user }

      it "returns a private JSON representation of the user's players" do
        json.should == {"players" => [ {"id"=>player.id,
                                        "name"=> player.user.name,
                                        "type"=>"Lumberjack",
                                        "user_id"=>player.user.id,
                                        "world_id"=>player.world.id,
                                        "world_name"=>player.world.name,
                                        "quest_points"=>player.quest_points,
                                        "pending_balance"=>player.pending_balance,
                                        "balance"=>player.balance,
                                        "time_remaining_this_turn"=>player.time_remaining_this_turn,
                                        "quests"=>{}} ] }
      end
    end
  end
    
=begin 
  describe '#owned_resource_tiles' do
  
    context 'logged in as another user' do 
      let(:user_to_sign_in) { other_user }
      
      it "returns a JSON representation of an error list" do
        expect(response).to respond_with_content_type(:json)
        #expect(response).to 
      end
      
        json{"errors"}.kind_of?(Array).should == be_true && 
        json{"success"}.should == be_false
      
    end 
  
    context 'logged in as the requested user' do
      let(:user_to_sign_in) { user }
      
      it "returns a JSON representation of success and an array of >= 0 tiles" do
        json{"success"}.should == be_true &&
        json{"resource_tiles"}.kind_of?(Array).should == be_true
      end
      
    end
  
  end 
=end 

end
