ig.module(
        'game.button'
    )
    .requires(
        'game.uielement'
    )
    .defines (function() {

    Button = UIElement.extend({

        init: function(bounds, buttonImage, hoverImage, clickImage, funcToCall, funcArgs, ninePatchData) {
            this.parent(bounds);
            this.setImage(buttonImage);
            this.buttonImage = buttonImage;
            this.hoverImage = hoverImage;
            this.clickImage = clickImage;
            this.funcToCall = funcToCall;
            this.funcArgs = funcArgs;
            if (ninePatchData) {
                this.enableNinePatch(ninePatchData[0], ninePatchData[1], ninePatchData[2], ninePatchData[3]);
            }
            this.onClick = function() {
                if (!this.inactive) {
                    this.setImage(this.clickImage);
                }
            };
            this.onUnclick = function() {
                if (!this.inactive) {
                    // TODO: Call the function only if the mouse is still over the button when it's released.
                    this.setImage(this.buttonImage);
                    this.funcToCall(this.funcArgs);
                }
            };
            this.onEnter = function() {
                if (!this.inactive) {
                    this.setImage(this.hoverImage);
                }
            };
            this.onHover = function() {
                if (!this.inactive) {
                    if (ig.input.state("click")) {
                        this.setImage(this.clickImage);
                    }
                    else {
                        this.setImage(this.hoverImage);
                    }
                }
            };
            this.onLeave = function() {
                if (!this.inactive) {
                    this.setImage(this.buttonImage);
                }
            }
        },

        setFunction: function(funcToCall, funcArgs) {
            this.onUnclick = function() {
                this.setImage(this.buttonImage);
                funcToCall(funcArgs);
            }
        }

    });

});