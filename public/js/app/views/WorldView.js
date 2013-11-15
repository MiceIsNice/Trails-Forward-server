var TFApp = window.TFApp || {};

TFApp.WorldView = Backbone.View.extend({

	el: ".world-wrapper",
	scene: {},
	camera: {},
	renderer: {},
	worldScale: 1,
	vertex_shader: "",
	fragment_shader: "",
	shaders:{
		//created in createShaders()
	},
	materials: {
		//created in createMaterials()
	},
	textures: {
	},
	//some geometry 'prefabs'
	treeGeometry: {},
	tileGeometry: {},
	tileSidesGeometry: {},
	houseGeometry: {},
	houseRoofGeometry: {},


	selectedLight: {},
	selectedTile: {},

	tileMeshes: [],

	//inputs state handlers
	keyArray: [],
	mouseArray: [],

	keyCode: { SHIFT: 16 },


	//last tile hovered over, used to avoid unecessary re-renderings
	_lastTileHoveredPos: {},
	
	_objsLoaded: false,


	events:{
		//"mousewheel .three-container": "handleScroll"
		"mousemove .three-container canvas" : "handleCanvasMove",
		"click     .three-container canvas" : "handleCanvasClick",
		"mousedown .three-container canvas" : "handleCanvasMouseDown",
		"mouseup .three-container canvas" 	: "handleCanvasMouseUp"

	},


	initialize: function(){
		var that = this;

		this.initializeThreeScene();

		TFApp.models.currentWorldModel.on("change:tiles", that.drawTiles, this);
		TFApp.models.currentWorldModel.on("change:dirtyTiles", that.redrawDirtyTiles, this);
		TFApp.models.currentWorldModel.on("change:staleTiles", that.fetchStaleTiles, this);

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
		var that = this;


		var that = this;

		var tiles = TFApp.models.currentWorldModel.tiles;
		while(!that._objsLoaded){
			//i'm a bad person - mb
		}
		for(var x=0; x<tiles.length; x++){
			for(var y=0; y<tiles[x].length; y++){
				this.drawTile({x: x, z: y});
			}
		}

		that.renderer.render(that.scene, that.camera);

	},
	redrawDirtyTiles: function(){
		var dirtyTiles = TFApp.models.currentWorldModel.get("dirtyTiles");
		for(var i = 0;i<dirtyTiles.length;i++){
			this.redrawTile(dirtyTiles[i]);
		}


	},
	initializeThreeScene: function(){
		var that = this;


		that.createShaders();
		that.createMaterials();
		that.createGeometries();
		that.loadObjs();


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
		// this.scene.fog = new THREE.Fog( 0x000000, 7, 60 );
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
		directionalLight.shadowCameraVisible = false;
		directionalLight.shadowMapWidth = 4096;
		directionalLight.shadowMapHeight = 4096;
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

		this.highlightTile = new THREE.Mesh(new THREE.PlaneGeometry( 1, 1), this.materials.highlight);
		this.highlightTile.position.set(0,-100,0);
		this.highlightTile.rotation.set(3*Math.PI/2,0,0);
		this.scene.add(this.highlightTile);
		//this.renderer.render(this.scene, this.camera);
		controls.update();

	},

	handleScroll: function(e){
		e.preventDefault();




		if(this.scene){
			this.camera.position.z-=e.originalEvent.wheelDelta/20;
			this.renderer.render(this.scene, this.camera);
		}
		return false;
	},
	handleCanvasMove: function(e){
		e.preventDefault();

		var that = this;

		if(!this.isMouseDown(1) && !this.isMouseDown(2) && !this.isMouseDown(3)){

			var vector = new THREE.Vector3( ( e.clientX / this.$canvas.width() ) * 2 - 1, - ( e.clientY / this.$canvas.height() ) * 2 + 1, 0.5 );
			projector.unprojectVector( vector, this.camera );

			var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

			var intersects = raycaster.intersectObjects( this.scene.children, true );
			if ( intersects.length > 0 ) {
				var clickedObject=intersects[0];
				var pos = {x: Math.floor(clickedObject.point.x), y: Math.floor(clickedObject.point.z)};

				if(that._lastTileHoveredPos.x == pos.x && that._lastTileHoveredPos.y == pos.y){

				}
				else{
					that._lastTileHoveredPos = pos;
					this.highlightTile.position.set(pos.x+this.worldScale*.5, .01, pos.y+this.worldScale*.5);
					this.renderer.render(this.scene, this.camera);	
				}

			}
		}
		//}

	},
	handleCanvasClick: function(e){
		e.preventDefault();

		var that = this;

		//if(this.isKeyDown(this.keyCode.SHIFT)){




		var vector = new THREE.Vector3( ( e.clientX / this.$canvas.width() ) * 2 - 1, - ( e.clientY / this.$canvas.height() ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, this.camera );

		var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( this.scene.children, true );
		if ( intersects.length > 0 ) {
			var clickedObject=intersects[0];
			var pos = {x: Math.floor(clickedObject.point.x), y: Math.floor(clickedObject.point.z)};



			this.selectionTile.position.set(pos.x+this.worldScale*.5, .01, pos.y+this.worldScale*.5);

			TFApp.models.gameModel.set("selectedTileCoords", [pos.x, pos.y]);

			this.selectedTile = clickedObject.object;

			this.renderer.render(this.scene, this.camera);

			if(this.clickAction){
				this.clickAction();
			}
		}





		//}

	},
	drawTile: function(pos){
		var that = this;

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
		tile.castShadow = true;
		tile.doubleSided = false;
		tile.position.set(x*this.worldScale, 0, y*this.worldScale);
		this.tileMeshes[x][y] = tile;


		var tileSides = new THREE.Mesh(
			this.tileSidesGeometry
		);
		tileSides.receiveShadow = true;
		tile.add(tileSides);
		tileSides.position.set(0,0,0);
		//set the tile material based on the tile type
		if(tileData.type == "WaterTile"){
			tile.material = this.materials.water;
			tileSides.material = this.materials.water;
			tile.position.y-=.5*this.worldScale;		
		}
		else{
			tile.material = this.materials.grass;
			tileSides.material = this.materials.grass;

		}


		tile.scale.set(this.worldScale,this.worldScale,this.worldScale);

		//create tree if there are trees
		if(tileData.large_tree_basal_area>50){
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
		else if(tileData.large_tree_basal_area>0){

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
		else if(tileData.small_tree_basal_area>50){
			var tree = new THREE.Mesh(
				this.treeGeometry
			);

			tree.material = this.materials.treeLeaves;
			tree.castShadow = true;
			tree.receiveShadow = true;
			tree.scale.set(.5*this.worldScale,.5*this.worldScale,.5*this.worldScale);
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
			tree.scale.set(.3*this.worldScale,.3*this.worldScale,.3*this.worldScale);
			tree.rotation.set(0,Math.random()*(Math.PI/2),0);
			tile.add(tree);
			tree.position.set(this.worldScale*.5,0,this.worldScale*.5);
		}




		if(tileData.owner == TFApp.models.currentPlayerModel.get("player_id")){
			// var ownershipFlag = new THREE.Mesh(
			// 	this.ownershipFlagGeometry
			// );
			var ownershipFlag = new THREE.Mesh(new THREE.PlaneGeometry( 1, 1), this.materials.ownership);
			ownershipFlag.rotation.set(3*Math.PI/2,0,0);
			ownershipFlag.receiveShadow = true;
			tile.add(ownershipFlag);
			ownershipFlag.position.set(this.worldScale*.5, .005, this.worldScale*.5);

		}

		//console.log(tileData);

		if(tileData.base_cover_type == "developed"){

			var house = new THREE.Mesh(that.houseGeometry, that.materials.houseBody);
			house.scale.set(.2,.2,.2);
			house.castShadow = true;
			house.receiveShadow = true;


			var houseRoof = new THREE.Mesh(that.houseRoofGeometry, that.materials.houseRoof);

			//var house = new THREE.Mesh(that.houseGeometry, that.materials.houseBody);
			houseRoof.castShadow = true;
			houseRoof.receiveShadow = true;

			house.add(houseRoof);


			tile.add(house);
			house.position.set(that.worldScale*.5, 0, this.worldScale*.5);

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
	},
	handleCanvasMouseDown: function(e){
		this.mouseArray[e.which] = true;
	},
	handleCanvasMouseUp: function(e){
		this.mouseArray[e.which] = false;
	},
	isMouseDown: function(mouseButton){
		return this.mouseArray[mouseButton];
	},
	convertWorldPositionToScreenPosition: function(pos){


	},
	createGeometries: function(){


		/*-------------------------------------------------------------
			 _                 
			| |_ _ __ ___  ___ 
			| __| '__/ _ \/ _ \
			| |_| | |  __/  __/
			 \__|_|  \___|\___|

		--------------------------------------------------------------*/
                   

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



		/*-------------------------------------------------------------
			 _   _ _      
			| |_(_) | ___ 
			| __| | |/ _ \
			| |_| | |  __/
			 \__|_|_|\___|
			              
		--------------------------------------------------------------*/


		//TILE GEOMETRY
		this.tileGeometry = new THREE.Geometry();

		//TOP
		this.tileGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		this.tileGeometry.vertices.push(new THREE.Vector3(0, 0, 1));
		this.tileGeometry.vertices.push(new THREE.Vector3(1, 0, 1));
		this.tileGeometry.vertices.push(new THREE.Vector3(1, 0, 0));


		this.tileGeometry.faces.push(new THREE.Face3(0,1,2, new THREE.Vector3(0,1,0)));
		this.tileGeometry.faces.push(new THREE.Face3(2,3,0, new THREE.Vector3(0,1,0)));


		//FRONT
		this.tileSidesGeometry = new THREE.Geometry();

		this.tileSidesGeometry.vertices.push(new THREE.Vector3(0, -1, 0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3(0, 0,  0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3(1, 0,  0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3(1, -1, 0));

		this.tileSidesGeometry.faces.push(new THREE.Face3(0,1,2, new THREE.Vector3(0,1,0)));
		this.tileSidesGeometry.faces.push(new THREE.Face3(2,3,0, new THREE.Vector3(0,1,0)));

		//LEFT
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0, -1, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0,  0, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0,  0, 0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0, -1, 0));

		this.tileSidesGeometry.faces.push(new THREE.Face3(4,5,6,  new THREE.Vector3(0,1,0)));
		this.tileSidesGeometry.faces.push(new THREE.Face3(6,7,4, new THREE.Vector3(0,1,0)));




		//RIGHT
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1, -1, 0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1,  0, 0));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1,  0, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1, -1, 1));

		this.tileSidesGeometry.faces.push(new THREE.Face3(8,9,10,  new THREE.Vector3(0,1,0)));
		this.tileSidesGeometry.faces.push(new THREE.Face3(10,11,8, new THREE.Vector3(0,1,0)));

		//BACK
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1, -1, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 1,  0, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0,  0, 1));
		this.tileSidesGeometry.vertices.push(new THREE.Vector3( 0, -1, 1));

		this.tileSidesGeometry.faces.push(new THREE.Face3(12,13,14,  new THREE.Vector3(0,1,0)));
		this.tileSidesGeometry.faces.push(new THREE.Face3(14,15,12,  new THREE.Vector3(0,1,0)));



		//tileSidesGeometry.computeBoundingSphere();
		this.tileSidesGeometry.computeFaceNormals();
		this.tileSidesGeometry.buffersNeedUpdate = true;
		this.tileSidesGeometry.uvsNeedUpdate = true;



		/*-------------------------------------------------------------
			 _                          
			| |__   ___  _   _ ___  ___ 
			| '_ \ / _ \| | | / __|/ _ \
			| | | | (_) | |_| \__ \  __/
			|_| |_|\___/ \__,_|___/\___|

		--------------------------------------------------------------*/
		this.houseGeometry = new THREE.Geometry();

		// //TOP
		// this.houseGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		// this.houseGeometry.vertices.push(new THREE.Vector3(0, 0, 1));
		// this.houseGeometry.vertices.push(new THREE.Vector3(1, 0, 1));
		// this.houseGeometry.vertices.push(new THREE.Vector3(1, 0, 0));

		// this.houseGeometry.faces.push(new THREE.Face3(0,1,2, new THREE.Vector3(0,1,0)));
		// this.houseGeometry.faces.push(new THREE.Face3(2,3,0, new THREE.Vector3(0,1,0)));

		// this.houseGeometry.computeFaceNormals();
		// this.houseGeometry.buffersNeedUpdate = true;
		// this.houseGeometry.uvsNeedUpdate = true;




	},
	createMaterials: function(){

		this.materials.grass = new THREE.MeshLambertMaterial({color: 0x116611, shading: THREE.FlatShading, vertexColors: THREE.VertexColors}),
		this.materials.water = new THREE.MeshPhongMaterial({color: 0x111166}),
		this.materials.selected = new THREE.MeshLambertMaterial({color: 0xFFFFFF, transparent: true, opacity: 0.5}),
		

		this.materials.highlight = new THREE.ShaderMaterial({
			attributes: {},
			uniforms:{
				color: { type: "c", value: new THREE.Color( 0xFFFFFF) },
				texture: { type: "t", value: THREE.ImageUtils.loadTexture('img/common/transparent_16.png') }
			},
			vertexShader: this.vertex_shader,
			fragmentShader: this.fragment_shader,
			transparent: true,
			opacity: .3
		}),


		this.materials.houseBody = new THREE.MeshLambertMaterial({color: 0xFFFFFF}),
		this.materials.houseRoof = new THREE.MeshLambertMaterial({color: 0x36260b}),

		this.materials.treeLeaves = new THREE.MeshLambertMaterial({color: 0x003300}),
		this.materials.ownership = new THREE.MeshLambertMaterial({color:0xFFFFFF, transparent: true, opacity: 0.3})
		
		this.materials.grass.vertexColors = true;
		this.materials.water.vertexColors = true;
		this.materials.selected.vertexColors = true;
	},
	createShaders: function(){
		this.vertex_shader = "varying vec2 vUv; void main() {vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }";
		this.fragment_shader = "uniform vec3 color;uniform sampler2D texture;varying vec2 vUv;void main() {vec4 tColor = texture2D( texture, vUv );gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 0.5 );}";
	},
	loadObjs: function(){
		var that = this;
		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

		//HOUSE
		var loader = new THREE.OBJLoader( manager );
		loader.load("/media/models/buildings/simple_house.obj", function(object){
			console.log(object);

			that.houseGeometry = object.children[1].geometry;
			that.houseGeometry.computeFaceNormals();
			that.houseGeometry.buffersNeedUpdate = true;
			that.houseGeometry.uvsNeedUpdate = true;

			that.houseRoofGeometry = object.children[0].geometry;
			that.houseRoofGeometry.computeFaceNormals();
			that.houseRoofGeometry.buffersNeedUpdate = true;
			that.houseRoofGeometry.uvsNeedUpdate = true;

			that._objsLoaded = true;
		});



	}


});