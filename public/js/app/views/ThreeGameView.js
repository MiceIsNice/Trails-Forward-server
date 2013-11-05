var TFApp = window.TFApp || {};

TFApp.ThreeGameView = Backbone.View.extend({

	
	el: ".game-wrapper",
	scene: {},
	camera: {},
	renderer: {},
	materials: {
		grass: new THREE.MeshBasicMaterial({color: 0x00CC00}),
		water: new THREE.MeshBasicMaterial({color: 0x0000CC})
	},
	events:{
		"mousewheel .three-container": "handleScroll"
	},
	initialize: function(){
		var that = this;
		console.log("GameView.initialize");

		this.initializeThreeScene();

		TFApp.models.worldModel.on("change:tiles", that.drawTiles, this);
	},
	render: function(){
		//TODO
	},
	start: function(){

		
	},
	drawTiles: function(){
		console.log("-----------------------------------------");
		console.log("draw tiles start");

		var tiles = TFApp.models.worldModel.get("tiles");

		for(var i=0; i<tiles.length; i++){
			
			var tileData = tiles[i].table;
			var tile = new THREE.Mesh(
				new THREE.PlaneGeometry(1, 1)
			);

			//set the tile material based on the tile type
			if(tileData.type == "WaterTile")
				tile.material = this.materials.water;
			else
				tile.material = this.materials.grass;


			tile.position.x = tileData.x;
			tile.position.y = tileData.y;



			this.scene.add(tile);
		}

		this.renderer.render(this.scene, this.camera);

		console.log("draw tiles end");
		console.log("-----------------------------------------");
		

	},


	initializeThreeScene: function(){
		console.log("-----------------------------------------");
		console.log("init three scene start");


		// set the scene size
		var WIDTH = 960,
		  HEIGHT = 600;

		// set some camera attributes
		var VIEW_ANGLE = 45,
		  ASPECT = WIDTH / HEIGHT,
		  NEAR = 0.1,
		  FAR = 10000;

		// get the DOM element to attach to
		// - assume we've got jQuery to hand
		var $container = $('.three-container');

		// create a WebGL renderer, camera
		// and a scene
		this.renderer = new THREE.WebGLRenderer();
		this.camera =
		  new THREE.PerspectiveCamera(
		    VIEW_ANGLE,
		    ASPECT,
		    NEAR,
		    FAR);

		this.scene = new THREE.Scene();

		// add the camera to the scene
		this.scene.add(this.camera);

		// the camera starts at 0,0,0
		// so pull it back
		this.camera.position.z = 200;

		// start the renderer
		this.renderer.setSize(WIDTH, HEIGHT);

		// attach the render-supplied DOM element
		$container.append(this.renderer.domElement);

		
		this.$canvas = this.$el.find("canvas");


		console.log("init three scene end");
		console.log("-----------------------------------------");
	},

	handleScroll: function(e){
		e.preventDefault();
		if(this.scene){
			this.camera.position.z+=e.originalEvent.wheelDelta/20;
			this.renderer.render(this.scene, this.camera);
		}
		return false;
	}



});