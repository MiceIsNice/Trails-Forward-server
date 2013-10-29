var TFApp = window.TFApp || {};
ig.module(
    	'game.main'
    )
    .requires(
    	'impact.game',
        'impact.debug.debug', //TODO: Remove for release
    	'impact.font',
    	'impact.image',
        'impact.input',
        'impact.entity',
        'game.assetmanager',
        'game.cachedisomap',
        'game.isominimap',
        'game.ui',
        'game.button',
        'game.scrollfield'
    )
    .defines(function(){

        /*
        main.js
        This is the main file that operates the Impact client for Trails Forward. It's admittedly not the greatest
        design decision that this class is so gigantic, but Javascript isn't inherently structured with classes, so
        there were some situations where code was placed into this class rather than placing it into its own class
        simply to speed up the coding process over the summer and produce a working prototype of various features.

        The comments should aid in understanding this class, as they're used to delimit sections of code as well as
        explain them. In general, this class handles input handling, the visual design and top-level logic of the UI,
        and the base game logic/draw loops.

        Nick Benson
        8/26/2013
         */

        TFApp.game = ig.Game.extend({

            // Load some fonts - ig.Font is all proprietary Impact code
            font: new ig.Font("media/timeless_white_16.font.png"),
            disableFont: new ig.Font("media/timeless_gray_16.font.png"),
            detailFont: new ig.Font("media/timeless_white_12.font.png"),

            // This sets up the basic logic for the UI, and the fact that it's called here means that it is done
            // during the loading screen
            ui: new UI(),

            // The AssetManager will load all of its assets as soon as it is constructed; again, during the loading
            // screen because it's called here
            assetManager: new AssetManager(),

            // Declare some variables
            // Strictly speaking a lot of these don't NEED to be declared ahead of time, but this is a nice place for
            // some initialization of values
            oldMouseX:0,
            oldMouseY:0,
            zoomMul:0.4,
            maxZoom:1,
            minZoom:0.04,
            zoomPanOffsetX:0, // enables centered zooming
            zoomPanOffsetY:0, // " "
            currentSurveyResults:"Loading survey data, one moment...",
            tilesSurveyed: [],
            viewOwnedTiles: true,

            // Variables to aid in loading things in the correct order
            loadState:0,
            acceptingLoad:false,
            retryMapLoad:false,

            // Forest tileTypes
            tileTypes:[
                "_0",
                "_A",
                "_C",
                "_E",
                "_G",

                "_AC",
                "_AE",
                "_AG",
                "_CE",
                "_CG",
                "_EG",

                "_ABC",
                "_AGH",
                "_CDE",
                "_EFG",

                "_ACE",
                "_AEG",
                "_ACG",
                "_CEG",

                "_ABCE",
                "_ACEG",
                "_ACGH",
                "_AEFG",
                "_CDEG",

                "_ABCG",
                "_ACDE",
                "_AEGH",
                "_CEFG",

                "_ABCDE",
                "_ABCGH",
                "_AEFGH",
                "_CDEFG",

                "_ABCEG",
                "_ACDEG",
                "_ACEFG",
                "_ACEGH",

                "_ABCDEG",
                "_ABCEGH",
                "_ACDEFG",
                "_ACEFGH",

                "_ABCEFG",
                "_ACDEGH",

                "_ABCDEFG",
                "_ABCDEGH",
                "_ABCEFGH",
                "_ACDEFGH",

                "_ABCDEFGH"
            ],

            init: function() {
                // This injection is a part of the modified scaling implementation of Trails Forward's Impact framework
                // Specifically, I modified the Impact engine slightly by making it use the Canvas API's default scaling
                // algorithm - bilinear - as opposed to Impact's nearest neighbor scaling. Impact was designed with
                // pixelated games in mind, thus the use of nearest neighbor scaling - our game would look crappy if we
                // used it.
                ig.System.inject({
                    imageZoom:this.zoomMul
                });

                // Key bindings
                ig.input.bind(ig.KEY.MOUSE1, 'click');
                ig.input.bind(ig.KEY.MOUSE2, 'rclick');
                ig.input.bind(ig.KEY.MWHEEL_DOWN, 'zoomBlipOut');
                ig.input.bind(ig.KEY.MWHEEL_UP, 'zoomBlipIn');

                // Otherwise known as "that = this", used identically
                var self = this;


                // End of UI instantiation
            },

            //END INIT

            // There are two maps; The terrainmap is just water or land tiles. The feature map has forests,
            // coastlines, and anything else static that sits on the map (like buildings, once they're implemented.)
            // These maps are the most intensive objects in the game, because they handle all of the caching and drawing,
            // which is the most intensive task for TF right now.
            constructMap: function() {
                this.terrainMap = new CachedIsoMap(128, this.assetManager);
                this.featureMap = new CachedIsoMap(128, this.assetManager);

                // After constructing the maps, nothing happens immediately because they have no data.
                // But in this method the act of logging in will trigger a chain of functions that eventually will
                // populate the data in the maps.

                TFglobals.DATA_CONTROLLER.getUserPlayers();

                //TFglobals.DATA_CONTROLLER.logInWithCookies();
                //TFglobals.DATA_CONTROLLER.logInUserWithEmailAndPassword("aaron.tietz@tufts.edu", "letmein");
            },

            // The Impact/Data Controller paradigm involves asking the Data Controller for things from Impact, and
            // one the Data Controller has finished getting whatever data was asked it will call callback functions in
            // Impact. Sometimes the Data Controller will call callback functions without being asked, such as if the
            // server tells the Data Controller something has changed due to actions other than this client's.
            // The callbacks are all "onX", while the functions that expect a callback are generally the "X".
            onGetUserPlayers: function(players) {
                //ig.log("Got user players.");
                TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId(players[0].id);
            },

            onLogin: function() {
                //ig.log("Logged in.");
            },

            onGetWorldData: function() {
                //ig.log("Got world data.");
				var rect = {x_min : 0, x_max : 64, y_min : 0, y_max : 64};
				TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
                TFglobals.DATA_CONTROLLER.getAvailableContractsForPlayer();
                TFglobals.DATA_CONTROLLER.getAvailableUpgradesForPlayer();
                TFglobals.DATA_CONTROLLER.getPlayerStats();
                TFglobals.DATA_CONTROLLER.getPlayersOwnedEquipment();
            },

            onGetPlayerStats: function(theResponse) {
                //console.log("Impact onGetPlayerStats got: ", theResponse);
                if(this.serverResponseWasPositive(theResponse)){
                    // console.log("onGetPlayerStats received balance: " + theResponse.balance
                    //     + ", turn points: " + theResponse.turn_points
                    //     + ", political capital: " + theResponse.political_capital);
                    this.money = theResponse.balance;
                    this.turnPoints = theResponse.turn_points;
                    this.politicalCapital = theResponse.political_capital;
                }
                else{
                    this.showNotificationWindow(function() {
                        return "Uh oh! Something went wrong. Couldn't get player stats." } );
                    // console.log("onGetPlayerStats failure!");
                    // console.log(theResponse);
                }
            },

            /**
             * This is the function from which data is loaded into the map, because the "chunk" contains all of the
             * data to load. It's all json from the server, so an understanding of how data is stored in the server
             * will help explain some of the logic here. There are some base_cover_types that aren't handled yet.
             * @param chunk
             */
            onGetMapChunk: function(chunk) {
                var self = this;
                //ig.log("Got map chunk.");
                var i, j, k, tile, shoreTypes, ownershipTypes, tileFeature, landType;
                //ig.log(chunk);
                // Interpret chunk data
                for (i = 0; i < chunk.length; i++) {
                    //ig.log("Reading index " + i + " of chunk");
                    tile = chunk[i].table;
                    if (tile) {
                        tileFeature = landType = undefined;
                        //ig.log("Found a tile that isn't null: " + tile.x + ", " + tile.y);
                        switch(tile.base_cover_type) {
                            case "forest":
                                if (tile.large_tree_basal_area == 0) {
                                    tileFeature = "forest_tileset_light";
                                }
                                else {
                                    tileFeature =
                                        "forest_tileset_heavy_" + Math.floor((Math.random() * 3) + 1);
                                }
                                break;
                            case "cultivated_crops":
                                break;
                            case "herbaceous":
                                break;
                            case "developed":
                                break;
                            default:
                                break;
                        }
                        switch (tile.type) {
                            case "LandTile":
                                landType = "grass";
                                break;
                            default:
                                landType = "water";
                        }
                        this.terrainMap.addTile(tile.x, tile.y, landType);
                        if (tileFeature) {
                            this.featureMap.addTile(tile.x, tile.y, tileFeature);
                        }
                        //ig.log("Added tile at " + tile.x + ", " + tile.y);
                    }
                }
                // Manage shorelines
                // getShoreTypes is a function that returns a list of which shorelines apply for a particular tile.
                // Shorelines draw right on top of normal water tiles; this was the solution that required the least
                // amount of work and headaches.
                for (i = 0; i < this.terrainMap.data.length; i++) {
                    if (this.terrainMap.data[i]) {
                        for (j = 0; j < this.terrainMap.data[i].length; j++) {
                            shoreTypes = this.getShoreTypes(i, j);
                            if (shoreTypes) {
                                for (k = 0; k < shoreTypes.length; k++) {
                                    this.terrainMap.addTile(i, j, "shoreline_" + shoreTypes[k]);
                                }
                            }
                        }
                    }
                }
                // Get ownership data if any
                TFglobals.DATA_CONTROLLER.getPlayersOwnedResourceTiles();
                // Get OTHER ownership data if any
                TFglobals.DATA_CONTROLLER.getResourceTilesOwnedByOthers();
                //ig.log("Done getting map chunk");
                this.gotMapChunk = true;
            },

            /**
             * This function updates the list of tiles that are owned by the player. It's called by the Data Controller.
             * @param theResponse
             */
            onGetPlayersOwnedResourceTiles : function(theResponse){
                var tile, i;
                if(this.serverResponseWasPositive(theResponse)){
                	if(theResponse.resource_tiles){
						//console.log("onGetPlayersOwnedResourceTiles received " + theResponse.resource_tiles.length + " tiles: ");
						theResponse.resource_tiles.reduce(
							function(previousValue, currentValue, index, array) {
								//console.log("",currentValue);
							}
						);
						for (i = 0; i < theResponse.resource_tiles.length; i++) {
							tile = theResponse.resource_tiles[i];
							this.ownedTiles = this.ownedTiles || [];
							this.ownedTiles[tile.x] = this.ownedTiles[tile.x] || [];
							this.ownedTiles[tile.x][tile.y] = true;
						}
                    }
                    else console.log("no resource tiles given to onGetPlayersOwnedResourceTiles");
                }
                else {
                    console.log("onGetPlayersOwnedResourceTiles failure with message: " + theResponse.errors.join(", "));
                }
            },

            /**
             * By contrast, this function updates the list of tiles owned by players who are not this player.
             * @param theResponse
             */
            onGetResourceTilesOwnedByOthers : function(theResponse){
                var tile, i;
                if(this.serverResponseWasPositive(theResponse)){
                    //console.log("onGetResourceTilesOwnedByOthers received " + theResponse.resource_tiles.length + " tiles: ");
                    for(i = 0; i < theResponse.resource_tiles.length; i++){
                        //console.log("", theResponse.resource_tiles[i]);
                    }
                    for (i = 0; i < theResponse.resource_tiles.length; i++) {
                        tile = theResponse.resource_tiles[i];
                        this.otherOwnedTiles = this.otherOwnedTiles || [];
                        this.otherOwnedTiles[tile.x] = this.otherOwnedTiles[tile.x] || [];
                        this.otherOwnedTiles[tile.x][tile.y] = true;
                    }
                }
                else{
                    console.log("onGetResourceTilesOwnedByOthers failure with message: " + theResponse.errors.join(", "));
                }
            },

            /**
             * Call this method on any tiles that have changed to have the map update them.
             * Invalidating a tile on a cachedisomap clears the cached section in its entirety and redraws every
             * resolution (in order) as quickly as possible if necessary (e.g. if the player is currently looking
             * at that section of the map). Visually, it looks like the map goes blurry for a second and gradually
             * improves in resolution as the sections are finished being drawn.
             */
            onInvalidateTile: function(x, y) {
                if (this.featureMap) {
                    this.featureMap.invalidateTile(x, y);
                }
                if (this.terrainMap) {
                    this.terrainMap.invalidateTile(x, y);
                }
            },

            // Called many times per second
            update: function() {
                var self = this;

                // Update all entities and backgroundMaps
                this.parent();

                // initialize the Impact module reference in TFglobals, the thing that allows Impact and the
                // Data Controller to talk to one another.
                if (!TFglobals.IMPACT) {
                    TFglobals.IMPACT = this;
                    //ig.log("Constructing map");
                    this.constructMap();
                    //ig.log("Finished calling construct map");
                }

                // Convenience.
                var mouseX = ig.input.mouse.x;
                var mouseY = ig.input.mouse.y;

                // Input handling
                if (ig.input.pressed('click') && !this.ui.overlaps(mouseX, mouseY)) {
                    this.panning = true;
                    this.origClickMouseX = mouseX;
                    this.origClickMouseY = mouseY;
                }
                else if (this.panning && ig.input.state('click')) { // panning
                    this.screen.x += (this.oldMouseX - mouseX) / ig.system.imageZoom;
                    this.screen.y += (this.oldMouseY - mouseY) / ig.system.imageZoom;
                }
                else if (this.panning && !ig.input.state('click')) { // stopping panning, selecting
                    this.panning = false;
                    if (this.origClickMouseX == mouseX && this.origClickMouseY == mouseY) { // SELECTION!
                        var viewRect = this.getViewRect();
                        var tileToSelect = this.terrainMap.getTileAtPx(
                            viewRect.x + mouseX / ig.system.imageZoom,
                            viewRect.y + mouseY / ig.system.imageZoom,
                            true);
                        this.selectTile(tileToSelect.isoX, tileToSelect.isoY);
                    }
                }
                else if (ig.input.state('rclick')) { // Zooming with right click
                    this.zoomMul += (this.oldMouseY - mouseY) / 300.0;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }
                else if (ig.input.state('zoomBlipOut')) { // Scroll wheel zooming out
                    this.zoomMul -= 0.03;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }
                else if (ig.input.state('zoomBlipIn')) { // Scroll wheel zooming in
                    this.zoomMul += 0.03;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }

                // These offsets keep the "camera" centered on the center point on the screen while zooming
                this.zoomPanOffsetX = ((ig.system.width / 2) / this.zoomMul) - (ig.system.width / 2);
                this.zoomPanOffsetY = ((ig.system.height / 2) / this.zoomMul) - (ig.system.height / 2);

                this.oldMouseX = mouseX;
                this.oldMouseY = mouseY;

                // Loading, updating the map and anything else that needs updating
                if (!this.assetManager.loaded() && !this.assetsLoadingText) {
                    //ig.log("Loading assets...");
                    this.assetsLoadingText = true;
                }
                else {
                    if (!this.assetsLoadedText) {
                        //ig.log("All assets loaded, ready to generate the map cache. Will generate once map chunk is gotten.");
                        this.mapUpdate = true;
                        this.assetsLoadedText = true;
                    }
                    if (this.terrainMap && this.gotMapChunk) {
                        if (this.mapUpdate) {
                            this.featureMap.update();
                            this.terrainMap.update();
                            if (!this.minimap) {
                             //ig.log("Loading minimap");
                             this.minimap = new IsoMinimap(new Rect(0,
                                 0,
                                 ig.system.width / 4,
                                 ig.system.width / 4 / 1.7777777777
                             ));
                             this.minimap.addReferenceMap(this.terrainMap);
                             this.minimap.load();
                             this.terrainMap.mapChangeCallback = function() {
                                 self.minimap.load();
                             };
                             //ig.log("Minimap loaded");
                             this.minimapBox.addChild(this.minimap);
                             }
                        }
                    }

                }

                // Finally, update the UI
                this.ui.update();
            },

            draw: function() {
                var ctx, scale, realX, realY, x, y, tile, i, j;

               //if (ig.input.pressed("click")) {
               //    this.shouldTime = true;
               //    time.start("draw");
               //}

                // The parent function draws all Entities and backgroundMaps
                // However, we don't use any of them because we couldn't use the Entity System built into Impact for
                // drawing the map. Strictly speaking, CachedIsoMaps could be entities, but being an entity simply
                // wasn't very valuable. When the game ultimately needs dynamic entities moving around on the screen,
                // we'll want to do something like have them tell the map to redraw everything "beneath" them on the
                // screen (or just things immediately "beneath" them) so that draw ordering makes sense.
                this.parent();

                // Draw the terrain map
                if (this.terrainMap) {

                    ctx = ig.system.context;
                    ctx.save();
                    scale = ig.system.imageZoom;
                    ctx.scale(scale, scale);
                    ctx.translate(-ig.game.screen.x + this.zoomPanOffsetX, -ig.game.screen.y + this.zoomPanOffsetY);

                    this.terrainMap.draw();

                    // Viewing tiles this player owns
                    if (this.ownedTiles && this.viewOwnedTiles) {
                        for (i = 0; i < this.ownedTiles.length; i++) {
                            if (this.ownedTiles[i]) {
                                for (j = 0; j < this.ownedTiles[i].length; j++) {
                                    tile = this.ownedTiles[i][j];
                                    if (tile) {
                                        realX = (i - j) * this.terrainMap.tilesize;
                                        realY = (i + j) / 2 * this.terrainMap.tilesize;
                                        ctx.drawImage(this.assetManager.images["ownership_solid"],
                                            realX,
                                            realY);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Viewing tiles other players own
                    if (this.otherOwnedTiles && this.viewOwnedTiles) {
                        for (i = 0; i < this.otherOwnedTiles.length; i++) {
                            if (this.otherOwnedTiles[i]) {
                                for (j = 0; j < this.otherOwnedTiles[i].length; j++) {
                                    tile = this.otherOwnedTiles[i][j];
                                    if (tile) {
                                        realX = (i - j) * this.terrainMap.tilesize;
                                        realY = (i + j) / 2 * this.terrainMap.tilesize;
                                        ctx.drawImage(this.assetManager.images["ownershipOther_solid"],
                                            realX,
                                            realY);
                                    }
                                }
                            }
                        }
                    }

                    // Viewing the currently selected tile
                    // TODO: Display the currently selected megatile as well
                    if (this.selectedTile) {
                        x = this.selectedTile[0];
                        y = this.selectedTile[1];
                        realX = (x - y) * this.terrainMap.tilesize;
                        realY = (x + y) / 2 * this.terrainMap.tilesize;
                        var highlight = this.assetManager.images["selection_highlight"];
                        if (highlight) {
                            ctx.drawImage(this.assetManager.images["selection_highlight"],
                                realX,
                                realY);
                        }
                    }

                    ctx.restore();
                }

                // This was code I used to help diagnose speed issues. It helped show me which parts of drawing took
                // the most time; unsurprisingly, the actual draw calls to the Canvas API take the most time.
                // There's a sweet spot between number-of-calls and amount-of-pixels-drawn-per-call.
                //if (this.shouldTime) {
                //    time.stop("draw");
                //    time.report();
                //    this.shouldTime = null;
                //}


                if (this.featureMap) {
                    ctx.save();
                    ctx.scale(scale, scale);
                    ctx.translate(-ig.game.screen.x + this.zoomPanOffsetX, -ig.game.screen.y + this.zoomPanOffsetY);

                    this.featureMap.draw();

                    ctx.restore();
                }

                // Finally, draw everything registered with the UI
                this.ui.draw();

                // This was used as a part of debugging the cachedisomap class. Prints debug information pertaining to
                // what the cachedisomap is doing at any given time - which resolution(s) it's trying to render or
                // display on the screen
                //if (this.terrainMap) {
                //    if (this.terrainMap.status) {
                //        this.font.draw("Current zoom level: " + ig.system.imageZoom
                //            + "\nCurrent terrainMap status: " + this.terrainMap.status
                //            + "\nCurrent featureMap status: " + this.featureMap.status
                //            + "\nHighest resolution on screen: " + this.terrainMap.highestResolutionOnScreen, 0, 0);
                //    }
                //}
            },

            // ******************* TILE SELECTION **********************

            /**
             * Selects the tile at the specified location. Selection has a little highlight effect. This also enables
             * actions requiring the context of a selected tile.
             * @param x
             * @param y
             */
            selectTile: function(x, y) {
                var tile = this.terrainMap.getTile(x, y);
                if (!tile || tile.length == 0) {
                    this.unselectTile();
                }
                else {
                    this.selectedTile = [x, y];
                    TFApp.models.gameModel.set("selectedTileCoords", this.selectedTile);
                }
            },

            unselectTile: function() {
                if (this.selectedTile) {
                    this.selectedTile = null;
                }
            },

            // ******************* BUYING TILES **********************

            /**
             * This is the function to call when the player first indicates they want to purchase a tile. It will open
             * up a confirmation window, and then initiate the request to the server (and wait for the relevant
             * callback).
             * @param x
             * @param y
             */
            buyTile: function(x, y) {
                this.showConfirmWindow(
                    function() { return "Are you sure you want to buy this tile?"; },
                    this.onConfirmBuyTile,
                    {x:x, y:y, that:this});
            },

            /**
             * Called when the player has confirmed they want to purchase the tile at the specified location.
             * Primarily, this function calls the Data Controller's request to the server to purchase the megatile.
             * @param args A list containing [x, y]
             */
            onConfirmBuyTile: function(args) {
                //ig.log("Attempted to purchase tile at " + args.x + ", " + args.y);
                TFglobals.DATA_CONTROLLER.attemptToPurchaseMegatileIncludingResourceTileXY(
                    args.x, args.y);
            },

            onAttemptToPurchaseMegatileIncludingResourceTileXY: function(theResponse){
                var i, j;
                if(this.serverResponseWasPositive(theResponse)){
                    // console.log("onAttemptToPurchaseMegatileIncludingResourceTileXY successfully purchased resource " +
                    //     "tile with origin x, y: " + theResponse.megatile_upper_left_xy.x
                    //     + ", " + theResponse.megatile_upper_left_xy.y);
                }
                else{
                    this.showNotificationWindow(
                        function() {
                            return "Unable to purchase tile. Someone may already\nown this tile, or there may " +
                                "have been a server error: " + theResponse.errors.join(", ");
                        }
                    );
                }
            },

            // ******************* BASIC DIALOG POP-UPS **********************

            /**
             * Displays a confirmation window with customizable displayed text and an arbitrary confirmation action.
             * @param textFunction A function that returns the text to display.
             * @param onConfirm The function to call if the user clicks "Yes" in the window. "No" closes the window.
             * @param confirmArgs The argument to give to the onConfirm function call on confirmation.
             */
            showConfirmWindow: function(textFunction, onConfirm, confirmArgs) {
                var self = this;

                // Making sure the confirm window exists
                if (!this.confirmWindow) {
                    this.confirmWindow = new UIElement(new Rect(
                        ig.system.width / 2 - 200,
                        ig.system.height / 2 - 100,
                        400,
                        200
                    ));
                    this.confirmWindow.setImage("uibox");
                    this.confirmWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.confirmWindow);
                }
                this.confirmWindow.hide = false;

                // Text in the confirm window
                if (!this.confirmText) {
                    this.confirmText = new UIElement(new Rect(200, 50, 1, 1));
                    this.confirmWindow.addChild(this.confirmText);
                }
                this.confirmText.enableText(textFunction, this.font, ig.Font.ALIGN.CENTER);

                // Yes button
                if (!this.confirmYes) {
                    this.confirmYes = new Button(new Rect(10, 140, 70, 40),
                        "button",
                        "button_hover",
                        "button_click",
                        function(confirmArgs) {
                            onConfirm(confirmArgs);
                            self.confirmWindow.hide = true;
                        },
                        confirmArgs,
                        [3, 75, 4, 33]
                    );
                    this.confirmWindow.addChild(this.confirmYes);
                    var yesText = new UIElement(new Rect(36, 12, 1, 1));
                    yesText.enableText(function() { return "Yes"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.confirmYes.addChild(yesText);
                }
                this.confirmYes.setFunction(
                    function(confirmArgs) {
                        onConfirm(confirmArgs);
                        self.confirmWindow.hide = true;
                    },
                    confirmArgs
                );

                // No button
                if (!this.confirmNo) {
                    this.confirmNo = new Button(
                        new Rect(310, 140, 70, 40),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.confirmWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.confirmWindow.addChild(this.confirmNo);
                    var noText = new UIElement(new Rect(36, 12, 1, 1));
                    noText.enableText(function() { return "No"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.confirmNo.addChild(noText);
                }
            },

            /**
             * Displays a notification window with a message and an 'Okay' button that closes the window.
             * @param textFunction
             */
            showNotificationWindow: function(textFunction) {
                var self = this;

                // Making sure the notification window exists
                if (!this.notificationWindow) {
                    this.notificationWindow = new UIElement(new Rect(
                        ig.system.width / 2 - 200,
                        ig.system.height / 2 - 100,
                        400,
                        200
                    ));
                    this.notificationWindow.setImage("uibox");
                    this.notificationWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.notificationWindow);
                }
                this.notificationWindow.hide = false;

                // Text in the notification window
                if (!this.notificationText) {
                    this.notificationText = new UIElement(new Rect(
                        200, 50, this.notificationWindow.getInnerWidth(), 1));
                    this.notificationWindow.addChild(this.notificationText);
                }
                this.notificationText.enableText(textFunction, this.font, ig.Font.ALIGN.CENTER);

                // Okay button
                if (!this.notificationOkay) {
                    this.notificationOkay = new Button(new Rect(165, 140, 70, 40),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.notificationWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.notificationWindow.addChild(this.notificationOkay);
                    var yesText = new UIElement(new Rect(36, 12, 1, 1));
                    yesText.enableText(function() { return "Okay"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.notificationOkay.addChild(yesText);
                }
            },

            // ******************* CONTRACTS **********************

            /**
             * Displays the window for contracts.
             */
            showContractsWindow: function() {
                var self = this;
                // Making sure the confirm window exists
                // TODO: Rewrite this function slightly so that the window is renewed/refreshed whenever it is opened
                if (!this.contractsWindow) {
                    this.contractsWindow = new UIElement(new Rect(
                        ig.system.width / 2 - 250,
                        ig.system.height / 2 - 150,
                        500,
                        300
                    ));
                    this.contractsWindow.setImage("uibox");
                    this.contractsWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.contractsWindow);
                }
                this.contractsWindow.hide = false;

                // A contract
                // Kept as a reference; multiple contracts are made in a for loop down below
                //if (!this.contract) {
                //    this.contract = new Button(new Rect(10, 140, 70, 40),
                //        "button",
                //        "button_hover",
                //        "button_click",
                //        function() {
                //            self.contractsWindow.hide = true;
                //        },
                //        undefined,
                //        [3, 75, 4, 33]
                //    );
                //    this.contractsWindow.addChild(this.contract);
                //}

                // A scroll field
                if (!this.contractScrollField) {
                    this.contractScrollField = new ScrollField(
                        new Rect(
                            10, 30, this.contractsWindow.bounds.width - 20, this.contractsWindow.bounds.height - 40
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        [3, 75, 4, 33],
                        "uibox",
                        [5, 11, 6, 11],
                        undefined,
                        undefined,
                        this.ui
                    );
                    this.contractsWindow.addChild(this.contractScrollField);
                    this.contractScrollField.horizontalScrollBar.hide = true;
                }

                // A button with an 'X' in the upper right corner that closes the window
                if (!this.contractsWindowClose) {
                    this.contractsWindowClose = new Button(
                        new Rect(
                            this.contractsWindow.bounds.width - 30, 0, 20, 20
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.contractsWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.contractsWindow.addChild(this.contractsWindowClose);
                    var contractsWindowCloseText = new UIElement(new Rect(12, 1, 1, 1));
                    contractsWindowCloseText.enableText(function() { return "x"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.contractsWindowClose.addChild(contractsWindowCloseText);
                }

                // Generating all of the contracts
                // TODO: This doesn't refresh when there's a change in this.contracts, but it should!
                var i = 0, contractHeight = 190, contractWidth = 142, contractSpacing = 5, contract;
                // a contract
                if (!this.contracts) {
                    this.contracts = [];
                    for (i = 0; i < this.availableContracts.length; i++) {
                        // Make the contract
                        contract = new Button(
                            new Rect(
                                contractSpacing + (i % 3) * contractWidth + (i % 3) * contractSpacing,
                                contractSpacing + ((i / 3) | 0) * contractHeight + ((i / 3) | 0) * contractSpacing,
                                contractWidth,
                                contractHeight
                            ),
                            "button",
                            "button_hover",
                            "button_click",
                            function() {

                            },
                            undefined,
                            [3, 75, 4, 33]
                        );

                        // Get the information for the tooltip
                        this.contractTooltipSource = this.availableContracts[i];
                        contract.contractInfo = this.availableContracts[i];

                        // Generate the tooltip when there's a "long hover" event triggered on the contract
                        contract.onLongHover = function() {
                            self.generateContractTooltip(this.contractInfo);
                        };
                        contract.onUnLongHover = function() {
                            self.removeContractTooltip();
                        };

                        // Assign the function to call when the contract is clicked
                        contract.funcToCall = function() {
                            var thisContract = this;
                            self.showConfirmWindow(function() {
                                    return "Are you sure you want to take on\nthe "
                                        + thisContract.contractInfo.codename + " contract?";
                                },
                                self.onConfirmTakeContract,
                                thisContract.contractInfo);
                            self.removeContractTooltip();
                        };

                        // Add the contract to the contentPanel of the scroll field UIElement.
                        // TODO: Fix a problem where the contentPanel isn't clipping its contents properly
                        // ^^ I think it's because the canvas clipped area isn't reset in the middle of drawing;
                        // ^^ the clipping area for the entire window is used rather than the contentPanel
                        this.contractScrollField.contentPanel.addChild(contract);

                        // Generate the contract image, and assign the hoverPassThrough attribute to true so that
                        // long hovers can trigger on the contract beneath the image even when the mouse is hovering
                        // over the image (normally hover events don't cascade down the UI chain).
                        var contractImage = new UIElement(new Rect(4, 6, 128, 128));
                        contractImage.hoverPassThrough = true;

                        // This logic will eventually need to move elsewhere when there start being large amounts of
                        // different contracts
                        if (this.contractTooltipSource.name === "Lumberjack Easy Park") {
                            contractImage.setImage("park_contract_picture");
                        }
                        else if (this.contractTooltipSource.codename === "Saw Timber Wanted") {
                            contractImage.setImage("mill_contract_picture");
                        }
                        else {
                            contractImage.setImage("contract_picture");
                        }

                        // Finally, add the image to the contract
                        contract.addChild(contractImage);

                        // Finally finally, add the text of the contract and push the finished contract
                        var contractText = new UIElement(new Rect(contractWidth / 2, 144, contractWidth - 10, 0));
                        this.specificContract = this.availableContracts[i];
                        console.log(this.specificContract);
                        contractText.text = this.specificContract.codename;
                        contractText.enableText(function() {
                                return this.text;
                            },
                            this.font, ig.Font.ALIGN.CENTER);
                        contract.addChild(contractText);
                        this.contracts.push(contract);
                    }
                }
            },

            onGetAvailableContracts: function(contracts) {
                console.log("Got contracts.");
                this.availableContracts = contracts.lumberjack_contracts;
            },

            generateContractTooltip: function(contractInfo) {
                // Generate a tooltip Panel UIElement offset from the mouse
                if (!this.tooltip) {
                    this.tooltip = new Panel(new Rect(
                        ig.input.mouse.x + 10,
                        ig.input.mouse.y + 10,
                        400,
                        200
                    ));
                    this.tooltip.setImage("uibox");
                    this.tooltip.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.tooltip);
                }
                this.tooltip.hide = false;
                var text = "";

                // TODO: Make tooltips only display useful/formatted information rather than just a list of properties
                if (!this.tooltipText) {
                    this.tooltipText = new UIElement(new Rect(0, 0, this.tooltip.getInnerWidth(), 10));
                    for (var property in contractInfo) {
                        if (contractInfo.hasOwnProperty(property)) {
                            text += property + ": " + contractInfo[property] + "\n";
                        }
                    }
                    this.tooltipText.enableText(function() { return text; }, this.font, ig.Font.ALIGN.LEFT);
                    this.tooltip.addChild(this.tooltipText);
                }
            },

            removeContractTooltip: function() {
                if (this.tooltip) {
                    this.tooltip.hide = true;
                    this.tooltip.clearChildren();
                    this.tooltipText = null;
                    this.tooltip = null;
                }
            },

            onConfirmTakeContract: function(contractInfo) {
                ig.game.contractsWindow.hide = true;
                TFglobals.DATA_CONTROLLER.attemptToAcceptContractWithId(contractInfo.id);
            },

            onAttemptToAcceptContract : function(theResponse){
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onAttemptToAcceptContract accepted contract with id: " + theResponse.contract_id);
                }
                else{
                    this.showNotificationWindow(function() {
                        return "Contract could not be accepted!\n" + theResponse.status } );
                    console.log("onAttemptToAcceptContract failure!");
                }
            },

            onContractComplete: function(theResponse) {
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("Positive response, contract completed: " + theResponse.contract_id);
                    this.showNotificationWindow(
                        function() {
                            return "Congratulations! You completed the " + theResponse.name + " contract!\nYou have been" +
                            "paid $" + theResponse.payout + " for your efforts.";
                        }
                    );
                }
                else{
                    this.showNotificationWindow(function() {
                        return "Contract could not be completed!\n" + theResponse.status } );
                    console.log("onContractCompleted failure!");
                }
            },

            // ******************* UPGRADES **********************

            /**
             * The logic of this function follows very closely the logic of the contracts window, so refer to
             * showContractsWindow to understand what this function is doing.
             */
            showUpgradesWindow: function() {
                var self = this;
                // Making sure the confirm window exists
                if (!this.upgradesWindow) {
                    this.upgradesWindow = new Panel(new Rect(
                        ig.system.width / 2 - 250,
                        ig.system.height / 2 - 150,
                        500,
                        300
                    ));
                    this.upgradesWindow.setImage("uibox");
                    this.upgradesWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.upgradesWindow);
                }
                this.upgradesWindow.hide = false;

                // A scroll field
                if (!this.upgradeScrollField) {
                    this.upgradeScrollField = new ScrollField(
                        new Rect(
                            10, 30, this.upgradesWindow.bounds.width - 20, this.upgradesWindow.bounds.height - 40
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        [3, 75, 4, 33],
                        "uibox",
                        [5, 11, 6, 11],
                        undefined,
                        undefined,
                        this.ui
                    );
                    this.upgradesWindow.addChild(this.upgradeScrollField);
                    this.upgradeScrollField.horizontalScrollBar.hide = true;
                }

                if (!this.upgradesWindowClose) {
                    this.upgradesWindowClose = new Button(
                        new Rect(
                            this.upgradesWindow.bounds.width - 30, 0, 20, 20
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.upgradesWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.upgradesWindow.addChild(this.upgradesWindowClose);
                    var upgradesWindowCloseText = new UIElement(new Rect(12, 1, 1, 1));
                    upgradesWindowCloseText.enableText(function() { return "x"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.upgradesWindowClose.addChild(upgradesWindowCloseText);
                }

                var i = 0, upgradeHeight = 190, upgradeWidth = 142, upgradeSpacing = 5, upgrade;
                // an upgrade
                if (!this.upgrades) {
                    this.upgrades = [];
                    for (i = 0; i < this.availableUpgrades.length; i++) {
                        upgrade = new Button(
                            new Rect(
                                upgradeSpacing + (i % 3) * upgradeWidth + (i % 3) * upgradeSpacing,
                                upgradeSpacing + ((i / 3) | 0) * upgradeHeight + ((i / 3) | 0) * upgradeSpacing,
                                upgradeWidth,
                                upgradeHeight
                            ),
                            "button",
                            "button_hover",
                            "button_click",
                            function() {

                            },
                            undefined,
                            [3, 75, 4, 33]
                        );
                        this.upgradeTooltipSource = this.availableUpgrades[i].logging_equipment;
                        upgrade.upgradeInfo = this.availableUpgrades[i].logging_equipment;
                        upgrade.onLongHover = function() {
                            self.generateUpgradeTooltip(this.upgradeInfo);
                        };
                        upgrade.onUnLongHover = function() {
                            self.removeUpgradeTooltip();
                        };
                        upgrade.funcToCall = function() {
                            var thisUpgrade = this;
                            self.showConfirmWindow(function() {
                                    return "Are you sure you want to purchase\nthe "
                                        + thisUpgrade.upgradeInfo.name + " upgrade?";
                                },
                                self.onConfirmPurchaseUpgrade,
                                thisUpgrade.upgradeInfo);
                            self.removeUpgradeTooltip();
                        };
                        this.upgradeScrollField.contentPanel.addChild(upgrade);
                        var upgradeImage = new UIElement(new Rect(2, 10, 128, 128));
                        upgradeImage.hoverPassThrough = true;
                        if (this.upgradeTooltipSource.name === "Sawyer Crew") {
                            upgradeImage.setImage("sawyer_upgrade_picture");
                        }
                        else {
                            upgradeImage.setImage("upgrade_picture");
                        }
                        upgrade.addChild(upgradeImage);
                        var upgradeText = new UIElement(new Rect(upgradeWidth / 2, 144, upgradeWidth - 10, 0));
                        this.specificUpgrade = this.availableUpgrades[i].logging_equipment;
                        console.log(this.specificUpgrade);
                        upgradeText.text = this.specificUpgrade.name;
                        upgradeText.enableText(function() {
                                return this.text;
                            },
                            this.font, ig.Font.ALIGN.CENTER);
                        upgrade.addChild(upgradeText);
                        this.upgrades.push(upgrade);
                    }

                    // This enables the display of owned upgrades beneath non-owned upgrades in the upgrades list
                    // so that the player can see what upgrades they own
                    // TODO: There's probably a better way to show the player which upgrades they already own, and it
                    // TODO: may require an overhaul of the design of the upgrades window
                    var startY;
                    if (upgrade) {
                        startY = upgrade.bounds.y + upgrade.bounds.height + 20;
                    }
                    else {
                        startY = 0;
                    }
                    this.ownedUpgradesText = new UIElement(new Rect(
                        0,
                        startY,
                        1,
                        1
                    ));
                    this.upgradeScrollField.contentPanel.addChild(this.ownedUpgradesText);
                    console.log(this.ownedUpgrades);
                    if (this.ownedUpgrades) {
                        this.ownedUpgradesText.enableText(
                            function() { return " Owned Upgrades: " },
                            this.font,
                            ig.Font.ALIGN.LEFT
                        );
                        if (this.upgradesChanged) {
                            if (!this.ownedUpgradesArray) {
                                this.ownedUpgradesArray = [];
                            }
                            for (i = 0; i < this.ownedUpgradesArray.length; i++) {
                                upgrade = this.ownedUpgradesArray[i];
                                this.upgradeScrollField.contentPanel.removeChild(upgrade);
                            }
                            this.ownedUpgradesArray = [];
                            for (i = 0; i < this.ownedUpgrades.length; i++) {
                                upgrade = new Button(
                                    new Rect(
                                        upgradeSpacing + (i % 3) * upgradeWidth + (i % 3) * upgradeSpacing,
                                        startY + 20 + upgradeSpacing + ((i / 3) | 0) * upgradeHeight + ((i / 3) | 0) * upgradeSpacing,
                                        upgradeWidth,
                                        upgradeHeight
                                    ),
                                    "uibox",
                                    "uibox",
                                    "uibox",
                                    function() {

                                    },
                                    undefined,
                                    [5, 11, 6, 11]
                                );
                                this.upgradeTooltipSource = this.ownedUpgrades[i].logging_equipment;
                                upgrade.upgradeInfo = this.ownedUpgrades[i].logging_equipment;
                                upgrade.onLongHover = function() {
                                    self.generateUpgradeTooltip(this.upgradeInfo);
                                };
                                upgrade.onUnLongHover = function() {
                                    self.removeUpgradeTooltip();
                                };
                                this.upgradeScrollField.contentPanel.addChild(upgrade);
                                upgradeImage = new UIElement(new Rect(2, 10, 128, 128));
                                upgradeImage.hoverPassThrough = true;
                                if (this.upgradeTooltipSource.name === "Sawyer Crew") {
                                    upgradeImage.setImage("sawyer_upgrade_picture");
                                }
                                else {
                                    upgradeImage.setImage("upgrade_picture");
                                }
                                upgrade.addChild(upgradeImage);
                                upgradeText = new UIElement(new Rect(upgradeWidth / 2, 144, upgradeWidth - 10, 0));
                                this.specificUpgrade = this.ownedUpgrades[i].logging_equipment;
                                console.log(this.specificUpgrade);
                                upgradeText.text = this.specificUpgrade.name;
                                upgradeText.enableText(function() {
                                        return this.text;
                                    },
                                    this.font, ig.Font.ALIGN.CENTER);
                                upgrade.addChild(upgradeText);
                                this.ownedUpgradesArray.push(upgrade);
                            }
                            this.upgradesChanged = false;
                        }
                    }
                }

            },

            onGetAvailableUpgradesForPlayer: function(upgrades) {
                console.log("Got upgrades.");
                this.availableUpgrades = upgrades;
            },

            onGetPlayersOwnedEquipment : function(theResponse){
                TFglobals.HELPER_FUNCTIONS.printDesiredDebugInfo("I_DUMMY.onGetPlayersOwnedEquipment", ["theResponse"], arguments, (TFglobals.FULL_DEBUGGING || TFglobals.I_DUMMY_DEBUGGING), (TFglobals.FULL_DEBUGGING_VERBOSE || TFglobals.I_DUMMY_DEBUGGING_VERBOSE));

                if(this.serverResponseWasPositive(theResponse)){
//                    console.log("onGetPlayersOwnedEquipment success!");
//                    console.log("player's equipment: ", theResponse);
                    this.ownedUpgrades = theResponse.playersEquipment;
                    this.upgradesChanged = true;
                }
                else{
                    console.log("onGetPlayersOwnedEquipment failure with message: " + theResponse.errors.join(", "));
                }
            },

            generateUpgradeTooltip: function(upgradeInfo) {
                if (!this.tooltip) {
                    this.tooltip = new Panel(new Rect(
                        ig.input.mouse.x + 10,
                        ig.input.mouse.y + 10,
                        400,
                        200
                    ));
                    this.tooltip.setImage("uibox");
                    this.tooltip.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.tooltip);
                }
                this.tooltip.hide = false;
                var text = "";
                if (!this.tooltipText) {
                    this.tooltipText = new UIElement(new Rect(0, 0, this.tooltip.getInnerWidth(), 10));
                    for (var property in upgradeInfo) {
                        if (upgradeInfo.hasOwnProperty(property)) {
                            text += property + ": " + upgradeInfo[property] + "\n";
                        }
                    }
                    this.tooltipText.enableText(function() { return text; }, this.font, ig.Font.ALIGN.LEFT);
                    this.tooltip.addChild(this.tooltipText);
                }
            },

            removeUpgradeTooltip: function() {
                if (this.tooltip) {
                    this.tooltip.hide = true;
                    this.tooltip.clearChildren();
                    this.tooltipText = null;
                    this.tooltip = null;
                }
            },

            onConfirmPurchaseUpgrade: function(upgradeInfo) {
                ig.game.upgradesWindow.hide = true;
                TFglobals.DATA_CONTROLLER.attemptToPurchaseUpgradeWithId(upgradeInfo.id);
            },

            onAttemptToPurchaseUpgradeResponse : function(theResponse){
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onAttemptToPurchaseUpgradeResponse successfully purchased equipment with id: "
                        + theResponse.logging_equipment_id);
                    this.showNotificationWindow(function() { return "Success!"});
                }
                else{
                    console.log("onAttemptToPurchaseUpgradeResponse failure!");
                    this.showNotificationWindow(function() { return "Upgrade could not be purchased.\n" +
                        "You may be ineligible for this upgrade, or there was a server error."});
                }
            },

            // ******************* SURVEYING ***********************

            /**
             * See showContractsWindow for a more thorough walkthrough of how windows like this are generated.
             * @param x tile coordinate of the tile that was surveyed
             * @param y tile coordinate of the tile that was surveyed
             */
            viewSurveyResults: function(x, y) {
                var self = this;
                // Making sure the survey window exists
                if (!this.surveyWindow) {
                    this.surveyWindow = new Panel(new Rect(
                        ig.system.width / 2 - 250,
                        ig.system.height / 2 - 150,
                        500,
                        300
                    ));
                    this.surveyWindow.setImage("uibox");
                    this.surveyWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.surveyWindow);
                }
                this.surveyWindow.hide = false;

                // A scroll field
                if (!this.surveyScrollField) {
                    this.surveyScrollField = new ScrollField(
                        new Rect(
                            10, 30, this.surveyWindow.bounds.width - 20, this.surveyWindow.bounds.height - 40
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        [3, 75, 4, 33],
                        "uibox",
                        [5, 11, 6, 11],
                        undefined,
                        undefined,
                        this.ui
                    );
                    this.surveyWindow.addChild(this.surveyScrollField);
                    this.surveyScrollField.horizontalScrollBar.hide = true;
                }

                this.surveyResultsText = new UIElement(
                    new Rect(5, 5, this.surveyScrollField.contentPanel.getInnerWidth(), 1));
                TFglobals.DATA_CONTROLLER.viewExistingSurveyOfTileWithXY(x, y);
                this.surveyResultsText.enableText(function() { return self.currentSurveyResults; },
                    this.detailFont, ig.Font.ALIGN.LEFT);
                this.surveyResultsText.update = function() {
                    this.bounds.height = self.detailFont.heightForString(this.formatText(this._textFunction()));
                };
                this.ui.updatingElements.push(this.surveyResultsText);
                this.surveyScrollField.addChildToPanel(this.surveyResultsText);

                if (!this.surveyWindowClose) {
                    this.surveyWindowClose = new Button(
                        new Rect(
                            this.surveyWindow.bounds.width - 30, 0, 20, 20
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.surveyWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.surveyWindow.addChild(this.surveyWindowClose);
                    var surveyWindowCloseText = new UIElement(new Rect(12, 1, 1, 1));
                    surveyWindowCloseText.enableText(function() { return "x"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.surveyWindowClose.addChild(surveyWindowCloseText);
                }
            },

            onConductSurveyOfTileWithXY: function(theResponse) {
                if(this.serverResponseWasPositive(theResponse)){
                    //ig.log(theResponse);
                    //ig.log(theResponse.survey.x + ", " + theResponse.survey.y);
                    this.tilesSurveyed[theResponse.survey.x] = this.tilesSurveyed[theResponse.survey.x] || [];
                    this.tilesSurveyed[theResponse.survey.x][theResponse.survey.y] = true;
                }
                else{
                    console.log("onConductSurveyOfTileWithXY failure with message: " + theResponse.errors.join(", "));
                }
            },

            // TODO: Make this reflect the actual content of theResponse rather than prewritten debug info
            onViewExistingSurveyOfTileWithXY: function(theResponse) {
                this.currentSurveyResults =  "Coordinates: 102039, 9001" +
                    "\nLand Type: Forest" +
                    "\nOwner: Professor Oak" +
                    "\nSurvey Source: SaveTheTrees Nature Conciliatorium" +
                    "\nNumber of 12-inch trees: 92" +
                    "\nNumber of 14-inch trees: 184" +
                    "\nNumber of 16-inch trees: 568" +
                    "\nDesirability: Fourth-level" +
                    "\nMajor Religion: Zoroastrianism" +
                    "\nMana: Subtle" +
                    "\nPriuses per gallon: 40" +
                    "\nPrimary wildlife: Zubat" +
                    "\nPreferences: Long walks on the beach, picnics, wheat" +
                    "\nFavorite animal: Liger" +
                    "\nPreferenced Andrew Bird Song: Nyatiti" +
                    "\nSeriously: That album was great" +
                    "\nWhen It Grows Up: It wants to be a firetruck" +
                    "\nGames per capita per fireplace: 14" +
                    "\nMedian Ruler Length: 12\" (30.48 cm)" +
                    "\nLargest observed number: A hundredy-two";

            },

            // ******************* HARVESTING *************************

            // TODO: This window will ultimately want to look nicer, or it should be a less intrusive popup
            /**
             * This function opens a window allowing the user to choose which kind of cut they want to use to harvest
             * the argument tile. Or the user can cancel with the harvestWindowClose button.
             */
            showHarvestWindow: function(x, y) {
                var self = this;
                // Making sure the confirm window exists
                if (!this.harvestWindow) {
                    this.harvestWindow = new UIElement(new Rect(
                        ig.system.width / 2 - 250,
                        ig.system.height / 2 - 150,
                        500,
                        300
                    ));
                    this.harvestWindow.setImage("uibox");
                    this.harvestWindow.enableNinePatch(5, 11, 6, 11);
                    this.ui.addElement(this.harvestWindow);
                }
                this.harvestWindow.hide = false;

                if (!this.harvestWindowClose) {
                    this.harvestWindowClose = new Button(
                        new Rect(
                            this.harvestWindow.bounds.width - 30, 0, 20, 20
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            self.harvestWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.harvestWindow.addChild(this.harvestWindowClose);
                    var harvestWindowCloseText = new UIElement(new Rect(12, 1, 1, 1));
                    harvestWindowCloseText.enableText(function() { return "x"; }, this.font, ig.Font.ALIGN.CENTER);
                    this.harvestWindowClose.addChild(harvestWindowCloseText);
                }

                if (!this.harvestOptionClearcut) {
                    this.harvestOptionClearcut = new Button(
                        new Rect(
                            0,
                            20,
                            this.harvestWindow.getInnerWidth(),
                            135
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            // Note that harvesting harvests entire megatiles, not just resource tiles
                            TFglobals.DATA_CONTROLLER.attemptToClearCutMegatileIncludingResourceTileXY(x, y);
                            self.harvestWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.harvestWindow.addChild(this.harvestOptionClearcut);
                    var harvestOptionClearcutText = new UIElement(new Rect(
                        10,
                        10,
                        this.harvestOptionClearcut.getInnerWidth() - 20,
                        0
                    ));
                    harvestOptionClearcutText.enableText(function() {
                            return "Clearcut:\n" +
                                "Clear the tile of any loggable trees. This option will allow this land to be built" +
                                " upon, but will also prevent this tile from growing more trees in the future, unless" +
                                " it is replanted.";
                        },
                        this.font, ig.Font.ALIGN.LEFT);
                    this.harvestOptionClearcut.addChild(harvestOptionClearcutText);
                }

                if (!this.harvestOptionDiameterLimit) {
                    this.harvestOptionDiameterLimit = new Button(
                        new Rect(
                            0,
                            155,
                            this.harvestWindow.getInnerWidth(),
                            135
                        ),
                        "button",
                        "button_hover",
                        "button_click",
                        function() {
                            TFglobals.DATA_CONTROLLER.attemptToDiameterLimitCutMegatileIncludingResourceTileXY(x, y);
                            self.harvestWindow.hide = true;
                        },
                        undefined,
                        [3, 75, 4, 33]
                    );
                    this.harvestWindow.addChild(this.harvestOptionDiameterLimit);
                    var harvestOptionDiameterLimitText = new UIElement(new Rect(
                        10,
                        10,
                        this.harvestOptionDiameterLimit.getInnerWidth() - 20,
                        0
                    ));
                    harvestOptionDiameterLimitText.enableText(function() {
                            return "Diameter Limit:\n" +
                                "Clear the tile of any trees greater than 12 inches in diameter. This option will" +
                                " yield the same number of saleable logs as clearcutting, and it will also allow the" +
                                " land to grow more trees in the future.";
                        },
                        this.font, ig.Font.ALIGN.LEFT);
                    this.harvestOptionDiameterLimit.addChild(harvestOptionDiameterLimitText);
                }

            },

            harvestTile: function(x, y) {
                TFglobals.DATA_CONTROLLER.attemptToClearCutMegatileIncludingResourceTileXY(x, y);
            },

            onAttemptToClearCutMegatileIncludingResourceTileXY: function(theResponse) {
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onAttemptToClearCutMegatileIncludingResourceTileXY success!");
                }
                else{
                    console.log("onAttemptToClearCutMegatileIncludingResourceTileXY failure with message: " + theResponse.errors.join(", "));
                }
            },

            onAttemptToDiameterLimitCutMegatileIncludingResourceTileXY: function(theResponse) {
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onAttemptToClearCutMegatileIncludingResourceTileXY success!");
                }
                else{
                    console.log("onAttemptToClearCutMegatileIncludingResourceTileXY failure with message: " + theResponse.errors.join(", "));
                }
            },

            // ******************* UTILITY FUNCTIONS **********************

            /**
             * Gets the boundaries of the viewport in world space as a Rect.
             * @returns {Rect}
             * @see Rect.js
             */
            getViewRect: function() {
                return new Rect(this.screen.x - this.zoomPanOffsetX,
                    this.screen.y - this.zoomPanOffsetY,
                    ig.system.width / ig.system.imageZoom,
                    ig.system.height / ig.system.imageZoom);
            },

            /**
             * Centers the game screen on a point in world-space.
             */
            centerOnPoint: function(x, y) {
                ig.game.screen.x -= (ig.game.screen.x + ig.system.width / 2) - x;
                ig.game.screen.y -= (ig.game.screen.y + ig.system.height / 2) - y;
            },

            /**
             * Returns true if the argument is considered a positive response indicating success.
             */
            serverResponseWasPositive : function(theResponse){
                if(theResponse.status == TFglobals.SUCCESS)
                    return true;
                else if(theResponse.status = TFglobals.FAILURE)
                    return false;
                else{
                    console.log("bad status code: " + theResponse.status);
                    return false;
                }
            },

            // ******************* ACTION-CHECKING ******************

            // TODO: All of these functions need either better implementation or implementation at-all.
            // They are used by the relevant buttons to determine whether or not the buttons should be "active" and
            // clickable, or inactive, unclickable, and grayed out.

            canHarvestSelectedTile: function() {
                return (this.ownedTiles
                            && this.selectedTile
                            && this.ownedTiles[this.selectedTile[0]]
                            && this.ownedTiles[this.selectedTile[0]][this.selectedTile[1]]);
            },

            canPlantSelectedTile: function() {
                return false;
            },

            canYardSelectedTile: function() {
                return false;
            },

            canPurchaseSelectedTile: function() {
                return true;
            },

            canTransportSelectedTile: function() {
                return false;
            },

            // ******************* SHORELINES **********************

            /**
             * Gets a megatile centered around the argument coordinates and, based on the land/water data contained in
             * that 3 by 3 tile (accessed from the terrainMap), determines what letter code(s) correspond to the correct
             * shoreline for that tile, and returns a list of them. The correct shoreline can then be drawn by
             * referring to "shoreline_XYZ" where X, Y, and Z are letters A-H.
             * Note that not ALL possible 256 permutations of shorelines are considered, because that would be insane.
             * @param x
             * @param y
             * @returns {*}
             */
            getShoreTypes: function(x, y) {
                var megatile = this.terrainMap.getMegatile(x, y);
                var shoreTypes = [], A, B, C, D, E, F, G, H;
                if (megatile[0] == null) {
                    return null;
                }
                else if (megatile[0][0] === "grass") {
                    return null;
                }
                else if (megatile[0][0] === "water") {
                    if (megatile[1] && megatile[1][0] === "grass") {
                        A = true;
                    }
                    if (megatile[2] && megatile[2][0] === "grass") {
                        B = true;
                    }
                    if (megatile[3] && megatile[3][0] === "grass") {
                        C = true;
                    }
                    if (megatile[4] && megatile[4][0] === "grass") {
                        D = true;
                    }
                    if (megatile[5] && megatile[5][0] === "grass") {
                        E = true;
                    }
                    if (megatile[6] && megatile[6][0] === "grass") {
                        F = true;
                    }
                    if (megatile[7] && megatile[7][0] === "grass") {
                        G = true;
                    }
                    if (megatile[8] && megatile[8][0] === "grass") {
                        H = true;
                    }
                    if (A && C && E && G) {
                        shoreTypes.push("Q");
                    }
                    else if (A && C && E && !G) {
                        shoreTypes.push("N");
                    }
                    else if (A && C && !E && G) {
                        shoreTypes.push("M");
                    }
                    else if (A && C && !E && !G) {
                        shoreTypes.push("K");
                        if (F) {
                            shoreTypes.push("B");
                        }
                    }
                    else if (A && !C && E && G) {
                        shoreTypes.push("P");
                    }
                    else if (A && !C && E && !G) {
                        shoreTypes.push("A");
                        shoreTypes.push("E");
                    }
                    else if (A && !C && !E && G) {
                        shoreTypes.push("J");
                        if (D) {
                            shoreTypes.push("H");
                        }
                    }
                    else if (A && !C && !E && !G) {
                        shoreTypes.push("E");
                        if (D) {
                            shoreTypes.push("H");
                        }
                        if (F) {
                            shoreTypes.push("B");
                        }
                    }
                    else if (!A && C && E && G) {
                        shoreTypes.push("O");
                    }
                    else if (!A && C && E && !G) {
                        shoreTypes.push("L");
                        if (H) {
                            shoreTypes.push("D");
                        }
                    }
                    else if (!A && C && !E && G) {
                        shoreTypes.push("G");
                        shoreTypes.push("C");
                    }
                    else if (!A && C && !E && !G) {
                        shoreTypes.push("G");
                        if (F) {
                            shoreTypes.push("B");
                        }
                        if (H) {
                            shoreTypes.push("D");
                        }
                    }
                    else if (!A && !C && E && G) {
                        shoreTypes.push("I");
                        if (B) {
                            shoreTypes.push("F");
                        }
                    }
                    else if (!A && !C && E && !G) {
                        shoreTypes.push("A");
                        if (B) {
                            shoreTypes.push("F");
                        }
                        if (H) {
                            shoreTypes.push("D");
                        }
                    }
                    else if (!A && !C && !E && G) {
                        shoreTypes.push("C");
                        if (B) {
                            shoreTypes.push("F");
                        }
                        if (D) {
                            shoreTypes.push("H");
                        }
                    }
                    else if (!A && !C && !E && !G) {
                        if (B) {
                            shoreTypes.push("F");
                        }
                        if (F) {
                            shoreTypes.push("B");
                        }
                        if (H) {
                            shoreTypes.push("D");
                        }
                        if (D) {
                            shoreTypes.push("H");
                        }
                    }
                    else return null;
                }
                return shoreTypes;
            }
        });

        TFApp.models.gameModel.set("impactgame", TFApp.game);
        // ig.main( // This is the call that actually fires up the Impact engine
        //     '#canvas',
        //     game,
        //     60,
        //     1200,
        //     675,
        //     1,
        //     ig.Loader
        // );
    });
