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
                    "media/trees_10_0.png",
                    "media/trees_10_1.png",
                    "media/trees_10_2.png",
                    "media/trees_25_0.png",
                    "media/trees_25_1.png",
                    "media/trees_25_2.png",
                    "media/trees_50_0.png",
                    "media/trees_50_1.png",
                    "media/trees_50_2.png",
                    "media/trees_75_0.png",
                    "media/trees_75_1.png",
                    "media/trees_75_2.png",
                    "media/trees1B_75_0.png",
                    "media/trees1B_75_1.png",
                    "media/trees1B_75_2.png",
                    "media/trees2A_75_0.png",
                    "media/trees2A_75_1.png",
                    "media/trees2A_75_2.png",
                    "media/trees3A_75_0.png",
                    "media/trees3A_75_1.png",
                    "media/trees3A_75_2.png",
                    "media/uibox.png"
                ];
            }

        });

    });