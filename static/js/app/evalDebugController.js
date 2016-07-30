(function () {

    angular.module('baseApp')
        .controller('evalDebugController', ['$scope', evalDebugController]);

    function evalDebugController($scope) {
        var self = this;

        self.readOpIntoTreeNode = function(name, opList){
          var c = [];
          for (var i = 0; i < opList.length; i++) {
            console.log(opList[i]);
            if (opList[i].type == 'line'){
              c[c.length] = {children: [], n: opList[i].type + ": (" + opList[i].startx + "," + opList[i].starty + ") -> (" + opList[i].endx + "," + opList[i].endy + ")"};
            }
            else if (opList[i].type == 'circle'){
              c[c.length] = {children: [], n: opList[i].type + " Center: (" + opList[i].x + "," + opList[i].y + ") Radius: " + opList[i].radius};
            }
            else if (opList[i].type == 'arc'){
              c[c.length] = {children: [], n: opList[i].type + " Center: (" + opList[i].x + "," + opList[i].y + ") Radius: " + opList[i].radius + " Ang: " + opList[i].startAng + " -> " + opList[i].endAng};
            }
          }
          return c;
        }

        self.readPathsIntoTreeNode = function(paths) {
          var ret = [];
          for (var pathName in paths) {
            var c = [];
            if (paths.hasOwnProperty(pathName)) {
              c = self.readOpIntoTreeNode(pathName, paths[pathName]);
              ret[ret.length] = {children: c, n: pathName};
            }
          }
          return ret;
        }

        self.readVariantIntoTreeNode = function(variant, name){
          if (variant.type == VAR_NUMBER){
            return {'children': [], 'n': name + " = " + variant.value + " (number)"};
          }
          if (variant.type == VAR_STRING){
            return {'children': [], 'n': name + " = " + variant.value + " (string)"};
          }
          if (variant.type == VAR_OBJECT){
            var c = [];
            for (var key in variant.value) {
              if (variant.value.hasOwnProperty(key)){
                c[c.length] = self.readVariantIntoTreeNode(variant.value[key], key);
              }
            }
            return {'collapsed': true, 'children': c, 'n': name + " (object)"};
          }
          if (variant.type == VAR_UNDEFINED){
            return {'children': [], 'n': name + " = UNDEFINED"};
          }
        }


        self.genGlobalsList = function(globals){
          var out = [];

          for (var key in globals) {
            if (globals.hasOwnProperty(key)){
              out[out.length] = self.readVariantIntoTreeNode(globals[key], key);
            }
          }
          return out;
        }

        self.genErrorsList = function(errors){
          var out = [];
          for(var i = 0; i < errors.length; i++) {
            out[out.length] = {n: errors[i].o, children: []};
          }
          return out;
        }

        $scope.execute = function(){
          var toks = lex(document.getElementById("rawcontent_eval").value);
        	var rootNode = ddlParse(toks);
          console.log(rootNode);
          var ctx = newOutputContext();
          rootNode.exec(ctx);
          console.log(ctx);
          $scope.treedata = [{n: 'Globals', children: self.genGlobalsList(ctx.globalVars)},
                             {n: 'Errors' , children: self.genErrorsList(ctx.errors)},
                             {n: 'Paths'  , children: self.readPathsIntoTreeNode(ctx.paths)}];
          console.log($scope.treedata);
        };

        $scope.treedata = [];
        $scope.errors = [];

    }
})();
