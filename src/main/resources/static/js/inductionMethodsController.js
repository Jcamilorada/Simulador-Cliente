var inductionMethodsController = function($scope, $induction_methods, webstore){

    $scope.onLoad = function() {
        $scope.induction_method = webstore.get("induction_method");

        $induction_methods.query(function (data) {
            $scope.methods = data;
        });
    }

    $scope.onChange = function() {
        webstore.update("induction_method", $scope.induction_method);
    }

    $scope.onLoad();
}
