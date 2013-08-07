ig.module(
        'game.scrollfield'
    )
    .requires(
        'game.uielement',
        'game.panel'
    )
    .defines (function() {

    ScrollField = UIElement.extend({

        init: function(bounds, scrollButtonImage, scrollButtonHoverImage, scrollButtonClickImage,
                       scrollButtonNinePatchData, scrollBarUIBox, scrollBarUIBoxNinePatchData,
                       contentPanelUIBox, contentPanelNinePatchData, ui) {
            var self = this;
            this.parent(bounds);
            this.buttonImage = scrollButtonImage;
            this.buttonHoverImage = scrollButtonHoverImage;
            this.buttonClickImage = scrollButtonClickImage;
            this.scrollBarUIBox = scrollBarUIBox;

            this.size = 16;
            this.clickScrollSpeed = 20;
            this.holdScrollSpeed = 2;

            this.horizontalScrollBar = new UIElement(new Rect(0, this.bounds.height - this.size, this.bounds.width - this.size, this.size));
            //this.horizontalScrollBar.hide = true;
            this.verticalScrollBar = new UIElement(new Rect(this.bounds.width - this.size, 0, this.size, this.bounds.height - this.size));
            //this.verticalScrollBar.hide = true;
            this.addChild(this.horizontalScrollBar);
            this.addChild(this.verticalScrollBar);

            this.horizontalCenterBar = new UIElement(
                new Rect(
                    this.size, 0,
                    (this.horizontalScrollBar.bounds.width - this.size * 2) *
                        (this.horizontalScrollBar.bounds.width - this.size * 2) / this.getHorizontalScrollMax(),
                    this.size
                )
            );
            this.horizontalCenterBar.setImage(this.scrollBarUIBox);
            this.horizontalCenterBar.enableNinePatch(
                scrollBarUIBoxNinePatchData[0],
                scrollBarUIBoxNinePatchData[1],
                scrollBarUIBoxNinePatchData[2],
                scrollBarUIBoxNinePatchData[3]
            );
            this.horizontalCenterBar.onClick = function(x, y) {
                self.horizontalStartPosition = x;
            };
            this.horizontalCenterBar.onHold = function(x, y) {
                self.horizontalAdvanceBy(x - self.horizontalStartPosition);
            };
            this.horizontalScrollBar.addChild(this.horizontalCenterBar);

            this.verticalCenterBar = new UIElement(
                new Rect(
                    0, this.size, this.size,
                    (this.verticalScrollBar.bounds.height - this.size * 2) *
                        (this.verticalScrollBar.bounds.height - this.size * 2) / this.getVerticalScrollMax()
                )
            );
            this.verticalCenterBar.setImage(this.scrollBarUIBox);
            this.verticalCenterBar.enableNinePatch(
                scrollBarUIBoxNinePatchData[0],
                scrollBarUIBoxNinePatchData[1],
                scrollBarUIBoxNinePatchData[2],
                scrollBarUIBoxNinePatchData[3]
            );
            this.verticalCenterBar.onClick = function(x, y) {
                self.verticalStartPosition = y;
            };
            this.verticalCenterBar.onHold = function(x, y) {
                self.verticalAdvanceBy(y - self.verticalStartPosition);
            };
            this.verticalScrollBar.addChild(this.verticalCenterBar);

            this.horizontalRootButton = new Button(
                new Rect(
                    0, 0, this.size, this.size
                ),
                this.buttonImage,
                this.buttonHoverImage,
                this.buttonClickImage,
                function() {
                    self.horizontalRegressBy(self.clickScrollSpeed);
                },
                undefined,
                scrollButtonNinePatchData
            );
            this.horizontalScrollBar.addChild(this.horizontalRootButton);

            this.horizontalRootButton.onHold = function(x, y) {
                self.horizontalRegressBy(self.holdScrollSpeed);
            };

            this.horizontalTipButton = new Button(
                new Rect(
                    self.horizontalScrollBar.bounds.width - this.size, 0, this.size, this.size
                ),
                this.buttonImage,
                this.buttonHoverImage,
                this.buttonClickImage,
                function() {
                    self.horizontalAdvanceBy(20);
                },
                undefined,
                scrollButtonNinePatchData
            );
            this.horizontalScrollBar.addChild(this.horizontalTipButton);

            this.horizontalTipButton.onHold = function(x, y) {
                self.horizontalAdvanceBy(self.holdScrollSpeed);
            };

            this.verticalRootButton = new Button(
                new Rect(
                    0, 0, this.size, this.size
                ),
                this.buttonImage,
                this.buttonHoverImage,
                this.buttonClickImage,
                function() {
                    self.verticalRegressBy(self.clickScrollSpeed);
                },
                undefined,
                scrollButtonNinePatchData
            );
            this.verticalScrollBar.addChild(this.verticalRootButton);

            this.verticalRootButton.onHold = function(x, y) {
                self.verticalRegressBy(self.holdScrollSpeed);
            };

            this.verticalTipButton = new Button(
                new Rect(
                    0, self.verticalScrollBar.bounds.height - this.size, this.size, this.size
                ),
                this.buttonImage,
                this.buttonHoverImage,
                this.buttonClickImage,
                function() {
                    self.verticalAdvanceBy(self.clickScrollSpeed);
                },
                undefined,
                scrollButtonNinePatchData
            );
            this.verticalScrollBar.addChild(this.verticalTipButton);

            this.verticalTipButton.onHold = function(x, y) {
                self.verticalAdvanceBy(self.holdScrollSpeed);
            };

            this.contentPanel = new Panel(
                new Rect(0, 0, this.bounds.width - this.size, this.bounds.height - this.size),
                contentPanelUIBox,
                contentPanelNinePatchData
            );
            this.addChild(this.contentPanel);

            ui.updatingElements.push(this);
        },

        /**
         * If you want something to be affected by scrolling, use this function to add it as a child instead of
         * this.addChild().
         * @param child
         */
        addChildToPanel: function(child) {
            this.contentPanel.addChild(child);
        },

        update: function() {
            this.horizontalCenterBar.bounds.width = Math.min((this.horizontalScrollBar.bounds.width - this.size * 2) *
                (this.horizontalScrollBar.bounds.width - this.size * 2) / this.getHorizontalScrollMax(),
                (this.horizontalScrollBar.bounds.width - this.size * 2));
            this.verticalCenterBar.bounds.height = Math.min((this.verticalScrollBar.bounds.height - this.size * 2) *
                (this.verticalScrollBar.bounds.height - this.size * 2) / this.getVerticalScrollMax(),
                (this.verticalScrollBar.bounds.height - this.size * 2));
        },

        horizontalAdvanceBy: function(x) {
            var diff;
            if (this.horizontalCenterBar.bounds.x + x < this.size) {
                diff = this.size - this.horizontalCenterBar.bounds.x;
                this.horizontalCenterBar.bounds.x += diff;
                this.contentPanel.offset.x -= diff;
            }
            else if (this.horizontalCenterBar.bounds.x + this.horizontalCenterBar.bounds.width + x
                    > this.horizontalScrollBar.bounds.width - this.size) {
                diff = (this.horizontalScrollBar.bounds.x + this.horizontalScrollBar.bounds.width - this.size)
                    - (this.horizontalCenterBar.bounds.x + this.horizontalCenterBar.bounds.width);
                this.horizontalCenterBar.bounds.x += diff;
                this.contentPanel.offset.x -= diff;
            }
            else {
                this.horizontalCenterBar.bounds.x += x;
                this.contentPanel.offset.x -= x;
            }
        },

        horizontalRegressBy: function(x) {
            this.horizontalAdvanceBy(-x);
        },

        verticalAdvanceBy: function(y) {
            var diff;
            if (this.verticalCenterBar.bounds.y + y < this.size) {
                diff = this.size - this.verticalCenterBar.bounds.y;
                this.verticalCenterBar.bounds.y += diff;
                this.contentPanel.offset.y -= diff;
            }
            else if (this.verticalCenterBar.bounds.y + this.verticalCenterBar.bounds.height + y
                > this.verticalScrollBar.bounds.height - this.size) {
                diff = (this.verticalScrollBar.bounds.y + this.verticalScrollBar.bounds.height - this.size)
                    - (this.verticalCenterBar.bounds.y + this.verticalCenterBar.bounds.height);
                this.verticalCenterBar.bounds.y += diff;
                this.contentPanel.offset.y -= diff;
            }
            else {
                this.verticalCenterBar.bounds.y += y;
                this.contentPanel.offset.y -= y;
            }
        },

        verticalRegressBy: function(y) {
            this.verticalAdvanceBy(-y);
        },

        getHorizontalScrollMax: function() {
            var i, child, rightMostPoint = 1;
            if (this.contentPanel) {
                for (i = 0; i < this.contentPanel._children.length; i++) {
                    child = this.contentPanel._children[i];
                    if (child.bounds.x + child.bounds.width > rightMostPoint) {
                        rightMostPoint = child.bounds.x + child.bounds.width;
                    }
                }
                return rightMostPoint;
            }
            return 1;
        },

        getVerticalScrollMax: function() {
            var i, child, bottomMostPoint = 1;
            if (this.contentPanel) {
                for (i = 0; i < this.contentPanel._children.length; i++) {
                    child = this.contentPanel._children[i];
                    if (child.bounds.y + child.bounds.height + 100 > bottomMostPoint) {
                        bottomMostPoint = child.bounds.y + child.bounds.height + 100;
                    }
                }
                return bottomMostPoint;
            }
            return 1;
        },

        /**
         * Draws this ScrollField relative to its parent (if it has one), and then draws all of its _children (if it has
         * any). ScrollFields clip the children of the content panel.
         */
        draw: function() {
            var ctx = ig.system.context,
                parentOffsetX = 0, parentOffsetY = 0, child;

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

            // Draw any children
            if (this._children.length > 0) {
                for (var i = 0; i < this._children.length; i++) {
                    child = this._children[i];
                    if (!child.hide) {
                        if (child == this.contentPanel) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(child.bounds.x + child.getOffsetX() + ((child._ninePatch) ? child._ninePatchData.x1 : 0),
                                child.bounds.y + child.getOffsetY() + ((child._ninePatch) ? child._ninePatchData.y1 : 0),
                                child.bounds.width - ((child._ninePatch) ? child._ninePatchData.x1 : 0) * 2,
                                child.bounds.height - ((child._ninePatch) ? child._ninePatchData.y1 : 0) * 2);
                            ctx.clip();
                            child.draw();
                            ctx.restore();
                        }
                        else {
                            child.draw();
                        }
                    }
                }
            }
        }

    });

});