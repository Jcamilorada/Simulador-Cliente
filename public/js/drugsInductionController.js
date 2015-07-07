var drugsInductionController = function($scope, $drugs, $cookieStore, $cookies){
    $scope.onLoad = function() {
        var induction_drug1 = $cookies["induction_drug1"];
        var induction_drug2 = $cookies["induction_drug2"];

        if (angular.isDefined(induction_drug1)) {
            $scope.induction_drug1 = $cookieStore.get("induction_drug1");
        }

        if (angular.isDefined(induction_drug2)) {
            $scope.induction_drug2 = $cookieStore.get("induction_drug2");
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
        $cookieStore.put("induction_drug1", $scope.induction_drug1);
        $cookieStore.put("induction_drug2", $scope.induction_drug2);
    }

    $scope.onLoad();
}