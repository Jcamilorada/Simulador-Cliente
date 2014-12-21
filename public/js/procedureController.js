var procedureController = function($scope, $modal){
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
            $scope.procedure = selection.procedure;
            $scope.procedureType = selection.procedureType;
            $scope.pnr = selection.procedureType.pnr;
        });
    }
}