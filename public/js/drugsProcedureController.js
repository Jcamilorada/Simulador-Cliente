var drugsProcedureController = function($scope, $drugs){

    $drugs.query(function (data) {
        $scope.drugs = data;
    });

}