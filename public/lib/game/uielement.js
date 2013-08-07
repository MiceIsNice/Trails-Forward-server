ig.module(
        'game.uielement'
    )
    .requires(
        'impact.font'
    )
    .defines (function() {

    UIElement = ig.Class.extend({

        /**
         * @param bounds The bounding box of this UIElement. If the element has an image, it will stretch to fit the bounds.
         * @optional @param textFunction
         * @param font
         * @param fontAlign
         * @param imageName
         * @param ninePatchX1
         * @param ninePatchX2
         * @param ninePatchY1
         * @param ninePatchY2
         * @param onClick
         * @param onUnclick
         * @param onEnter
         * @param onHover
         * @param onLeave
         * @param onHold
         */
        init: function(bounds, textFunction, font, fontAlign, imageName,
                       ninePatchX1, ninePatchX2, ninePatchY1, ninePatchY2, onClick, onUnclick, onEnter, onHover,
                       onLeave, onHold) {
            this.bounds = bounds;
            this._loaded = false;
            this._children = [];
            this._parent = null;
            this.hide = false;
            this.assetManager = ig.game.assetManager;
            if (textFunction && font && fontAlign) {
                this.enableText(textFunction, font, fontAlign);
            }
            if (imageName) {
                this.setImage(imageName);
            }
            if (ninePatchX1 && ninePatchX2 && ninePatchY1 && ninePatchY2) {
                this.enableNinePatch(ninePatchX1, ninePatchX2, ninePatchY1, ninePatchY2);
            }
            if (onClick && typeof onClick === "function") {
                this.onClick = onClick;
            }
            if (onUnclick && typeof onUnclick === "function") {
                this.onUnclick = onUnclick;
            }
            if (onEnter && typeof onEnter === "function") {
                this.onEnter = onEnter;
            }
            if (onHover && typeof onHover === "function") {
                this.onHover = onHover;
            }
            if (onLeave && typeof onLeave === "function") {
                this.onLeave = onLeave;
            }
            if (onHold && typeof onHold === "function") {
                this.onHold = onHold;
            }
        },

        /**
         * Enables nine patching for this UIElement. Without nine patching, images will stretch in their entirety to
         * fit the element's bounds.
         * @param x1 The distance in pixels from the left edge of the image to the left edge of the center face patch
         * @param x2 The distance in pixels from the left edge of the image to the right edge of the center face patch
         * @param y1 The distance in pixels from the top edge of the image to the top edge of the center face patch
         * @param y2 The distance in pixels from the top edge of the image to the bottom edge of the center face patch
         */
        enableNinePatch: function(x1, x2, y1, y2) {
            this._ninePatch = true;
            this._ninePatchData = {
                x1:x1,
                x2:x2,
                y1:y1,
                y2:y2
            };
        },

        /**
         * Disables nine patching for this UIElement. It's probably rare that you would ever need this function, but
         * what the hey, might as well be feature-complete.
         */
        disableNinePatch: function() {
            this._ninePatch = false;
        },

        /**
         * Enables the displaying of text for this UIElement.
         * @param textFunction A function that returns a string of text to display.
         * @param {ig.Font} font The font with which to display the text (will be calling font.draw())
         * @param {ig.Font.ALIGN} fontAlign The alignment style of the font.
         */
        enableText: function(textFunction, font, fontAlign) {
            this._textFunction = textFunction;
            this._font = font;
            if (fontAlign) {
                this._fontAlign = fontAlign;
            }
            this._usingText = true;
        },

        /**
         * Disables the displaying of text for this UIElement.
         */
        disableText: function() {
            this._usingText = false;
        },

        /**
         * @param {UIElement} child The child UIElement to add as this element's child.
         */
        addChild: function(child) {
            this._children.push(child);
            child._parent = this;
        },

        /**
         * Removes the specified instance from the child array if it exists.
         */
        removeChild: function(child) {
            for (var i = this._children.length-1; i >= 0; i--) {
                if (this._children[i] == child) {
                    this._children[i].splice(i, 1);
                    break;
                }
            }
            child._parent = null;
        },

        /**
         * Removes all children from this UIElement.
         */
        clearChildren: function() {
            for (var i = this._children.length - 1; i >= 0; i--) {
                this._children[i]._parent = null;
            }
            this._children = [];
        },

        /**
         * @param x X coordinate of the testing point in this element's space
         * @param y Y coordinate of the testing point in this element's space
         * @returns {UIElement} The first leaf of the interface tree that overlaps with the argument mouse coordinates.
         */
        childMostAt: function(x, y) {
            var i, child;
            for (i = 0; i <  this._children.length; i++) {
                child = this._children[i];
                if (child.bounds.containsPoint(x, y)) {
                    return child.childMostAt(x - child.bounds.x, y - child.bounds.y);
                }
            }
            return this;
        },

        /**
         * Sets the name of the image asset for this UIElement. Should match the name of an image in the AssetManager.
         */
        setImage: function(imageName) {
            if (this.assetManager) {
                this.imageName = imageName;
            }
        },

        /**
         * @returns {boolean} True if the element's load-requiring properties (its image, for instance, if it has one)
         * are loaded. If no image is set, returns true, since there isn't anything else in default UIElements that need
         * loading.
         */
        loaded: function() {
            if (this._loaded) {
                return true;
            }
            else {
                if (this.assetManager && this.imageName) {
                    var loaded = this.assetManager.loaded(this.imageName);
                    this._loaded = loaded;
                    return loaded;
                }
                else {
                    this._loaded = true;
                    return true;
                }
            }
        },

        /**
         * Calls this.onClick().
         * @param x The x coordinate of the click relative to the top-left corner of this element's bounds
         * @param y The y coordinate of the click relative to the top-left corner of this element's bounds
         */
        click: function(x, y) {
            if (this._parent) {
                this._parent.click(x + this.bounds.x, y + this.bounds.y);
            }
            if (this.onClick && typeof this.onClick === "function") {
                this.onClick(x, y);
            }
        },

        /**
         * Calls this.onUnclick() if it exists. Called when the user lets go of the mouse-button
         * after clicking this element.
         */
        unclick: function(x, y) {
            if (this._parent) {
                this._parent.unclick(x + this.bounds.x, y + this.bounds.y);
            }
            if (this.onUnclick && typeof this.onUnclick === "function") {
                this.onUnclick(x, y);
            }
        },

        /**
         * Calls this.onEnter() if it exists. Called when the mouse hovers over the element.
         * @param x The x coordinate of the mouse relative to the top-left corner of this element's bounds
         * @param y The y coordinate of the mouse relative to the top-left corner of this element's bounds
         */
        enter: function(x, y) {
            if (this.onEnter && typeof this.onEnter === "function") {
                this.onEnter(x, y);
            }
        },

        /**
         * Calls this.onHover() if it exists. Called when the mouse hovers over the element.
         * @param x The x coordinate of the mouse relative to the top-left corner of this element's bounds
         * @param y The y coordinate of the mouse relative to the top-left corner of this element's bounds
         */
        hover: function(x, y) {
            if (this._parent && this.hoverPassThrough) {
                this._parent.hover(x + this.bounds.x, y + this.bounds.y);
            }
            if (this.onHover && typeof this.onHover === "function") {
                this.onHover(x, y);
            }
        },

        /**
         * Calls this.onLeave() if it exists. Called when the mouse stops hovering over the element.
         */
        leave: function() {
            if (this._parent && this.hoverPassThrough) {
                this._parent.leave();
            }
            if (this.onLeave && typeof this.onLeave === "function") {
                this.onLeave();
            }
        },

        /**
         * Calls this.onHold(x, y) if it exists and calls
         * @returns {*}
         */
        hold: function(x, y) {
            if (this.onHold && typeof this.onHold === "function") {
                this.onHold(x, y);
            }
        },

        /**
         * Calls this.onLongHover() if it exists, which occurs when the mouse hovers over an element without moving
         * for one second.
         * If longHover() is being called, hover() is too.
         * @param x
         * @param y
         */
        longHover: function(x, y) {
            if (this._parent && this.hoverPassThrough) {
                this._parent.longHover(x + this.bounds.x, y + this.bounds.y);
            }
            if (this.onLongHover && typeof this.onLongHover === "function") {
                this.onLongHover(x, y);
            }
        },

        /**
         * Calls this.onUnLongHover() if it exists, which occurs when the mouse starts moving after holding long
         * enough to start a longHover.
         * Note: An unLongHover is guaranteed if there is a leave() during a longHover, but an unLongHover does not
         * necessarily imply a leave().
         * @param x
         * @param y
         */
        unLongHover: function(x, y) {
            if (this._parent && this.hoverPassThrough) {
                this._parent.unLongHover(x + this.bounds.x, y + this.bounds.y);
            }
            if (this.onUnLongHover && typeof this.onUnLongHover === "function") {
                this.onUnLongHover(x, y);
            }
        },

        getOffsetX: function() {
            if (this._parent) {
                return this._parent.getOffsetX() + this.bounds.x;
            }
            else return this.bounds.x;
        },

        getOffsetY: function() {
            if (this._parent) {
                return this._parent.getOffsetY() + this.bounds.y;
            }
            else return this.bounds.y;
        },

        getInnerWidth: function() {
            return this.bounds.width
                - ((this._ninePatch)? (this._ninePatchData.x1 + this._ninePatchData.x2 - this.bounds.width) : 0);
        },

        /**
         * Draws this UIElement relative to its parent (if it has one), and then draws all of its _children (if it has
         * any).
         */
        draw: function() {
            var ctx = ig.system.context,
                parentOffsetX = 0, parentOffsetY = 0;

            // Draw relative to parent position if a parent exists
            if (this._parent) {
                parentOffsetX = this._parent.getOffsetX();
                parentOffsetY = this._parent.getOffsetY();
                if (this._parent._ninePatch) {
                    parentOffsetX += this._parent._ninePatchData.x1;
                    parentOffsetY += this._parent._ninePatchData.y1;
                }
            }

            // Draw images if they exist / are loaded
            if (this.loaded()) {
                if (this.assetManager && this.imageName && this.assetManager.images[this.imageName]) {
                    this.image = this.assetManager.images[this.imageName];
                    if (this._ninePatch) {
                        // For nine patch elements, draw all nine patches separately
                        // Upper left
                        ctx.drawImage(this.image,
                            0, 0,
                            this._ninePatchData.x1, this._ninePatchData.y1,
                            this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY,
                            this._ninePatchData.x1, this._ninePatchData.y1);
                        // Upper right
                        ctx.drawImage(this.image,
                            this._ninePatchData.x2, 0,
                            this.image.width - this._ninePatchData.x2, this._ninePatchData.y1,
                            this.bounds.x + parentOffsetX + this.bounds.width - (this.image.width - this._ninePatchData.x2),
                            this.bounds.y + parentOffsetY,
                            this.image.width - this._ninePatchData.x2, this._ninePatchData.y1);
                        // Lower left
                        ctx.drawImage(this.image,
                            0, this._ninePatchData.y2,
                            this._ninePatchData.x1, this.image.height - this._ninePatchData.y2,
                            this.bounds.x + parentOffsetX,
                            this.bounds.y + parentOffsetY + this.bounds.height - (this.image.height - this._ninePatchData.y2),
                            this._ninePatchData.x1, this.image.height - this._ninePatchData.y2);
                        // Lower right
                        ctx.drawImage(this.image,
                            this._ninePatchData.x2, this._ninePatchData.y2,
                            this.image.width - this._ninePatchData.x2, this.image.height - this._ninePatchData.y2,
                            this.bounds.x + parentOffsetX + this.bounds.width - (this.image.width - this._ninePatchData.x2),
                            this.bounds.y + parentOffsetY + this.bounds.height - (this.image.height - this._ninePatchData.y2),
                            this.image.width - this._ninePatchData.x2, this.image.height - this._ninePatchData.y2);
                        // Left edge
                        ctx.drawImage(this.image,
                            0, this._ninePatchData.y1,
                            this._ninePatchData.x1, this.image.height - this._ninePatchData.y2,
                            this.bounds.x + parentOffsetX,
                            this.bounds.y + parentOffsetY + this._ninePatchData.y1,
                            this._ninePatchData.x1, this.bounds.height - this._ninePatchData.y1 - (this.image.height - this._ninePatchData.y2));
                        // Right edge
                        ctx.drawImage(this.image,
                            this._ninePatchData.x2, this._ninePatchData.y1,
                            this.image.width - this._ninePatchData.x2, this._ninePatchData.y2 - this._ninePatchData.y1,
                            this.bounds.x + parentOffsetX + this.bounds.width - (this.image.width - this._ninePatchData.x2),
                            this.bounds.y + parentOffsetY + this._ninePatchData.y1,
                            this.image.width - this._ninePatchData.x2, this.bounds.height - this._ninePatchData.y1 - (this.image.height - this._ninePatchData.y2));
                        // Top edge
                        ctx.drawImage(this.image,
                            this._ninePatchData.x1, 0,
                            this._ninePatchData.x2 - this._ninePatchData.x1, this._ninePatchData.y1,
                            this.bounds.x + parentOffsetX + this._ninePatchData.x1,
                            this.bounds.y + parentOffsetY,
                            this.bounds.width - this._ninePatchData.x1 - (this.image.width - this._ninePatchData.x2), this._ninePatchData.y1);
                        // Bottom edge
                        ctx.drawImage(this.image,
                            this._ninePatchData.x1, this._ninePatchData.y2,
                            this._ninePatchData.x2 - this._ninePatchData.x1, this.image.height - this._ninePatchData.y2,
                            this.bounds.x + parentOffsetX + this._ninePatchData.x1,
                            this.bounds.y + parentOffsetY + this.bounds.height - (this.image.height - this._ninePatchData.y2),
                            this.bounds.width - this._ninePatchData.x1 - (this.image.width - this._ninePatchData.x2), this.image.height - this._ninePatchData.y2);
                        // Center face
                        ctx.drawImage(this.image,
                            this._ninePatchData.x1, this._ninePatchData.y1,
                            this._ninePatchData.x2 - this._ninePatchData.x1, this._ninePatchData.y2 - this._ninePatchData.y1,
                            this.bounds.x + parentOffsetX + this._ninePatchData.x1,
                            this.bounds.y + parentOffsetY + this._ninePatchData.y1,
                            this.bounds.width - this._ninePatchData.x1 - (this.image.width - this._ninePatchData.x2),
                            this.bounds.height - this._ninePatchData.y1 - (this.image.height - this._ninePatchData.y2));
                    }
                    else {
                        ctx.drawImage(this.image,
                            0, 0,
                            this.image.width, this.image.height,
                            this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY,
                            this.bounds.width, this.bounds.height);
                    }
                }
            }

            // Draw any text
            if (this._usingText) {
                this._font.draw(this.formatText(this._textFunction()), this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY, this._fontAlign);
            }

            // Draw any children
            if (this._children.length > 0) {
                for (var i = 0; i < this._children.length; i++) {
                    if (!this._children[i].hide) {
                        this._children[i].draw();
                    }
                }
            }
        },

        /**
         * Adds newlines to the argument string.
         * @param {String} text
         * @returns {String} A line-breakified string based on this.bounds.width.
         */
        formatText: function(text) {
            var buffer = "", temp, pos = 0, moartemp;
            if (this.bounds.width > 10) {
                while (true) {
                    moartemp = text.indexOf(" ", pos+1);
                    if (moartemp == -1) {
                        temp = text.substring(pos);
                    }
                    else temp = text.substring(pos, moartemp);
                    if (ig.game.font.widthForString(buffer+temp) > this.bounds.width) {
                        buffer += "\n";
                        temp = temp.substring(1);
                    }
                    buffer += temp;
                    pos = text.indexOf(" ", pos+1);
                    if (pos == -1) break;
                }
                return buffer;
            }
            else return text;
        }

    })

});