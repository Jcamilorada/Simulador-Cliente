var checkListController = function($scope, $location, $filter, $recommendations){
    $recommendations.query({type: 1},function (data) {
        $scope.type1_recommendations = data;
    });
    $recommendations.query({type: 2},function (data) {
        $scope.type2_recommendations = data;
    });
    $recommendations.query({type: 3},function (data) {
        $scope.type3_recommendations = data;
    });

    $scope.isValid = null;
    $scope.validate = function()
    {
        $scope.$watch("recommendations", function(newValue, oldValue) {
            var trues = $filter("filter")(newValue, { val:true });
            $scope.isValid = (trues.length == $scope.recommendations.length);
        }, true);

        if ($scope.isValid) {
            $location.path('/information');
        }
    };

    $scope.showError = function(){
        return $scope.isValid === false;
    }
}