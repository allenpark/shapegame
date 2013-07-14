var canvas = document.getElementById("canvas");
var shapeGame = new ShapeGame(canvas);

var xWidth = Math.floor(this.canvas.width/2);
var yHeight = Math.floor(this.canvas.height/2);
var xMin = Math.floor(this.canvas.width/4);
var yMin = Math.floor(this.canvas.height/4);
var inFirstTriangle = function(x, y) {
  return ShapeGame.inRange(x, xMin, xMin + xWidth) &&
      ShapeGame.inRange(y, yMin, yMin + yHeight) &&
      y > x;
};
var inSecondTriangle = function(x, y) {
  return ShapeGame.inRange(x - 50, xMin, xMin + xWidth) &&
      ShapeGame.inRange(y, yMin, yMin + yHeight) &&
      y > x - 50;
};
var inCircle = function(x, y) {
  return (x - xMin) * (x - xMin) + (y - yMin) * (y - yMin) < 25 * 25;
};
shapeGame.makeNewShape(inFirstTriangle);
shapeGame.makeNewShape(inSecondTriangle);
shapeGame.makeNewShape(inCircle);

/*
var percentMove = .01;
var randomWalk = setInterval(function() {
    shapeGame.centerRandomWalk(percentMove * shapeGame.canvas.width,
        percentMove * shapeGame.canvas.height);
  }, 20);
*/
