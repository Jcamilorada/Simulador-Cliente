var updateSimulationDialogController = function($scope, $modalInstance, $sf_x, $sf_y, $sf_xy){

    $scope.onLoad = function() {
        $scope.update = {
            time: 15,
            pnr: 0.5
        };

        $scope.onUpdatePNR();
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
        $modalInstance.close($scope.update);
    };

    // Surface model calculations methods.
    $scope.onUpdateX = function() {
        $sf_y.get({ x:  $scope.update.x,  pnr: $scope.update.pnr}, function (data) {
        $scope.update.y = data.value;
        });
    }

    $scope.onUpdateY = function() {
        $sf_x.get({ y:  $scope.update.y,  pnr: $scope.update.pnr}, function (data) {
            $scope.update.y = data.value;
        });
    }

    $scope.onUpdatePNR = function() {
        $sf_xy.get({pnr: $scope.update.pnr}, function (data) {
             $scope.update.x = data.x;
             $scope.update.y = data.y;
         });
    }

    $scope.onLoad();
}