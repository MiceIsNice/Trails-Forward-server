var TFApp = window.TFApp || {};

TFApp.ConsoleView = Backbone.View.extend({

	el: ".console",
	events:{
	},

	initialize: function(){
		var that = this;
		this.$consoleInner = this.$el.find(".console-inner");

	},
	render: function(){
		//TODO
	},
	start: function(){
	},
	addMessage: function(messageText){
		this.$consoleInner.append($('<p>'+messageText+'</p>'));
		this.$consoleInner.scrollTop(this.$consoleInner.prop("scrollHeight"));

	},
	addError: function(errorText){
		this.$consoleInner.append($('<p class="error">'+errorText+'</p>'));
		this.$consoleInner.scrollTop(this.$consoleInner.prop("scrollHeight"));


	}




});