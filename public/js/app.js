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

    var div_element =  $("#" + div_id);

    var scene, camera, renderer, controls, airplane, spritey;
    var geometry, material, mesh, light;
    var mouse = new THREE.Vector2();
    var objects = [];


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

    var canvas;
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

                context.clearRect(0,0, canvas.width, canvas.height)
                context.fillText(intersects[0].point.z, 4, 28);
                texture.needsUpdate = true;
            }
        }
    }

    function onDocumentMouseUp(event){
        event.preventDefault();
        controls.enabled = true;
        $scope.SELECTED = null;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    var context ,texture;
    function makeTextSprite( message, parameters ) {
      if (parameters === undefined) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : {
                r: 0,
                g: 0,
                b: 0,
                a: 1.0
            };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : {
                r: 255,
                g: 255,
                b: 255,
                a: 1.0
            };

        //var spriteAlignment = THREE.SpriteAlignment.topLeft;
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";

        context.fillText(message, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 50, 1.0);

        return sprite;
    }

    function init() {
        var div_element =  $("#" + div_id);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, div_element.width() / div_element.height(), 1, 10000 );
        camera.position.z = 90;
        //camera.matrix.elements = camera_matrix_elements;
        //camera.matrixWorld.elements = camera_matrix_elements;
        controls = new THREE.TrackballControls(camera);

        initGraph();
        initPlane();
        initAirPlane();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( div_element.width(), div_element.height());

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

        spritey = makeTextSprite(" Hello! ", {
            fontsize: 24,
            borderColor: {
                r: 255,
                g: 0,
                b: 0,
                a: 1.0
            },
            backgroundColor: {
                r: 255,
                g: 100,
                b: 100,
                a: 0.8
            }
        });
        spritey.position.set(-85, 105, 55);
        scene.add(spritey);
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