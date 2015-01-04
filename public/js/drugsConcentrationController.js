var drugsConcentrationController = function($scope, $solutions){
    $solutions.query(function (data) {
        $scope.solutions = data;
    });
    $scope.drugs = [{id: 1, name: 'Remifentanilo'}, {id: 2, name:'Propofol'}];
    $scope.solution_types = [{name: 'Solución Salina', value: 1}, {name:'Dextrosa', value: 2}];

}