var inductionMethodsController = function($scope, $induction_methods, $cookieStore, $cookies){

    $scope.onLoad = function() {
        var induction_method = $cookies["induction_method"];
        if (angular.isDefined(induction_method)) {
            $scope.induction_method = $cookieStore.get("induction_method");
        }

        $induction_methods.query(function (data) {
            $scope.methods = data;

        });
    }

    $scope.onChange = function() {
        $cookieStore.put("induction_method", $scope.induction_method);
    }

    $scope.onLoad();

}