ig.module(
        'game.cachedisomap'
    )
    .requires(
        'impact.map',
        'impact.debug.debug',
        'game.rect'
    )
    .defines(function() {

        CachedIsoMap = ig.Class.extend({

            useCache:true,
            sectionSize:32, // This is a good section size (in tiles) for tiles 256 x 256 pixels in size.
                            // (It means highest-res sections are squares 32 * this.tilesize pixels to a side.)
            maxVeryLowResCanvases:256,
            maxLowResCanvases:32,
            maxMidResCanvases:16,
            maxHighResCanvases:8,
            lowResZoomThreshold:0.0625,
            midResZoomThreshold:0.25,
            highResZoomThreshold:0.5,
            maxTilesPerUpdate:6, // The maximum number of HIGH-RES tiles to render to canvas caches per update
                                 // (Tiles at half high-res resolution are drawn at twice this rate)

            init: function(tilesize, assetManager) {
                this.tilesize = tilesize;
                this.imageCacheList = [];

                // Create the baseline for the various resolutions of caches
                this._veryLowResSections = []; // 1/16 the size
                this._veryLowResSectionCtx = [];
                this._lowResSections = []; // 1/4 the size
                this._lowResSectionCtx = [];
                this._midResSections = []; // 1/2 the size
                this._midResSectionCtx = [];
                this._highResSections = []; // 1-to-1 canvases. These can be quite large, so we'll only ever make a few.
                this._highResSectionCtx = [];

                this._boundsMinX = this._boundsMinY = this._boundsMaxX = this._boundsMaxY = 0;

                // This will be the source of all imagery
                this.assetManager = assetManager;
            },

            /**
             * Sets the specified tile's texture index and cell that will be used
             * when rendering the texture map.
             * @param {Number} x The tile x co-ordinate.
             * @param {Number} y The tile y co-ordinate.
             * @param {string} imageName The name of the image in the assetManager to be used.
             */
            addTile: function (x, y, imageName) {
                if (x || x == 0) {
                    if (y || y == 0) {
                        this.data = this.data || [];
                        this.data[x] = this.data[x] || [];
                        this.data[x][y] = this.data[x][y] || [];
                        this.data[x][y].push(imageName);
                        this.invalidateTile(x, y); // Important to call this - we changed a tile!
                    }
                }
            },

            /**
             * Gets the information on the tile at the specified coordinates, or undefined if it hasn't
             * been set. Tiles are arrays of imageNames.
             * @param {Number} x
             * @param {Number} y
             * @returns {Array}
             */
            getTile: function (x, y) {
                if (this.data[x]) {
                    return this.data[x][y];
                }
                return null;
            },

            /**
             * Gets / sets a value on the map.
             * @param {Number} x
             * @param {Number} y
             * @param {string} imageName The index of the tile image to use
             * @return {*} Nothing if setting, the tile if getting, or undefined.
             */
            tile: function(x, y, imageName) {
                if (imageName) {
                    this.addTile(x, y, imageName);
                }
                else {
                    return this.getTile(x, y);
                }
            },

            /**
             * Returns the megatile CENTERED ON the argument tile. A megatile is a 3x3 array of tiles.
             * @param x
             * @param y
             */
            getMegatile: function(x, y) {
                var list = [], i, xo, yo;
                for (i = 0; i < 9; i++) {
                    list.push(null);
                }
                for (i = 0; i < 9; i++) {
                    switch(i) {
                        case 0: xo = yo = 0; break;
                        case 1: xo = 0; yo = -1; break;
                        case 2: xo = 1; yo = -1; break;
                        case 3: xo = 1; yo = 0; break;
                        case 4: xo = 1; yo = 1; break;
                        case 5: xo = 0; yo = 1; break;
                        case 6: xo = -1; yo = 1; break;
                        case 7: xo = -1; yo = 0; break;
                        case 8: xo = -1; yo = -1; break;
                        default: break;
                    }
                    if (this.data[x+xo]) {
                        if (this.data[x+xo][y+yo]) {
                            list[i] = this.data[x+xo][y+yo];
                        }
                    }
                }
                return list;
            },

            /**
             * Ensures the given section exists in memory and returns a reference to it.
             * @param sectionX
             * @param sectionY
             * @param resDivider The divisor to apply to the rendered canvas
             * @returns {*} The canvas created.
             * @private
             */
            _ensureSectionExists: function(sectionX, sectionY, resDivider) {
                // Ugh, this got far more code-duplicate-y than I had intended.
                switch (resDivider) {
                    case 1:
                        this._highResCanvasList = this._highResCanvasList || [];
                        if (this._highResCanvasList.length == this.maxHighResCanvases) {
                            //ig.log("Maximum number of high res canvases reached");
                            // We've run out of high resolution canvases! Nullify the first one in the list to make room
                            // (Garbage collection will free up the memory on its own - the delete keyword is SLOW!)
                            // http://kendsnyder.com/posts/chrome-v8-creators-with-and-delete-are-dog-slow
                            var oldSection = this._highResCanvasList.shift();
                            this._highResSections[oldSection.x][oldSection.y] = null;
                            this._highResSectionCtx[oldSection.x][oldSection.y] = null;
                            this._high_res_cached[oldSection.x][oldSection.y] = false;
                        }
                        // Make sure the structural variables are instantiated
                        this._highResSections = this._highResSections || [];
                        this._highResSectionCtx = this._highResSectionCtx || [];
                        this._highResSections[sectionX] = this._highResSections[sectionX] || [];
                        this._highResSectionCtx[sectionX] = this._highResSectionCtx[sectionX] || [];
                        if (!this._highResSections[sectionX][sectionY]) {
                            // If it doesn't exist, it's about to be created by _makeSection, so push it to the list
                            this._highResCanvasList.push({x:sectionX, y:sectionY});
                        }
                        return this._makeSection(this._highResSections, this._highResSectionCtx, sectionX, sectionY, 1);
                        break;
                    case 2:
                        this._midResCanvasList = this._midResCanvasList || [];
                        if (this._midResCanvasList.length == this.maxMidResCanvases) {
                            //ig.log("Maximum number of mid res canvases reached");
                            // We've run out of mid resolution canvases!
                            var oldSection = this._midResCanvasList.shift();
                            this._midResSections[oldSection.x][oldSection.y] = null;
                            this._midResSectionCtx[oldSection.x][oldSection.y] = null;
                            this._mid_res_cached[oldSection.x][oldSection.y] = false;
                        }
                        // Make sure the structural variables are instantiated
                        this._midResSections = this._midResSections || [];
                        this._midResSectionCtx = this._midResSectionCtx || [];
                        this._midResSections[sectionX] = this._midResSections[sectionX] || [];
                        this._midResSectionCtx[sectionX] = this._midResSectionCtx[sectionX] || [];
                        if (!this._midResSections[sectionX][sectionY]) {
                            // If it doesn't exist, it's about to be created by _makeSection, so push it to the list
                            this._midResCanvasList.push({x:sectionX, y:sectionY});
                        }
                        return this._makeSection(this._midResSections, this._midResSectionCtx, sectionX, sectionY, 2);
                        break;
                    case 4:
                        this._lowResCanvasList = this._lowResCanvasList || [];
                        if (this._lowResCanvasList.length == this.maxLowResCanvases) {
                            //ig.log("Maximum number of low res canvases reached");
                            // We've run out of low resolution canvases!
                            var oldSection = this._lowResCanvasList.shift();
                            this._lowResSections[oldSection.x][oldSection.y] = null;
                            this._lowResSectionCtx[oldSection.x][oldSection.y] = null;
                            this._low_res_cached[oldSection.x][oldSection.y] = false;
                        }
                        // Make sure the structural variables are instantiated
                        this._lowResSections = this._lowResSections || [];
                        this._lowResSectionCtx = this._lowResSectionCtx || [];
                        this._lowResSections[sectionX] = this._lowResSections[sectionX] || [];
                        this._lowResSectionCtx[sectionX] = this._lowResSectionCtx[sectionX] || [];
                        if (!this._lowResSections[sectionX][sectionY]) {
                            // If it doesn't exist, it's about to be created by _makeSection, so push it to the list
                            this._lowResCanvasList.push({x:sectionX, y:sectionY});
                        }
                        return this._makeSection(this._lowResSections, this._lowResSectionCtx, sectionX, sectionY, 4);
                        break;
                    case 16:
                        this._veryLowResCanvasList = this._veryLowResCanvasList || [];
                        if (this._veryLowResCanvasList.length == this.maxVeryLowResCanvases) {
                            //ig.log("Maximum number of very low res canvases reached");
                            // We've run out of very low resolution canvases!
                            var oldSection = this._veryLowResCanvasList.shift();
                            this._veryLowResSections[oldSection.x][oldSection.y] = null;
                            this._veryLowResSectionCtx[oldSection.x][oldSection.y] = null;
                            this._very_low_res_cached[oldSection.x][oldSection.y] = false;
                        }
                        // Make sure the structural variables are instantiated
                        this._veryLowResSections = this._veryLowResSections || [];
                        this._veryLowResSectionCtx = this._veryLowResSectionCtx || [];
                        this._veryLowResSections[sectionX] = this._veryLowResSections[sectionX] || [];
                        this._veryLowResSectionCtx[sectionX] = this._veryLowResSectionCtx[sectionX] || [];
                        if (!this._veryLowResSections[sectionX][sectionY]) {
                            // If it doesn't exist, it's about to be created by _makeSection, so push it to the list
                            this._veryLowResCanvasList.push({x:sectionX, y:sectionY});
                        }
                        return this._makeSection(this._veryLowResSections, this._veryLowResSectionCtx, sectionX, sectionY, 16);
                        break;
                    default:
                        console.log("resDivider INVALID");
                }
            },

            /**
             * Helper method for _ensureSectionExists.
             * @private
             */
            _makeSection: function(sections, sectionCtx, sectionX, sectionY, resDivider) {
                // If the sections don't exist, create them
                if (!sections[sectionX][sectionY]) {
                    // Make a new canvas
                    sections[sectionX][sectionY] = document.createElement('canvas');
                    sections[sectionX][sectionY].width = (this.tilesize * this.sectionSize) / resDivider;
                    sections[sectionX][sectionY].height = (this.tilesize * this.sectionSize) / resDivider;

                    /*if (this._pingCanvas(this._sections[sectionX][sectionY])) {
                     //ig.log("Ping successful: Canvas is valid " + sectionX + ", " + sectionY);
                     }
                     else {
                     //ig.log("Invalid canvas " + sectionX + ", " + sectionY);
                     if (this._invalidCount) {
                     this._invalidCount += 1;
                     }
                     else {
                     this._invalidCount = 1;
                     }
                     }*/

                    var sectionCtx = sectionCtx[sectionX][sectionY] = sections[sectionX][sectionY].getContext('2d');

                    // Now that we have initialized the new canvas, make sure it's going to anti-alias things.
                    sectionCtx.imageSmoothingEnabled = true;
                    sectionCtx.webkitImageSmoothingEnabled = true;
                    sectionCtx.mozImageSmoothingEnabled = true;
                }
                return sections[sectionX][sectionY];
            },

            /**
             * Private function for debugging canvas draws and Chrome's canvas size/amount limitations.
             * Not sustainable right now because it leaves residue on canvases it pings.
             * If this method is needed in the future to check for invalid canvases, it will need to be modified.
             * DEPRECATED. I'm keeping this here for reference only, because it's a useful reference for how to ping a
             * canvas, if such functionality is ever needed in the future.
             * @returns {boolean} True if the canvas can be drawn upon, false if something went wrong (Chroooome!)
             * @private
             * @deprecated
             */
            _pingCanvas: function(canvas) {
                var ctx = canvas.getContext('2d');
                ctx.drawImage(this.imageCacheList[0], -this.tilesize, -this.tilesize);
                var imageData = ctx.getImageData(0, 0, 1, 1);
                return imageData.data[0] != 0;
            },

            /**
             * Renders the tile determined by imageName to the specified canvas context at renderX, renderY. Can
             * optionally divide the resolution of the drawn tile.
             * @param ctx The canvas context onto which to draw
             * @param renderX The x coordinate at which to draw
             * @param renderY They coordinate at which to draw
             * @param imageName The imageName of the image to draw from the assetManager
             * @param sectionX Specify this if this method is being used for caching a section, it offsets renderX, or just use undefined
             * @param sectionY Specify this if this method is being used for caching a section, it offsets renderY, or just use undefined
             * @param resDivider The divisor to apply to the resolution (automatically adjusts renderX,Y accordinagly)
             * @private
             */
            _renderTile: function(ctx, renderX, renderY, imageName, sectionX, sectionY, resDivider) {
                // If we're painting onto a section, we should use the section origin as our render origin
                if (sectionX !== undefined) {
                    renderX -= sectionX * this.tilesize * this.sectionSize;
                }
                if (sectionY !== undefined) {
                    renderY -= sectionY * this.tilesize * this.sectionSize;
                }

                var image = this.assetManager.images[imageName];


                if (image) {
                    if (ctx) {
                        ctx.drawImage(image,
                            0, 0,
                            image.width, image.height,
                            renderX / resDivider, renderY / resDivider,
                            image.width / resDivider, image.height / resDivider);
                        ig.Image.drawCount++;
                    }
                }
            },

            /**
             * Sets the pixel boundaries in world space of the map based on its data, as well as handles updating the
             * cache of the map based on the viewport position and zoom.
             */
            update: function() {

                // Update the map boundaries so we can ignore sections outside of them
                if (this.data) {
                    if (this.data[0]) {
                        this._boundsMinX = -this.data[0].length * this.tilesize;
                        this._boundsMaxY = (this.data.length + this.data[0].length) / 2 * this.tilesize;
                    }
                    else {
                        this._boundsMinX = 0;
                        this._boundsMaxY = 0;
                    }
                    this._boundsMinY = -this.tilesize;
                    this._boundsMaxX = this.data.length * this.tilesize;
                }
                else this._boundsMinX = this._boundsMinY = this._boundsMaxX = this._boundsMaxY = 0;

                if (this.data) {// Update the cache in a prioritized order:
                    /*  1- Very-low-res cache anything the player can see right now
                     2- Very-low-res cache the immediate surroundings
                     3- Low-res cache anything the player can see right now IF PAST LOW ZOOM THRESHOLD
                     4- Mid-res cache anything the player can see right now IF PAST MID ZOOM THRESHOLD
                     5- High-res cache anything the player can see right now IF PAST HIGH ZOOM THRESHOLD
                     6- Low-res cache the immediate surroundings IF PAST LOW ZOOM THRESHOLD
                     7- Mid-res cache the immediate surroundings IF PAST MID ZOOM THRESHOLD
                     8- High-res cache the immediate surroundings IF PAST HIGH ZOOM THRESHOLD
                     9- Very-low-res the map in any order
                     Only cache one section per update loop.
                     */
                    // Step 1: Very-low-res cache anything the player can see right now
                    this.status = "Very-low-res caching visible";
                    var visibleSections = this.getSections(ig.game.getViewRect());
                    this._very_low_res_cached = this._very_low_res_cached || [];
                    for (var i = 0; i < visibleSections.length; i++) {
                        this._very_low_res_cached[visibleSections[i].x] =
                            this._very_low_res_cached[visibleSections[i].x] || [];
                        if (!this._very_low_res_cached[visibleSections[i].x][visibleSections[i].y]) {
                            this.cacheSection(visibleSections[i].x, visibleSections[i].y, "very_low_res");
                            return; // Only one section per update
                        }
                    }

                    // Step 2: Very-low-res cache the immediate surroundings
                    this.status = "Very-low-res caching the immediate surroundings";
                    var surroundRect = ig.game.getViewRect();
                    surroundRect.x -= surroundRect.width / 2;
                    surroundRect.y -= surroundRect.height / 2;
                    surroundRect.width *= 2;
                    surroundRect.height *= 2;
                    var surroundingSections = this.getSections(surroundRect);
                    for (i = 0; i < surroundingSections.length; i++) {
                        this._very_low_res_cached[surroundingSections[i].x] =
                            this._very_low_res_cached[surroundingSections[i].x] || [];
                        if (!this._very_low_res_cached[surroundingSections[i].x][surroundingSections[i].y]) {
                            this.cacheSection(surroundingSections[i].x, surroundingSections[i].y, "very_low_res");
                            return; // Only one section per update
                        }
                    }

                    // Step 3: Low-res cache anything the player can see right now if past low zoom threshold
                    if (ig.system.imageZoom >= this.lowResZoomThreshold) {
                        this.status = "Low-res caching visible";
                        this._low_res_cached = this._low_res_cached || [];
                        for (i = 0; i < visibleSections.length; i++) {
                            this._low_res_cached[visibleSections[i].x] =
                                this._low_res_cached[visibleSections[i].x] || [];
                            if (!this._low_res_cached[visibleSections[i].x][visibleSections[i].y]) {
                                this.cacheSection(visibleSections[i].x, visibleSections[i].y, "low_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // Step 4: Mid-res cache anything the player can see right now if past mid zoom threshold
                    if (ig.system.imageZoom >= this.midResZoomThreshold) {
                        this.status = "Mid-res caching visible";
                        this._mid_res_cached = this._mid_res_cached || [];
                        for (i = 0; i < visibleSections.length; i++) {
                            this._mid_res_cached[visibleSections[i].x] =
                                this._mid_res_cached[visibleSections[i].x] || [];
                            if (!this._mid_res_cached[visibleSections[i].x][visibleSections[i].y]) {
                                this.cacheSection(visibleSections[i].x, visibleSections[i].y, "mid_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // Step 5: High-res cache anything the player can see right now if past high zoom threshold
                    if (ig.system.imageZoom >= this.highResZoomThreshold) {
                        this.status = "High-res caching visible";
                        this._high_res_cached = this._high_res_cached || [];
                        for (i = 0; i < visibleSections.length; i++) {
                            this._high_res_cached[visibleSections[i].x] =
                                this._high_res_cached[visibleSections[i].x] || [];
                            if (!this._high_res_cached[visibleSections[i].x][visibleSections[i].y]) {
                                this.cacheSection(visibleSections[i].x, visibleSections[i].y, "high_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // Step 6: Low-res cache the immediate surroundings if past low res zoom threshold
                    if (ig.system.imageZoom >= this.lowResZoomThreshold) {
                        this.status = "Low-res caching the immediate surroundings";
                        for (i = 0; i < surroundingSections.length; i++) {
                            this._low_res_cached[surroundingSections[i].x] =
                                this._low_res_cached[surroundingSections[i].x] || [];
                            if (!this._low_res_cached[surroundingSections[i].x][surroundingSections[i].y]) {
                                this.cacheSection(surroundingSections[i].x, surroundingSections[i].y, "low_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // Step 7: Mid-res cache the immediate surroundings if past mid res zoom threshold
                    if (ig.system.imageZoom >= this.midResZoomThreshold) {
                        this.status = "Mid-res caching the immediate surroundings";
                        for (i = 0; i < surroundingSections.length; i++) {
                            this._mid_res_cached[surroundingSections[i].x] =
                                this._mid_res_cached[surroundingSections[i].x] || [];
                            if (!this._mid_res_cached[surroundingSections[i].x][surroundingSections[i].y]) {
                                this.cacheSection(surroundingSections[i].x, surroundingSections[i].y, "mid_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // Step 8: High-res cache the immediate surroundings if past high res zoom threshold
                    if (ig.system.imageZoom >= this.highResZoomThreshold) {
                        this.status = "High-res caching the immediate surroundings";
                        for (i = 0; i < surroundingSections.length; i++) {
                            this._high_res_cached[surroundingSections[i].x] =
                                this._high_res_cached[surroundingSections[i].x] || [];
                            if (!this._high_res_cached[surroundingSections[i].x][surroundingSections[i].y]) {
                                this.cacheSection(surroundingSections[i].x, surroundingSections[i].y, "high_res");
                                return; // Only one section per update
                            }
                        }
                    }

                    // This step is only good if we're certain we can cache the entirety of the map without using up
                    // all of our allowed very-low-res sections. If we can't, it causes dancing black boxes around the
                    // screen. Commented out for this reason.
                    // Step 9: Very-low-res cache the rest of the map in any order
                    //var realX, realY, sectionX, sectionY;
                    //this.status = "Very-low-res caching the map";
                    //for (i = 0; i < this.data.length; i++) {
                    //    for (var j = 0; j < this.data[i].length; j++) {
                    //        realX = (i - j);
                    //        realY = (i + j) / 2;
                    //        sectionX = Math.floor(isoX / this.sectionSize);
                    //        sectionY = Math.floor(isoY / this.sectionSize);
                    //        this._very_low_res_cached[sectionX] =
                    //            this._very_low_res_cached[sectionX] || [];
                    //        if (!this._very_low_res_cached[sectionX][sectionY]) {
                    //            this.cacheSection(sectionX, sectionY, "very_low_res");
                    //            return; // Only one section per update
                    //        }
                    //    }
                    //}
                    this.status = "Done caching for now";
                }
            },

            /**
             * Caches the specified section into memory.
             * @param sectionX The x coordinate of the section (in section space, not world space)
             * @param sectionY The y coordinate of the section (in section space, not world space)
             * @param resMode A string determining the resolution at which to cache this section
             */
            cacheSection: function(sectionX, sectionY, resMode) {
                // Set the resolution divider that we'll use when generating cache sections
                // or when rendering tiles to the cache
                var resDivider;
                switch (resMode) {
                    case "high_res":
                        resDivider = 1;
                        break;
                    case "mid_res":
                        resDivider = 2;
                        break;
                    case "low_res":
                        resDivider = 4;
                        break;
                    case "very_low_res":
                        resDivider = 16;
                        break;
                    default:
                        resDivider = 64; // Make it clear that there was an error
                }

                //ig.log("Caching section " + sectionX + ", " + sectionY); //TODO DELETE

                // Get the tiles we have left to render; either populate if empty or just keep going
                // Also make sure we're still on the same section, otherwise start over!
                this._tilesLeftToRender = this._tilesLeftToRender || [];
                if (this._tilesLeftToRender.length == 0
                    || this._currentlyDrawingSectionX != sectionX
                    || this._currentlyDrawingSectionY != sectionY) {
                    this._tilesLeftToRender = this.getTiles(new Rect(
                        sectionX * this.sectionSize * this.tilesize,
                        sectionY * this.sectionSize * this.tilesize,
                        this.sectionSize * this.tilesize,
                        this.sectionSize * this.tilesize));
                    this._currentlyDrawingSectionX = sectionX;
                    this._currentlyDrawingSectionY = sectionY;
                }

                //ig.log("tiles left to render: " + this._tilesLeftToRender.length); //TODO DELETE

                // Ensure the section exists for the corresponding resolution, then render some tiles to it
                var context = this._ensureSectionExists(sectionX, sectionY, resDivider).getContext('2d');
                for (var i = 0; i < this.maxTilesPerUpdate * resDivider * resDivider; i++) {
                    if (i == this._tilesLeftToRender.length) {
                        break;
                    }
                    // Otherwise keep rendering until we hit the maximum allowed this update
                    for (var j = 0; j < this._tilesLeftToRender[i].imageNames.length; j++) {
                        this._renderTile(
                            context,
                            this._tilesLeftToRender[i].renderX,
                            this._tilesLeftToRender[i].renderY,
                            this._tilesLeftToRender[i].imageNames[j],
                            sectionX, sectionY,
                            resDivider
                        );
                    }
                }
                // Get rid of the rendered tiles from the array of tiles still to be drawn
                var c = 0;
                for (; i > 0; i--) {
                    c++; // Teehee
                }
                this._tilesLeftToRender = this._tilesLeftToRender.splice(c);
                if (this._tilesLeftToRender.length == 0) {
                    // We finished rendering this section at this resolution
                    this._markSectionCached(sectionX, sectionY, resDivider);
                }
            },

            /**
             * Marks the argument section cached so that we don't try caching it again.
             * @private
             */
            _markSectionCached: function(sectionX, sectionY, resDivider) {
                this._markSection(sectionX, sectionY, resDivider, true);
            },

            /**
             * @param {int} sectionX
             * @param {int} sectionY
             * @param {int} resDivider
             * @param {boolean} flag
             * @private
             */
            _markSection: function(sectionX, sectionY, resDivider, flag) {
                switch (resDivider) {
                    case 1:
                        this._high_res_cached = this._high_res_cached || [];
                        this._high_res_cached[sectionX] = this._high_res_cached[sectionX] || [];
                        this._high_res_cached[sectionX][sectionY] = flag;
                        break;
                    case 2:
                        this._mid_res_cached = this._mid_res_cached || [];
                        this._mid_res_cached[sectionX] = this._mid_res_cached[sectionX] || [];
                        this._mid_res_cached[sectionX][sectionY] = flag;
                        break;
                    case 4:
                        this._low_res_cached = this._low_res_cached || [];
                        this._low_res_cached[sectionX] = this._low_res_cached[sectionX] || [];
                        this._low_res_cached[sectionX][sectionY] = flag;
                        break;
                    case 16:
                        this._very_low_res_cached = this._very_low_res_cached || [];
                        this._very_low_res_cached[sectionX] = this._very_low_res_cached[sectionX] || [];
                        this._very_low_res_cached[sectionX][sectionY] = flag;
                        break;
                    default:
                        ig.log("Invalid resDivider");
                }
            },

            /**
             * Call this function when a tile is changed, because any section marked cached whose tile is changed is no
             * longer properly cached and needs to be reloaded.
             * @param x Isometric X coordinate of the tile that was changed
             * @param y Isometric Y coordinate of the tile that was changed
             */
            invalidateTile: function(x, y) {
                var realX, realY, sectionX, sectionY;
                realX = (x - y);
                realY = (x + y) / 2;

                sectionX = Math.floor(realX / this.sectionSize);
                sectionY = Math.floor(realY / this.sectionSize);

                this._markSection(sectionX, sectionY, 1, false);
                this._markSection(sectionX, sectionY, 2, false);
                this._markSection(sectionX, sectionY, 4, false);
                this._markSection(sectionX, sectionY, 16, false);
            },

            /**
             * @param rect A Rect (or an object with x, y, width, and height properties).
             * @returns {Array} An array of objects (with renderX, renderY, and imageNames properties) that overlap with
             * the argument Rect.
             */
            getTiles: function(rect) {
                var tiles = [], count = 0, haveOffset = false, tile;
                for (var j = rect.y - this.tilesize; j < rect.y + rect.height; j += this.tilesize / 2) {
                    for (var i = rect.x - this.tilesize * 2; i < rect.x + rect.width; i += this.tilesize * 2) {
                        if (count % 2 == 1 && !haveOffset) { // Every other vertical column is offset slightly b/c iso
                            i += this.tilesize;
                            haveOffset = true;
                        }
                        tile = this.getTileAtPx(i, j);
                        if (tile.imageNames) {
                            // Sometimes there's no tile! That's okay, we just can't draw it, so we wouldn't push it
                            tiles.push(tile);
                        }
                    }
                    count++;
                    haveOffset = false;
                }
                return tiles;
            },

            /**
             * @returns {*} An object (with renderX, renderY, and imageNames) of the tile on the map located at the
             * render (pixel) coordinates, or undefined if there is no data at that location on this map.
             */
            getTileAtPx: function(realX, realY) {
                var isoX = Math.floor((realX / 2 + realY) / this.tilesize);
                var isoY = Math.floor((-realX / 2 + realY) / this.tilesize);
                var renderX = (isoX - isoY) * this.tilesize;
                var renderY = (isoX + isoY) / 2 * this.tilesize;
                return {renderX:renderX, renderY:renderY, imageNames:this.getTile(isoX, isoY), isoX:isoX - 1, isoY:isoY};
            },

            /**
             * @param {Rect} rect The boundaries to check (properties x, y, width, height) in world space.
             * @returns {*} A list of objects with x and y parameters corresponding to sections of the map that overlap with
             * the argument rect.
             */
            getSections: function(rect) {
                var sections = [];
                var size = this.sectionSize*this.tilesize;
                var x1 = Math.floor(rect.x / size);
                var y1 = Math.floor(rect.y / size);
                var x2 = Math.floor((rect.x + rect.width) / size);
                var y2 = Math.floor((rect.y + rect.height) / size);
                if (x1 < this._boundsMinX)
                    x1 = this._boundsMinX;
                if (x2 > this._boundsMaxX)
                    x2 = this._boundsMaxX;
                if (y1 < this._boundsMinY)
                    y1 = this._boundsMinY;
                if (y2 > this._boundsMaxY)
                    y2 = this._boundsMaxY;
                // Width and height are always positive, so x2 is always > x1 (similarly for y1 and y2)
                for (var i = 0; i < x2 - x1 + 1; i++) {
                    for (var j = 0; j < y2 - y1 + 1; j++) {
                        sections.push({x:(x1 + i), y:(y1 + j)});
                    }
                }
                return sections;
            },

            /**
             * Draws the map from the cache if caching is enabled, or just draws all of the tiles of map.
             * Caching is highly recommended for all but very small maps, and absolutely necessary for playability on
             * large maps.
             */
            draw: function() {
                if (this.useCache) {
                    this._drawCache();
                }
                else {
                    var realX, realY, tileType;
                    for (var i = 0; i < this.data.length; i++) {
                        for (var j = 0; j < this.data[i].length; j++) {

                            realX = (i - j) * this.tilesize;
                            realY = (i + j) / 2 * this.tilesize;

                            tileType = this.data[i][j];

                            // checking if on-screen
                            if (realX > ig.game.screen.x
                                && realX < ig.game.screen.x + ig.system.width / ig.system.imageZoom - this.tilesize
                                && realY > ig.game.screen.y
                                && realY < ig.game.screen.y + ig.system.height / ig.system.imageZoom - this.tilesize) {
                                ig.system.context.drawImage(this.imageCacheList[tileType], realX, realY);
                                ig.Image.drawCount++;
                            }
                            //var image = this.imageList[tileData];
                            //image.draw(ig.system.context, x*this.tileWidth - ig.game.screen.x, y*this.tileHeight - ig.game.screen.y);
                        }
                    }
                }
            },

            /**
             * Draws whatever sections are in the cache and marked as cached fully.
             * @private
             */
            _drawCache: function() {
                // Get the sections that are on screen
                var sections = this.getSections(ig.game.getViewRect());

                // Draw 'em
                var sectionRenderX, sectionRenderY;
                var canvas;
                for (var i = 0; i < sections.length; i++) {
                    // See if we've cached them first, otherwise we can't draw anything
                    // Now prefer the highest resolution available corresponding to this zoom level,
                    // defaulting to the next highest cached resolution
                    // High res
                    this._high_res_cached = this._high_res_cached || [];
                    this._high_res_cached[sections[i].x] = this._high_res_cached[sections[i].x] || [];
                    if (this._high_res_cached[sections[i].x][sections[i].y]
                        && ig.system.imageZoom >= this.highResZoomThreshold) {
                        sectionRenderX = sections[i].x * this.tilesize * this.sectionSize;
                        sectionRenderY = sections[i].y * this.tilesize * this.sectionSize;

                        canvas = this._highResSections[sections[i].x][sections[i].y];

                        ig.system.context.drawImage(canvas,
                            0, 0,
                            canvas.width, canvas.height,
                            sectionRenderX, sectionRenderY,
                            this.sectionSize * this.tilesize, this.sectionSize * this.tilesize);
                        ig.Image.drawCount++;
                        this.highestResolutionOnScreen = "high";
                    }
                    else {
                        // Mid res
                        this._mid_res_cached = this._mid_res_cached || [];
                        this._mid_res_cached[sections[i].x] = this._mid_res_cached[sections[i].x] || [];
                        if (this._mid_res_cached[sections[i].x][sections[i].y]
                            && ig.system.imageZoom >= this.midResZoomThreshold) {
                            sectionRenderX = sections[i].x * this.tilesize * this.sectionSize;
                            sectionRenderY = sections[i].y * this.tilesize * this.sectionSize;

                            canvas = this._midResSections[sections[i].x][sections[i].y];

                            ig.system.context.drawImage(canvas,
                                0, 0,
                                canvas.width, canvas.height,
                                sectionRenderX, sectionRenderY,
                                this.sectionSize * this.tilesize, this.sectionSize * this.tilesize);
                            ig.Image.drawCount++;
                            this.highestResolutionOnScreen = "mid";
                        }
                        else {
                            // Low res
                            this._low_res_cached = this._low_res_cached || [];
                            this._low_res_cached[sections[i].x] = this._low_res_cached[sections[i].x] || [];
                            if (this._low_res_cached[sections[i].x][sections[i].y]
                                && ig.system.imageZoom >= this.lowResZoomThreshold) {
                                sectionRenderX = sections[i].x * this.tilesize * this.sectionSize;
                                sectionRenderY = sections[i].y * this.tilesize * this.sectionSize;

                                canvas = this._lowResSections[sections[i].x][sections[i].y];

                                ig.system.context.drawImage(canvas,
                                    0, 0,
                                    canvas.width, canvas.height,
                                    sectionRenderX, sectionRenderY,
                                    this.sectionSize * this.tilesize, this.sectionSize * this.tilesize);
                                ig.Image.drawCount++;
                                this.highestResolutionOnScreen = "low";
                            }
                            else {
                                // Very low res
                                this._very_low_res_cached = this._very_low_res_cached || [];
                                this._very_low_res_cached[sections[i].x] = this._very_low_res_cached[sections[i].x] || [];
                                if (this._very_low_res_cached[sections[i].x][sections[i].y]) {
                                    sectionRenderX = sections[i].x * this.tilesize * this.sectionSize;
                                    sectionRenderY = sections[i].y * this.tilesize * this.sectionSize;

                                    canvas = this._veryLowResSections[sections[i].x][sections[i].y];

                                    if (canvas) {
                                        ig.system.context.drawImage(canvas,
                                            0, 0,
                                            canvas.width, canvas.height,
                                            sectionRenderX, sectionRenderY,
                                            this.sectionSize * this.tilesize, this.sectionSize * this.tilesize);
                                        ig.Image.drawCount++;
                                        this.highestResolutionOnScreen = "very low";
                                    }
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Converts from coordinates in isometric space to coordinates in real space.
             * Returns a list containing [x, y].
             */
            isoToReal: function(x, y) {
                return [(x - y) * this.tilesize, (x + y) / 2 * this.tilesize];
            },

            /**
             * Converts from coordinates in screen ("real") space to sectionX and sectionY coordinates, returned as a
             * list containing [sectionX, sectionY].
             * Sections are squares of side length this.sectionSize * this.tilesize.
             * @param realX
             * @param realY
             * @returns {Array}
             */
            realToSection: function(realX, realY) {
                return [Math.floor(realX / (this.sectionSize * this.tilesize)),
                    Math.floor(realY / (this.sectionSize * this.tilesize))];
            }

        })
    }
);