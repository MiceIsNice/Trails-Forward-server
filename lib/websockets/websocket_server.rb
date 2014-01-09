require 'em-websocket'
require 'uuid'
require 'amqp'
require 'json'

uuid = UUID.new

EventMachine::WebSocket.start(:host => "127.0.0.1", :port => 8080) do |ws|
  ws.onopen do
    puts "WebSocket opened"
  end

  



  ws.onmessage do |message|
    puts "-------------------------------------------------------------------"
    puts "got a message from the client:"
    puts message

    data = JSON.parse(message)
    world_id = data["data"]["world_id"]

    if world_id
      AMQP.connect(:host => '127.0.0.1') do |connection, open_ok|
        AMQP::Channel.new(connection) do |channel, open_ok|

          worldchatqueue = channel.queue(uuid.generate);

          puts "subscribing the websocket user to a world exchange based on their input data"
          worldchatqueue.bind(channel.fanout("worldchat" + world_id.to_s)).subscribe do |message|
            #this is what happens when a new message is found on the exchange
            puts "Sending message in worldchat" + world_id.to_s + " to a websocket client."
            ws.send message
          end
        end
      end
    end
    puts "-------------------------------------------------------------------"

  end

  ws.onclose do
    puts "WebSocket closed"
  end
  ws.onerror { |error |
    puts "ERROR!"
    puts error

  }
end