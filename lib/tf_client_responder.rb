# Contains response behavior understood by the client
# 

module TFClientResponder

  Object_required = true
  Object_not_required = false
  
  # checks if needed parameters are given, and all objects desired are authorized to perform the desired function
  # returns a: {:success => bool, :objects => ActiveRecord object[], :client_response => TFClientResponse}
  def can_perform_action given_parameters, needed_parameters, active_record_lookup_func_proc, 
                          object_is_required, authorization_tag, second_auth_arg_proc = nil
                          
    response = new_successful_client_response
  
    if given_parameters != nil && needed_parameters != nil
      response = all_parameters_given given_parameters, needed_parameters
      if response[:success] == false 
        return response
      end
    end
    
    the_data = active_record_lookup_func_proc.call(given_parameters)
    response[:objects] = the_data[:objects]

    if object_is_required && response[:objects].length == 0
      response[:success] = false
      response[:client_response] = client_response_with_errors_array_from_response nil, the_data[:not_found_message]
      begin 
        authorize! :fail, "failing on purpose!"
      rescue CanCan::AccessDenied => e
        response[:success] = false
        response[:client_response] = client_response_with_errors_array_from_response nil, [e.message]
      end
      return response
    end
    
    begin 
      if second_auth_arg_proc == nil 
        response[:objects].each{|thing| authorize! authorization_tag, thing}
      else 
        second = second_auth_arg_proc.call given_parameters
        response[:objects].each{|thing, second| authorize! authorization_tag, thing}
      end
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

  def new_successful_client_response
    return {:success => true, :details => nil, :errors => nil}
  end
  
    # A message can be nil or a hash. If the key is new, add the key and associated value
    #  array to the hash.  If the key exists, append new values where they belong
  def client_response_from_response response, key, value_array
    if response == nil 
      response = new_successful_client_response
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

  def client_response_with_details_hash_from_response response, hash
    if !response[:details]
      response[:details] = {}
    end

    return response[:details].merge(hash)
  end
  
end

