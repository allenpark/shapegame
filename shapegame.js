/**
 * The entirety of the shape game.
 * @param {Canvas} The canvas element.
 */
var ShapeGame = function(newCanvas) {
  this.canvas = newCanvas;
  this.context = this.canvas.getContext('2d');
  this.imageData = this.context.createImageData(
    this.canvas.width, this.canvas.height);
  this.xoff = this.canvas.width / 3;
  this.yoff = this.canvas.height / 3;
};

/**
 * Sets pixel pos to r, g, b, alpha.
 * @param {!number} x The x position of the pixel.
 * @param {!number} y The y position of the pixel.
 * @param {!number} r The red percentage.
 * @param {!number} g The green percentage.
 * @param {!number} b The blue percentage.
 * @param {!number=} alpha The opaque percentage. Default is 255.
 * @param {!ImageData=} image The image array. Default is this.imageData.
 */
ShapeGame.prototype.setPixel = function(x, y, r, g, b, alpha, image) {
  alpha = alpha != undefined ? alpha : 255;
  image = image != undefined ? image : this.imageData;
  position = this.canvas.width * y + x;
  // makes it either alpha or 255.
  image.data[position*4] = r;
  image.data[position*4+1] = g;
  image.data[position*4+2] = b;
  image.data[position*4+3] = alpha;
};

/**
 * Decorating the canvas with pretty.
 */
ShapeGame.prototype.decorateCanvas = function() {
  for (var y = 0; y < this.canvas.height; y++) {
    for (var x = 0; x < this.canvas.width; x++) {
      // calculate sine based on distance
      var x2 = x - this.xoff;
      var y2 = y - this.yoff;
      var d = Math.sqrt(x2*x2 + y2*y2);
      var t = Math.sin(d/6.0);

      // calculate RGB values based on sine
      var r = t * 200;
      var g = 125 + t * 80;
      var b = 235 + t * 20;

      r = Math.max(0,Math.min(255, r));
      g = Math.max(0,Math.min(255, g));
      b = Math.max(0,Math.min(255, b));
      this.setPixel(x, y, r, g, b);
    }
  }
};

/**
 * Copy the image data back onto the canvas.
 */
ShapeGame.prototype.updateCanvas = function() {
  this.context.putImageData(this.imageData, 0, 0); // at coords 0,0
};

/**
 * Sets the center.
 * @param {!number} xCenter The new x center, in percentage of width.
 * @param {!number} yCenter The new y center, in percentage of height.
 */
ShapeGame.prototype.setCenter = function(xCenter, yCenter) {
  this.xoff = xCenter * this.canvas.width;
  this.yoff = yCenter * this.canvas.height;
};

/**
 * Returns if the point is inside the canvas.
 * @param {!number} x The x coordinate.
 * @param {!number} y The y coordinate.
 * @return {!boolean} True if the point is inside the canvas, false otherwise.
 */
ShapeGame.prototype.inCanvas = function(x, y) {
  return this.inXRange(x) && this.inYRange(y);
};

/**
 * Returns if the number is in the range, inclusive.
 * @param {!number} num The number to be tested.
 * @param {!number} low The low end of the range.
 * @param {!number} high The high end of the range.
 */
ShapeGame.prototype.inRange = function(num, low, high) {
  return low <= num && num <= high;
};

/**
 * Returns if the number is in the x range, inclusive.
 * @param {!number} num The number to be tested.
 */
ShapeGame.prototype.inXRange = function(num) {
  return this.inRange(num, 0, this.canvas.width);
};

/**
 * Returns if the number is in the y range, inclusive.
 * @param {!number} num The number to be tested.
 */
ShapeGame.prototype.inYRange = function(num) {
  return this.inRange(num, 0, this.canvas.height);
};

var moveCenterAround = function(canvas, shapeGame, time, x, y, diff) {
  shapeGame.setCenter(x, y);
  shapeGame.decorateCanvas();
  shapeGame.updateCanvas();
  var randomSign = function() {
    return Math.floor(Math.random() * 2) * 2 - 1;};
  var randomSign2 = function() {return 1;};
  var newX = x + randomSign() * diff;
  if (!shapeGame.inXRange(newX)) {
    newX = 2*x - newX;
  }
  var newY = y + randomSign() * diff;
  if (!shapeGame.inYRange(newY)) {
    newY = 2*y - newY;
  }
  setTimeout(
    function()
    {moveCenterAround(canvas, shapeGame, time, newX, newY, diff);},
    time);
}

var canvas = document.getElementById("canvas");
var shapeGame = new ShapeGame(canvas);
moveCenterAround(canvas, shapeGame, 20, .5, .5, .01);

