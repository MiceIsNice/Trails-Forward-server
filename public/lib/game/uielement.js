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
         */
        init: function(bounds) {
            this.bounds = bounds;
            this._loaded = false;
            this._children = [];
            this._parent = null;
        },

        /**
         * Enables nine patching for this UIElement. Without nine patching, images will stretch in their entirety to
         * fit the element's bounds.
         * @param x1 The distance in pixels from the left edge of the image to the left edge of the center face patch
         * @param x2 The distance in pixels from the right edge of the image to the right edge of the center face patch
         * @param y1 The distance in pixels from the top edge of the image to the top edge of the center face patch
         * @param y2 The distance in pixels from the bottom edge of the image to the bottom edge of the center face patch
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
         * Sets the url of the image asset to load upon the load() call. Kept separate from actual loading so you can
         * handle loading in your code however you want to - separated out, or all at once.
         */
        setImageSrc: function(imageUrl) {
            this.imageUrl = imageUrl;
        },

        /**
         * @returns {boolean} True if the element's load-requiring properties (its image, for instance, if it has one)
         * are loaded. If no image is set, returns true, since there isn't anything else in default UIElements that need
         * loading.
         */
        isLoaded: function() {
            if (this.imageUrl) {
                return this._loaded;
            }
            else return true;
        },

        /**
         * Does absolutely nothing, but calls click(x, y) on any _children this element has. You should call
         * parent.click(x, y) when you overwrite this.
         * @param x The x coordinate of the click relative to the top-left corner of this element's bounds
         * @param y The y coordinate of the click relative to the top-left corner of this element's bounds
         */
        click: function(x, y) {
            var child;
            if (this._children.length > 0) {
                for (var i = 0; i < this._children.length; i++) {
                    child = this._children[i];
                    child.click(x - child.bounds.x, y - child.bounds.y);
                }
            }
        },

        /**
         * Starts loading the image set via the setImageSrc method. this.isLoaded() will return true once it's done.
         */
        load: function() {
            var self = this;
            var img = new Image();
            img.onload = function () {
                img._loaded = true;
                self._loaded = true;
            };
            // start the <img> loading process
            img.src = this.imageUrl;
            this.image = img;
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
                parentOffsetX = this._parent.bounds.x;
                parentOffsetY = this._parent.bounds.y;
                if (this._parent._ninePatch) {
                    parentOffsetX += this._parent._ninePatchData.x1;
                    parentOffsetY += this._parent._ninePatchData.y1;
                }
            }

            // Draw images if they exist / are loaded
            if (this._loaded) {
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

            // Draw any text
            if (this._usingText) {
                this._font.draw(this._textFunction(), this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY, this._fontAlign);
            }

            // Draw any children
            if (this._children.length > 0) {
                for (var i = 0; i < this._children.length; i++) {
                    this._children[i].draw();
                }
            }
        }

    })

});