var AngularApp = {};

var App = angular.module('AngularApp', ['ngRoute', 'ngResource']);

App.constant('serverUrl', 'http://localhost:8080');

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/applicationInfo', {
        templateUrl: 'templates/information.html',
        controller: informationController
    });

    $routeProvider.when('/mesh', {
        templateUrl: 'templates/mesh.html',
        controller: meshController
    });

    $routeProvider.when('/dragging', {
        templateUrl: 'templates/dragging.html',
        controller: draggingController
    });

    $routeProvider.otherwise({redirectTo: '/'});
}]);