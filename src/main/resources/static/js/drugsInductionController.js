var drugsInductionController = function($scope, $drugs, webstore){
    $scope.onLoad = function() {
        $scope.induction_drug1 = webstore.get("induction_drug1");
        $scope.induction_drug2 = webstore.get("induction_drug2");

        $drugs.query({ type:1 }, function (data) {
            var drugs_type_1 = [];

            for (drug in data)
            {
                for (concentration in data[drug].concentrations) {
                    drugs_type_1.push({
                        name: data[drug].name + ' ' + data[drug].concentrations[concentration] + ' mcg',
                        id: data[drug].id,
                        value: data[drug].concentrations[concentration]
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
                     name: data[drug].name + ' ' + data[drug].concentrations[concentration] + ' mg',
                     id: data[drug].id,
                     value: data[drug].concentrations[concentration]
                     });
                }
            }
            $scope.type2_drugs = drugs_type_2;
        });
    }

    $scope.onChange = function() {
        webstore.update("induction_drug1", $scope.induction_drug1);
        webstore.update("induction_drug2", $scope.induction_drug2);
    }

    $scope.onLoad();
}
