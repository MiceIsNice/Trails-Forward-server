ig.module(
        'game.rect'
    )
    .requires(

    )
    .defines( function() {

        Rect = ig.Class.extend({

            init: function(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            },

            /**
             * Returns true if the point given by x, y intersects with this Rect, false otherwise.
             * @param x
             * @param y
             */
            containsPoint: function(x, y) {
                return ((x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height));
            },

            /**
             * Returns true if the rect object (properties x, y, width, height) intersects with this rect, false
             * otherwise.
             * @param rect An object with x, y, width, and height properties.
             */
            intersects: function(rect) {
                if (rect.x && rect.y && rect.width && rect.height) {
                    if (((rect.x >= this.x && rect.x <= this.x + this.width)
                        || (rect.x + rect.width >= this.x && rect.x + rect.width <= this.x + this.width))
                        && ((rect.y >= this.y && rect.y <= this.y + this.height)
                        || (rect.y + rect.height >= this.y && rect.y + rect.height <= this.y + this.height))) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * @returns {{x: *, y: *}} The top-left corner position of the rect.
             */
            top_left: function() {
                return {x:this.x, y:this.y};
            },

            /**
             * @returns {{x: *, y: *}} The top-center position of the rect.
             */
            top_center: function() {
                return {x:this.x + this.width / 2, y:this.y};
            },

            /**
             * @returns {{x: *, y: *}} The top-right corner position of the rect.
             */
            top_right: function() {
                return {x:this.x + this.width, y:this.y};
            },

            /**
             * @returns {{x: *, y: *}} The middle-left position of the rect.
             */
            mid_left: function() {
                return {x:this.x, y:this.y + this.height / 2};
            },

            /**
             * @returns {{x: *, y: *}} The middle-center position of the rect.
             */
            mid_center: function() {
                return {x:this.x + this.width / 2, y:this.y + this.height / 2};
            },

            /**
             * @returns {{x: *, y: *}} The middle-right position of the rect.
             */
            mid_right: function() {
                return {x:this.x + this.width, y:this.y + this.height / 2};
            },

            /**
             * @returns {{x: *, y: *}} The bottom-left corner position of the rect.
             */
            bottom_left: function() {
                return {x:this.x, y:this.y + this.height};
            },

            /**
             * @returns {{x: *, y: *}} The bottom-center position of the rect.
             */
            bottom_center: function() {
                return {x:this.x + this.width / 2, y:this.y + this.height};
            },

            /**
             * @returns {{x: *, y: *}} The bottom-right corner position of the rect.
             */
            bottom_right: function() {
                return {x:this.x + this.width, y:this.y + this.height};
            },

            /**
             * @returns {{x: *, y: *}} The center position of the rect.
             */
            center: function() {
                return {x:this.x + this.width / 2, y:this.y + this.height / 2};
            }

        });

    });