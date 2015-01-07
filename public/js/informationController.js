var informationController = function($scope, $cookieStore, $cookies){

    $scope.onLoad = function() {
        var patient = $cookies["patient"];

        if (angular.isDefined(patient)) {
            $scope.patient = $cookieStore.get("patient");
        }
    }

    $scope.onUpdate = function(){
        $cookieStore.put("patient", $scope.patient);
    }

    $scope.onLoad();
}