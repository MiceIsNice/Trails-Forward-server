ig.module(
        'game.ui'
    )
    .requires(
        'game.uielement'
    )
    .defines (function() {

    UI = ig.Class.extend({

        init: function() {
            this._elements = [];
        },

        /**
         * @param {UIElement} uielement The element to add to the base UI hierarchy. No need to add elements that are already _children
         * of other UIElements.
         */
        addElement: function(uielement) {
            this._elements.push(uielement);
        },

        /**
         * Calls registered UIElements' click() methods when they are clicked. To see how elements are chosen to click,
         * see elementAt(x, y).
         */
        update: function() {
            if (ig.input.pressed('click')) { // TODO: Make buttons activate on release rather than press
                var elementClicked = this.elementAt(ig.input.mouse.x, ig.input.mouse.y);
                if (elementClicked) {
                    elementClicked.click(ig.input.mouse.x - elementClicked.bounds.x,
                        ig.input.mouse.y - elementClicked.bounds.y);
                }
            }
        },

        /**
         * Draws all of the UIElements registered with this UI.
         */
        draw: function() {
            for (var i = 0; i < this._elements.length; i++) {
                this._elements[i].draw();
            }
        },

        /**
         * @param x X coordinate to test for an element
         * @param y Y coordinate to test for an element
         * @returns {UIElement} The top-most element in the elements stack at the argument point, or null if there is no
         * such element.
         */
        elementAt: function(x, y) {
            for (var i = this._elements.length - 1; i >= 0; i--) { // iterate in reverse because we want the top-most
                var element = this._elements[i];
                if (element.bounds.containsPoint(x, y)) {
                    return element;
                }
            }
            return null;
        },

        /**
         * @param x X coordinate of the point to test.
         * @param y Y coordinate of the point to test.
         * @returns {boolean} True if the argument point overlaps with the bounding box of a UIElement registered with this UI.
         */
        overlaps: function(x, y) {
            if (this.elementAt(x, y)) {
                return true;
            }
            return false;
        }

    })

});