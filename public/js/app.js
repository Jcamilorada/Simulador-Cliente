var App = angular.module('AngularApp', ['routeModule', 'ngResource', 'ngSanitize', 'ui.bootstrap', 'ngCookies', 'pascalprecht.translate']);

// Holder js Fix
App.directive('myHolder', function() {
  return {
    link: function(scope, element, attrs) {
      attrs.$set('data-src', attrs.myHolder);
      Holder.run({images:element[0]});
    }
  };
});