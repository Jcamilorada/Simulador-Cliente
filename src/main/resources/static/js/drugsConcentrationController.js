var drugsConcentrationController = function($scope, $solutions, webstore) {
    $scope.onLoad = function() {
        var solution1 = webstore.get("drug1_solution");
        var solution2 = webstore.get("drug2_solution");
        var solution_type1 = webstore.get("drug1_solution_type");
        var solution_type2 = webstore.get("drug2_solution_type");

        $solutions.query(function (data) {
            $scope.solutions = data;
        });

        $scope.drugs = [
            {id: 1, name: 'Remifentanilo', solution: solution1, solution_type: solution_type1},
            {id: 2, name:'Propofol', solution: solution2, solution_type: solution_type2}];

        $scope.solution_types = [{name: 'Solución Salina', value: 1}, {name:'Dextrosa', value: 2}];
    }

    $scope.onChange = function() {
        var drug_1 =  $scope.drugs[0];
        var drug_2 =  $scope.drugs[1];

        webstore.update("drug1_solution", drug_1.solution);
        webstore.update("drug2_solution", drug_2.solution);
        webstore.update("drug1_solution_type", drug_1.solution_type);
        webstore.update("drug2_solution_type", drug_2.solution_type);
    }

    $scope.onLoad();

}
