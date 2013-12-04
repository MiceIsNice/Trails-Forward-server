
require "rubygems"
require "bunny"
require "amqp"

class WebsocketController < ApplicationController
  skip_authorization_check


  def index
    conn = Bunny.new(:host => "127.0.0.1")
    conn.start
    ch = conn.create_channel
    x = ch.fanout("worldchat3");
    x.publish(params[:text]);
    conn.close
    render json: {:message => ""}
  end



  def show

    render json: {:message => ""}
  end



  def create

  end

  def update

  end

end
