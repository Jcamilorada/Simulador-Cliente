var routeModule = angular.module("routeModule", ['ngRoute']);

routeModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'templates/home.html',
        controller: homeController
    });

    $routeProvider.when('/license', {
        templateUrl: 'templates/license.html',
        controller: licenseController
    });

    $routeProvider.when('/checkList', {
        templateUrl: 'templates/checkList.html',
        controller: checkListController
    });

    $routeProvider.when('/information', {
        templateUrl: 'templates/information.html',
        controller: informationController
    });

    $routeProvider.when('/procedure', {
        templateUrl: 'templates/procedure.html',
        controller: procedureController
    });

    $routeProvider.when('/drugsInduction', {
        templateUrl: 'templates/drugsInduction.html',
        controller: drugsInductionController
    });

    $routeProvider.when('/drugsProcedure', {
        templateUrl: 'templates/drugsProcedure.html',
        controller: drugsProcedureController
    });

    $routeProvider.when('/drugsConcentration', {
        templateUrl: 'templates/drugsConcentration.html',
        controller: drugsConcentrationController
    });

    $routeProvider.when('/pnr_proc', {
        templateUrl: 'templates/pnr_proc.html',
        controller: pnrProcController
    });

    $routeProvider.when('/ind_proc', {
        templateUrl: 'templates/pnr_ind.html',
        controller: pnrIndController
    });

    $routeProvider.when('/running', {
        templateUrl: 'templates/runningSimulation.html',
        controller: runningController
    });

    $routeProvider.when('/inductionMethod', {
        templateUrl: 'templates/inductionMethod.html',
        controller: inductionMethodsController
    });

    $routeProvider.otherwise({redirectTo: '/'});
}]);
