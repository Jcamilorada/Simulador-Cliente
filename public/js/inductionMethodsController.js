var inductionMethodsController = function($scope, $induction_methods){

    $induction_methods.query(function (data) {
        $scope.methods = data;
    });

}