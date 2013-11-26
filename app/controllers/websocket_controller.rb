
require "rubygems"
require "amqp"

class WebsocketController < ApplicationController
  skip_authorization_check

  def index


    AMQP.start(:host => "localhost") do
      connection = AMQP.connect(:host => '127.0.0.1')
      channel = AMQP::Channel.new(connection)
      queue   = channel.queue("foo")

      channel.default_exchange.publish("Hello World!", :routing_key => "foo")
      puts " [x] Sent 'Hello World!'"

      EM.add_timer(0.5) do
        connection.close do
          EM.stop { exit }
        end
      end
    end



    # EventMachine.run do
    #   puts "Connected to AMQP broker. Running #{AMQP::VERSION} version of the gem..."

    #   channel  = AMQP::Channel.new(connection)
    #   queue    = channel.queue("foo", :auto_delete => true)
    #   exchange = channel.direct("")

    #   queue.subscribe do |payload|
    #     puts "Received a message: #{payload}. Disconnecting..."
    #     connection.close { EventMachine.stop }
    #   end

      
    # end

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
