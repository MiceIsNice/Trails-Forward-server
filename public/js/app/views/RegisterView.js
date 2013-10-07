var TFApp = window.TFApp || {};

TFApp.RegisterView = Backbone.View.extend({

	el: ".register-wrapper", 

	events: {
		"click .submit": "attemptRegisterPost"
	},
	initialize: function(){

		this.$form = $(this.$el.find("form"));
		this.$wait = $(this.$el.find(".wait"));
		this.$fail = $(this.$el.find(".fail"));



	},
	attemptRegisterPost: function(e){
		var that = this;


		e.preventDefault();

		//show the loader gif
		that.$wait.show();

		//do the needful
		$.ajax({
			type: "post",
			url: "/users",
			data: that.$form.serialize(),
			dataType: "json",
			success: function(data){
				console.log("Login Success: ", data);
			},
			error: function(data){
				console.log("Login Error: ", data);
			}
		});

		return false;

	},
	render: function(){
		//TODO
	}

});