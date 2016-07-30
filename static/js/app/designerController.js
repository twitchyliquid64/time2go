function showSvgInDiv(id, svg) {
    var element = document.getElementById(id);
    element.innerHTML = svg;
}





(function () {

    angular.module('baseApp')
        .controller('designerController', ['$scope', designerController]);

    function designerController($scope) {
        var self = this;
        $scope.isDirty = false;
        $scope.hasErrors = false;
        $scope.errors = [];

        self.editor = CodeMirror(document.getElementById("content_main"), {
          mode: 'javascript',
          lineNumbers: true,
          autofocus: true,
          cursorHeight: 0.85
        });

        self.editor.on("change", function(inst, changObj){
          if ($scope.isDirty == false) {
            $scope.$apply(function(){$scope.isDirty = true;});
          }
        })

        self.editor.setOption("extraKeys", {
          'Ctrl-R': function(cm) {
            $scope.$apply(function(){$scope.execute();});
          }
        });

        $scope.execute = function(){
          console.log("designer.execute()");
          var toks = lex(self.editor.getValue());
        	var rootNode = ddlParse(toks);
          var ctx = newOutputContext();
          rootNode.exec(ctx);

          $scope.errors = ctx.errors;
          if (ctx.errors.length > 0) {
            $scope.hasErrors = true;
          } else {
            $scope.hasErrors = false;
            var svg = ddlRenderTargets['svg'](ctx, {preview: true});
            showSvgInDiv("renderPreviewContainer", svg);
          }
          $scope.isDirty = false;
        }

        $scope.fileSVG = function(){
          var toks = lex(self.editor.getValue());
        	var rootNode = ddlParse(toks);
          var ctx = newOutputContext();
          rootNode.exec(ctx);
          var svg = ddlRenderTargets['svg'](ctx, {preview: false});

          var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
          saveAs(blob, ctx.name + ".svg");
        }

        $scope.fileDXF = function(){
          var toks = lex(self.editor.getValue());
          var rootNode = ddlParse(toks);
          var ctx = newOutputContext();
          rootNode.exec(ctx);
          var svg = ddlRenderTargets['dxf'](ctx, {preview: false});

          var blob = new Blob([svg], {type: "application/dxf;charset=utf-8"});
          saveAs(blob, ctx.name + ".dxf");
        }

        console.log(document.getElementsByClassName('fa-spin'));
    }
})();
