// Rest Resources
App.factory("parameters", function($resource, serverUrl) {
  return $resource(serverUrl + "/parameters/:id");
});

App.factory("recommendations", function($resource, serverUrl) {
  return $resource(serverUrl + "/recommendations");
});

App.factory("$procedures", function($resource, serverUrl) {
  return $resource(serverUrl + "/procedures/:id", {id:'@id'}, {
    'query': {url: serverUrl + "/procedures/search/:keyword", isArray:true},
  });
});

App.factory("$procedures_types", function($resource, serverUrl) {
  return $resource(serverUrl + "/procedures-types");
});

App.factory("$drugs", function($resource, serverUrl) {
   return $resource(serverUrl + "/drugs/:id", {id:'@id'}, {
      'query': {url: serverUrl + "/drugs/type/:type", isArray:true},
    });
});

App.factory("$solutions", function($resource, serverUrl) {
  return $resource(serverUrl + "/solutions");
});

App.factory("$induction_methods", function($resource, serverUrl) {
  return $resource(serverUrl + "/methods");
});


// Surface Model resources
App.factory("$sf_pnr", function($resource, serverUrl) {
  return $resource(serverUrl + "/sf/x/:x/y/:y");
});

App.factory("$sf_x", function($resource, serverUrl) {
  return $resource(serverUrl + "/sf/y/:y/pnr/:pnr");
});

App.factory("$sf_y", function($resource, serverUrl) {
  return $resource(serverUrl + "/sf/x/:x/pnr/:pnr");
});

App.factory("$sf_xy", function($resource, serverUrl) {
  return $resource(serverUrl + "/sf/pnr/:pnr");
});

App.factory("$sf_xy_pnr", function($resource, serverUrl) {
  return $resource(serverUrl + "/sf/x/:x/y/:y");
});