TrailsForwardWorld::Application.routes.draw do

  devise_for :users,
             :controllers => {:sessions => 'sessions'}
             #:controllers => {:sessions => 'users/sessions'}
  #get "sign_up" => "users#new", :as => "sign_up"

  match "/users/authenticate_for_token" => "users#authenticate_for_token"
#  match "/users/sign_up" => "devise/registrations#new"

  resources :rosebud do
    put :clear_my_owned_land
    put :clear_all_owned_land
    put :clear_survey_data
    put :clear_my_contracts
    put :clear_my_upgrades
  end

  resources :users do
    resources :players, :only => [:index, :new, :create, :show, :update, :edit, :destroy]
  end
 
  resources :users do 
    resources :players do
      get :player_stats
      get :player_equipment
      get :owned_resource_tiles
      put :set_player_balance_and_turn_points
    end
  end 
  
  resources :worlds do
    put :end_turn_for_all_players
    resources :resource_tiles do
      get :owned_by_others
    end
  end

  
  resources :players do
    get :surveys_for_player
  end

  resources :worlds, :only => [:index, :show, :update] do
    member do
      get :time_left_for_turn
      get :turn_state
    end
    
    resource :pricing, :controller => :world_pricing, :only => [] do
      get :pine_sawtimber
    end

    resources :players, :only => [:index, :create, :destroy], :controller => :world_players do
      get :bids_placed
      get :bids_received
      resources :contracts, :only => [:index], :controller => :world_player_contracts do
        post :attach_megatiles
        post :deliver
      end
      resources :available_contracts, :only => [:index], :controller => :world_player_available_contracts do
        post :accept
      end
    end

    resources :listings, :only => [:index, :create, :show] do
      collection do
        get 'active', :controller => :listings, :action => :index_active
      end

      resources :bids, :controller => :listing_bids, :except => [:destroy, :update] do
        member do
          post :accept
        end
      end
    end

    resources :megatiles, :only => [:index, :show] do
      resources :listings, :except => [:destroy, :update]

      resources :bids, :except => [:destroy, :update] do
        post :accept
        post :reject
      end

      resources :surveys, :only => [:index, :show, :create]

      member do
        put :buy
        get :appraise
      end

      collection do
        get 'appraise', :controller => :megatiles, :action => :appraise_list
        get :owned
      end
    end

    resources :resource_tiles, :only => [:index, :show, :update] do
      member do
        post :bulldoze
        post :clearcut
        post :build
        post :build_outpost
        post :diameter_limit_cut, action: :diameter_limit_cut_list
      end

      collection do
        post 'diameter_limit_cut', controller: :resource_tiles, action: :diameter_limit_cut_list
        post 'partial_selection_cut', controller: :resource_tiles, action: :partial_selection_cut_list
        post 'bulldoze', :controller => :resource_tiles, :action => :bulldoze_list
        post 'clearcut', :controller => :resource_tiles, :action => :clearcut_list
        post 'build', :controller => :resource_tiles, :action => :build_list
        get 'permitted_actions', :controller => :resource_tiles, :action => :permitted_actions
      end
    end

    resources :contracts
    
    resources :messages do
      member do
        put :read
        put :archive
      end
    end

    resources :logging_equipment, :only => [:index], :controller => :world_logging_equipment do
      member do
        get :available
        put :buy
      end

      collection do
        get :owned
      end
    end
  end

  resources :contract_templates
  resources :non_player_characters
  resources :companies, :controller => 'non_player_characters'
  resources :people, :controller => 'non_player_characters'

  resources :logging_equipment_templates
  resources :logging_equipment

  root :to => "welcome#index"
end
