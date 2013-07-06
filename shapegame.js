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

  // initializing position to shape map
  this.posToShape = [];
  var newShape = [];
  var newShape2 = [];
  var newShape3 = [];
  for (var x = 0; x < this.canvas.width; x++) {
    this.posToShape[x] = [];
    newShape[x] = [];
    newShape2[x] = [];
    newShape3[x] = [];
    for (var y = 0; y < this.canvas.height; y++) {
      this.posToShape[x][y] = [];
      newShape[x][y] = null;
      newShape2[x][y] = null;
      newShape3[x][y] = null;
    }
  }

  this.shapes = [];

  this.mouseClicked = null;
  this.mouseLastMoved = [];
  this.mouseLastSeen = [];

  var xWidth = Math.floor(this.canvas.width/2);
  var yHeight = Math.floor(this.canvas.height/2);
  var newColor = randomColor();
  var newColor2 = randomColor();
  var newColor3 = randomColor();
  var xMin = Math.floor(this.canvas.width/4);
  this.minX = xMin;
  var yMin = Math.floor(this.canvas.height/4);
  this.minY = yMin;
  var inCircle = function(x, y) {
    return (x - xMin) * (x - xMin) + (y - yMin) * (y - yMin) < 25 * 25;
  }
  for (var x = 0; x < this.canvas.width; x++) {
    for (var y = 0; y < this.canvas.height; y++) {
      if (inRange(x, xMin, xMin + xWidth - 1) &&
          inRange(y, yMin, yMin + yHeight - 1) &&
          y > x) {
        newShape[x][y] = newColor;
        newShape2[x+50][y] = newColor2;
      }
      if (inCircle(x, y)) {
        newShape3[x][y] = newColor3;
      }
    }
  }
  this.shapes.push(new Shape(
    newShape, newColor, this.canvas.width, this.canvas.height));
  this.shapes.push(new Shape(
    newShape2, newColor2, this.canvas.width, this.canvas.height));
  this.shapes.push(new Shape(
    newShape3, newColor3, this.canvas.width, this.canvas.height));
  for (var x = 0; x < this.canvas.width; x++) {
    for (var y = 0; y < this.canvas.height; y++) {
      if (inRange(x, xMin, xMin + xWidth - 1) &&
          inRange(y, yMin, yMin + yHeight - 1) &&
          y > x) {
        this.posToShape[x][y].push(this.shapes[0]);
        this.posToShape[x+50][y].push(this.shapes[1]);
      }
      if (inCircle(x, y)) {
        this.posToShape[x][y].push(this.shapes[2]);
      }
    }
  }

  this.callbacks = [];
  this.running = false;

  this.spf = 15; // seconds per frame
  this.refreshInterval = setInterval(function() {
    this.lockingFunction(function() {
      this.decorateCanvas();
    }.bind(this), 'refreshCanvas');
    }.bind(this), this.spf);
};

ShapeGame.prototype.lockingFunction = function(callback, funcName) {
  this.callbacks.push([callback, (new Date()).getTime(), funcName]);
  if (!this.running) {
    this.running = true;
    while (this.callbacks.length > 0) {
      if (this.callbacks.length > 1) {
        console.log('callbacks is ' + this.callbacks.length + ' long');
      }
      var callbackInfo = this.callbacks.pop();
      var timeSincePush = (new Date()).getTime() - callbackInfo[1];
      if (timeSincePush > 1) {
        console.log('lag is ' + timeSincePush);
      }
      if (callbackInfo[2]) {
        //console.log('running ' + callbackInfo[2]);
      }
      callbackInfo[0]();
    }
    this.running = false;
  } else {
    console.trace();
    console.log('Clearing callbacks. Behavior may be unexpected.');
    this.running = false;
  }
};

/**
 * Sets pixel pos to r, g, b, alpha.
 * @param {!number} x The x position of the pixel.
 * @param {!number} y The y position of the pixel.
 * @param {number} r The red value.
 * @param {number} g The green value.
 * @param {number} b The blue value.
 * @param {!ImageData=} image The image array. Default is this.imageData.
 * @param {number=} alpha The opaque value. Default is 255.
 */
ShapeGame.prototype.setPixel = function(x, y, r, g, b, image, alpha) {
  alpha = alpha != undefined ? alpha : 255;
  image = image != undefined ? image : this.imageData;
  position = this.canvas.width * y + x;
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
      if (this.posToShape[x][y].length > 0) {
        var color = this.posToShape[x][y][0].color;
        this.setPixel(x, y, color[0], color[1], color[2]);
      } else {
        // calculate sine based on distance
        var x2 = x - this.xoff;
        var y2 = y - this.yoff;
        var d = Math.sqrt(x2*x2 + y2*y2);
        var t = Math.sin(d/6.0);

        // calculate RGB values based on sine
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
 * Sets the center in percent length.
 * @param {!number} xCenter The new x center, in percentage of width.
 * @param {!number} yCenter The new y center, in percentage of height.
 */
ShapeGame.prototype.setCenterPercent = function(xCenter, yCenter) {
  this.setCenter(xCenter * this.canvas.width,
    yCenter * this.canvas.height);
};

/**
 * Sets the center.
 * @param {!number} xCenter The new x center.
 * @param {!number} yCenter The new y center.
 */
ShapeGame.prototype.setCenter = function(xCenter, yCenter) {
  this.xoff = xCenter;
  this.yoff = yCenter;
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
 * @param {!number} end1 The first end of the range.
 * @param {!number} end2 The second end of the range.
 */
var inRange = function(num, end1, end2) {
  return end1 <= num && num <= end2;
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
 * Does a random walk with the center. Only needs to be called once.
 * @param {!number} time The interval between updates.
 * @param {!number} x The new x coordinate.
 * @param {!number} y The new y coordinate.
 * @param {!number} diff The difference, in percentage, in coordinates.
 */
ShapeGame.prototype.moveCenterAround = function(time, x, y, diff) {
  this.setCenterPercent(x, y);
  this.decorateCanvas();
  var randomSign = function() {
    return Math.floor(Math.random() * 2) * 2 - 1;};
  var newX = x + randomSign() * diff;
  if (!this.inXRange(newX)) {
    newX = 2*x - newX;
  }
  var newY = y + randomSign() * diff;
  if (!this.inYRange(newY)) {
    newY = 2*y - newY;
  }
  setTimeout(function() {
        this.moveCenterAround(time, newX, newY, diff);
      }.bind(this), time);
};

/**
 * Converts a Event to position.
 * @param {!Event} e The mouse event.
 * @return {!Array.<number>} The position.
 */
ShapeGame.prototype.eventToPos = function(e) {
  var newX = (e.pageX - this.canvas.offsetLeft) / 1200 * this.canvas.width;
  var newY = (e.pageY - this.canvas.offsetTop) / 400 * this.canvas.height;
  return [Math.floor(newX), Math.floor(newY)];
};

/**
 * To be called when the mouse moves. Moves the center to the mouse.
 * @param {Event} e The event thrown when the mouse moves.
 */
ShapeGame.prototype.mouseMoved = function(e) {
  if (e == null) {
    e = window.event; // for IE
  }
  this.lockingFunction(function() {this.mouseMovedCallback(e);}.bind(this),
                       'mouseMoved');
}

/**
 * Callback for mouseMoved.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseMovedCallback = function(e) {
  var pos = this.eventToPos(e);
  document.getElementById('debug').innerHTML =
    'x: ' + pos[0] + '/' + this.canvas.width +
    ', y: ' + pos[1] + '/' + this.canvas.height;
  this.setCenter(pos[0], pos[1]);
  if (this.mouseClicked) {
    while (this.randomMoving) {} // wait for random walk to stop
    this.moving = true; // say that mouse has been moved
    if (this.mouseClicked != null) {
      this.mouseLastSeen = pos;
    }
  }
};

ShapeGame.prototype.updateShapePlace = function() {
  var xMoved = this.mouseLastSeen[0] - this.mouseLastMoved[0];
  var yMoved = this.mouseLastSeen[1] - this.mouseLastMoved[1];
  this.mouseLastMoved = this.mouseLastSeen;
  this.moveShape(this.mouseClicked, xMoved, yMoved);
};

/**
 * Called when the mouse goes down.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseDown = function(e) {
  if (e == null) {
    e = window.event; // for IE
  }
  this.lockingFunction(function() {this.mouseDownCallback(e);}.bind(this),
                       'mouseDown');
}

/**
 * Callback for mouseDown
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseDownCallback = function(e) {
  var pos = this.eventToPos(e);
  var shape = this.posToShape[pos[0]][pos[1]][0];
  if (shape) {
    this.mouseClicked = shape;
    this.mouseLastMoved = pos;
    this.mouseLastSeen = pos;
    this.updateShapePlace();
    this.interval = setInterval(function() {
      this.lockingFunction(function() {
        this.updateShapePlace();
      }.bind(this), 'updateShapePlace');
    }.bind(this), this.spf);
  }
};

/**
 * To be called when the mouse goes up.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseUp = function(e) {
  this.lockingFunction(function() {this.mouseUpCallback(e);}.bind(this),
                       'mouseUp');
};

/**
 * Callback for mouseUp.
 * @param {Event} e The event thrown.
 */
ShapeGame.prototype.mouseUpCallback = function(e) {
  this.mouseClicked = null;
  clearInterval(this.interval);
};

ShapeGame.prototype.moveShape = function(shape, xMove, yMove) {
//  console.log('xMove:' + xMove + ',xMin:' + shape.xMin +
//              ',xMax:' + shape.xMax + ',width:' + (shape.xMax - shape.xMin));
  if (!inRange(xMove, -shape.xMin, this.canvas.width - shape.xMax)) {
    //console.log('not in xrange');
    if (xMove < 0) {
      xMove = -shape.xMin;
    } else if (xMove > 0) {
      xMove = this.canvas.width - shape.xMax - 1;
    } else {
      console.log('xMove = 0 but out of range');
    }
    return false;
  }
  if (!inRange(yMove, -shape.yMin, this.canvas.height - shape.yMax)) {
    //console.log('not in yrange');
    if (yMove < 0) {
      yMove = -shape.yMin;
    } else if (yMove > 0) {
      yMove = this.canvas.width - shape.yMax - 1;
    } else {
      console.log('yMove = 0 but out of range');
    }
    return false;
  }
  var xStart, xDiff, xFinal;
  /*if (xMove < 0) {
    xStart = -xMove;
    xDiff = 1;
    xFinal = this.canvas.width;
  } else if (xMove >= 0) {
    xStart = this.canvas.width - 1 - xMove;
    xDiff = -1;
    xFinal = 0;
  }*/
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

  //console.log(xStart + ' ' + xDiff + ' ' + xFinal);
  //console.log(yStart + ' ' + yDiff + ' ' + yFinal);

  for (var x = xStart; xDiff * x < xDiff * xFinal; x += xDiff) {
    for (var y = yStart; yDiff * y < yDiff * yFinal; y += yDiff) {
      var resetOrig = !inRange(x, shape.xMin, shape.xMax-1) ||
          !inRange(y, shape.yMin, shape.yMax-1);
      shape.shapeArray[x+xMove][y+yMove] = shape.shapeArray[x][y];
      if (resetOrig) {
        shape.shapeArray[x][y] = null;
      }
      if (typeof this.posToShape[x] == 'undefined' ||
          typeof this.posToShape[x][y] == 'undefined') {
        console.log('noobx|' + xStart + ' ' + xDiff + ' ' + xFinal);
        console.log('nooby|' + yStart + ' ' + yDiff + ' ' + yFinal);
        console.log('rawr|' + x + ' ' + xMove + ' ' + (x+xMove) + '|' +
                    y + ' ' + yMove + ' ' + (y+yMove));
      }
      var indexShape = this.posToShape[x][y].indexOf(shape);
      if (indexShape != -1) {
        this.posToShape[x][y].splice(indexShape, 1);
        this.posToShape[x+xMove][y+yMove].unshift(shape);
      }
    }
  }
  return true;
};

ShapeGame.prototype.cutThrough = function() {
  this.lockingFunction(function() {this.cutThroughCallback();}.bind(this),
                       'cutThrough');
};

ShapeGame.prototype.cutThroughCallback = function() {
  var affectedShapeIndices = {};
  for (var x = 0; x < this.canvas.width; x++) {
    for (var y = 0; y < this.canvas.height; y++) {

      for (var shapeIndex = 1; shapeIndex < this.posToShape[x][y].length;
           shapeIndex++) { // skip the first shape
        var shape = this.posToShape[x][y][shapeIndex];
        affectedShapeIndices[this.shapes.indexOf(shape)] = true;
        shape.shapeArray[x][y] = null;
      }

      if (this.posToShape[x][y].length > 1) { // remove all but first shape
        this.posToShape[x][y] = [this.posToShape[x][y][0]];
      }
    }
  }
  for (var shapeIndex in affectedShapeIndices) {
    this.shapes[shapeIndex].calcMinMax();
  }
  // Think about if the above or below approach works better.
  /*for (var shapeIndex in this.shapes) {
    this.shapes[shapeIndex].calcMinMax();
  }*/
};

/**
 * Returns a random color.
 * @return {!Array.<number>} An array of length 3 with values between 0 and 256.
 */
var randomColor = function() {
  return [Math.floor(Math.random()*256), Math.floor(Math.random()*256),
          Math.floor(Math.random()*256)];
};

var Shape = function(
  newArray, newColor, canvasWidth, canvasHeight) {
  this.shapeArray = newArray;
  this.color = newColor || randomColor();
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.calcMinMax();
};

Shape.prototype.calcMinMax = function() {
  this.xMin = this.canvasWidth;
  this.xMax = 0;
  this.yMin = this.canvasHeight;
  this.yMax = 0;
  for (var x = 0; x < this.canvasWidth; x++) {
    for (var y = 0; y < this.canvasHeight; y++) {
      if (this.shapeArray[x][y] != null) {
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
}

var canvas = document.getElementById("canvas");
var shapeGame = new ShapeGame(canvas);
shapeGame.decorateCanvas();
//shapeGame.moveCenterAround(20, .5, .5, .01);
