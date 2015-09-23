var drugsProcedureController = function($scope, $drugs,  webstore){

    $scope.onLoad = function() {
        $scope.procedure_drug1 = webstore.get("procedure_drug1");
        $scope.procedure_drug2 = webstore.get("procedure_drug2");

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
        webstore.update("procedure_drug1", $scope.procedure_drug1);
        webstore.update("procedure_drug2", $scope.procedure_drug2);
    }

    $scope.onLoad();

}
