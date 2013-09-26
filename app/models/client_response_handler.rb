class ClientResponseHandler < ApplicationController

  def self.all_parameters_given given_parameters, needed_parameters
    needed_parameters.each { |identifier| unless 
                               given_parameters[identifier] 
                               return false 
                              end}
    return true
  end 

  def self.missing_parameters_message given_parameters, needed_parameters
    message = new Array
    needed_parameters.each {|identifier| unless params[identifier]
                                           message.push identifier
                                         end}
    return { :missing_parameters => message }
  end 
  
## changed [] to { } for the return above and below this

  def self.new_error_message message
    return { :errors => message }
  end
  
  def self.add_error_message error, message
    if error[:errors]
      error[:errors].push message 
    else
      error[:errors] = message
    end
    return error
  end 
  
end
