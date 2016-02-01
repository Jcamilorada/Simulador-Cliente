var procedureController = function($scope, $modal, webstore){
    /* Procedure constants */
    var prop_c = "prop_proc";
    var remi_c = "remi_proc";
    var time_c = "time_proc";

    $scope.onLoad = function() {
        var procedureType = webstore.get("procedureType");
        var procedure = webstore.get("procedure");

        if (angular.isDefined(procedureType)) {
            $scope.procedureType = webstore.get("procedureType");
            $scope.pnr = $scope.procedureType.pnr;
        }

        if (angular.isDefined(procedure)) {
            $scope.procedure = webstore.get("procedure");
        }
    }

    $scope.showDialog = function() {
        var modalInstance = $modal.open({
            templateUrl: 'templates/procedureDialog.html',
            controller: 'procedureDialogController',
            size: 'lg',
            resolve: {
                selection: function () {
                    $scope.selection = {procedure: $scope.procedure, procedureType: $scope.procedureType}
                    return $scope.selection;
                }
            }
        });

        modalInstance.result.then(function(selection) {
            webstore.remove(prop_c);
            webstore.remove(remi_c);
            webstore.remove(time_c);

            webstore.update("procedureType", selection.procedureType);
            webstore.update("procedure", selection.procedure);

            $scope.procedure = selection.procedure;
            $scope.procedureType = selection.procedureType;
            $scope.pnr = selection.procedureType.pnr;
        });
    }

    $scope.onLoad();
}
