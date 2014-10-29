var informationController = function($scope, $http, serverUrl){
    $scope.getData = function(){
        $http.get(serverUrl + '/parameter/1').
          success(function(data, status, headers, config) {
            $scope.data = data;
          }).
          error(function(data, status, headers, config) {
          });
    }
}