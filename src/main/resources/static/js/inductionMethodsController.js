var inductionMethodsController = function($scope, $induction_methods, webstore){

    /* induction values contants  */
    var prop_c = "prop_ind";
    var remi_c = "remi_ind";
    var time_c = "time_ind";

    $scope.onLoad = function() {
        $scope.induction_method = webstore.get("induction_method");

        $induction_methods.query(function (data) {
            $scope.methods = data;
        });
    }

    $scope.onChange = function() {
        webstore.update("induction_method", $scope.induction_method);
        webstore.remove(remi_c);
        webstore.remove(prop_c);
        webstore.remove(time_c);
    }

    $scope.onLoad();
}
