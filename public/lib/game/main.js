ig.module(
    	'game.main'
    )
    .requires(
    	'impact.game',
        'impact.debug.debug', //TODO: Remove for release
    	'impact.font',
    	'impact.image',
        'impact.input',
        'game.cachedisomap',
        'game.isominimap',
        'game.ui',
        'game.assetmanager'
    )
    .defines(function(){

        var game = ig.Game.extend({

            // Load things
            font: new ig.Font("media/kharon_double_white.font.png"),

            ui: new UI(),

            assetManager: new AssetManager(),

            // Declare variables
            oldMouseX:0,
            oldMouseY:0,
            zoomMul:0.4,
            maxZoom:1,
            minZoom:0.04,
            zoomPanOffsetX:0, // enables centered zooming
            zoomPanOffsetY:0, // " "

            // Variables to aid in loading things in the correct order
            loadState:0,
            acceptingLoad:false,
            retryMapLoad:false,

            init: function() {
                // This injection is a part of the modified scaling implementation of Trails Forward's Impact framework
                ig.System.inject({
                    imageZoom:this.zoomMul
                });

                // Key bindings
                ig.input.bind(ig.KEY.MOUSE1, 'click');
                ig.input.bind(ig.KEY.MOUSE2, 'rclick');
                ig.input.bind(ig.KEY.MWHEEL_DOWN, 'zoomBlipOut');
                ig.input.bind(ig.KEY.MWHEEL_UP, 'zoomBlipIn');

                // UI
                var self = this, moneyBox, moneyText;
                // TODO: UI needs to be driven by server code and/or placed elsewhere
                moneyBox = new UIElement(new Rect(ig.system.width - 158, 0, 158, 30));
                moneyBox.setImageSrc("media/uibox.png");
                moneyBox.enableNinePatch(4, 9, 4, 9);
                moneyBox.load();
                this.ui.addElement(moneyBox);
                moneyText = new UIElement(new Rect(148, -2, 1, 1));
                this.money = "$1,000,000.00";
                moneyText.enableText(function () {
                    return self.money;
                }, this.font, ig.Font.ALIGN.RIGHT);
                moneyBox.addChild(moneyText);
            },

            constructMap: function() {
                // Construct the data for the map
                var mapData1 = []; // grass and water
                var mapData2 = []; // trees and houses
                var chunk;

                // Now construct the map with this data, and add image references
                this.map = new CachedIsoMap(128, this.assetManager);

                TFglobals.DATA_CONTROLLER.logInUserWithEmailAndPassword("aaron.tietz@tufts.edu", "letmein");
            },

            onLogin: function() {
                console.log("Logged in.");
                TFglobals.SERVER_API.getWorldDataForWorldId(3); // TODO: Hard-coded for now, fix later
            },

            onGetWorldData: function() {
                console.log("Got world data.");
                TFglobals.DATA_CONTROLLER.getMapChunkWithStartId(1); // TODO: Get more chunks
            },

            onGetMapChunk: function(chunk) {
                console.log("Got map chunk.");
                var i, j, megatile, tile;
                for (i = 0; i < chunk.length; i++) {
                    ig.log("Reading index " + i + " of chunk");
                    megatile = chunk[i];
                    Math.min
                    if (megatile) {
                        ig.log("Found a megatile that isn't null: " + megatile.x + ", " + megatile.y);
                        for (j = 0; j < megatile.resource_tiles.length; j++) {
                            tile = megatile.resource_tiles[j];
                            this.map.addTile(tile.x, tile.y, (tile.type === "LandTile")?"grass":"water");
                            ig.log("Added tile at " + tile.x + ", " + tile.y);
                            //if (tile.development_intensity >= 0.25) {
                            //    this.map.addTile(tile.x, tile.y, "");
                            //}
                            if (tile.tree_density >= 0.75) {
                                this.map.addTile(tile.x, tile.y, "trees3A_75_" + Math.floor(Math.random() * 3));
                            }
                            /*else if (tile.tree_density >= 0.50) {
                                this.map.addTile(tile.x, tile.y, "trees_50_" + Math.floor(Math.random() * 3));
                            }
                            else if (tile.tree_density >= 0.25) {
                                this.map.addTile(tile.x, tile.y, "trees_25_" + Math.floor(Math.random() * 3));
                            }
                            else if (tile.tree_density >= 0.10) {
                                this.map.addTile(tile.x, tile.y, "trees_10_" + Math.floor(Math.random() * 3));
                            }*/
                        }
                    }
                }
                ig.log("Done getting map chunk");
                this.gotMapChunk = true;
            },

            onGetUserPlayers: function(players) {
                console.log("Players gotten: " + players[0]);
            },

            /**
             * Call this method on any tiles that have changed to have the map update them.
             */
            onInvalidateTile: function(x, y) {
                if (this.map) {
                    this.map.invalidateTile(x, y);
                }
            },

            // Called many times per second
            update: function() {
                // Update all entities and backgroundMaps
                this.parent();

                if (!TFglobals.IMPACT) {
                    TFglobals.IMPACT = this;
                    ig.log("Constructing map");
                    this.constructMap();
                    ig.log("Finished calling construct map");
                }

                var mouseX = ig.input.mouse.x;
                var mouseY = ig.input.mouse.y;

                if (ig.input.pressed('click') && !this.ui.overlaps(mouseX, mouseY)) {
                    this.panning = true;
                }
                else if (this.panning && ig.input.state('click')) {
                    this.screen.x += (this.oldMouseX - mouseX) / ig.system.imageZoom;
                    this.screen.y += (this.oldMouseY - mouseY) / ig.system.imageZoom;
                }
                else if (this.panning && !ig.input.state('click')) {
                    this.panning = false;
                }
                else if (ig.input.state('rclick')) {
                    this.zoomMul += (this.oldMouseY - mouseY) / 300.0;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }
                else if (ig.input.state('zoomBlipOut')) {
                    this.zoomMul -= 0.03;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }
                else if (ig.input.state('zoomBlipIn')) {
                    this.zoomMul += 0.03;
                    this.zoomMul = Math.min((Math.max(this.zoomMul, this.minZoom)), this.maxZoom);
                    ig.system.imageZoom = this.zoomMul;
                }

                this.zoomPanOffsetX = ((ig.system.width / 2) / this.zoomMul) - (ig.system.width / 2);
                this.zoomPanOffsetY = ((ig.system.height / 2) / this.zoomMul) - (ig.system.height / 2);

                this.oldMouseX = mouseX;
                this.oldMouseY = mouseY;

                if (!this.assetManager.loaded() && !this.assetsLoadingText) {
                    ig.log("Loading assets...");
                    this.assetsLoadingText = true;
                }
                else {
                    if (!this.assetsLoadedText) {
                        ig.log("All assets loaded, ready to generate the map cache. Will generate once map chunk is gotten.");
                        this.mapUpdate = true;
                        this.assetsLoadedText = true;
                    }
                    if (this.map && this.gotMapChunk) {
                        if (this.mapUpdate) {
                            this.map.update();
                            /*if (!this.minimap) {
                             ig.log("Loading minimap");
                             this.minimap = new IsoMinimap();
                             this.minimap.addReferenceMap(this.map);
                             this.minimap.load();
                             ig.log("Minimap loaded");
                             this.ui.addElement(this.minimap);
                             }*/
                        }
                    }
                }

                this.ui.update();
            },

            draw: function() {

                // Draw all entities and backgroundMaps
                this.parent();

                if (this.map) {

                    var ctx = ig.system.context;
                    ctx.save();
                    var scale = ig.system.imageZoom;
                    ctx.scale(scale, scale);
                    ctx.translate(-ig.game.screen.x + this.zoomPanOffsetX, -ig.game.screen.y + this.zoomPanOffsetY);

                    this.map.draw();

                    ctx.restore();
                }

                this.ui.draw();

                // Add your own drawing code here
                if (this.map) {
                    if (this.map.status) {
                        this.font.draw("Current zoom level: " + ig.system.imageZoom
                            + "\nCurrent map status: " + this.map.status
                            //+ "\nCurrent map2 status: " + this.map2.status
                            + "\nHighest resolution on screen: " + this.map.highestResolutionOnScreen, 0, 0);
                    }
                }
            },

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
            }

        });

        ig.main( // This is the call that actually fires up the Impact engine
            '#canvas',
            game,
            60,
            1200,
            675,
            1,
            ig.Loader
        );
    });
