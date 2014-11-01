var AngularApp = {};

var App = angular.module('AngularApp', ['ngRoute', 'ngResource', 'ui.bootstrap']);

App.constant('serverUrl', 'http://localhost:8080');

App.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/mesh', {
        templateUrl: 'templates/mesh.html',
        controller: meshController
    });

    $routeProvider.when('/dragging', {
        templateUrl: 'templates/dragging.html',
        controller: draggingController
    });

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

    $routeProvider.otherwise({redirectTo: '/'});
}]);