var procedureDialogController = function($scope, $modalInstance, $procedures, $procedures_types, selection, $filter){

    $scope.onLoad = function() {
        if (angular.isDefined(selection.procedure)) {
            $scope.procedureCode = selection.procedure.code;
            $procedures.get({id: selection.procedure.code }, function(data) {
                $scope.procedures = [data];
            });
        }

        if (angular.isDefined(selection.procedureType)){
            $scope.procedureTypeId = selection.procedureType.id;
        }

        $procedures_types.query(function (data) {
            $scope.procedure_types = data;
        });
    }

    $scope.search = function() {
        $procedures.query({ keyword: $scope.keyword }, function(data) {
            $scope.procedures = data;
        });
    }

    $scope.ok = function () {
        var procedure = $filter("filter")($scope.procedures, { code:$scope.procedureCode })[0];
        var procedureType = $filter("filter")($scope.procedure_types, { id:$scope.procedureTypeId })[0];

        $modalInstance.close({'procedure': procedure, 'procedureType': procedureType});
      };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.onLoad();
}