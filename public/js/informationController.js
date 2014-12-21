var informationController = function($scope, $http, $cookieStore, $cookies, serverUrl){
    var storePatientInfo = $cookies["patient"];
    var patient = storePatientInfo != "undefined" ? $cookieStore.get("patient") : {};

    patient = {};
    patient.weight = 10;
    patient.gender = "Hombre";

    $scope.patient = patient;
    $scope.update = function(patient){
        $cookieStore.put("patient", patient);
    }
}