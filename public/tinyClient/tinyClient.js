/* tinyClient.js
 * A tiny version of the C# client code, setting up one Megatile's
 * Resourcetiles using a small, static data set
 */



var theGame = new GameManager();
theGame.initialize();
for (var i = 0; i < 9; i++) {
    console.log(theGame.helperFunctions.getPropertyFromObj("land_cover_type",
        theGame.worldData.megaTiles[0].resourceTiles[i]));
}
