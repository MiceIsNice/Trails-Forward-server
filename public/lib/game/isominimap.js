ig.module(
    'game.isominimap'
)
    .requires(
        'game.cachedisomap',
        'game.rect',
        'game.uielement'
    )
    .defines(function() {

        IsoMinimap = UIElement.extend({

            init: function(bounds) {
                // Call the parent constructor to set the bounds
                this.parent(bounds);

                // Initialize the canvas used to store the minimap image
                this.canvas = document.createElement("canvas");
                this.canvas.width = bounds.width;
                this.canvas.height = bounds.height;
            },

            /**
             * @param {CachedIsoMap} map A map to reference for data for this minimap. There can be multiple, they will
             * draw in order from bottom to top.
             */
            addReferenceMap: function(map) {
                this.referenceMaps = this.referenceMaps || [];
                this.referenceMaps.push(map);
            },

            click: function(x, y) {
                var miniToMapRatio = this.getMinimapToMapSizeRatio();
                ig.game.centerOnPoint(
                    (x - this.bounds.width / 2 - this._parent.getOffsetX()) / miniToMapRatio,
                    (y - this._parent.getOffsetY()) / miniToMapRatio);
            },

            /**
             * Cache the map onto a small canvas. Overrides the default UIElement load() function.
             */
            load: function() {
                // TODO: This might be unnecessarily expensive; I may want to split it into sections like CachedIsoMap.
                if (this.referenceMaps) {
                    var realX, realY, miniX, miniY,
                        miniToFullRatio = this.getMinimapToMapSizeRatio(),
                        ctx = this.canvas.getContext('2d'),
                        m, i, j, k,
                        imageNames, imageNamesSansShorelines = [], name;
                    for (m = 0; m < this.referenceMaps.length; m++) {
                        if (this.referenceMaps[m].data) {
                            //ig.log("minimap: " + this.referenceMaps[m].data.length);
                            for (i = 0; i < this.referenceMaps[m].data.length; i++) {
                                //ig.log("minimap: " + this.referenceMaps[m].data[i].length);
                                for (j = 0; j < this.referenceMaps[m].data[i].length; j++) {
                                    realX = (i - j) * this.referenceMaps[m].tilesize;
                                    realY = (i + j) / 2 * this.referenceMaps[m].tilesize;
                                    miniX = realX + (this.bounds.width / 2 / miniToFullRatio);
                                    miniY = realY;

                                    imageNames = this.referenceMaps[m].data[i][j];
                                    //ig.log(imageNames);
                                    if (imageNames) {
                                        imageNamesSansShorelines = [];
                                        for (k = 0; k < imageNames.length; k++) {
                                            name = imageNames[k];
                                            if (!(name.substring(0, "shoreline".length) === "shoreline")) {
                                                imageNamesSansShorelines.push(name);
                                            }
                                        }
                                        //ig.log("Sans shorelines loading: ");
                                        //ig.log(imageNamesSansShorelines);
                                        this.referenceMaps[m]._renderTile(ctx,
                                            miniX, miniY, imageNamesSansShorelines, undefined, undefined, 1 / miniToFullRatio);
                                    }
                                }
                            }
                        }
                    }
                    this._loaded = true;
                } else {
                    ig.log("Unable to load: No reference maps.");
                }
            },

            /**
             * The bounds of the minimap can be changed after initializing it. This won't change the cached resolution
             * of the minimap, but it will change where the minimap is drawn. Overrides the default UIElement draw()
             * function.
             */
            draw: function() {
                var parentOffsetX, parentOffsetY;
                if (this._loaded) {

                    // Draw relative to parent position if a parent exists
                    if (this._parent) {
                        parentOffsetX = this._parent.getOffsetX();
                        parentOffsetY = this._parent.getOffsetY();
                        if (this._parent._ninePatch) {
                            parentOffsetX += this._parent._ninePatchData.x1;
                            parentOffsetY += this._parent._ninePatchData.y1;
                        }
                    }

                    var ctx = ig.system.context,
                        miniToMapRatio;
                    // Fill in the background with black
                    ctx.fillRect(this.bounds.x + parentOffsetX,
                        this.bounds.y + parentOffsetY,
                        this.bounds.width,
                        this.bounds.height);

                    // Paint the map
                    ctx.drawImage(this.canvas,
                        0, 0,
                        this.canvas.width, this.canvas.height,
                        this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY,
                        this.bounds.width, this.bounds.height);

                    // Stroke the viewport's position
                    miniToMapRatio = this.getMinimapToMapSizeRatio();
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(this.bounds.x + parentOffsetX,
                        this.bounds.y + parentOffsetY,
                        this.bounds.width,
                        this.bounds.height);
                    ctx.clip();
                    ctx.strokeStyle = "#ffffff";
                    ctx.strokeRect(
                        this.bounds.x + parentOffsetX + this.bounds.width / 2
                            + (ig.game.screen.x - ig.game.zoomPanOffsetX) * miniToMapRatio,
                        this.bounds.y + parentOffsetY + (ig.game.screen.y - ig.game.zoomPanOffsetY) * miniToMapRatio,
                        ig.system.width * miniToMapRatio / ig.system.imageZoom,
                        ig.system.height * miniToMapRatio / ig.system.imageZoom
                    );
                    ctx.restore();
                }
            },

            /**
             * @returns {Number} The ratio of this minimap's size over the reference map's size, or null if there's no
             * reference map set for this minimap yet.
             */
            getMinimapToMapSizeRatio: function() {
                if (this.referenceMaps) { // return this minimap's width over the reference map's width
                    if (this.referenceMaps[0]) {
                        if (Math.abs(this.referenceMaps[0]._boundsMaxX) > Math.abs(this.referenceMaps[0]._boundsMinX)) {
                            return this.bounds.width / (2 * this.referenceMaps[0]._boundsMaxX);
                        }
                        return this.bounds.width / (2 * Math.abs(this.referenceMaps[0]._boundsMinX));
                    }
                    return null;
                } else {
                    return null;
                }
            }

        });

    });