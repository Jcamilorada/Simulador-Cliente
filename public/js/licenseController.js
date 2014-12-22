var licenseController = function($scope, $http, serverUrl, parameter){
    parameters.get({ id: 1 }, function(data) {
        $scope.license = data.value;
    });
}