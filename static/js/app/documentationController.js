(function () {

    angular.module('baseApp')
        .controller('documentationController', ['$scope', documentationController]);

    function documentationController($scope) {
        var self = this;
        $scope.dynamicDocumentation = ddlDocumentationObjects;
    }
})();
