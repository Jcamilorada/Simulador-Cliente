var informationController = function($scope, $http, $cookieStore, $cookies, serverUrl){
    var storePatientInfo = $cookies["patient"];
    $scope.patient = storePatientInfo != "undefined" ? $cookieStore.get("patient") : {};

    $scope.update = function(patient){
        $cookieStore.put("patient", patient);
    }
}