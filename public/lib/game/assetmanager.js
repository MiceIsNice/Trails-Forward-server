ig.module(
    'game.assetmanager'
)
    .requires(

    )
    .defines( function() {

        AssetManager = ig.Class.extend({

            init: function() {
                this._loaded = true; // No assets means we are loaded already
                this.images = {};
                this.numLoaded = 0;

                this._loadAssets();
            },

            /**
             * Starts immediately loading the image from its url argument. loaded() will return true once all
             * images are loaded.
             */
            loadImage: function(imageUrl, name) {
                var img = new Image(), assetManager = this;
                img.onload = function () {
                    img._loaded = true;
                    assetManager.numLoaded++;
                };
                // start the <img> loading process by setting the <img> source
                img.src = imageUrl;
                this.images[name] = img;
                this._loaded = false; // We added something so we're no longer loaded
            },

            /**
             * @returns {boolean} True if the specified asset is loaded, or (no argument) if all assets are loaded,
             * or false otherwise.
             */
            loaded: function(imageName) {
                if (this._loaded) {
                    return true;
                }
                else { // Iterate through pieces and tiles to see if they are loaded
                    if (imageName) {
                        if (this.images[imageName]) {
                            return this.images[imageName]._loaded;
                        }
                        else return false;
                    }
                    else {
                        var image;
                        for (image in this.images) {
                            if (this.images.hasOwnProperty(image)) {
                                if (!image._loaded) {
                                    return false;
                                }
                            }
                        }
                        this._loaded = true;
                        return true;
                    }
                }
            },

            /**
             * Asks the server for a list of {url, type, name} objects to load.
             * @private
             */
            _loadAssets: function() {
                var assetsToLoad = this._getAssetListFromServer(), assetUrl, i, filename;
                for (i = 0; i < assetsToLoad.length; i++) {
                    assetUrl = assetsToLoad[i];
                    filename = assetUrl.replace(/^.*[\\\/]/, '');
                    filename = filename.replace(/\..*/, ''); // remove the trailing filetype, e.g. .png
                    ig.log("Loading asset " + filename + " from " + assetUrl);
                    this.loadImage(assetUrl, filename);
                }
            },

            _getAssetListFromServer: function() {
                return [
                    "media/water.png",
                    "media/grass.png",
                    //"media/grassK.png",
                    "media/trees_10_0.png",
                    "media/uibox.png",
                    "media/button.png",
                    "media/button_hover.png",
                    "media/button_click.png",
                    "media/button_inactive.png",
                    "media/shoreline_A.png",
                    "media/shoreline_B.png",
                    "media/shoreline_C.png",
                    "media/shoreline_D.png",
                    "media/shoreline_E.png",
                    "media/shoreline_F.png",
                    "media/shoreline_G.png",
                    "media/shoreline_H.png",
                    "media/shoreline_I.png",
                    "media/shoreline_J.png",
                    "media/shoreline_K.png",
                    "media/shoreline_L.png",
                    "media/shoreline_M.png",
                    "media/shoreline_N.png",
                    "media/shoreline_O.png",
                    "media/shoreline_P.png",
                    "media/shoreline_Q.png",
                    "media/selection_highlight.png",
                    "media/forest_tileset_heavy.png",
                    "media/forest_tileset_light.png",
                    "media/harvesting_tile.png",
                    "media/contract_picture.png",
                    "media/park_contract_picture.png",
                    "media/mill_contract_picture.png",
                    "media/upgrade_picture.png",
                    "media/sawyer_upgrade_picture.png",
                    "media/ownership_solid.png",
                    "media/ownershipOther_solid.png"
                ];
            }

        });

    });