// Frames per second.
var fps = 60;
// True iff debug messages are being shown.
var debugMessages = false;
// True iff function call messages are being shown.
var funcDebugMessages = false;
// True iff verifying shapes to eventToPos.
var verifyingShapes = true;

/**
 * The entirety of the shape game.
 * @param {Canvas} The canvas element.
 */
var ShapeGame = function(newCanvas) {
  this.canvas = newCanvas;
  this.context = this.canvas.getContext('2d');
  this.imageData = this.context.createImageData(
    this.canvas.width, this.canvas.height);

  // The center of the background.
  this.backgroundCenter = [this.canvas.width / 3, this.canvas.height / 3];

  // Initializing position to shape map.
  this.posToShape = [];
  for (var x = 0; x < this.canvas.width; x++) {
    this.posToShape[x] = [];
    for (var y = 0; y < this.canvas.height; y++) {
      this.posToShape[x][y] = [];
    }
  }

  // The list of shapes.
  this.shapes = [];

  // The shape the mouse is down on.
  this.mouseClicked = null;
  // The last position the shape was moved to.
  this.mouseLastMoved = [];
  // The last position the mouse was seen.
  this.mouseLastSeen = [];

  // Milliseconds per frame.
  this.mspf = 1000 / fps;
  // Refreshes the canvas every this.mspf milliseconds.
  this.refreshInterval = setInterval(function() {
    this.decorateCanvas();
    this.verifyShapes();
    this.funcDebug('refreshInterval');
  }.bind(this), this.mspf);
};

/**
 * Prints out a debug message to the console.
 * @param {string} message The debug message.
 */
ShapeGame.prototype.debug = function(message) {
  if (debugMessages) {
    console.log('[ShapeGame]: ' + message);
  }
};

/**
 * Prints out that a function is being called to the console.
 * @param {string} message The function name.
 */
ShapeGame.prototype.funcDebug = function(message) {
  if (funcDebugMessages) {
    console.log('[ShapeGame]: Function ' + message + ' was called.');
  }
};

/**
 * Prints out a warning message to the console.
 * @param {string} message The warning message.
 */
ShapeGame.prototype.warning = function(message) {
  console.log('[ShapeGame]: (WARNING) ' + message);
};

/**
 * Verifies that shape arrays match eventToPos.
 */
ShapeGame.prototype.verifyShapes = function() {
  if (!verifyingShapes) {
    return;
  }
  for (var x = 0; x < this.canvas.width; x++) {
    for (var y = 0; y < this.canvas.height; y++) {
      var posShapes = this.posToShape[x][y];
      for (var shapeIndex in posShapes) {
        var shape = posShapes[shapeIndex];
        if (shape.color != shape.shapeArray[x][y]) {
          this.warning('eventToPos doesn\'t match shape array');
          return;
        }
      }
    }
  }
};

/**
 * Makes a new shape.
 * @param {!function(number, number)} shapeFunc Returns true iff
 *     (number, number) is in the shape.
 * @param {Array.<number>=} color A color array. Default is random.
 */
ShapeGame.prototype.makeNewShape = function(shapeFunc, color) {
  var shape = new Shape(this.canvas.width, this.canvas.height, color);
  this.shapes.push(shape);

  var newShape = [];
  for (var x = 0; x < this.canvas.width; x++) {
    newShape[x] = [];
    for (var y = 0; y < this.canvas.height; y++) {
      if (shapeFunc(x, y)) {
        newShape[x][y] = shape.color;
        this.posToShape[x][y].push(shape);
      } else {
        newShape[x][y] = null;
      }
    }
  }
  shape.shapeArray = newShape;
  this.recalculateShapeParams(this.shapes.length - 1);
};

/**
 * Sets pixel pos to r, g, b, alpha.
 * @param {!number} x The x position of the pixel.
 * @param {!number} y The y position of the pixel.
 * @param {number} r The red value.
 * @param {number} g The green value.
 * @param {number} b The blue value.
 * @param {number=} alpha The opaque value. Default is 255.
 */
ShapeGame.prototype.setPixel = function(x, y, r, g, b, alpha) {
  alpha = alpha != undefined ? alpha : 255;
  position = this.canvas.width * y + x;
  this.imageData.data[position*4] = r;
  this.imageData.data[position*4+1] = g;
  this.imageData.data[position*4+2] = b;
  this.imageData.data[position*4+3] = alpha;
};

/**
 * Decorating the canvas with pretty.
 */
ShapeGame.prototype.decorateCanvas = function() {
  for (var y = 0; y < this.canvas.height; y++) {
    for (var x = 0; x < this.canvas.width; x++) {
      // If there's a shape on this pixel.
      if (this.posToShape[x][y].length > 0) {
        var color = this.posToShape[x][y][0].color;
        this.setPixel(x, y, color[0], color[1], color[2]);
      } else {
        // Calculate sine based on distance.
        var xDiff = x - this.backgroundCenter[0];
        var yDiff = y - this.backgroundCenter[1];
        var t = Math.sin(Math.sqrt(xDiff * xDiff + yDiff * yDiff) / 6.0);

        // Calculate RGB values based on sine.
        var r = Math.max(0,Math.min(255, t * 200));
        var g = Math.max(0,Math.min(255, 125 + t * 80));
        var b = Math.max(0,Math.min(255, 235 + t * 20));
        this.setPixel(x, y, r, g, b);
      }
    }
  }
  this.context.putImageData(this.imageData, 0, 0); // at coords 0,0
};

/**
 * Sets the center.
 * @param {!number} xCenter The new x center.
 * @param {!number} yCenter The new y center.
 */
ShapeGame.prototype.setCenter = function(xCenter, yCenter) {
  this.backgroundCenter[0] = xCenter;
  this.backgroundCenter[1] = yCenter;
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
 * Returns if the number is in the range.
 * @param {!number} num The number to be tested.
 * @param {!number} end1 The first end of the range, inclusive.
 * @param {!number} end2 The second end of the range, exclusive.
 */
var inRange = function(num, end1, end2) {
  return end1 <= num && num < end2;
};

/**
 * Returns if the number is in the x range, inclusive.
 * @param {!number} num The number to be tested.
 */
ShapeGame.prototype.inXRange = function(num) {
  return inRange(num, 0, this.canvas.width);
};

/**
 * Returns if the number is in the y range, inclusive.
 * @param {!number} num The number to be tested.
 */
ShapeGame.prototype.inYRange = function(num) {
  return inRange(num, 0, this.canvas.height);
};

/**
 * Moves the center in a random direction.
 * @param {!number} diff The difference in coordinates.
 */
ShapeGame.prototype.centerRandomWalk = function(diff) {
  var x = this.backgroundCenter[0];
  var y = this.backgroundCenter[1];

  // Returns either -1 or 1 randomly.
  var randomSign = function() {
    return Math.floor(Math.random() * 2) * 2 - 1;
  };

  var newX = x + randomSign() * diff;
  if (!this.inXRange(newX)) {
    // Just go ahead and use the other sign.
    newX = 2*x - newX;
  }
  var newY = y + randomSign() * diff;
  if (!this.inYRange(newY)) {
    // Just go ahead and use the other sign.
    newY = 2*y - newY;
  }

  this.setCenter(newX, newY);
};

/**
 * Converts a Event to position.
 * @param {!Event} e The mouse event.
 * @return {!Array.<number>} The position.
 */
ShapeGame.prototype.eventToPos = function(e) {
  // TODO: Read 1200 and 400 from the HTML page.
  var newX = (e.pageX - this.canvas.offsetLeft) / 1200 * this.canvas.width;
  var newY = (e.pageY - this.canvas.offsetTop) / 400 * this.canvas.height;
  return [Math.floor(newX), Math.floor(newY)];
};

/**
 * Called when the mouse moves. Moves the center to the mouse.
 * @param {Event} e The event thrown when the mouse moves.
 */
ShapeGame.prototype.mouseMoved = function(e) {
  this.funcDebug('mouseMoved');
  if (e == null) {
    e = window.event; // for IE
  }

  var pos = this.eventToPos(e);
  this.setCenter(pos[0], pos[1]);
  if (this.mouseClicked != null) {
    this.mouseLastSeen = pos;
  }

  document.getElementById('debug').innerHTML =
    'x: ' + pos[0] + '/' + this.canvas.width +
    ', y: ' + pos[1] + '/' + this.canvas.height;
};

/**
 * Updates the place of the shape to be where the mouse was last seen.
 */
ShapeGame.prototype.updateShapePlace = function() {
  var xMoved = this.mouseLastSeen[0] - this.mouseLastMoved[0];
  var yMoved = this.mouseLastSeen[1] - this.mouseLastMoved[1];
  this.mouseLastMoved = this.mouseLastSeen;
  this.moveShape(this.mouseClicked, xMoved, yMoved);
};

/**
 * Called when the mouse goes down. Looks for a shape at the click.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseDown = function(e) {
  this.funcDebug('mouseDown');
  if (e == null) {
    e = window.event; // for IE
  }

  var pos = this.eventToPos(e);
  // Grab the shape on top.
  var shape = this.posToShape[pos[0]][pos[1]][0];
  if (shape) {
    this.mouseClicked = shape;
    this.mouseLastMoved = pos;
    this.mouseLastSeen = pos;
    this.updateShapePlace();
    this.updateShapeInterval = setInterval(function() {
      this.funcDebug('updateShapeInterval');
      this.updateShapePlace();
    }.bind(this), this.mspf);
  }
};

/**
 * Called when the mouse goes up. Clears the clicked shape.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseUp = function(e) {
  this.funcDebug('mouseUp');
  if (e == null) {
    e = window.event; // for IE
  }

  this.mouseClicked = null;
  clearInterval(this.updateShapeInterval);
};

/**
 * Moves the shape a certain amount.
 * @param {!Shape} shape The shape to be moved.
 * @param {number} xMove The x amount to be moved.
 * @param {number} yMove The y amount to be moved.
 */
ShapeGame.prototype.moveShape = function(shape, xMove, yMove) {
  if (!inRange(xMove, -shape.xMin, this.canvas.width - shape.xMax + 1)) {
    this.debug('not in xrange');
    if (xMove < 0) {
      xMove = -shape.xMin;
    } else if (xMove > 0) {
      xMove = this.canvas.width - shape.xMax - 1;
    } else {
      this.warning('xMove = 0 but out of range');
    }
    return false;
  }
  if (!inRange(yMove, -shape.yMin, this.canvas.height - shape.yMax + 1)) {
    this.debug('not in yrange');
    if (yMove < 0) {
      yMove = -shape.yMin;
    } else if (yMove > 0) {
      yMove = this.canvas.width - shape.yMax - 1;
    } else {
      this.warning('yMove = 0 but out of range');
    }
    return false;
  }

  // Choose which way to iterate over the shape depending on movement direction.
  var xStart, xDiff, xFinal;
  if (xMove < 0) {
    xStart = shape.xMin;
    xDiff = 1;
    xFinal = shape.xMax;
  } else if (xMove >= 0) {
    xStart = shape.xMax - 1;
    xDiff = -1;
    xFinal = shape.xMin - 1;
  }
  var yStart, yDiff, yFinal;
  if (yMove < 0) {
    yStart = shape.yMin;
    yDiff = 1;
    yFinal = shape.yMax;
  } else if (yMove >= 0) {
    yStart = shape.yMax - 1;
    yDiff = -1;
    yFinal = shape.yMin - 1;
  }

  shape.xMin += xMove;
  shape.xMax += xMove;
  shape.yMin += yMove;
  shape.yMax += yMove;

  for (var x = xStart; xDiff * x < xDiff * xFinal; x += xDiff) {
    for (var y = yStart; yDiff * y < yDiff * yFinal; y += yDiff) {
      // If it's out of range of the loop, reset it. Note that the loop
      // effectively goes from xMin to xMax and yMin to yMax _before_
      // xMove and yMove were added.
      var outOfRange = !inRange(x, shape.xMin, shape.xMax) ||
          !inRange(y, shape.yMin, shape.yMax);
      shape.shapeArray[x+xMove][y+yMove] = shape.shapeArray[x][y];
      if (outOfRange) {
        shape.shapeArray[x][y] = null;
      }

      var indexShape = this.posToShape[x][y].indexOf(shape);
      if (indexShape != -1) {
        this.posToShape[x][y].splice(indexShape, 1);
        this.posToShape[x+xMove][y+yMove].unshift(shape); // Add to front.
      }
    }
  }
  return true;
};

/**
 * Makes the top shape cut through all below shapes.
 */
ShapeGame.prototype.cutThrough = function() {
  this.funcDebug('cutThrough');

  for (var x = 0; x < this.canvas.width; x++) {
    for (var y = 0; y < this.canvas.height; y++) {
      // Skip the first shape.
      for (var shapeIndex = 1; shapeIndex < this.posToShape[x][y].length;
           shapeIndex++) {
        this.posToShape[x][y][shapeIndex].shapeArray[x][y] = null;
      }

      // Remove all but first shape.
      if (this.posToShape[x][y].length > 1) {
        this.posToShape[x][y] = [this.posToShape[x][y][0]];
      }
    }
  }

  // TODO: Consider whether keeping a list of all affected shapes is better.
  // Recalculate min/max/width/height for all shapes.
  for (var shapeIndex = this.shapes.length - 1; shapeIndex >= 0;
       shapeIndex --) {
    var shape = this.shapes[shapeIndex];
    this.recalculateShapeParams(
        shapeIndex, shape.xMin, shape.xMax, shape.yMin, shape.yMax);
  }
};

/**
 * Recalculates xMin, xMax, yMin, yMax, width, height, and whether a shape is
 * gone or split. May delete from or add to the end of this.shapes.
 * @param {number} shapeIndex The index of the shape in this.shapes.
 * @param {number=} xLow The lowest x to be considered. Default is 0.
 * @param {number=} xHigh The highest x to be considered. Default is
 *     this.canvas.width.
 * @param {number=} yLow The lowest y to be considered. Default is 0.
 * @param {number=} yHigh The highest y to be considered. Default is
 *     this.canvas.height.
 */
ShapeGame.prototype.recalculateShapeParams =
    function(shapeIndex, xLow, xHigh, yLow, yHigh) {
  var shape = this.shapes[shapeIndex];
  // We know that all shapes are within their original boundaries.
  var shapeFuncArray =
    shape.calculateParams(xLow, xHigh, yLow, yHigh);
  var numShapes = shapeFuncArray[0];
  var shapeFunc = shapeFuncArray[1];
  if (numShapes == 0) { // Shape is gone.
    // No need to remove from posToShape because it's already gone.
    this.shapes.splice(shapeIndex, 1);
  } else if (numShapes > 1) { // Shape split into more than 1.
    // Remove from this.shapes.
    this.shapes.splice(shapeIndex, 1);

    // Remove from posToShape.
    for (var x = 0; x < this.canvas.width; x++) {
      for (var y = 0; y < this.canvas.height; y++) {
        var removedIndex = this.posToShape[x][y].indexOf(shape);
        if (removedIndex != -1) {
          this.posToShape[x][y].splice(removedIndex, 1);
        }
      }
    }

    // Add new shapes.
    for (var i = 0; i < numShapes; i++) {
      this.makeNewShape(
          function(x, y) {return shapeFunc(x, y, i);}, shape.color);
    }
  }

};

/**
 * Returns a random color.
 * @return {!Array.<number>} An array of length 3 with values between 0 and 256.
 */
var randomColor = function() {
  return [Math.floor(Math.random()*256), Math.floor(Math.random()*256),
          Math.floor(Math.random()*256)];
};

/**
 * The shapes.
 * @param {number} canvasWidth The width of the canvas.
 * @param {number} canvasHeight The height of the canvas.
 * @param {Array.<number>=} newColor A new color. Default is a random color.
 * @param {Array.<Array.<?number>>=} newArray The array representing the shape.
 *     Iff a position is not null, then the position is in the shape. Default is
 *     an empty array.
 */
var Shape = function(canvasWidth, canvasHeight, newColor, newArray) {
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.color = newColor || randomColor();
  this.shapeArray = newArray || [];
};

/**
 * Calculates minimum and maximum x and y and the width and height.
 * @param {number=} xLow The lowest x value to be checked. Default is 0.
 * @param {number=} xHigh the highest x value to be checked. Default is
 *     canvasWidth.
 * @param {number=} yLow The lowest y value to be checked. Default is 0.
 * @param {number=} yHigh The highest y value to be checked. Default is
 *     canvasHeight.
 * @return {(number, function(number, number, number)} The first number is the
 *     number of shapes produced. The second function takes x, y, i and returns
 *     true iff (x, y) is in shape i, where 0 <= i < numShapes.
 */
Shape.prototype.calculateParams = function(xLow, xHigh, yLow, yHigh) {
  xLow = typeof xLow == 'undefined' ? 0 : xLow;
  xHigh = typeof xHigh == 'undefined' ? this.canvasWidth : xHigh;
  yLow = typeof yLow == 'undefined' ? 0 : yLow;
  yHigh = typeof yHigh == 'undefined' ? this.canvasHeight: yHigh;

  // Extreme values of each.
  this.xMin = xHigh;
  this.xMax = xLow;
  this.yMin = yHigh;
  this.yMax = yLow;

  // A 2D array with indices into shapeNums.
  var shapeNumRefs = [];
  // A list of shape numbers. Can contain duplicates.
  var shapeNums = [];
  // The highest shape number used so far.
  var highestShapeNum = -1;
  // The shape numbers that are actually in use.
  var shapeNumsInUse = [];
  for (var x = xLow; x < xHigh; x++) {
    shapeNumRefs[x] = [];
    for (var y = yLow; y < yHigh; y++) {
      shapeNumRefs[x][y] = -1;
      if (this.shapeArray[x][y] != null) {
        var xLinkExists = x != xLow && this.shapeArray[x-1][y] != null;
        var yLinkExists = y != yLow && this.shapeArray[x][y-1] != null;
        if (xLinkExists) {
          shapeNumRefs[x][y] = shapeNumRefs[x-1][y];
          if (yLinkExists && // Both xLink and yLink exists.
              shapeNums[shapeNumRefs[x-1][y]] !=
              shapeNums[shapeNumRefs[x][y-1]]) {
            shapeNumsInUse.splice( // Remove from in use.
                shapeNumsInUse.indexOf(shapeNums[shapeNumRefs[x][y-1]]));
            // If they're connected, then they should use the same shape number.
            shapeNums[shapeNumRefs[x][y-1]] = shapeNums[shapeNumRefs[x-1][y]];
          }
        } else if (yLinkExists) { // Only yLink exists.
          shapeNumRefs[x][y] = shapeNumRefs[x][y-1];
        } else { // Neither xLink nor yLink exist. Make a new shape num.
          highestShapeNum ++;
          numShapes ++;
          shapeNumsInUse.push(highestShapeNum);
          shapeNums.push(highestShapeNum);
          shapeNumRefs[x][y] = shapeNums.length - 1;
        }

        // Searching for xMin, xMax, yMin, and yMax.
        if (x < this.xMin) {
          this.xMin = x;
        }
        if (x + 1 > this.xMax) {
          this.xMax = x + 1;
        }
        if (y < this.yMin) {
          this.yMin = y;
        }
        if (y + 1 > this.yMax) {
          this.yMax = y + 1;
        }
      }
    }
  }
  this.width = this.xMax - this.xMin;
  this.height = this.yMax - this.yMin;
  var numShapes = shapeNumsInUse.length;

  var shapeFuncArray = [shapeNumsInUse.length,
      function(x, y, i) {
        return typeof shapeNumRefs[x] != 'undefined' &&
          typeof shapeNumRefs[x][y] != 'undefined' &&
          shapeNumsInUse[i] == shapeNums[shapeNumRefs[x][y]];
      }];
  return shapeFuncArray;
};

var canvas = document.getElementById("canvas");
var shapeGame = new ShapeGame(canvas);

var xWidth = Math.floor(this.canvas.width/2);
var yHeight = Math.floor(this.canvas.height/2);
var xMin = Math.floor(this.canvas.width/4);
var yMin = Math.floor(this.canvas.height/4);
var inFirstTriangle = function(x, y) {
  return inRange(x, xMin, xMin + xWidth) &&
      inRange(y, yMin, yMin + yHeight) &&
      y > x;
};
var inSecondTriangle = function(x, y) {
  return inRange(x - 50, xMin, xMin + xWidth) &&
      inRange(y, yMin, yMin + yHeight) &&
      y > x - 50;
};
var inCircle = function(x, y) {
  return (x - xMin) * (x - xMin) + (y - yMin) * (y - yMin) < 25 * 25;
};
shapeGame.makeNewShape(inFirstTriangle);
shapeGame.makeNewShape(inSecondTriangle);
shapeGame.makeNewShape(inCircle);

/*var percentMove = .01;
var randomWalk = setInterval(function() {
    shapeGame.centerRandomWalk(percentMove * shapeGame.canvas.width,
        percentMove * shapeGame.canvas.height);
  }, 20);*/
