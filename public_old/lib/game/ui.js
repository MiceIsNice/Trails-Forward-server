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
            this.updatingElements = [];
            this.longHoverTimeMs = 1000;
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
            var elementOfInterest = this.elementAt(ig.input.mouse.x, ig.input.mouse.y), i;
            if (elementOfInterest) {
                if (ig.input.pressed('click')) {
                    if (!this.clicking) {
                        elementOfInterest.click(ig.input.mouse.x - elementOfInterest.bounds.x,
                            ig.input.mouse.y - elementOfInterest.bounds.y);
                        this.clicking = elementOfInterest;
                    }
                }
                else if (ig.input.state('click') && this.clicking == elementOfInterest) {
                    elementOfInterest.hold(ig.input.mouse.x - elementOfInterest.bounds.x,
                        ig.input.mouse.y - elementOfInterest.bounds.y);
                }
                else if (ig.input.state('click') && this.clicking) {
                    this.clicking.hold(ig.input.mouse.x - this.clicking.bounds.x,
                        ig.input.mouse.y - this.clicking.bounds.y);
                }
                else if (!this.hoveringOver) {
                    elementOfInterest.enter(ig.input.mouse.x - elementOfInterest.bounds.x,
                        ig.input.mouse.y - elementOfInterest.bounds.y);
                    this.hoveringOver = elementOfInterest;
                }
                else if (elementOfInterest == this.hoveringOver) {
                    this.oldMouseX = this.oldMouseX || 0;
                    this.oldMouseY = this.oldMouseY || 0;
                    elementOfInterest.hover(ig.input.mouse.x - elementOfInterest.bounds.x,
                    ig.input.mouse.y - elementOfInterest.bounds.y);
                    if (ig.input.mouse.x == this.oldMouseX && ig.input.mouse.y == this.oldMouseY) {
                        var delta = time.stop("hoverTimer");
                        time.start("hoverTimer");
                        this.elapsedHovering = this.elapsedHovering || 0;
                        this.elapsedHovering += delta;
                        if (this.elapsedHovering >= this.longHoverTimeMs) {
                            this.isLongHovering = true;
                            elementOfInterest.longHover(this.oldMouseX - elementOfInterest.bounds.x,
                                this.oldMouseY - elementOfInterest.bounds.y);
                        }
                    }
                    else {
                        this.elapsedHovering = 0;
                        if (this.isLongHovering) {
                            elementOfInterest.unLongHover(ig.input.mouse.x - elementOfInterest.bounds.x,
                                ig.input.mouse.y - elementOfInterest.bounds.y);
                            this.isLongHovering = false;
                        }
                    }
                    this.oldMouseX = ig.input.mouse.x;
                    this.oldMouseY = ig.input.mouse.y;
                }
                else if (this.hoveringOver) {
                    this.hoveringOver.leave();
                    this.elapsedHovering = 0;
                    if (this.isLongHovering) {
                        this.hoveringOver.unLongHover(ig.input.mouse.x - this.hoveringOver.bounds.x,
                            ig.input.mouse.y - this.hoveringOver.bounds.y);
                        this.isLongHovering = false;
                    }
                    this.hoveringOver = elementOfInterest;
                    elementOfInterest.enter();
                }
            }
            else if (ig.input.state('click') && this.clicking) {
                this.clicking.hold(ig.input.mouse.x - this.clicking.bounds.x,
                    ig.input.mouse.y - this.clicking.bounds.y);
            }
            else {
                if (this.hoveringOver) {
                    this.hoveringOver.leave();
                    this.hoveringOver = null;
                }
            }
            if (this.clicking && ig.input.released('click')) {
                this.clicking.unclick(ig.input.mouse.x - this.clicking.bounds.x,
                    ig.input.mouse.y - this.clicking.bounds.y);
                this.clicking = null;
            }

            for (i = 0; i < this.updatingElements.length; i++) {
                this.updatingElements[i].update();
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
                if (element.bounds.containsPoint(x, y) && !element.hide) {
                    return element.childMostAt(x - element.bounds.x, y - element.bounds.y);
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