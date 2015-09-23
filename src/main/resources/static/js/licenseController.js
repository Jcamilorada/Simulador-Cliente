var licenseController = function($scope, $http, $parameters){
    $parameters.get({ id: 1 }, function(data) {
        $scope.license = data.value;
    });
}
