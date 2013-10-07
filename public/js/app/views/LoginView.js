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

		//show the loader gif
		that.$wait.show();

		//do the needful
		$.ajax({
			type: "post",
			url: "/users/sign_in",
			data: that.$form.serialize(),
			dataType: "json",
			success: function(data){

				console.log("Login Success: ", data);
				console.log(data.user.authentication_token);

				that.$wait.hide();
				TFApp.models.user.set({"authentication_token": data.user.authentication_token});
				TFApp.router.navigate("", true);

			},
			error: function(data){

				console.log("Login Error: ", data);

			}
		});

		//prevent the form from submitting "naturally"
		return false;
	},
	render: function(){
		//TODO
	}

});