class UsersController < ApplicationController
  before_filter :authenticate_user!, :except => [:authenticate_for_token, :new]
  skip_authorization_check :only => [:authenticate_for_token, :new]

  def authenticate_for_token
    @user = User.find_by_email params[:email]
    if @user != nil and @user.valid_password? params[:password]
      @auth_token = @user.authentication_token
      ret = {:id => @user.id, :auth_token => @auth_token}
      cookies[:id] = @user.id
      cookies[:auth_token] = @auth_token
      
      respond_to do |format|
        format.json {render :json => ret }
        format.xml  {render :xml => ret }
      end
    else
      render :nothing => true, :status => :forbidden
    end
  end

  def index
    @users = User.all

    respond_to do |format|
      format.html
      format.xml  { render :xml => @users }
    end
  end

  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html
      format.xml  { render :xml => @user }
    end
  end

  def new
    @user = User.new
    respond_to do |format|
      format.html
      format.xml  { render :xml => @user }
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def create
   # @user = User.new(params[:email], params[:password], params[:name]);
    @user = User.new(params[:user])
    puts "UsersController::create made a new user with id #{@user.id}"

    respond_to do |format|
      if @user.save
        format.html { redirect_to(@user, :notice => 'User was successfully created.') }
        format.xml  { render :xml  => @user, :status => :created, :location => @user }
        format.json { render :json => @user, :status => :created, :location => @user }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml  => @user.errors, :status => :unprocessable_entity }
        format.json { render :json => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        @user.reset_authentication_token!
        format.html { redirect_to(@user, :notice => 'User was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

=begin
  def player_stats 
    
    if params[:user_id] && params[:player_id]
      player = Player.where("user_id = ? AND id = ?", params[:user_id], params[:player_id])[0]
    else
      render json: {:errors => ["need a valid user id and player id combination"]}
    end 
    
    authorize! :player_stats, player
    
    render json: {:balance => player.balance, :turn_points => player.time_remaining_this_turn, :political_capital => 5}
  end
=end

  def destroy
    @user = User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(users_url) }
      format.xml  { head :ok }
    end
  end
end
