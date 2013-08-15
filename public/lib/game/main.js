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
            disableFont: new ig.Font("media/timeless_gray_16.font.png"),
            detailFont: new ig.Font("media/timeless_white_12.font.png"),

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
            currentSurveyResults:"Loading survey data, one moment...",
            tilesSurveyed: [],

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
                this.money = 0;
                moneyText.enableText(function () {
                    var num = self.money, sign, cents;
                    if (!num)
                        num = 0;
                    num = num.toString().replace(/\$|\,/g, '');
                    if (isNaN(num)) num = "0";
                    sign = (num == (num = Math.abs(num)));
                    num = Math.floor(num * 100 + 0.50000000001);
                    cents = num % 100;
                    num = Math.floor(num / 100).toString();
                    if (cents < 10) cents = "0" + cents;
                    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
                        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
                    return (((sign) ? '' : '-') + '$' + num + '.' + cents);
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

                this.tileDetailsBox = new UIElement(new Rect(
                    0,
                    ig.system.height - 100,
                    ig.system.width,
                    110
                ));
                this.tileDetailsBox.setImage("uibox");
                this.tileDetailsBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(this.tileDetailsBox);

                this.tileDetailsContentBox = new UIElement(new Rect(
                    ig.system.width / 4 + 8 + 20,
                    10,
                    600,
                    100
                ));
                this.tileDetailsBox.addChild(this.tileDetailsContentBox);

                this.tileDetailsTileView = new UIElement(new Rect(
                    0,
                    0,
                    200,
                    100
                ));
                var i, imageName, tileImages;
                this.displayingTileImage = document.createElement("canvas");
                this.displayingTileImageCtx = this.displayingTileImage.getContext("2d");
                this.tileDetailsTileView.update = function() {
                    if (ig.game.selectedTile) {
                        if (!this.displayingTile || (ig.game.selectedTile[0] != this.displayingTile[0]
                            || ig.game.selectedTile[1] != this.displayingTile[1])) {
                            ig.game.displayingTileImage.width = ig.game.displayingTileImage.width;
                            tileImages = ig.game.terrainMap.getTile(ig.game.selectedTile[0], ig.game.selectedTile[1]);
                            if (tileImages) {
                                for (i = 0; i < tileImages.length; i++) {
                                    imageName = tileImages[i];
                                    ig.game.displayingTileImageCtx.drawImage(
                                        ig.game.assetManager.images[imageName],
                                        0,
                                        -(ig.game.terrainMap.tilesize / 2)
                                    );
                                }
                            }
                            tileImages = ig.game.featureMap.getTile(ig.game.selectedTile[0], ig.game.selectedTile[1]);
                            if (tileImages) {
                                for (i = 0; i < tileImages.length; i++) {
                                    imageName = tileImages[i];
                                    ig.game.displayingTileImageCtx.drawImage(
                                        ig.game.assetManager.images[imageName],
                                        0,
                                        -(ig.game.featureMap.tilesize / 2)
                                    );
                                }
                            }
                            this.displayingTile = ig.game.selectedTile;
                            this.setImageFromSource(ig.game.displayingTileImage);
                        }
                    }
                    else {
                        this.displayingTile = null;
                        this.setImage(undefined);
                        ig.game.displayingTileImage.width = ig.game.displayingTileImage.width;
                    }
                };
                this.ui.updatingElements.push(this.tileDetailsTileView);
                this.tileDetailsContentBox.addChild(this.tileDetailsTileView);

                this.tileDetailsTextBox1 = new UIElement(new Rect(
                    200,
                    0,
                    400,
                    100
                ));
                this.tileDetailsTextBox1.enableText(function() {
                    return "Type: Land\n" +
                        "Surveyable: Yes\n" +
                        "Features: Heavy forestation\n" +
                        "Owned By: Me\n" +
                        "(This text is static right now)";
                    }, this.detailFont, ig.Font.ALIGN.LEFT);
                this.tileDetailsContentBox.addChild(this.tileDetailsTextBox1);

                this.minimapBox = new UIElement(new Rect(
                    0,
                    ig.system.height - ig.system.width / 4 / 1.7777777777 - 8,
                    ig.system.width / 4 + 8,
                    ig.system.width / 4 / 1.7777777777 + 8
                ));
                this.minimapBox.setImage("uibox");
                this.minimapBox.enableNinePatch(5, 11, 5, 10);
                this.ui.addElement(this.minimapBox);

                this.viewOwnedTilesButton = new Button(new Rect(
                    this.minimapBox.bounds.x + 10,
                    this.minimapBox.bounds.y + this.minimapBox.bounds.height - 20,
                    10,
                    10),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        if (!self.viewOwnedTiles) {
                            self.viewOwnedTilesText._textFunction = function() { return "X"; };
                            self.viewOwnedTiles = true;
                        }
                        else {
                            self.viewOwnedTilesText._textFunction = function() { return ""; };
                            self.viewOwnedTiles = false;
                        }
                    },
                    [3, 75, 4, 33]
                );
                this.ui.addElement(this.viewOwnedTilesButton);
                this.viewOwnedTilesText = new UIElement(new Rect(5, -2, 1, 1));
                this.viewOwnedTilesText.enableText(function() { return ""; }, this.detailFont, ig.Font.ALIGN.CENTER);
                this.viewOwnedTilesButton.addChild(this.viewOwnedTilesText);
                this.viewOwnedTilesLabel = new UIElement(new Rect(12, -2, 1, 1));
                this.viewOwnedTilesLabel.enableText(function() { return "Show Ownership Layer"; }, this.detailFont, ig.Font.ALIGN.LEFT);
                this.viewOwnedTilesButton.addChild(this.viewOwnedTilesLabel);

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
                        15,
                        30,
                        ig.system.width / 8 - 21,
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
                contractsButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                contractsButtonText.enableText(function () {
                    return "Contracts";
                }, this.font, ig.Font.ALIGN.CENTER);
                contractsButton.addChild(contractsButtonText);

                var upgradesButton, upgradesButtonText;
                upgradesButton = new Button(new Rect(
                        10 + 15 + ig.system.width / 8 - 21,
                        30,
                        ig.system.width / 8 - 21,
                        30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.showUpgradesWindow();
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                actionsBox.addChild(upgradesButton);
                upgradesButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                upgradesButtonText.enableText(function () {
                    return "Upgrades";
                }, this.font, ig.Font.ALIGN.CENTER);
                upgradesButton.addChild(upgradesButtonText);

                this.surveyButton = new Button(new Rect(
                        15,
                        60,
                        ig.system.width / 8 - 21,
                        30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        TFglobals.DATA_CONTROLLER.conductSurveyOfTileWithXY(self.selectedTile[0], self.selectedTile[1]);
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.surveyButton.setImage("button_inactive");
                this.surveyButton.inactive = true;
                this.ui.updatingElements.push(this.surveyButton);
                this.surveyButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.surveyButtonText.enableText(function () {
                    return "Survey";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.surveyButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (this.inactive) {
                            this.inactive = false;
                            this.setImage("button");
                            self.surveyButtonText._font = self.font;
                        }
                        if (self.tilesSurveyed[self.selectedTile[0]]) {
                            if (self.tilesSurveyed[self.selectedTile[0]][self.selectedTile[1]]) {
                                self.surveyButtonText._textFunction = function() {
                                    return "View Survey";
                                };
                                this.onUnclick = function() {
                                    self.viewSurveyResults(self.selectedTile[0], self.selectedTile[1]);
                                };
                            }
                            else {
                                self.surveyButtonText._textFunction = function() {
                                    return "Survey";
                                };
                                this.onUnclick = function() {
                                    TFglobals.DATA_CONTROLLER
                                        .conductSurveyOfTileWithXY(self.selectedTile[0], self.selectedTile[1]);
                                };
                            }
                        }
                        else {
                            self.surveyButtonText._textFunction = function() {
                                return "Survey";
                            };
                            this.onUnclick = function() {
                                TFglobals.DATA_CONTROLLER
                                    .conductSurveyOfTileWithXY(self.selectedTile[0], self.selectedTile[1]);
                            };
                        }
                        // change this.surveyButtonText to "View Survey"
                        // change the associated function to viewing survey results
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.surveyButtonText._font = self.disableFont;
                        }
                    }
                };
                actionsBox.addChild(this.surveyButton);
                this.surveyButton.addChild(this.surveyButtonText);

                this.harvestButton = new Button(new Rect(
                    10 + 15 + ig.system.width / 8 - 21,
                    60,
                    ig.system.width / 8 - 21,
                    30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        ig.log("Attempted to harvest tile - not yet implemented!");
                        self.showHarvestWindow(self.selectedTile[0], self.selectedTile[1]);
                        //Need to open a window to specify the type of cut
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.harvestButton.setImage("button_inactive");
                this.harvestButton.inactive = true;
                this.ui.updatingElements.push(this.harvestButton);
                this.harvestButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.harvestButtonText.enableText(function () {
                    return "Harvest";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.harvestButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (ig.game.canHarvestSelectedTile()) {
                            if (this.inactive) {
                                this.inactive = false;
                                this.setImage("button");
                                self.harvestButtonText.enableText(self.harvestButtonText._textFunction,
                                    self.font, ig.Font.ALIGN.CENTER);
                            }
                        }
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.harvestButtonText.enableText(self.harvestButtonText._textFunction,
                                self.disableFont, ig.Font.ALIGN.CENTER);
                        }
                    }
                };
                actionsBox.addChild(this.harvestButton);
                this.harvestButton.addChild(this.harvestButtonText);

                this.plantButton = new Button(new Rect(
                    15,
                    90,
                    ig.system.width / 8 - 21,
                    30),
                    "button",
                    "button_hover",
                    "button_click",
                    function(selectedTile) {
                        ig.log("Attempted to plant tile - not yet implemented!");
                        //TFglobals.DATA_CONTROLLER.requestPlantForTileWithId(selectedTile)
                    },
                    self.selectedTile,
                    [3, 75, 4, 33]
                );
                this.plantButton.setImage("button_inactive");
                this.plantButton.inactive = true;
                this.ui.updatingElements.push(this.plantButton);
                this.plantButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.plantButtonText.enableText(function () {
                    return "Plant";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.plantButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (ig.game.canPlantSelectedTile()) {
                            if (this.inactive) {
                                this.inactive = false;
                                this.setImage("button");
                                self.plantButtonText.enableText(self.plantButtonText._textFunction,
                                    self.font, ig.Font.ALIGN.CENTER);
                            }
                        }
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.plantButtonText.enableText(self.plantButtonText._textFunction,
                                self.disableFont, ig.Font.ALIGN.CENTER);
                        }
                    }
                };
                actionsBox.addChild(this.plantButton);
                this.plantButton.addChild(this.plantButtonText);

                this.yardButton = new Button(new Rect(
                    10 + 15 + ig.system.width / 8 - 21,
                    90,
                    ig.system.width / 8 - 21,
                    30),
                    "button",
                    "button_hover",
                    "button_click",
                    function(selectedTile) {
                        ig.log("Attempted to yard tile - not yet implemented!");
                        //Need to open a window to specify the type of cut
                    },
                    self.selectedTile,
                    [3, 75, 4, 33]
                );
                this.yardButton.setImage("button_inactive");
                this.yardButton.inactive = true;
                this.ui.updatingElements.push(this.yardButton);
                this.yardButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.yardButtonText.enableText(function () {
                    return "Yard";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.yardButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (ig.game.canYardSelectedTile()) {
                            if (this.inactive) {
                                this.inactive = false;
                                this.setImage("button");
                                self.yardButtonText.enableText(self.yardButtonText._textFunction,
                                    self.font, ig.Font.ALIGN.CENTER);
                            }
                        }
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.yardButtonText.enableText(self.yardButtonText._textFunction,
                                self.disableFont, ig.Font.ALIGN.CENTER);
                        }
                    }
                };
                actionsBox.addChild(this.yardButton);
                this.yardButton.addChild(this.yardButtonText);

                this.purchaseButton = new Button(new Rect(
                    15,
                    120,
                    ig.system.width / 8 - 21,
                    30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        self.buyTile(self.selectedTile[0], self.selectedTile[1]);
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.purchaseButton.setImage("button_inactive");
                this.purchaseButton.inactive = true;
                this.ui.updatingElements.push(this.purchaseButton);
                this.purchaseButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.purchaseButtonText.enableText(function () {
                    return "Purchase";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.purchaseButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (ig.game.canPurchaseSelectedTile()) {
                            if (this.inactive) {
                                this.inactive = false;
                                this.setImage("button");
                                self.purchaseButtonText.enableText(self.purchaseButtonText._textFunction,
                                    self.font, ig.Font.ALIGN.CENTER);
                            }
                        }
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.purchaseButtonText.enableText(self.purchaseButtonText._textFunction,
                                self.disableFont, ig.Font.ALIGN.CENTER);
                        }
                    }
                };
                actionsBox.addChild(this.purchaseButton);
                this.purchaseButton.addChild(this.purchaseButtonText);

                this.transportButton = new Button(new Rect(
                    10 + 15 + ig.system.width / 8 - 21,
                    120,
                    ig.system.width / 8 - 21,
                    30),
                    "button",
                    "button_hover",
                    "button_click",
                    function() {
                        ig.log("Attempted to transport tile - not yet implemented!");
                        //Need to open a window to specify the type of cut
                    },
                    undefined,
                    [3, 75, 4, 33]
                );
                this.transportButton.setImage("button_inactive");
                this.transportButton.inactive = true;
                this.ui.updatingElements.push(this.transportButton);
                this.transportButtonText = new UIElement(new Rect((ig.system.width / 8) / 2 - 10, 7, 1, 1));
                this.transportButtonText.enableText(function () {
                    return "Transport";
                }, this.disableFont, ig.Font.ALIGN.CENTER);
                this.transportButton.update = function() {
                    if (ig.game.selectedTile) {
                        if (ig.game.canTransportSelectedTile()) {
                            if (this.inactive) {
                                this.inactive = false;
                                this.setImage("button");
                                self.transportButtonText.enableText(self.transportButtonText._textFunction,
                                    self.font, ig.Font.ALIGN.CENTER);
                            }
                        }
                    }
                    else {
                        if (!this.inactive) {
                            this.inactive = true;
                            this.setImage("button_inactive");
                            self.transportButtonText.enableText(self.transportButtonText._textFunction,
                                self.disableFont, ig.Font.ALIGN.CENTER);
                        }
                    }
                };
                actionsBox.addChild(this.transportButton);
                this.transportButton.addChild(this.transportButtonText);
            },

            constructMap: function() {
                this.terrainMap = new CachedIsoMap(128, this.assetManager);
                this.featureMap = new CachedIsoMap(128, this.assetManager);
                this.ownershipMap = new CachedIsoMap(128, this.assetManager);

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
				var rect = {x_min : 0, x_max : 64, y_min : 0, y_max : 64};
				TFglobals.DATA_CONTROLLER.getTilesInRect(rect);
                TFglobals.DATA_CONTROLLER.getAvailableContractsForPlayer();
                TFglobals.DATA_CONTROLLER.getAvailableUpgradesForPlayer();
                TFglobals.DATA_CONTROLLER.getPlayerStats();
                TFglobals.DATA_CONTROLLER.getPlayersOwnedEquipment();
            },

            onGetPlayerStats: function(theResponse) {
            console.log("Impact onGetPlayerStats got: ", theResponse);
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onGetPlayerStats received balance: " + theResponse.balance
                        + ", turn points: " + theResponse.turn_points
                        + ", political capital: " + theResponse.political_capital);
                    this.money = theResponse.balance;
                    this.turnPoints = theResponse.turn_points;
                    this.politicalCapital = theResponse.political_capital;
                }
                else{
                    this.showNotificationWindow(function() {
                        return "Uh oh! Something went wrong. Couldn't get player stats." } );
                    console.log("onGetPlayerStats failure!");
                    console.log(theResponse);
                }
            },

            onGetMapChunk: function(chunk) {
                var self = this;
                ig.log("Got map chunk.");
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
                ig.log("Done getting map chunk");
                this.gotMapChunk = true;
            },

            onGetPlayersOwnedResourceTiles : function(theResponse){
                var tile, i;
                if(this.serverResponseWasPositive(theResponse)){
                	if(theResponse.resource_tiles){
						console.log("onGetPlayersOwnedResourceTiles received " + theResponse.resource_tiles.length + " tiles: ");
						theResponse.resource_tiles.reduce(
							function(previousValue, currentValue, index, array) {
								console.log("",currentValue);
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

            onGetResourceTilesOwnedByOthers : function(theResponse){
                var tile, i;
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onGetResourceTilesOwnedByOthers received " + theResponse.resource_tiles.length + " tiles: ");
                    for(var i = 0; i < theResponse.resource_tiles.length; i++)
                        console.log("", theResponse.resource_tiles[i]);
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

                var ctx, scale, realX, realY, x, y, tile, i, j;

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
                }
            },

            unselectTile: function() {
                if (this.selectedTile) {
                    this.selectedTile = null;
                }
            },

            // ******************* BUYING TILES **********************

            /**
             * Called when the player clicks on a tile that is already selected.
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
             * @param args A list containing [x, y]
             */
            onConfirmBuyTile: function(args) {
                ig.log("Attempted to purchase tile at " + args.x + ", " + args.y);
                TFglobals.DATA_CONTROLLER.attemptToPurchaseMegatileIncludingResourceTileXY(
                    args.x, args.y);
            },

            onAttemptToPurchaseMegatileIncludingResourceTileXY: function(theResponse){
                var i, j;
                if(this.serverResponseWasPositive(theResponse)){
                    console.log("onAttemptToPurchaseMegatileIncludingResourceTileXY successfully purchased resource " +
                        "tile with origin x, y: " + theResponse.megatile_upper_left_xy.x
                        + ", " + theResponse.megatile_upper_left_xy.y);
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
                        undefined,
                        undefined,
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
                        this.contractScrollField.contentPanel.addChild(contract);
                        var contractImage = new UIElement(new Rect(4, 6, 128, 128));
                        contractImage.hoverPassThrough = true;
                        if (this.contractTooltipSource.name === "Lumberjack Easy Park") {
                            contractImage.setImage("park_contract_picture");
                        }
                        else if (this.contractTooltipSource.codename === "Saw Timber Wanted") {
                            contractImage.setImage("mill_contract_picture");
                        }
                        else {
                            contractImage.setImage("contract_picture");
                        }
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

            // ******************* UPGRADES **********************

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
                    console.log("onGetPlayersOwnedEquipment success!");
                    console.log("player's equipment: ", theResponse);
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
                    ig.log(theResponse);
                    ig.log(theResponse.survey.x + ", " + theResponse.survey.y);
                    this.tilesSurveyed[theResponse.survey.x] = this.tilesSurveyed[theResponse.survey.x] || [];
                    this.tilesSurveyed[theResponse.survey.x][theResponse.survey.y] = true;
                }
                else{
                    console.log("onConductSurveyOfTileWithXY failure with message: " + theResponse.errors.join(", "));
                }
            },

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
                            TFglobals.DATA_CONTROLLER.attemptToDiameterLimitCutMegatileWithResourceTileXY(x, y);
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

            onAttemptToClearCutMegatileIncludingResourceTileXY: function(theResponse) {
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

            // ******************* ACTION-CHECKING ******************

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
            },

            // ******************* OWNERSHIP HIGHLIGHTS **********************

            getOwnershipTypes: function(x, y) {
                var megatile = this.ownershipMap.getOwnershipMegatile(x, y);
                var ownershipTypes = [], A, B, C, D, E, F, G, H;
                console.log(megatile);
                if (megatile[0] == null) {
                    return null;
                }
                else if (megatile[0] !== "me") {
                    return null;
                }
                else if (megatile[0] === "me") {
                    if (megatile[1] !== "me") {
                        A = true;
                    }
                    if (megatile[2] !== "me") {
                        B = true;
                    }
                    if (megatile[3] !== "me") {
                        C = true;
                    }
                    if (megatile[4] !== "me") {
                        D = true;
                    }
                    if (megatile[5] !== "me") {
                        E = true;
                    }
                    if (megatile[6] !== "me") {
                        F = true;
                    }
                    if (megatile[7] !== "me") {
                        G = true;
                    }
                    if (megatile[8] !== "me") {
                        H = true;
                    }
                    console.log(A, B, C, D, E, F, G, H);
                    if (A && C && E && G) {
                        ownershipTypes.push("Q");
                    }
                    else if (A && C && E && !G) {
                        ownershipTypes.push("N");
                    }
                    else if (A && C && !E && G) {
                        ownershipTypes.push("M");
                    }
                    else if (A && C && !E && !G) {
                        ownershipTypes.push("K");
                        if (F) {
                            ownershipTypes.push("B");
                        }
                    }
                    else if (A && !C && E && G) {
                        ownershipTypes.push("P");
                    }
                    else if (A && !C && E && !G) {
                        ownershipTypes.push("A");
                        ownershipTypes.push("E");
                    }
                    else if (A && !C && !E && G) {
                        ownershipTypes.push("J");
                        if (D) {
                            ownershipTypes.push("H");
                        }
                    }
                    else if (A && !C && !E && !G) {
                        ownershipTypes.push("E");
                        if (D) {
                            ownershipTypes.push("H");
                        }
                        if (F) {
                            ownershipTypes.push("B");
                        }
                    }
                    else if (!A && C && E && G) {
                        ownershipTypes.push("O");
                    }
                    else if (!A && C && E && !G) {
                        ownershipTypes.push("L");
                        if (H) {
                            ownershipTypes.push("D");
                        }
                    }
                    else if (!A && C && !E && G) {
                        ownershipTypes.push("G");
                        ownershipTypes.push("C");
                    }
                    else if (!A && C && !E && !G) {
                        ownershipTypes.push("G");
                        if (F) {
                            ownershipTypes.push("B");
                        }
                        if (H) {
                            ownershipTypes.push("D");
                        }
                    }
                    else if (!A && !C && E && G) {
                        ownershipTypes.push("I");
                        if (B) {
                            ownershipTypes.push("F");
                        }
                    }
                    else if (!A && !C && E && !G) {
                        ownershipTypes.push("A");
                        if (B) {
                            ownershipTypes.push("F");
                        }
                        if (H) {
                            ownershipTypes.push("D");
                        }
                    }
                    else if (!A && !C && !E && G) {
                        ownershipTypes.push("C");
                        if (B) {
                            ownershipTypes.push("F");
                        }
                        if (D) {
                            ownershipTypes.push("H");
                        }
                    }
                    else if (!A && !C && !E && !G) {
                        if (B) {
                            ownershipTypes.push("F");
                        }
                        if (F) {
                            ownershipTypes.push("B");
                        }
                        if (H) {
                            ownershipTypes.push("D");
                        }
                        if (D) {
                            ownershipTypes.push("H");
                        }
                    }
                    else return null;
                }
                return ownershipTypes;
            },

            // *********************** SERVER FUNCTIONS ************************

            serverResponseWasPositive : function(theResponse){
                if(theResponse.status == TFglobals.SUCCESS)
                    return true;
                else if(theResponse.status = TFglobals.FAILURE)
                    return false;
                else{
                    console.log("bad status code: " + theResponse.status);
                    return false;
                }
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
