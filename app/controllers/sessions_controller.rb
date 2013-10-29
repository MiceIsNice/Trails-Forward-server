class SessionsController < Devise::SessionsController
  
  def create
    puts "----------------!!!!!!!!!--------------------"

    return render :json => {:id => current_user.id, 
                            :authentication_token => current_user.authentication_token,
                            :email => current_user.email,
                            :name => current_user.name
                          }.to_json
    
  end
end