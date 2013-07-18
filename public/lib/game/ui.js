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
         * Removes the specified instance from the array if it exists.
         */
        removeElement: function(uielement) {
            for (var i = this._elements.length-1; i >= 0; i--) {
                if (this._elements[i] == uielement) {
                    this._elements[i].splice(i, 1);
                    break;
                }
            }
        },

        /**
         * Calls registered UIElements' click() methods when they are clicked. To see how elements are chosen to click,
         * see elementAt(x, y).
         */
        update: function() {
            var elementOfInterest = this.elementAt(ig.input.mouse.x, ig.input.mouse.y);
            if (elementOfInterest) {
                if (ig.input.pressed('click')) { // TODO: Make buttons activate on release rather than press
                    if (!this.clicking) {
                        elementOfInterest.click(ig.input.mouse.x - elementOfInterest.bounds.x,
                            ig.input.mouse.y - elementOfInterest.bounds.y);
                        this.clicking = elementOfInterest;
                    }
                }
                else {
                    this.hoveringOver = elementOfInterest;
                    elementOfInterest.hover(ig.input.mouse.x - elementOfInterest.bounds.x,
                        ig.input.mouse.y - elementOfInterest.bounds.y);
                }
            }
            else {
                if (this.clicking && !ig.input.pressed('click')) {
                    this.clicking.onUnclick();
                    this.clicking = null;
                }
                if (this.hoveringOver) {
                    this.hoveringOver.leave(ig.input.mouse.x - this.hoveringOver.bounds.x,
                        ig.input.mouse.y - this.hoveringOver.bounds.y);
                    this.hoveringOver = null;
                }
            }
        },

        /**
         * Draws all of the UIElements registered with this UI.
         */
        draw: function() {
            for (var i = 0; i < this._elements.length; i++) {
                if (!this._elements[i].hide) {
                    this._elements[i].draw();
                }
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
                if (element.bounds.containsPoint(x, y) && element.hide == false) {
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
            return this.elementAt(x, y);
        }

    })

});