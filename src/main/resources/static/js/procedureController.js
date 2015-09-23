var procedureController = function($scope, $modal, $cookieStore, $cookies){
    $scope.onLoad = function() {
        var procedureType = $cookies["procedureType"];
        var procedure = $cookies["procedure"];

        if (angular.isDefined(procedureType)) {
            $scope.procedureType = $cookieStore.get("procedureType");
            $scope.pnr = $scope.procedureType.pnr;
        }

        if (angular.isDefined(procedure)) {
            $scope.procedure = $cookieStore.get("procedure");
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
            $cookieStore.put("procedureType", selection.procedureType);
            $cookieStore.put("procedure", selection.procedure);

            $scope.procedure = selection.procedure;
            $scope.procedureType = selection.procedureType;
            $scope.pnr = selection.procedureType.pnr;

            $cookieStore.remove("proc_pnr");
        });
    }

    $scope.onLoad();
}