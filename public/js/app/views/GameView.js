var TFApp = window.TFApp || {};

TFApp.GameView = Backbone.View.extend({

	el: ".game-wrapper",
	events:{
		"click .alert-cancel": "closeAlert"
		//todo move this all to it's own constructor
		//"click .accordian-section h1": "toggleAccordianSection"
	},


	initialize: function(){
		var that = this;
		//creat and cache some backbone views that are exclusive to this view
		this.QuickBarView = new TFApp.QuickBarView();
		this.ActionButtonsView = new TFApp.ActionButtonsView();
		this.TileDetailsView = new TFApp.TileDetailsView();
		this.SidebarView = new TFApp.SidebarView();

		this.$alerts = this.$el.find(".alerts");
		this.$alertModals = this.$el.find(".alert-modal");
		this.$confirmationModal = this.$el.find(".confirmation.alert-modal");
		this.$errorModal = this.$el.find(".error.alert-modal");
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

		this.$alertModals.css({"display":"none"});
		this.$alerts.stop().css({"display":"table"}).animate({opacity: 1});

		errorText = errorText || "SOMETHING BAD HAPPENED";
		this.$errorModal.find("p").text = errorText;
		this.$errorModal.stop().css({"display":"table-cell"}).animate({opacity: 1});
		
	},
	showConfirmationModal: function(callback, data, h1Text, message){
		var that = this;

		if(h1Text)
			this.$confirmationModal.find("h1").text(h1Text);
		if(message)
			this.$confirmationModal.find("p").text(message);

		this.$confirmationModal.find(".alert-confirm").off("click");
		this.$confirmationModal.find(".alert-confirm").on("click", function(){
			callback(data, that.closeAlert, that);
		});
		this.$alerts.stop().css({"display":"table"}).animate({opacity: 1});
		this.$confirmationModal.stop().css({"display":"table-cell"}).animate({opacity: 1});
	},
	closeAlert: function(){
		var that = this;
		this.$alerts.stop().animate({opacity: 0}, function(){
			that.$alerts.css({"display":"none"});
		});
		this.$alertModals.stop().animate({opacity: 0}, function(){
			that.$alertModals.css({"display":"none"});
		});
	}




});