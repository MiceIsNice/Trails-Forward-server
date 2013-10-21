var TFApp = window.TFApp || {};

TFApp.LoginView = Backbone.View.extend({

	el: ".login-wrapper", 

	events: {
		"click .submit": "attemptLoginPost"
	},
	initialize: function(){
		this.$form = $(this.$el.find("form"));
		this.$wait = $(this.$el.find(".wait"));
		this.$fail = $(this.$el.find(".fail"));
	},
	attemptLoginPost: function(e){
		e.preventDefault();
		var that = this;


		that.$fail.hide();
		that.$wait.show();


		//do the needful
		$.ajax({
			type: "post",
			url: "/users/sign_in",
			data: that.$form.serialize(),
			dataType: "json",
			success: function(data){
				that.handleLoginSuccess(data);
			},
			error: function(data){
				that.$wait.hide();
				that.$fail.show();
				console.error("Login Error: ", data);
			}
		});

		//prevent the form from submitting "naturally"
		return false;
	},
	handleLoginSuccess: function(data){
		var that = this;
		console.log("Login Success: ", data);

		$.cookie("user_id", data.id);
		$.cookie("authentication_token", data.authentication_token);

		that.$wait.hide();
		TFApp.models.userModel.set({ "user_id": data.id,
									 "authentication_token": data.authentication_token,
									 "name": data.name,
									 "email": data.email

									});

		//TODO: Determine where the user came from, and route
		//      them back to there.
		TFApp.router.navigate("lobby", true);
	},




	render: function(){
		//TODO
	},


});