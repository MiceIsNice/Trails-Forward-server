var TFApp = window.TFApp || {};

TFApp.WorldView = Backbone.View.extend({

	el: ".world-wrapper",

	scene: {},
	camera: {},
	renderer: {},
	worldScale: 1,
	materials: {
		grass: new THREE.MeshLambertMaterial({color: 0x009900}),
		water: new THREE.MeshLambertMaterial({color: 0x000099}),
		selected: new THREE.MeshLambertMaterial({color: 0xFFFFFF, transparent: true, opacity: 0.5}),
		treeLeaves: new THREE.MeshLambertMaterial({color: 0x006600})
	},
	textures: {

	},
	//some geometry 'prefabs'
	treeGeometry: {},
	tileGeometry: {},

	selectedLight: {},
	selectedTile: {},
	tileMeshes: [],
	keyArray: [],
	keyCode: { SHIFT: 16 },
	events:{
		//"mousewheel .three-container": "handleScroll"
		"click .three-container canvas": "handleCanvasClick"
	},


	initialize: function(){
		var that = this;
		console.log("GameView.initialize");

		this.initializeThreeScene();

		TFApp.models.currentWorldModel.on("change:tiles", that.drawTiles, this);


		//since we can't handle global keyup/keydown from the normal view scope,
		//add our own event listeners
		$(document).on("keyup", function(e){
			that.handleKeyUp(e);
		});
		$(document).on("keydown", function(e){
			that.handleKeyDown(e);
		});
	},
	render: function(){

	},
	start: function(){
		
	},
	drawTiles: function(){
		console.log("-----------------------------------------");
		console.log("draw tiles start");
		var that = this;

		var tiles = TFApp.models.currentWorldModel.tiles;



		this.treeGeometry = new THREE.Geometry();

		this.treeGeometry.vertices.push(new THREE.Vector3(0, 1, 0));
		//left
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0, -.3));
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0,  .3));

		//back
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0,  .3));
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0,  .3));
		
		//right
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0,  .3));
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0, -.3));

		//front
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0, -.3));
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0, -.3));
		

		// //bottom
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0, -.3));
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0, -.3));
		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0,  .3));

		this.treeGeometry.vertices.push(new THREE.Vector3( .3, 0,  .3));
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0,  .3));
		this.treeGeometry.vertices.push(new THREE.Vector3(-.3, 0, -.3));





		this.treeGeometry.faces.push(new THREE.Face3(0,1,2,
											new THREE.Vector3(0,-1,0)));
		this.treeGeometry.faces.push(new THREE.Face3(0,3,4,
											new THREE.Vector3(0,-1,0)));
		this.treeGeometry.faces.push(new THREE.Face3(0,5,6,
											new THREE.Vector3(0,-1,0)));
		this.treeGeometry.faces.push(new THREE.Face3(0,7,8,
											new THREE.Vector3(0,-1,0)));


		this.treeGeometry.faces.push(new THREE.Face3(9,10,11, new THREE.Vector3(0,1,0)));
		this.treeGeometry.faces.push(new THREE.Face3(12,13,14, new THREE.Vector3(0,-1,0)));



		//treeGeometry.computeBoundingSphere();
		this.treeGeometry.computeFaceNormals();
		this.treeGeometry.buffersNeedUpdate = true;
		this.treeGeometry.uvsNeedUpdate = true;

		//TILE GEOMETRY
		this.tileGeometry = new THREE.Geometry();

		this.tileGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		this.tileGeometry.vertices.push(new THREE.Vector3(0, 0, 1));
		this.tileGeometry.vertices.push(new THREE.Vector3(1, 0, 1));
		this.tileGeometry.vertices.push(new THREE.Vector3(1, 0, 0));

		this.tileGeometry.faces.push(new THREE.Face3(0,1,2, new THREE.Vector3(0,1,0)));
		this.tileGeometry.faces.push(new THREE.Face3(2,3,0, new THREE.Vector3(0,1,0)));

		//tileGeometry.computeBoundingSphere();
		this.tileGeometry.computeFaceNormals();
		this.tileGeometry.buffersNeedUpdate = true;
		this.tileGeometry.uvsNeedUpdate = true;



		for(var x=0; x<tiles.length; x++){
			for(var y=0; y<tiles[x].length; y++){


				this.drawTile({x: x, z: y});

			}

		}

		that.renderer.render(that.scene, that.camera);

		console.log("draw tiles end");
		console.log("-----------------------------------------");
		

	},
	initializeThreeScene: function(){
		console.log("-----------------------------------------");
		console.log("init three scene start");
		var that = this;

		that.materials.grass.vertexColors = true;
		that.materials.water.vertexColors = true;
		that.materials.selected.vertexColors = true;

		// get the DOM element to attach to
		// - assume we've got jQuery to hand
		var $container = $('.three-container');

		// set the scene size
		var WIDTH = 900,
		  HEIGHT = 600;

		// set some camera attributes
		var VIEW_ANGLE = 45,
		  ASPECT = window.innerWidth / window.innerHeight,
		  NEAR = .01,
		  FAR = 10000;


		this.scene = new THREE.Scene();

		this.camera =
		  new THREE.PerspectiveCamera(
		    VIEW_ANGLE,
		    ASPECT,
		    NEAR,
		    FAR);





		// add the camera to the scene
		this.camera.position.set(64,32,64);
		this.camera.lookAt(new THREE.Vector3( 32, 0, 32 ));
		//this.camera.lookAt(32,0,32);
		controls = new THREE.OrbitControls( this.camera );
		controls.target.set(32,0,32);
		controls.addEventListener( 'change', function(){
			that.renderer.render(that.scene, that.camera)
		});
		this.scene.add(this.camera);




		




		/****************************************************
							  LIGHTS
		 ****************************************************/
		var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.target.position.set(32*this.worldScale, 0, 32*this.worldScale);
		directionalLight.position.set(64*this.worldScale, 32*this.worldScale, 64*this.worldScale);

		directionalLight.castShadow = true;
		directionalLight.shadowDarkness = .4;
		directionalLight.shadowCameraVisible = true;
		directionalLight.shadowMapWidth = 8192;
		directionalLight.shadowMapHeight = 8192;
		directionalLight.shadowMapBias = .0039;



		var d = 100*this.worldScale;
		directionalLight.shadowCameraNear = 10*this.worldScale;
		directionalLight.shadowCameraFar = 90*this.worldScale;

		directionalLight.shadowCameraLeft = -d;
		directionalLight.shadowCameraRight = d;
		directionalLight.shadowCameraTop = d;
		directionalLight.shadowCameraBottom = -d;


		this.scene.add(directionalLight);

        this.scene.add(new THREE.AmbientLight(0x222222));




		// create a WebGL renderer, camera
		// and a scene
		this.renderer = new THREE.WebGLRenderer();

		//config shadows
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;





		// start the renderer
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		// attach the render-supplied DOM element
		$container.append(this.renderer.domElement);

		this.$canvas = this.$el.find("canvas");

		projector = new THREE.Projector();

		this.selectionTile = new THREE.Mesh(new THREE.PlaneGeometry( 1, 1), this.materials.selected);
		this.selectionTile.position.set(0,-100,0);
		this.selectionTile.rotation.set(3*Math.PI/2,0,0);
		this.scene.add(this.selectionTile);

		//this.renderer.render(this.scene, this.camera);
		controls.update();

		console.log("init three scene end");
		console.log("-----------------------------------------");
	},

	handleScroll: function(e){
		e.preventDefault();




		if(this.scene){
			this.camera.position.z-=e.originalEvent.wheelDelta/20;
			this.renderer.render(this.scene, this.camera);
		}
		return false;
	},
	handleCanvasClick: function(e){
		e.preventDefault();

		var that = this;

		if(this.isKeyDown(this.keyCode.SHIFT)){

			var vector = new THREE.Vector3( ( e.clientX / this.$canvas.width() ) * 2 - 1, - ( e.clientY / this.$canvas.height() ) * 2 + 1, 0.5 );
			projector.unprojectVector( vector, this.camera );

			var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

			var intersects = raycaster.intersectObjects( this.scene.children, true );
			if ( intersects.length > 0 ) {
				var clickedObject=intersects[0];
				var pos = {x: Math.floor(clickedObject.point.x), y: Math.floor(clickedObject.point.z)};



				console.log(pos);
				this.selectionTile.position.set(pos.x+this.worldScale*.5, .01, pos.y+this.worldScale*.5);

				TFApp.models.gameModel.set("selectedTileCoords", [pos.x, pos.y]);

				this.selectedTile = clickedObject.object;

				this.renderer.render(this.scene, this.camera);
			}
		}

	},
	drawTile: function(pos){
		//confusing, i know...
		var x = Math.floor(pos.x);
		var y = Math.floor(pos.z);

		this.tileMeshes = this.tileMeshes || [];
		this.tileMeshes[x] = this.tileMeshes[x] || [];
		this.scene.remove(this.tileMeshes[x][y]);

		var tileData = TFApp.models.currentWorldModel.tiles[x][y];

		var tile = new THREE.Mesh(
			this.tileGeometry
		);
		tile.receiveShadow = true;	
		tile.doubleSided = false;
		tile.position.set(x*this.worldScale, 0, y*this.worldScale);

		this.tileMeshes[x][y] = tile;


		//set the tile material based on the tile type
		if(tileData.type == "WaterTile")
			tile.material = this.materials.water;
		else
			tile.material = this.materials.grass;


		tile.scale.set(this.worldScale,this.worldScale,this.worldScale);

		//create tree if there are trees
		if(tileData.large_tree_basal_area>0){

			var tree = new THREE.Mesh(
				this.treeGeometry
			);

			tree.material = this.materials.treeLeaves;
			tree.castShadow = true;
			tree.receiveShadow = true;
			tree.scale.set(this.worldScale,this.worldScale,this.worldScale);
			tree.rotation.set(0,Math.random()*(Math.PI/2),0);
			tile.add(tree);
			tree.position.set(this.worldScale*.5,0,this.worldScale*.5);
		}
		else if(tileData.small_tree_basal_area>0){
			var tree = new THREE.Mesh(
				this.treeGeometry
			);

			tree.material = this.materials.treeLeaves;
			tree.castShadow = true;
			tree.receiveShadow = true;
			tree.scale.set(.7*this.worldScale,.7*this.worldScale,.7*this.worldScale);
			tree.rotation.set(0,Math.random()*(Math.PI/2),0);
			tile.add(tree);
			tree.position.set(this.worldScale*.5,0,this.worldScale*.5);
		}


		this.scene.add(tile);

	},
	redrawTile: function(pos){
		this.drawTile(pos);
		this.renderer.render(this.scene, this.camera);
	},

	handleKeyDown: function(e){
		if (e.keyCode == this.keyCode.SHIFT){
			this.keyArray[this.keyCode.SHIFT] = true;
		}

	},
	handleKeyUp: function(e){
		if (e.keyCode == this.keyCode.SHIFT){
			this.keyArray[this.keyCode.SHIFT] = false;
		}
	},
	isKeyDown: function(key){
		return this.keyArray[key];
	}


});