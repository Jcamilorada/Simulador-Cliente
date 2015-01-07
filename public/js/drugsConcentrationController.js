var drugsConcentrationController = function($scope, $solutions, $cookieStore, $cookies) {

    $scope.onLoad = function() {
        var drug1_solution = $cookies["drug1_solution"];
        var drug2_solution = $cookies["drug2_solution"];

        var solution1, solution2;

        if (angular.isDefined(drug1_solution)) {
            solution1 = $cookieStore.get("drug1_solution");
        }

        if (angular.isDefined(drug2_solution)) {
            solution2 = $cookieStore.get("drug2_solution");
        }

        $solutions.query(function (data) {
            $scope.solutions = data;
        });

        $scope.drugs = [
            {id: 1, name: 'Remifentanilo', solution: solution1},
            {id: 2, name:'Propofol', solution: solution2}];

        $scope.solution_types = [{name: 'Solución Salina', value: 1}, {name:'Dextrosa', value: 2}];
    }

    $scope.onChange = function() {
        $cookieStore.put("drug1_solution", $scope.drugs[0].solution);
        $cookieStore.put("drug2_solution", $scope.drugs[1].solution);
    }

    $scope.onLoad();

}