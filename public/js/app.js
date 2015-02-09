var AngularApp = {};

var App = angular.module('AngularApp', ['ngRoute', 'ngResource', 'ngSanitize', 'ui.bootstrap', 'ngCookies', 'pascalprecht.translate']);

// Holder js Fix
App.directive('myHolder', function() {
  return {
    link: function(scope, element, attrs) {
      attrs.$set('data-src', attrs.myHolder);
      Holder.run({images:element[0]});
    }
  };
})


App.config(['$routeProvider', function ($routeProvider) {

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

    $routeProvider.when('/pnr', {
        templateUrl: 'templates/pnr.html',
        controller: pnrController
    });

    $routeProvider.when('/simulation', {
        templateUrl: 'templates/simulation.html',
        controller: simulationController
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


App.constant('serverUrl', 'http://localhost:8092');
App.constant('round_2d', function(num) {
    return Math.round(num * 100) / 100;
});
App.constant('$drawMesh', function($scope, serverUrl, div_id) {

    function round_2d(num) {
        return Math.round(num * 100) / 100;
    }

    var div_element =  $("#" + div_id);

    var scene, camera, renderer, controls, airplane;
    var geometry, material, mesh, light;
    var mouse = new THREE.Vector2();
    var objects = [];

    // Graphic Labels
    var pnr_text_sprite, remi_text_sprite, prop_text_sprite;


    init();
    animate();

    // Drag and drop implementation.
    function onDocumentMouseDown(event){
        event.preventDefault();
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            controls.enabled = false;
            $scope.SELECTED = intersects[0].object;
        }
    }

    function onDocumentMouseMove(event){
        var offset = div_element.offset();

        event.preventDefault();
        mouse.x = ( ( event.clientX - offset.left ) / div_element.width() ) * 2 - 1;
        mouse.y = - ( ( event.clientY - offset.top ) / div_element.height() ) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        if ($scope.SELECTED){
            var intersects = raycaster.intersectObject(mesh);

            if (intersects.length > 0)
            {
                $scope.SELECTED.position.x = intersects[0].point.x;
                $scope.SELECTED.position.y = intersects[0].point.y;
                $scope.SELECTED.position.z = intersects[0].point.z;
                $scope.$digest();

                GRAP.changeTextSprit(pnr_text_sprite, "PNR: ", round_2d($scope.SELECTED.position.z / 10));
                GRAP.changeTextSprit(remi_text_sprite, "Remifentanilo: ", round_2d($scope.SELECTED.position.x / 5));
                GRAP.changeTextSprit(prop_text_sprite, "Propofil: ", round_2d($scope.SELECTED.position.y / 5));
            }
        }
    }

    function onDocumentMouseUp(event){
        event.preventDefault();
        controls.enabled = true;
        $scope.SELECTED = null;
    }

    function init() {
        var div_element =  $("#" + div_id);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, div_element.width() / div_element.height(), 1, 10000 );
        camera.position.z = 90;
        //controls = new THREE.TrackballControls(camera, div_element);

        initGraph();
        initPlane();
        initAirPlane();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( div_element.width(), div_element.height());
        controls = new THREE.TrackballControls(camera, div_element.get(0));

        div_element.append(renderer.domElement);

       // Create a light.
        light = new THREE.PointLight(0xffffff);
        light.intensity = 1;
        scene.add(light);

        var light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light2 );

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

        pnr_text_sprite = GRAP.createLabelBox("pnr", 50, 50, 5);
        remi_text_sprite = GRAP.createLabelBox("remi", 50, 50, 20);
        prop_text_sprite = GRAP.createLabelBox("prop", 50, 50, 35);


        scene.add(pnr_text_sprite.sprite);
        scene.add(remi_text_sprite.sprite);
        scene.add(prop_text_sprite.sprite);
    }

    function initGraph() {
        var loader = new THREE.JSONLoader();
        loader.load(serverUrl + '/mesh/remi_prop',
            function(geometry, materials) {
                materials[0].transparent = true;
                materials[0].opacity = 0.5;
                mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
                scene.add(mesh);
            });
    }

    function initPlane(){
        var axes = new THREE.AxisHelper(50);
        scene.add(axes);

        var gridXY = new THREE.GridHelper(50, 1);
        gridXY.position.set(25, 25, -0.1);
        gridXY.rotation.x = Math.PI/2;
        scene.add(gridXY);
    }

    function initAirPlane(){
        var loader = new THREE.JSONLoader();
        loader.load('http://localhost:8091/js-resources/airplane.js',
            function(geometry, materials) {
                airplane = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials));
                airplane.scale.set(0.2, 0.2, 0.2);
                airplane.position.set(0, 0, 2);
                airplane.rotation.x += 1.57;

                scene.add(airplane);
                objects.push(airplane);
            });
    }

   function animate() {
       requestAnimationFrame(animate);
       controls.update();
       light.position.copy( camera.position );
       renderer.setClearColor( 0xFFFFFFFF, 0 );
       renderer.render(scene, camera);
   }
});