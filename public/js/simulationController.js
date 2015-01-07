var simulationController = function($scope, $cookieStore, $cookies)
{

    $scope.onLoad = function() {
        var delta = $cookies["delta"];
        if (angular.isDefined(delta)) {
            $scope.delta = $cookieStore.get("delta");
        }

        var simulation_speed = $cookies["simulation_speed"];
        if (angular.isDefined(simulation_speed)) {
            $scope.simulation_speed = $cookieStore.get("simulation_speed");
        }

        var wakeup_pnr = $cookies["wakeup_pnr"];
        if (angular.isDefined(wakeup_pnr)) {
            $scope.wakeup_pnr = $cookieStore.get("wakeup_pnr");
        }

        var wakeup_time = $cookies["wakeup_time"];
        if (angular.isDefined(wakeup_time)) {
            $scope.wakeup_time = $cookieStore.get("wakeup_time");
        }
    }


    $scope.onUpdate = function() {
        $cookieStore.put("delta", $scope.delta);
        $cookieStore.put("simulation_speed", $scope.simulation_speed);
        $cookieStore.put("wakeup_pnr", $scope.wakeup_pnr);
        $cookieStore.put("wakeup_time", $scope.wakeup_time);
    }

    $scope.onLoad();
}