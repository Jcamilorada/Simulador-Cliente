var drugsConcentrationController = function($scope, $solutions){
    $solutions.query(function (data) {
        $scope.solutions = data;
    });
    $scope.drugs = [{name: 'Remi'}, {name:'Propo'}];
    $scope.solution_types = [{name: 'Solución Salina', value: 1}, {name:'Dextrosa', value: 2}];

}