var TFApp = window.TFApp || {};

TFApp.GameView = Backbone.View.extend({

	el: ".game-wrapper",
	events:{
		//todo move this all to it's own constructor
		"click .accordian-section h1": "toggleAccordianSection"
	},


	initialize: function(){
		var that = this;


		//creat and cache some backbone views that are exclusive to this view
		this.QuickBarView = new TFApp.QuickBarView();
		this.ActionButtonsView = new TFApp.ActionButtonsView();
		this.TileDetailsView = new TFApp.TileDetailsView();
		this.SidebarView = new TFApp.SidebarView();
		

	},
	render: function(){
		//TODO
	},
	start: function(){
		console.log("Starting Game View");
	},

	toggleAccordianSection: function(e){
		e.preventDefault(true, true);
		var $target = $(e.currentTarget);
		var $container = $target.closest(".accordian-section");
		var $siblingContainers = $container.siblings(".accordian-section");
		var $containerTableWrap = $container.find(".table-wrap");

		var currentHeight = $containerTableWrap.height();
		var autoHeight = $containerTableWrap.css('height', 'auto').height();
		$containerTableWrap.css('height', currentHeight);

		$siblingContainers.find(".table-wrap").animate({height: 0});
		$siblingContainers.removeClass("active");

		if(!$container.hasClass("active")){
			
			$containerTableWrap.animate({height: autoHeight}, function(){
				$containerTableWrap.height("100%");
				$container.addClass("active");
			});
		}
		return false;

	},
	showErrorModal: function(errorText){
		errorText = errorText || "SOMETHING BAD HAPPENED";
		alert(errorText);

	}




});