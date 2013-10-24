# Contains response behavior understood by the client
# 

module TFClientResponder

  Object_required =  true
  Object_not_required = false
  
  # checks if needed parameters are given, and all objects desired are authorized to perform the desired function
  # returns a: {:success => bool, :objects => ActiveRecord object[], :client_response => TFClientResponse}
  def can_perform_action given_parameters, needed_parameters, active_record_lookup_func, object_is_required, authorization_tag
  
    if given_parameters != nil && needed_parameters != nil
      response = all_parameters_given given_parameters, needed_parameters
      if response[:success] == false 
        return response
      end
    end
    
    response[:objects] = active_record_lookup_func given_parameters
    if object_is_required && response[:objects].length == 0
      response[:success] = false
      response[:client_response] = client_response_with_errors_array_from_response nil, response[:objects][:not_found_message]
      return response
    end 
    
    begin 
      response[:objects].each{|thing| authorize! authorization_tag, thing}
    rescue CanCan::AccessDenied => e
      response[:success] = false
      response[:client_response] = client_response_with_errors_array_from_response nil, [e.message]
    end

    return response
  end

  # returns client response if needed parameters are not given
  def all_parameters_given given_parameters, needed_parameters
    response = { :success => true, :client_response => [] }
    needed_parameters.each {|identifier| unless given_parameters.has_key?(identifier)
                                           response[:client_response].push identifier
                                         end}
    if response[:client_response].length > 0
      response[:success] = false 
      message = ""
      response[:client_response].each{|name| message += ", " + name}
      err_message = [ "missing parameters: " + message ]
      response[:client_response] = client_response_with_errors_array_from_response nil, err_message
    else
      response[:client_response] = nil
    end
    
    return response
  end 
  
    # A message can be nil or a hash. If the key is new, add the key and associated value
    #  array to the hash.  If the key exists, append new values where they belong
  def client_response_from_response response, key, value_array
    if response == nil 
      response = {:success => true} 
    end
    
    if key == :errors
      response[:success] = false
    end
    
    return response.update({:key => value_array}){|key, oldval, newval| oldval.concat newval}
  end 
  
  def client_response_with_errors_array_from_response response, errors_array 
    client_response_from_response response, :errors, errors_array
  end 
  
  def client_response_with_message_array_from_response response, message_array 
    client_response_from_response response, :message, message_array
  end 
  
end

