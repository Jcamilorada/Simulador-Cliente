function Hello($scope, $http) {
    $http.get("http://localhost:8080/information")
    .success(function(data){
        $scope.greeting = data;
    });
}
