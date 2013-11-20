var TFApp = window.TFApp || {};

TFApp.AudioView = Backbone.View.extend({

	el: ".audio-sources", 

	events: {
		//probably will stay empty?
	},
	initialize: function(){

		this.$woodChopOnce = this.$el.find("#wood-chop-once");
		this.$woodChopMany = this.$el.find("#wood-chop-many");
		this.$cashRegister = this.$el.find("#cash-register");
		this.$errorBeep = this.$el.find("#error-beep");


	},
	playWoodChopOnce: function(){
		this.$woodChopOnce[0].play();
	},
	playWoodChopMany: function(){
		this.$woodChopMany[0].play();
	},
	playCashRegister: function(){
		this.$cashRegister[0].volume = 0.4;
		this.$cashRegister[0].play();
	},
	playError: function(){
		this.$errorBeep[0].play();
	},
	render: function(){
		//TODO
	}

});