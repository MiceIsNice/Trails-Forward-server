class WebsocketController < ApplicationController
  skip_authorization_check

  def index

    $websocket_clients.each do |ws|
      ws.send "someone went to the websocket/index route"
      ws.send params[:msg]
    end
    
    render json: {:message => ""}
  end


  def show
  end


  def create

  end

  def update

  end

end
