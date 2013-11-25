# require 'em-websocket'

# $websocket_clients = []

# Thread.new do
#   EventMachine.run {
#     EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
#       ws.onopen {
#         $websocket_clients << ws
#       }
#       ws.onmessage { |msg|
#         puts "WSOCKET!!!!!!!!!!!!!!!"
#         puts msg
#         ws.send "Pong: #{msg}"
#       }
#       ws.onclose {
#         $websocket_clients.delete(ws)
#       }

#     end
#   }
# end