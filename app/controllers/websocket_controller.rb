
require "rubygems"
require "bunny"
require "amqp"

class WebsocketController < ApplicationController
  skip_authorization_check


  def index

    conn = Bunny.new(:host => "127.0.0.1")
    conn.start
    ch = conn.create_channel
    x = ch.fanout("twitter");

    x.publish("OH PLEASE GOD")

    # ch.default_exchange.publish("HELLO WORLD!", :routing_key => q.name)
    # #q.publish("ANYTHING", :routing_key => q.name)
    # puts "[x] Send 'Hello World!'"

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
