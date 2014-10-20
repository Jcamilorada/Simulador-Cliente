var AngularApp = {};

var App = angular.module('AngularApp', ['ngRoute', 'ngResource']);

App.constant('serverUrl', 'http://localhost:8080');

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/applicationInfo', {
        templateUrl: 'templates/information.html',
        controller: InformationController
    });

    $routeProvider.otherwise({redirectTo: '/'});
}]);