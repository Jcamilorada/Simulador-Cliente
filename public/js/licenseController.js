var licenseController = function($scope, $http, serverUrl, parameters){
    parameters.get({ id: 1 }, function(data) {
        $scope.license = data.value;
    });
}