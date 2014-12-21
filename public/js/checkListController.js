var checkListController = function($scope, $location, $filter, $http, serverUrl, recommendations){
    recommendations.query(function (data) {
        $scope.recommendations = data;
    });
    $scope.isValid = null;

    $scope.validate = function()
    {
        $scope.$watch("recommendations", function(newValue, oldValue) {
            var trues = $filter("filter")(newValue, { val:true });
            $scope.isValid = (trues.length == $scope.recommendations.length);
        }, true);

        if ($scope.isValid) {
            $location.path('/procedure');
        }

    };

    $scope.showError = function(){
        return $scope.isValid === false;
    }
}