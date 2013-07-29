// This file is intended to be hosted by the SERVER SERVER rather than the CLIENT SERVER.

function VilasFactory() {

}

VilasFactory.prototype = new TileFactory();

VilasFactory.prototype.pieces = {};

VilasFactory.prototype.trees = [
    {
        name: "conifer",
        url: "../media/conifer.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer2",
        url: "../media/conifer.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer3",
        url: "../media/conifer.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer4",
        url: "../media/conifer.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer5",
        url: "../media/conifer.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer_yellow1",
        url: "../media/conifer_yellow1.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer_yellow2",
        url: "../media/conifer_yellow2.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer_blue1",
        url: "../media/conifer_blue1.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "conifer_blue2",
        url: "../media/conifer_blue2.png",
        origin: {
            x: 132,
            y: 219
        },
        extents: {
            width: 50,
            height: 50
        }
    },
    {
        name: "deciduous",
        url: "../media/deciduous.png",
        origin: {
            x: 128,
            y: 233
        },
        extents: {
            width: 100,
            height: 100
        }
    }
    ];

VilasFactory.prototype.houses = [
    {
        name: "house_piece",
        url: "../media/loggyhouse1.png",
        origin: {
            x: 126,
            y: 171
        },
        extents: {
            width: 300,
            height: 300
        }
    }
    ];

VilasFactory.prototype.load = function() {
    var i, self = this;
    for (i = 0; i < this.trees.length; i++) {
        this._loadUrl(this.trees[i].url, this.trees[i], this.trees[i].name);
    }
    for (i = 0; i < this.houses.length; i++) {
        this._loadUrl(this.houses[i].url, this.houses[i], this.houses[i].name);
    }
    this._loaded = false; // We added things that aren't loaded yet
};

/**
 * Starts immediately loading the image from its url argument. loaded() will return true once all
 * images are loaded.
 */
VilasFactory.prototype._loadUrl = function(imageUrl, piece, name) {
    var img = new Image();
    img.onload = function () {
        img._loaded = true;
    };
    // start the <img> loading process by setting the <img> source
    img.src = imageUrl;
    this.pieces[name] = piece;
    this.pieces[name].image = img;
};

VilasFactory.prototype.loaded = function() {
    var i, asset;
    if (this._loaded) {
        return true;
    }
    else { // Iterate through pieces and tiles to see if they are loaded
        for (name in this.pieces) {
            if (this.pieces.hasOwnProperty(name)) {
                if (!this.pieces[name].image._loaded) {
                    return false;
                }
            }
        }
        this._loaded = true;
        return true;
    }
};

/**
 * @param {Number} num_trees The number of trees to place on the tile.
 * @param {Number} num_trees_variance The maximum possible noise on num_trees, which will be +/- an integer from 0 to this.
 * @param {Number} scale The original scale of the pieces on this tile.
 * @param {Number} scale_variance The maximum possible noise on scale. Scale multiplier will be 1 +/- a number from 0 to this number.
 * @param {Number} tilesize The pixel size of the square canvas on which this tile will be drawn.
 * @param {Number} tileType A string representing the shape of the tile (see TileFactory.tileTypes)
 */
VilasFactory.prototype.buildForestTile = function(num_trees, num_trees_variance, scale, scale_variance, tilesize, tileType) {
    var tile, final_num_trees, i, k, piece, location, trees_per_section, dividerMaybe;

    tile = this.startTile("forest", tilesize);

    final_num_trees = num_trees + Math.floor(Math.random() * (num_trees_variance + 1)) * (Math.random() > 0.5 ? 1 : -1);

    trees_per_section = Math.round(final_num_trees / 9);

    this.count = this.count || 0;
    this.count++;
    console.log(this.count);

    for (k = 0; k < 9; k++) {
        dividerMaybe = this.ignoreSectionBecauseTileType(k, tileType)? 10 : 1;
        for (i = 0; i < trees_per_section / dividerMaybe && Math.random() * 2 < (trees_per_section / dividerMaybe); i++) {
            piece = this.getRandomFromArray(this.trees);
            location = this.getUnoccupiedSpace(piece, tile, scale, null, k);
            if (location) {
                this.occupySpace(piece, location.x, location.y, tile, scale);
            }
        }
    }

    return this.finishTile(tile, scale, scale_variance);
};

VilasFactory.prototype.buildForestTileset = function(num_trees, num_trees_variance, scale, scale_variance, tilesize) {
    var i, tile, tiles = [], ieff;
    for (i = 0; i < 50; i++) {
        ieff = (i > 46)? 46 : i;
        tile = this.buildForestTile(num_trees, num_trees_variance, scale, scale_variance, tilesize, this.tileTypes[ieff]);
        tiles.push(tile);
    }
    return tiles;
};

VilasFactory.prototype.buildResidentialTile = function(num_houses, num_houses_variance, num_trees, num_trees_variance,
                                                       scale, scale_variance, tilesize, roundToFraction) {
    var tile, final_num_houses, i, piece, location, final_num_trees;

    tile = this.startTile("residential", tilesize);

    final_num_houses = num_houses + Math.floor(Math.random() * (num_houses_variance + 1)) * (Math.random() > 0.5 ? 1 : -1);

    for (i = 0; i < final_num_houses; i++) {
        piece = this.getRandomFromArray(this.houses);
        location = this.getUnoccupiedSpace(piece, tile, scale, roundToFraction);
        if (location) {
            console.log("Here");
            this.occupySpace(piece, location.x, location.y, tile, scale);
        }
    }

    final_num_trees = num_trees + Math.floor(Math.random() * (num_trees_variance + 1)) * (Math.random() > 0.5 ? 1 : -1);

    for (i = 0; i < final_num_trees; i++) {
        piece = this.getRandomFromArray(this.trees);
        location = this.getUnoccupiedSpace(piece, tile, scale);
        if (location) {
            this.occupySpace(piece, location.x, location.y, tile, scale);
        }
    }

    return this.finishTile(tile, scale, scale_variance);
};