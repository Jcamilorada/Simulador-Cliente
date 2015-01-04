var informationController = function($scope, $http, $cookieStore, $cookies, serverUrl){

    var storePatientInfo = $cookies["patient"];
    var patient = storePatientInfo != "undefined" ? $cookieStore.get("patient") : {};

    $scope.patient = patient;

    $scope.update = function(patient){
        $cookieStore.put("patient", patient);
    }
}