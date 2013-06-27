
function TileFactory() {

}

/**
 * Starts the construction of a tile and returns it.
 * @param {String} name
 * @param {Number} tilesize The size of the resulting square canvas onto which the tile is drawn. SHOULD be power of 2.
 * @returns {{name: String, tilesize: Number, canvas: HTMLElement, context: CanvasRenderingContext2D, contents: Array}}
 */
TileFactory.prototype.startTile = function(name, tilesize) {
    var canvas, context;
    canvas = document.createElement("canvas");
    canvas.width = tilesize;
    canvas.height = tilesize;
    context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    return {
        name:name,
        tilesize:tilesize,
        canvas:canvas,
        context:context,
        contents:[]
    };
};

/**
 * Returns an object with random coordinates at which an object with the argument extents can fit in the argument tile
 * (without overlapping with any other of that tile's contents).
 * @param {{name: String, url: String, origin: {x: Number, y: Number}, extents: {width: Number, height: Number}}} piece
 * @param {{name: String, tilesize: Number, canvas: HTMLElement, context: CanvasRenderingContext2D, contents: Array}} tile
 * @param {Number} scale
 */
TileFactory.prototype.getUnoccupiedSpace = function(piece, tile, scale) {
    var rect, i, content, count = 0, extents = piece.extents;
    rect = new Rect(0, 0, extents.width * scale, extents.height * scale);
    while (count < 200) {
        rect.x = Math.random() * tile.tilesize - rect.width / 2;
        rect.y = Math.random() * tile.tilesize - rect.height / 2;
        for (i = 0; i < tile.contents.length; i++) {
            content = tile.contents[i];
            if (rect.intersects(new Rect(content.x - content.piece.extents.width / 2,
                content.y - content.piece.extents.height / 2,
                content.piece.extents.width,
                content.piece.extents.height))) {
                break;
            }
            else {
                //console.log("rect " + rect.x + ", " + rect.y + ", " + rect.width + ", " + rect.height
                //    + " does not intersect " + (content.x - content.piece.extents.width / 2) + ", "
                //    + (content.y - content.piece.extents.height / 2) + ", "
                //    + content.piece.extents.width + ", " + content.piece.extents.height);
            }
        }
        if (!(rect.x < 0
            || rect.x + rect.width > tile.tilesize
            || rect.y < 0
            || rect.y + rect.height > tile.tilesize)) {
            if (i == tile.contents.length) { // then we made it through everything and there are no intersections, return it
                return {x:rect.x + rect.width / 2, y:rect.y + rect.height / 2};
            }
        }
        count++;
    }
    console.log("getUnoccupiedSpace() failed: No suitable location found.");
    return null;
};

/**
 *
 * @param {{name: String, url: String, origin: {x: Number, y: Number}, extents: {width: Number, height: Number}}} piece
 * @param {Number} x
 * @param {Number} y
 * @param {{name: String, tilesize: Number, canvas: HTMLElement, context: CanvasRenderingContext2D, contents: Array}} tile
 * @param {Number} scale
 */
TileFactory.prototype.occupySpace = function(piece, x, y, tile, scale) {
    var newPiece = {
        name:piece.name,
        url:piece.url,
        origin: {
            x:piece.origin.x,
            y:piece.origin.y
        },
        extents: {
            width:piece.extents.width * scale,
            height:piece.extents.height * scale
        },
        image:piece.image
    };
    tile.contents.push({x:x, y:y, piece:newPiece});
};

/**
 *
 * @param {{name: String, tilesize: Number, canvas: HTMLElement, context: CanvasRenderingContext2D, contents: Array}} tile
 * @param{Number} scale The original scale of the pieces on this tile.
 * @param {Number} scale_variance The maximum possible noise on scale. Scale multiplier will be 1 +/- a number from 0 to this number.
 * @returns {*} The finished tile, its canvas property drawn to and everything.
 */
TileFactory.prototype.finishTile = function(tile, scale, scale_variance) {
    var final_scale, content, realX, realY, i;
    // This comparison function is not very complicated, even though it might look it. First you calculate the Y
    // coordinates of the items to compare given their coordinates in isometric space. Then you're done, really: when
    // viewing an isometric grid, objects further down in their real-space Y-coordinate are closer to the camera and
    // should be stored later so that they are drawn later. So this just compares those Y-coordinates.
    tile.contents.sort(function(a, b) {
        return (a.x + a.y) / 2 - (b.x + b.y) / 2;
    });

    // Now that the contents are sorted, iterate through them and draw them to the tile's canvas isometrically.
    // (Note: The contents are stored non-isometrically to simplify a bajillion things. Waaaay easier that way.)
    for (i = 0; i < tile.contents.length; i++) {

        final_scale = scale + Math.random() * (scale_variance) * (Math.random() > 0.5 ? 1 : -1);

        content = tile.contents[i];
        realX = (content.x - content.y) / 2;
        realY = (content.x + content.y) / 4;

        realX += tile.tilesize / 2;
        realY += tile.tilesize / 4;

        if (this.loaded()) {
            tile.context.drawImage(content.piece.image,
                0, 0,
                content.piece.image.width, content.piece.image.height,
                realX - content.piece.origin.x * final_scale, realY - content.piece.origin.y * final_scale,
                content.piece.image.width * final_scale, content.piece.image.height * final_scale
            );
            //tile.context.beginPath();
            //tile.context.strokeRect(content.x - content.piece.extents.width / 2, content.y - content.piece.extents.height / 2,
            //    content.piece.extents.width, content.piece.extents.height);
            //console.log("Just stroked rect"
            //    + ", " + (content.x - content.piece.extents.width / 2)
            //    + ", " + (content.y - content.piece.extents.height / 2)
            //    + ", " + (content.x - content.piece.extents.width / 2 + content.piece.extents.width)
            //    + ", " + (content.y - content.piece.extents.height / 2 + content.piece.extents.height));
        }
        else {
            console.log("Images not all loaded! Wait a little bit and try again.");
            break;
        }
    }

    return tile;
};

/**
 * Self-explanatory.
 * @param {Array} array
 */
TileFactory.prototype.getRandomFromArray = function(array) {
    return array[Math.floor(Math.random() * array.length)];
};

// Rectangles are useful.
Rect = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};

/**
 * Returns true if the point given by x, y intersects with this Rect, false otherwise.
 * @param x
 * @param y
 */
Rect.prototype.containsPoint = function(x, y) {
    return ((x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height));
};

/**
 * Returns true if the rect object (properties x, y, width, height) intersects with this rect, false
 * otherwise.
 * @param rect An object with x, y, width, and height properties.
 */
Rect.prototype.intersects = function(rect) {
    if (rect.x && rect.y && rect.width && rect.height) {
        return !(this.x + this.width < rect.x
            || this.y + this.height < rect.y
            || this.x > rect.x + rect.width
            || this.y > rect.y + rect.height);
    }
    else {
        console.log("Invalid rect, couldn't do intersection method");
    }
    return false;
};

/**
 * @returns {{x: *, y: *}} The top-left corner position of the rect.
 */
Rect.prototype.top_left = function() {
    return {x:this.x, y:this.y};
};

/**
 * @returns {{x: *, y: *}} The top-center position of the rect.
 */
Rect.prototype.top_center = function() {
    return {x:this.x + this.width / 2, y:this.y};
};

/**
 * @returns {{x: *, y: *}} The top-right corner position of the rect.
 */
Rect.prototype.top_right = function() {
    return {x:this.x + this.width, y:this.y};
};

/**
 * @returns {{x: *, y: *}} The middle-left position of the rect.
 */
Rect.prototype.mid_left = function() {
    return {x:this.x, y:this.y + this.height / 2};
};

/**
 * @returns {{x: *, y: *}} The middle-center position of the rect.
 */
Rect.prototype.mid_center = function() {
    return {x:this.x + this.width / 2, y:this.y + this.height / 2};
};

/**
 * @returns {{x: *, y: *}} The middle-right position of the rect.
 */
Rect.prototype.mid_right = function() {
    return {x:this.x + this.width, y:this.y + this.height / 2};
};

/**
 * @returns {{x: *, y: *}} The bottom-left corner position of the rect.
 */
Rect.prototype.bottom_left = function() {
    return {x:this.x, y:this.y + this.height};
};

/**
 * @returns {{x: *, y: *}} The bottom-center position of the rect.
 */
Rect.prototype.bottom_center = function() {
    return {x:this.x + this.width / 2, y:this.y + this.height};
};

/**
 * @returns {{x: *, y: *}} The bottom-right corner position of the rect.
 */
Rect.prototype.bottom_right = function() {
    return {x:this.x + this.width, y:this.y + this.height};
};

/**
 * @returns {{x: *, y: *}} The center position of the rect.
 */
Rect.prototype.center = function() {
    return {x:this.x + this.width / 2, y:this.y + this.height / 2};
};