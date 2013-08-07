ig.module(
        'game.panel'
    )
    .requires(
        'game.uielement'
    )
    .defines (function() {

    /**
     * Panels are UIElements whose children are drawn clipped into the bounds of the Panel.
     * Panels can be given offset values that offset globally where its children are drawn.
     */
    Panel = UIElement.extend({

        init: function(bounds, panelImage, ninePatchData) {
            this.parent(bounds);
            this.setImage(panelImage);
            if (ninePatchData) {
                this.enableNinePatch(ninePatchData[0], ninePatchData[1], ninePatchData[2], ninePatchData[3]);
            }
            this.offset = {x:0, y:0};
        },

        /**
         * Adds the parameters to the panel's current offset.
         * @param x
         * @param y
         */
        shiftOffset: function(x, y) {
            this.offset.x += x;
            this.offset.y += y;
        },

        /**
         * Draws this ScrollField relative to its parent (if it has one), and then draws all of its _children (if it has
         * any). ScrollFields clip their children!
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
                this._font.draw(this._textFunction(), this.bounds.x + parentOffsetX, this.bounds.y + parentOffsetY, this._fontAlign);
            }

            // Draw any children clipped to the bounds of the panel and offset by the offset
            if (this._children.length > 0) {
                ctx.save();
                ctx.translate(this.offset.x, this.offset.y);
                ctx.rect(this.bounds.x + this.getOffsetX(), this.bounds.y + this.getOffsetY(), this.bounds.width, this.bounds.height);
                ctx.clip();
                for (var i = 0; i < this._children.length; i++) {
                    if (!this._children[i].hide) {
                        this._children[i].draw();
                    }
                }
                ctx.restore();
            }
        }

    });

});