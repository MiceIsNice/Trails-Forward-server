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

        var game = ig.Game.extend({

            // Load things
            font: new ig.Font("media/timeless_white_16.font.png"),

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
                ig.System.inject({
                    imageZoom:this.zoomMul
                });

                // Key bindings
                ig.input.bind(ig.KEY.MOUSE1, 'click');
                ig.input.bind(ig.KEY.MOUSE2, 'rclick');
                ig.input.bind(ig.KEY.MWHEEL_DOWN, 'zoomBlipOut');
                ig.input.bind(ig.KEY.MWHEEL_UP, 'zoomBlipIn');

                // UI
                var self = this;

                var playerNameBox, playerNameText;
                playerNameBox = new UIElement(new Rect(0, 0, 180, 30));
                playerNameBox.setImage("uibox");
                playerNameBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(playerNameBox);
                playerNameText = new UIElement(new Rect(85, 1, 1, 1));
                this.playerName = "David Tennant";
                playerNameText.enableText(function() {
                    return self.playerName;
                }, this.font, ig.Font.ALIGN.CENTER);
                playerNameBox.addChild(playerNameText);

                var zoomInButton, zoomOutButton, zoomInText, zoomOutText;
                zoomInButton = new Button(new Rect(0, ig.system.height / 2 - 70, 30, 30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.zoomMul *= 1.2;
                        self.zoomMul = Math.min((Math.max(self.zoomMul, self.minZoom)), self.maxZoom);
                        ig.system.imageZoom = self.zoomMul;
                        self.zoomPanOffsetX = ((ig.system.width / 2) / self.zoomMul) - (ig.system.width / 2);
                        self.zoomPanOffsetY = ((ig.system.height / 2) / self.zoomMul) - (ig.system.height / 2);
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.ui.addElement(zoomInButton);
                zoomInText = new UIElement(new Rect(12, 1, 1, 1));
                zoomInText.enableText(function() {
                    return "+";
                }, this.font, ig.Font.ALIGN.CENTER);
                zoomInButton.addChild(zoomInText);

                zoomOutButton = new Button(new Rect(0, ig.system.height / 2 - 40, 30, 30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.zoomMul /= 1.2;
                        self.zoomMul = Math.min((Math.max(self.zoomMul, self.minZoom)), self.maxZoom);
                        ig.system.imageZoom = self.zoomMul;
                        self.zoomPanOffsetX = ((ig.system.width / 2) / self.zoomMul) - (ig.system.width / 2);
                        self.zoomPanOffsetY = ((ig.system.height / 2) / self.zoomMul) - (ig.system.height / 2);
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.ui.addElement(zoomOutButton);
                zoomOutText = new UIElement(new Rect(12, 1, 1, 1));
                zoomOutText.enableText(function() {
                    return "-";
                }, this.font, ig.Font.ALIGN.CENTER);
                zoomOutButton.addChild(zoomOutText);

                var turnPointsBox, turnPointsBar, turnPointsText;
                turnPointsBox = new UIElement(new Rect(ig.system.width - 160, 0, 160, 30));
                turnPointsBox.setImage("uibox");
                turnPointsBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(turnPointsBox);
                turnPointsText = new UIElement(new Rect(75, 1, 1, 1));
                this.turnPoints = 100;
                this.turnPointsMax = 100;
                turnPointsText.enableText(function () {
                    return self.turnPoints + "/" + self.turnPointsMax;
                }, this.font, ig.Font.ALIGN.CENTER);
                turnPointsBox.addChild(turnPointsText);

                var moneyBox, moneyText;
                moneyBox = new UIElement(new Rect(ig.system.width - 160, 30, 160, 30));
                moneyBox.setImage("uibox");
                moneyBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(moneyBox);
                moneyText = new UIElement(new Rect(148, 1, 1, 1));
                this.money = "$1,000,000.00";
                moneyText.enableText(function () {
                    return self.money;
                }, this.font, ig.Font.ALIGN.RIGHT);
                moneyBox.addChild(moneyText);

                var politicalCapitalBox, politicalCapitalText;
                politicalCapitalBox = new UIElement(new Rect(ig.system.width - 160, 60, 160, 30));
                politicalCapitalBox.setImage("uibox");
                politicalCapitalBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(politicalCapitalBox);
                politicalCapitalText = new UIElement(new Rect(75, 1, 1, 1));
                this.politicalCapital = 0;
                this.politicalCapitalMax = 10;
                politicalCapitalText.enableText(function () {
                    return self.politicalCapital + "/" + self.politicalCapitalMax;
                }, this.font, ig.Font.ALIGN.CENTER);
                politicalCapitalBox.addChild(politicalCapitalText);

                this.minimapBox = new UIElement(new Rect(
                    0,
                    ig.system.height - ig.system.width / 4 / 1.7777777777 - 8,
                    ig.system.width / 4 + 8,
                    ig.system.width / 4 / 1.7777777777 + 8
                ));
                this.minimapBox.setImage("uibox");
                this.minimapBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(this.minimapBox);

                var actionsBox, actionsText;
                actionsBox = new UIElement(new Rect(
                    ig.system.width - ig.system.width / 4 - 8,
                    ig.system.height - ig.system.width / 4 / 1.7777777777 - 8,
                    ig.system.width / 4 + 8,
                    ig.system.width / 4 / 1.7777777777 + 8));
                actionsBox.setImage("uibox");
                actionsBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(actionsBox);
                actionsText = new UIElement(new Rect((ig.system.width / 4 + 8) / 2 - 5, 1, 1, 1));
                actionsText.enableText(function () {
                    return "Actions";
                }, this.font, ig.Font.ALIGN.CENTER);
                actionsBox.addChild(actionsText);

                var contractsButton, contractsButtonText;
                contractsButton = new Button(new Rect(
                        20,
                        30,
                        ig.system.width / 4 - 42,
                        30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.showContractsWindow();
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                actionsBox.addChild(contractsButton);
                contractsButtonText = new UIElement(new Rect((ig.system.width / 4) / 2 - 20, 7, 1, 1));
                contractsButtonText.enableText(function () {
                    return "Contracts";
                }, this.font, ig.Font.ALIGN.CENTER);
                contractsButton.addChild(contractsButtonText);

                var upgradesButton, upgradesButtonText;
                upgradesButton = new Button(new Rect(
                        20,
                        60,
                        ig.system.width / 4 - 42,
                        30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.showContractsWindow();
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                actionsBox.addChild(upgradesButton);
                upgradesButtonText = new UIElement(new Rect((ig.system.width / 4) / 2 - 20, 7, 1, 1));
                upgradesButtonText.enableText(function () {
                    return "Upgrades";
                }, this.font, ig.Font.ALIGN.CENTER);
                upgradesButton.addChild(upgradesButtonText);
            },

            constructMap: function() {
                this.terrainMap = new CachedIsoMap(128, this.assetManager);
                this.featureMap = new CachedIsoMap(128, this.assetManager);

                TFglobals.DATA_CONTROLLER.getUserPlayers();

                //TFglobals.DATA_CONTROLLER.logInWithCookies();
                TFglobals.DATA_CONTROLLER.logInUserWithEmailAndPassword("aaron.tietz@tufts.edu", "letmein");
            },

            onGetUserPlayers: function(players) {
                ig.log("Got user players.");
                TFglobals.DATA_CONTROLLER.getWorldDataForPlayerId(players[0].id);
            },

            onLogin: function() {
                ig.log("Logged in.");
            },

            onGetWorldData: function() {
                ig.log("Got world data.");
               // TFglobals.DATA_CONTROLLER.getMapChunkWithStartId(1); // TODO: Get more chunks
				var rect = {x_min : 0, x_max : 64, y_min : 0, y_max : 64};
				TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
                TFglobals.DATA_CONTROLLER.getAvailableContractsForPlayer();
            },

            onGetMapChunk: function(chunk) {
                ig.log("Got map chunk.");
                var i, j, k, tile, shoreTypes, tileFeature, landType;
                //ig.log(chunk);
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
                                    tileFeature = "forest_tileset_heavy";
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
                ig.log("Done getting map chunk");
                this.gotMapChunk = true;
            },

            /**
             * Call this method on any tiles that have changed to have the map update them.
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
                    this.origClickMouseX = mouseX;
                    this.origClickMouseY = mouseY;
                }
                else if (this.panning && ig.input.state('click')) {
                    this.screen.x += (this.oldMouseX - mouseX) / ig.system.imageZoom;
                    this.screen.y += (this.oldMouseY - mouseY) / ig.system.imageZoom;
                }
                else if (this.panning && !ig.input.state('click')) {
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
                    if (this.terrainMap && this.gotMapChunk) {
                        if (this.mapUpdate) {
                            this.featureMap.update();
                            this.terrainMap.update();
                            if (!this.minimap) {
                             ig.log("Loading minimap");
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
                             ig.log("Minimap loaded");
                             this.minimapBox.addChild(this.minimap);
                             }
                        }
                    }
                }

                this.ui.update();
            },

            draw: function() {

                var ctx, scale, realX, realY, x, y;

               //if (ig.input.pressed("click")) {
               //    this.shouldTime = true;
               //    time.start("draw");
               //}

                // Draw all entities and backgroundMaps
                // TODO: Have IsomapEntities draw after featureMap and automatically re-draw trees below them
                this.parent();

                if (this.terrainMap) {
                    ctx = ig.system.context;
                    ctx.save();
                    scale = ig.system.imageZoom;
                    ctx.scale(scale, scale);
                    ctx.translate(-ig.game.screen.x + this.zoomPanOffsetX, -ig.game.screen.y + this.zoomPanOffsetY);

                    this.terrainMap.draw();

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

                //if (this.shouldTime) {
                //    time.stop("draw");
                //    time.report();
                //    this.shouldTime = null;
                //}

                // Draw things between the maps like tile selection highlights


                if (this.featureMap) {
                    ctx.save();
                    ctx.scale(scale, scale);
                    ctx.translate(-ig.game.screen.x + this.zoomPanOffsetX, -ig.game.screen.y + this.zoomPanOffsetY);

                    this.featureMap.draw();

                    ctx.restore();
                }

                this.ui.draw();

                //// Add your own drawing code here
                //if (this.terrainMap) {
                //    if (this.terrainMap.status) {
                //        this.font.draw("Current zoom level: " + ig.system.imageZoom
                //            + "\nCurrent terrainMap status: " + this.terrainMap.status
                //            + "\nCurrent featureMap status: " + this.featureMap.status
                //            + "\nHighest resolution on screen: " + this.terrainMap.highestResolutionOnScreen, 0, 0);
                //    }
                //}
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
            },

            /**
             * Selects the tile at the specified location. Selection has a little highlight effect.
             * @param x
             * @param y
             */
            selectTile: function(x, y) {
                if (this.selectedTile) {
                    if (this.selectedTile[0] == x && this.selectedTile[1] == y) {
                        this.buyTile(x, y); // TODO: Obviously this is not proper functionality ultimately
                    }
                }
                this.selectedTile = [x, y];
                //ig.log("Selected tile: " + x + ", " + y);
                //ig.log("Tile has the following shape with respect to trees: ");
                //ig.log(this.featureMap.getForestTile(x, y));
                //ig.log(this.terrainMap.getTile(x, y));
            },

            /**
             * Called when the player clicks on a tile that is already selected.
             * @param x
             * @param y
             */
            buyTile: function(x, y) { //TODO Obviously this should be called under different circumstances ultimately
                this.showConfirmWindow(
                    function() { return "Are you sure you want to buy this tile?"; },
                    this.onConfirmBuyTile,
                    {x:x, y:y, that:this});
            },

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
             * Displays the window for contracts.
             */
            showContractsWindow: function() {
                var self = this;
                // Making sure the confirm window exists
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
                        "uibox",
                        [5, 11, 6, 11],
                        this.ui
                    );
                    this.contractsWindow.addChild(this.contractScrollField);
                    this.contractScrollField.horizontalScrollBar.hide = true;
                }

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

                var i = 0, contractHeight = 190, contractWidth = 142, contractSpacing = 5, contract;
                // a contract
                if (!this.contracts) {
                    this.contracts = [];
                    for (i = 0; i < this.availableContracts.length; i++) {
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
                                self.contractsWindow.hide = true;
                                self.removeContractTooltip();
                            },
                            undefined,
                            [3, 75, 4, 33]
                        );
                        this.contractTooltipSource = this.availableContracts[i];
                        contract.contractInfo = this.availableContracts[i];
                        contract.onLongHover = function() {
                            self.generateContractTooltip(this.contractInfo);
                        };
                        contract.onUnLongHover = function() {
                            self.removeContractTooltip();
                        };
                        this.contractScrollField.contentPanel.addChild(contract);
                        var contractImage = new UIElement(new Rect(9, 10, 128, 128));
                        contractImage.setImage("contract_picture");
                        contract.addChild(contractImage);
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
                if (!this.tooltip) {
                    this.tooltip = new UIElement(new Rect(
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

            /**
             * Called when the player has confirmed they want to purchase the tile at the specified location.
             * @param args A list containing [x, y]
             */
            onConfirmBuyTile: function(args) {
                // Aaron's code here!
                ig.log("Attempted to purchase tile at " + args.x + ", " + args.y);

                args.that.featureMap.clearTile(args.x, args.y);
                args.that.featureMap.addTile(args.x, args.y, "harvesting_tile");
            },

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
