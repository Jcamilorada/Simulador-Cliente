var informationController = function($scope, webstore){

    $scope.onLoad = function() {
        $scope.patient = webstore.get("patient");
    }

    $scope.onUpdate = function(){
        webstore.update("patient", $scope.patient);
    }

    $scope.onLoad();
}
