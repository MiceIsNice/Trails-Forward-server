var TFApp = window.TFApp || {};

var UserModel = Backbone.Model.extend({
	defaults:{
		user_id: "",
		email: "",
		name: "",
		username: "",
		authentication_token: "",
		authQueryString: ""
	},
	initialize: function(){
		var that = this;

		//whenever the user_id changes:
		// -update the authQueryString
		// -get a new set of players and worlds

		this.on("change:user_id", function(){
			that.createAuthQueryString();
			//that.getUserPlayers();
			//that.getUserWorlds();
			//TFApp.router.navigate("lobby", true);
		});



	},

	getUserPlayers: function(){
		var that=this;
		var playerCollectionUrl = "/users/" + that.get("user_id") + "/players.json" + that.get("authQueryString");
		TFApp.collections.userPlayers.url = playerCollectionUrl;// = new PlayerCollection([], {url: playerCollectionUrl});
		TFApp.collections.userPlayers.fetch({reset: true});
	},
	getUserWorlds: function(){
		var that=this;
		var worldCollectionUrl = "/worlds.json" + that.get("authQueryString");



	},
	createAuthQueryString: function(){
		this.set("authQueryString", 
				 "?id=" 
				 + this.get("user_id") + 
				 "&auth_token=" + 
				 this.get("authentication_token"));	
	},
	joinWorld: function(world_id){
		var that = this;
		var dataString = that.get("authQueryString") 
							+ "&player%5Btype%5D=Lumberjack" 
							+ "&player%5Buser_id%5D="+ that.get("user_id")
							+ "&player%5bworld_id%5D="+ world_id
							+ "&user_id=" + that.get("user_id")
							;
		console.log(dataString);
		// var dataString = 
		// 		 "auth_token=" + 
		// 		 this.get("authentication_token");

		$.ajax({
			type: "post",
			url: "/worlds/"+world_id+"/players",
			data: dataString,
			dataType: "json",
			success: function(data){
				console.log("join world success: ", data)
			},
			error: function(data){
				console.error("join world error: ", data.statusText);
			}
		});


	}


});