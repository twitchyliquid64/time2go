


function defaultFunctionHandlers(){
  var funcs = {};
  funcs.debugparams = function(outputContext, unordered, ordered){
    console.log("PARAM DEBUG:", unordered, ordered);
    return newVariant(VAR_UNDEFINED, undefined);
  }



  // ========= BUILTIN-FUNCTION: obj(<named parameters> ...) =========
  funcs.obj = function(outputContext, unordered, ordered){
    return newVariant(VAR_OBJECT, ordered);
  }
  ddlDocumentationObjects['obj'] = {
    type: 'builtin-function',
    name: 'obj',
    desc: 'This function constructs and returns an object which has its named parameters as keys.',
    example: 'test := obj(n: 10)\nvalue_of_n := test.n'
  }



  // ========= BUILTIN-FUNCTION: point([x, y] OR [x: x, y: y]) =========
  funcs.point = function(outputContext, unordered, ordered){
    ordered.isPoint = newVariant(VAR_NUMBER, 1)
    if (unordered.length == 2){
      ordered.x = unordered[0];
      ordered.y = unordered[1];
    }
    return newVariant(VAR_OBJECT, ordered);
  }
  ddlDocumentationObjects['point'] = {
    type: 'builtin-function',
    name: 'point',
    desc: 'This function constructs and returns an object which has keys \'x\' and \'y\' set. You should pass x, then y as unnamed parameters. You may pass additional NAMED parameters to construct additional keys on the object.',
    example: 'test := point(10, 20)\nvalue_x := test.x'
  }


  // ========= BUILTIN-FUNCTION: name(<document name>) =========
  funcs.name = function(outputContext, unordered, ordered){
    if (unordered.length != 1 || unordered[0].type != VAR_STRING) {
      err = {t: "PARAM_ERROR", o: "invalid parameters in call to name()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
    } else {
      outputContext.name = unordered[0].value;
    }
    return newVariant(VAR_UNDEFINED, undefined);
  }
  ddlDocumentationObjects['name'] = {
    type: 'builtin-function',
    name: 'name',
    desc: 'This function allows you to set the human-readable name of the output document.',
    example: 'name("yah mum")'
  }


  // ========= BUILTIN-FUNCTION: arc(...) =========
  funcs.arc = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "arc");
    var x = getVariantValueOrUndefined(ordered.x);
    var y = getVariantValueOrUndefined(ordered.y);
    var radius = getVariantValueOrUndefined(ordered.radius);
    var startAng = getVariantValueOrUndefined(ordered.startAng);
    var endAng = getVariantValueOrUndefined(ordered.endAng);

    if (x == undefined || y == undefined || radius == undefined || startAng == undefined || endAng == undefined) {
      err = {t: "PARAM_ERROR", o: "x/y/radius/startAng/endAng missing or invalid in call to arc()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      x = 10;
      y = 10;
      radius = 10;
      startAng = 10;
      endAng = 20;
    }

    outputContext.addPath(name, [{'type': 'arc', 'x': x, 'y': y, 'radius': radius, 'startAng': startAng, 'endAng': endAng}]);
    return newVariant(VAR_OBJECT, {
      isArc: newVariant(VAR_NUMBER, 1),
      name: newVariant(VAR_STRING, name),
      x: newVariant(VAR_NUMBER, x),
      y: newVariant(VAR_NUMBER, y),
      radius: newVariant(VAR_NUMBER, radius),
      startAng: newVariant(VAR_NUMBER, startAng),
      endAng: newVariant(VAR_NUMBER, endAng)
    });
  };
  ddlDocumentationObjects['arc'] = {
    type: 'builtin-function',
    name: 'arc',
    desc: 'This function draws an arc on the output document. The named parameters x, y, and radius specify the center co-ordinates and the circle radius respectively. The start and finish of the arc is determined by the startAng and endAng parameters.',
    example: 'arc(x: 20, y: 40, radius: 5, startAng: 0, endAng: 90)'
  }



  // ========= BUILTIN-FUNCTION: line(...) =========
  funcs.line = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "line");
    var start = getVariantValueOrUndefined(ordered.start);
    var end = getVariantValueOrUndefined(ordered.end);

    if(start == undefined || end == undefined){
      err = {t: "PARAM_ERROR", o: "start/end missing or invalid in call to line()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      start = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
      end = {x: newVariant(VAR_NUMBER, 20), y: newVariant(VAR_NUMBER, 20)};
    }

    outputContext.addPath(name, [{'type': 'line', startx: start.x.value, starty: start.y.value, endx: end.x.value, endy: end.y.value}]);
    return newVariant(VAR_OBJECT, {
      isLine: newVariant(VAR_NUMBER, 1),
      name: newVariant(VAR_STRING, name),
      start: newVariant(VAR_OBJECT, start),
      end: newVariant(VAR_OBJECT, end)
    });
  };
  ddlDocumentationObjects['line'] = {
    type: 'builtin-function',
    name: 'line',
    desc: 'This function draws a line on the output document. The named parameters start and end specify the start and end points of the co-ordinates.',
    example: 'line(start: point(0,0), end: point(30, 30))'
  }



  // ========= BUILTIN-FUNCTION: circle(...) =========
  funcs.circle = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "circle");
    var x = getVariantValueOrUndefined(ordered.x);
    var y = getVariantValueOrUndefined(ordered.y);
    var radius = getVariantValueOrUndefined(ordered.radius);

    if(x == undefined || y == undefined || radius == undefined){
      err = {t: "PARAM_ERROR", o: "x/y/radius missing or invalid in call to circle()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      x = 10;
      y = 10;
      radius = 10;
    }

    outputContext.addPath(name, [{'type': 'circle', 'x': x, 'y': y, 'radius': radius}]);
    return newVariant(VAR_OBJECT, {
      isCircle: newVariant(VAR_NUMBER, 1),
      name: newVariant(VAR_STRING, name),
      x: newVariant(VAR_NUMBER, x),
      y: newVariant(VAR_NUMBER, y),
      radius: newVariant(VAR_NUMBER, radius),
    });
  };
  ddlDocumentationObjects['circle'] = {
    type: 'builtin-function',
    name: 'circle',
    desc: 'This function draws a circle on the output document. The named parameters x, y, and radius specify the center co-ordinates and the circle radius respectively.',
    example: 'circle(x: 20, y: 40, radius: 5)'
  }


  // ========= BUILTIN-FUNCTION: paraTab(...) =========
  funcs.paraTab = paraTab;
  ddlDocumentationObjects['paraTab'] = {
    type: 'subset-function',
    name: 'paraTab',
    desc: 'This function MUST be used in a call to parametricOutline(). It specifies a rectangular cutout/extension on a side of the rectangle. Displacement specifies the amount by which the rectangle should extend, negative values create a cutout. Length is the size of the cutout/extension on the same axis as the side, side is the side to apply the modification (top/bottom/left/right), and offset is the position from which to apply the modification. Negative values commence from the oppositve axis.',
    example: 'paraTab(\n  	offset: -2,\n  	side: \'left\',\n  	displacement: 4,\n  	length: 5,\n  )'
  }

  // ========= BUILTIN-FUNCTION: paraStandardMount(...) ===
  funcs.paraStandardMount = paraStandardMount;

  // ========= BUILTIN-FUNCTION: mountF(...) ==============
  funcs.mountF = function(outputContext, unordered, ordered){
    var height_inc_tolerance = 3;
    var mountTotalWidth = 19;
    var name = getName(ordered, outputContext, "mountF");
    var center = getVariantValueOrUndefined(ordered.center);
    var orientation = getVariantValueOrUndefined(ordered.orientation);
    var isVertical = false;
    if (orientation == true || orientation == 'vertical')isVertical = true;

    if(center == undefined){
      err = {t: "PARAM_ERROR", o: "center missing or invalid in call to mountF()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      center = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
    }

    if (isVertical){
      var topSlotVertices = [{y: center.y.value - (mountTotalWidth/2), x: center.x.value - (height_inc_tolerance/2)},
                              {y: center.y.value - (mountTotalWidth/2), x: center.x.value + (height_inc_tolerance/2)},
                              {y: center.y.value - (mountTotalWidth/2) + 5, x: center.x.value + (height_inc_tolerance/2)},
                              {y: center.y.value - (mountTotalWidth/2) + 5, x: center.x.value - (height_inc_tolerance/2)}];
      var topSlotPath = constructClosedPolylinePath(name+"_slottop", topSlotVertices);
      outputContext.addPath(name+"_slottop", topSlotPath);
    } else {
      var leftSlotVertices = [{x: center.x.value - (mountTotalWidth/2), y: center.y.value - (height_inc_tolerance/2)},
                              {x: center.x.value - (mountTotalWidth/2), y: center.y.value + (height_inc_tolerance/2)},
                              {x: center.x.value - (mountTotalWidth/2) + 5, y: center.y.value + (height_inc_tolerance/2)},
                              {x: center.x.value - (mountTotalWidth/2) + 5, y: center.y.value - (height_inc_tolerance/2)}];
      var leftSlotPath = constructClosedPolylinePath(name+"_slotleft", leftSlotVertices);
      outputContext.addPath(name+"_slotleft", leftSlotPath);
    }

    outputContext.addPath(name+"_bolthole", [{'type': 'circle', 'x': center.x.value, 'y': center.y.value, 'radius': 1.51}]);

    if (isVertical){
      var bottomSlotVertices = [{y: center.y.value + (mountTotalWidth/2) - 5, x: center.x.value - (height_inc_tolerance/2)},
                              {y: center.y.value + (mountTotalWidth/2) - 5, x: center.x.value + (height_inc_tolerance/2)},
                              {y: center.y.value + (mountTotalWidth/2), x: center.x.value + (height_inc_tolerance/2)},
                              {y: center.y.value + (mountTotalWidth/2), x: center.x.value - (height_inc_tolerance/2)}];
      var bottomSlotPath = constructClosedPolylinePath(name+"_slotbottom", bottomSlotVertices);
      outputContext.addPath(name+"_slotbottom", bottomSlotPath);
    } else {
      var rightSlotVertices = [{x: center.x.value + (mountTotalWidth/2) - 5, y: center.y.value - (height_inc_tolerance/2)},
                              {x: center.x.value + (mountTotalWidth/2) - 5, y: center.y.value + (height_inc_tolerance/2)},
                              {x: center.x.value + (mountTotalWidth/2), y: center.y.value + (height_inc_tolerance/2)},
                              {x: center.x.value + (mountTotalWidth/2), y: center.y.value - (height_inc_tolerance/2)}];
      var rightSlotPath = constructClosedPolylinePath(name+"_slotright", rightSlotVertices);
      outputContext.addPath(name+"_slotright", rightSlotPath);
    }


    return newVariant(VAR_OBJECT, {
      isMountF: newVariant(VAR_NUMBER, 1),
      center: newVariant(VAR_OBJECT, center)
    });
  }
  ddlDocumentationObjects['mountF'] = {
    type: 'subset-function',
    name: 'mountF',
    desc: 'Generates the female receptacle which a parametric Outlines\' paraStandardMount connects with. Specify the center point, and if you want it in a vertical or horizontal orientation. Defaults to horizontal orientation when orientation not specified.',
    example: 'mountF(\n  	orientation: \'vertical\',\n  	center: point(10,10),\n  )'
  }



  // ========= BUILTIN-FUNCTION: paraOutline(...) =========
  funcs.parametricOutline = paraOutline;
  ddlDocumentationObjects['parametricOutline'] = {
    type: 'builtin-function',
    name: 'parametricOutline',
    desc: 'Same as rectangle() except it allows you to specify modifications which are applied to a side of the basic rectangular shape. See paraTab() for such an example.',
    example: 'parametricOutline(\n  width: 90,\n  height: 60,\n  topLeft: point(0,0),\n  paraTab(\n  	offset: 9,\n  	side: \'top\',\n  	displacement: -3,\n  	length: 4,\n  )\n)'
  }

  // ========= BUILTIN-FUNCTION: rectangle(...) =========
  funcs.regularPolygon = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "rectangle");
    var sides = getVariantValueOrUndefined(ordered.sides);
    var center = getVariantValueOrUndefined(ordered.center);
    var radius = getVariantValueOrUndefined(ordered.radius);

    if(sides == undefined || center == undefined || radius == undefined){
      err = {t: "PARAM_ERROR", o: "sides/center/radius missing or invalid in call to regularPolygon()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      sides = 6;
      center = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
      radius = 3;
    }

    var vertices = [];
    var angle = 2 * Math.PI / sides;
    for (var i = 0; i < sides; i++) {
      var x = center.x.value + radius * Math.cos(i * angle);
      var y = center.y.value + radius * Math.sin(i * angle);
      vertices[vertices.length] = {x: x, y: y};
    }

    var path = constructClosedPolylinePath(name, vertices);
    outputContext.addPath(name, path);
    return newVariant(VAR_OBJECT, {
      isRegularPolygon: newVariant(VAR_NUMBER, 1),
      center: newVariant(VAR_OBJECT, center),
      radius: newVariant(VAR_NUMBER, radius),
      sides: newVariant(VAR_NUMBER, sides)
    })
  }

  // ========= BUILTIN-FUNCTION: rectangle(...) =========
  funcs.rectangle = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "rectangle");
    var width = getVariantValueOrUndefined(ordered.width);
    var height = getVariantValueOrUndefined(ordered.height);
    var topLeft = getVariantValueOrUndefined(ordered.topLeft);
    var topRight = getVariantValueOrUndefined(ordered.topRight);
    var bottomLeft = getVariantValueOrUndefined(ordered.bottomLeft);
    var bottomRight = getVariantValueOrUndefined(ordered.bottomRight);

    if(width == undefined || height == undefined){
      err = {t: "PARAM_ERROR", o: "width/height missing or invalid in call to rectangle()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      width = 10;
      height = 10;
    }
    if(topLeft == undefined && topRight == undefined && bottomLeft == undefined && bottomRight == undefined) {
      err = {t: "PARAM_ERROR", o: "topLeft/topRight/bottomLeft/bottomRight missing or invalid in call to rectangle()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      topLeft = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
    }

    //now calculate all the values, depending on what was given
    if (topRight != undefined){
      topLeft = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topRight.x.value - width), y: topRight.y}).value;
    }
    else if (bottomLeft != undefined){
      topLeft = funcs.point(outputContext, [], {x: bottomLeft.x, y: newVariant(VAR_NUMBER, bottomLeft.y.value - height)}).value;
    }
    else if (bottomRight != undefined){
      topLeft = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, bottomRight.x.value - width), y: newVariant(VAR_NUMBER, bottomRight.y.value - height)}).value;
    }
    topRight = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: topLeft.y}).value;
    bottomLeft = funcs.point(outputContext, [], {x: topLeft.x, y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;
    bottomRight = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;

    var path = constructClosedPolylinePath(name, [{x: topLeft.x.value, y: topLeft.y.value},
                                                  {x: topRight.x.value, y: topRight.y.value},
                                                  {x: bottomRight.x.value, y: bottomRight.y.value},
                                                  {x: bottomLeft.x.value, y: bottomLeft.y.value},]);
    outputContext.addPath(name, path);
    return newVariant(VAR_OBJECT, {
      isRectangle: newVariant(VAR_NUMBER, 1),
      name: newVariant(VAR_STRING, name),
      width: newVariant(VAR_NUMBER, width),
      height: newVariant(VAR_NUMBER, height),
      topLeft: newVariant(VAR_OBJECT, topLeft),
      topRight: newVariant(VAR_OBJECT, topRight),
      bottomLeft: newVariant(VAR_OBJECT, bottomLeft),
      bottomRight: newVariant(VAR_OBJECT, bottomRight)
    });
  }
  ddlDocumentationObjects['rectangle'] = {
    type: 'builtin-function',
    name: 'rectangle',
    desc: 'This function draws a rectangle on the output document. Width and height must be specified as integers, along with x and y of one of the four corners of the rectangle.',
    example: 'rectangle(width: 10, height: 10, topLeft: point(10,10))\nrectangle(width: 10, height: 10, bottomRight: point(10,10))'
  }

  return funcs;
}


function constructClosedPolylinePath(name, vertexList){
  var ret = [];
  var lastCoords = vertexList[0];
  for (var i = 1; i < vertexList.length; i++) {
    ret[i-1] = {'type': 'line', startx: lastCoords.x, starty: lastCoords.y, endx: vertexList[i].x, endy: vertexList[i].y}
    lastCoords = vertexList[i];
  }
  ret[ret.length] = {'type': 'line', startx: vertexList[vertexList.length-1].x, starty: vertexList[vertexList.length-1].y, endx: vertexList[0].x, endy: vertexList[0].y}
  return ret;
}

function getVariantValueOrUndefined(variant){
  if (variant == undefined){
    return undefined
  }
  return variant.value;
}

function getName(variant, outputContext, prefix){
  if (variant.name == undefined){
    return prefix + "_" + String(outputContext.newID());
  }
  return String(variant.name.value);
}

var ddlDocumentationObjects = {};
defaultFunctionHandlers(); //call it to populate the documentation cache
