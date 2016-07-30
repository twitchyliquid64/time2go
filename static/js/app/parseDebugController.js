(function () {

    angular.module('baseApp')
        .controller('parseDebugController', ['$scope', parseDebugController]);

    function parseDebugController($scope) {
        var self = this;

        self.parseIntoTreeNode = function(node, keyName){
          var out = {'children': []};
          out.nodeName = node.nodeName;

          if (node.nodeName == AST_NUMBER_LIT){
            out.nodeName = String(node.value) +  " (literal)";
          }
          if (node.nodeName == AST_DESCRIPTOR){
            out.nodeName = String(node.value) +  " (function descriptor)";
          }
          if (node.nodeName == AST_STRING_LIT){
            out.nodeName = '\'' + String(node.value) +  "' (literal)";
          }
          if (node.nodeName == AST_KEY_VAL_LIT){
            out.nodeName = String(keyName) +  " (named parameter)";
          }
          if (node.nodeName == AST_ASSIGNMENT){
            out.nodeName = String(node.value) +  " =";
          }
          if (node.nodeName == AST_IDENTIFIER){
            out.nodeName = String(node.value) +  " (variable reference)";
          }
          if (node.nodeName == AST_DEREF){
            out.nodeName = String(node.value) +  " (dereference)";
          }
          if (node.nodeName == AST_JS_EXP){
            out.nodeName = "JS: " + String(node.value);
          }

          for(var i = 0; i < node.unnamedChildren.length; i++) {
            out.children[out.children.length] = self.parseIntoTreeNode(node.unnamedChildren[i]);
          }

          for (var key in node.namedChildren) {
            if (node.namedChildren.hasOwnProperty(key)){
              out.children[out.children.length] = self.parseIntoTreeNode(node.namedChildren[key], key);
            }
          }
          return out
        }

        self.parseAstIntoTreeNodes = function(root){
          var out = [];

          for(var i = 0; i < root.unnamedChildren.length; i++) {
            out[out.length] = self.parseIntoTreeNode(root.unnamedChildren[i]);
          }
          $scope.treedata = [{'nodeName': "Root", 'children': out}]
        }

        $scope.execute = function(){
          var toks = lex(document.getElementById("rawcontent_parse").value);
        	var rootNode = ddlParse(toks);
        	console.log(rootNode);
        	self.parseAstIntoTreeNodes(rootNode);
        };

        $scope.treedata = [];

    }
})();
