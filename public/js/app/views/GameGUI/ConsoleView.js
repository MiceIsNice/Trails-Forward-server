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
		var date = new Date();
		this.$consoleInner.append($('<p><span class="time">'+date.toLocaleTimeString()+': </span>'+messageText+'</p>'));
		this.$consoleInner.scrollTop(this.$consoleInner.prop("scrollHeight"));

	},
	addError: function(messageText){
		var date = new Date();
		this.$consoleInner.append($('<p class="error"><span class="time">'+date.toLocaleTimeString()+': </span>'+messageText+'</p>'));
		this.$consoleInner.scrollTop(this.$consoleInner.prop("scrollHeight"));


	}




});