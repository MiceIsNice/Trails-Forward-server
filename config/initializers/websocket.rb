# require 'amqp'
# module HiringThingEM
#   def self.start
  	
#     if defined?(PhusionPassenger)
#       PhusionPassenger.on_event(:starting_worker_process) do |forked|
#       if forked && EM.reactor_running?
#           EM.stop
#       end
#       Thread.new {
#       EM.run do
#          AMQP.channel ||= AMQP::Channel.new(AMQP.connect(:host=> 127.0.0.1 ))
#       end
#       }
#       die_gracefully_on_signal
#       end
#     end
#   end

#   def self.die_gracefully_on_signal
#     Signal.trap("INT")  { EM.stop }
#     Signal.trap("TERM") { EM.stop }
#   end
# end

# HiringThingEM.start