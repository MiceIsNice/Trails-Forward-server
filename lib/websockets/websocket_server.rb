require 'em-websocket'
require 'uuid'
require 'amqp'
require 'json'

uuid = UUID.new

EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
  ws.onopen do
    puts "WebSocket opened"
    

  


  end



  ws.onmessage do |message|
    puts "got a message"
    puts message

    data = JSON.parse(message)
    world_id = data["data"]["world_id"]

    if world_id
      AMQP.connect(:host => '127.0.0.1') do |connection, open_ok|
        AMQP::Channel.new(connection) do |channel, open_ok|
          worldchatqueue = channel.queue(uuid.generate);
          worldchatqueue.bind(channel.fanout("worldchat" + world_id)).subscribe do |message|
            puts "Sending a message from /lib/websockets/websocket_server"
            ws.send message
          end
        end
      end
    end

  end

  ws.onclose do
    puts "WebSocket closed"
  end
end