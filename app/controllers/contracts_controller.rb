class ContractsController < ApplicationController
  include TFClientResponder
  skip_authorization_check
  expose(:world)
  expose(:contracts) { world.contracts }
  expose(:contract)

  respond_to :json, :html


  def contracts_not_owned_by_others args
    player = Player.find(args[:player_id])
    {:objects => contracts.select {|c| c.world_id == player.world_id && (c.player_id == nil || c.player_id == args[:player_id].to_i)},
     :not_found_message => "No contracts found in world #{player.world_id} owned by player #{args[:player_id]} or available." }
  end

  # def can_perform_action given_parameters, needed_parameters, active_record_lookup_func_proc, 
  #                         object_is_required, authorization_tag, second_auth_arg_proc = nil

  def index
    response = can_perform_action params, [:player_id], Proc.new {|args| contracts_not_owned_by_others args}, Object_not_required, 
                 :view_contract, Proc.new {|args| Player.find(args[:player_id])}

    response = client_response_with_details_hash_from_response response, { :tiles => (response[:objects].map {|c| c.to_base_contract_hash}) }
    render json: response

    # render_for_api :base_contract, :json => response[:objects]
  end


  def show
    respond_with contract
  end


  def create
    contract.save
    ContractsController::stuff_megatiles_into_contract contract, params[:megatile_ids_to_include]
    respond_with contract, notice: 'Contract Created', location: world_contracts_path
  end


  def update
    contract.update_attributes params[:contract]
    ContractsController::stuff_megatiles_into_contract contract, params[:megatile_ids_to_include]
    respond_with contract, notice: 'Contract Updated', location: world_contracts_path
  end

  def self.stuff_megatiles_into_contract(contract, megatile_ids_string)
    return if megatile_ids_string == nil
    ids = megatile_ids_string.split(",").map { |s| s.to_i}
    return if ids.length == 0
    megatiles = contract.world.megatiles.where :id => ids
    megatiles.each do |mt|
      contract.included_megatiles << mt if mt.owner == nil
    end
  end
end
