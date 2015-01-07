var drugsProcedureController = function($scope, $drugs,  $cookieStore, $cookies){

    $scope.onLoad = function() {
        var procedure_drug1 = $cookies["procedure_drug1"];
        var procedure_drug2 = $cookies["procedure_drug2"];

        if (angular.isDefined(procedure_drug1)) {
            $scope.procedure_drug1 = $cookieStore.get("procedure_drug1");
        }

        if (angular.isDefined(procedure_drug2)) {
            $scope.procedure_drug2 = $cookieStore.get("procedure_drug2");
        }

        $drugs.query({ type:1 }, function (data) {
            var drugs_type_1 = [];

            for (drug in data)
            {
                for (concentration in data[drug].concentrations) {
                    drugs_type_1.push({
                        name: data[drug].name + '-' + data[drug].concentrations[concentration],
                        id: data[drug].id,
                        value: concentration
                        });
                }
            }
            $scope.type1_drugs = drugs_type_1;
        });

        $drugs.query({ type:2 }, function (data) {
            var drugs_type_2 = [];

            for (drug in data)
            {
                for (concentration in data[drug].concentrations) {
                    drugs_type_2.push({
                     name: data[drug].name + '-' + data[drug].concentrations[concentration],
                     id: data[drug].id,
                     value: concentration});
                }
            }
            $scope.type2_drugs = drugs_type_2;
        });
    }

    $scope.onChange = function() {
        $cookieStore.put("procedure_drug1", $scope.procedure_drug1);
        $cookieStore.put("procedure_drug2", $scope.procedure_drug2);
    }

    $scope.onLoad();

}