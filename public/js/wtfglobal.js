/**
 * This var provides a structured way for the various top-level components of the game (the Impact framework, the Trails
 * Forward data controller, and the various helper functions) organized and easy to access from all of the different
 * components.
 * @type {TrailsForwardGlobals}
 */
// var TFglobals = new TrailsForwardGlobals();

// TFglobals.initialize(new TrailsForwardDataController(), new TrailsForwardHelperFunctions(), ig.game);


if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}