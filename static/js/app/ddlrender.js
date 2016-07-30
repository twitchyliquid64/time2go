var ddlRenderTargets = {};

function parsePathsForMaxMin(execOutputContext) {
  var paths = execOutputContext.paths;
  var minx = 0;
  var miny = 0;
  var maxx = 0;
  var maxy = 0;
  var hasHadCoords = false;

  var checkCoord = function(x,y){
    if (!hasHadCoords) {
      minx = x;
      maxx = x;
      miny = y;
      maxy = y;
    }

    hasHadCoords = true;
    if (x < minx)minx = x;
    if (x > maxx)maxx = x;
    if (y < miny)miny = y;
    if (y > maxy)maxy = y;
  }

  for (var pathName in paths) {
    if (paths.hasOwnProperty(pathName)) {
      var path = paths[pathName];

      for (var i = 0; i < path.length; i++) {
        switch (path[i].type) {
          case 'line':
            checkCoord(path[i].startx, path[i].starty);
            checkCoord(path[i].endx, path[i].endy);
            break;
          case 'circle':
          case 'arc':
            checkCoord(path[i].x, path[i].y);
            checkCoord(path[i].x + path[i].radius, path[i].y + path[i].radius);
            checkCoord(path[i].x - path[i].radius, path[i].y - path[i].radius);
            break;
        }
      }
    }
  }

  return {minx: minx, maxx: maxx, miny: miny, maxy: maxy};
}
