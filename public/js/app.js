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

    $routeProvider.when('/pnr_proc', {
        templateUrl: 'templates/pnr_proc.html',
        controller: pnrProcController
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

    $routeProvider.when('/plotter', {
        templateUrl: 'templates/graph.html',
        controller: plotterController
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

    var scene, camera, renderer, controls, sphere;

    var geometry, material, mesh, light;
    var mouse = new THREE.Vector2();
    var objects = [];
    var textMainMesh;

    // Graphic Labels
    var pnr_text_sprite, remi_text_sprite, prop_text_sprite;

    init();
    animate();

    // Validate if click was pressed on the ball.
    function onDocumentMouseDown(event){
        event.preventDefault();
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            //controls.enabled = false;
            $scope.SELECTED = intersects[0].object;
        }
    }

    // Drag the ball under the mesh graph.
    function onDocumentMouseMove(event){
        var offset = div_element.offset();

        event.preventDefault();
        // TODO: Added manualyy 15 because pading
        mouse.x = 2 * ((event.clientX - offset.left - 15) / div_element.width()) - 1;
        mouse.y = 1 - 2 * ((event.clientY - offset.top) / div_element.height());

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());



        if ($scope.SELECTED){
            var intersects = raycaster.intersectObject(mesh);

            if (intersects.length > 0)
            {
                $scope.SELECTED.position.x = intersects[0].point.x;
                $scope.SELECTED.position.y = intersects[0].point.y;
                $scope.SELECTED.position.z = intersects[0].point.z;

                $scope.Remifentanilo = intersects[0].point.x / 10;
                $scope.Propofol = intersects[0].point.y / 10;
                $scope.PNR = intersects[0].point.z;
                $scope.$digest();
            }
        }

        else {
            var intersects = raycaster.intersectObject(sphere);

            if (intersects.length > 0)
            {
                div_element.css('cursor', 'pointer');
            }
            else
            {
                div_element.css('cursor', 'default');
            }
        }
    }

    // Release selected object.
    function onDocumentMouseUp(event){
        event.preventDefault();
        $scope.SELECTED = null;
    }

    function init() {
        div_element =  $("#" + div_id);

        scene = new THREE.Scene();


        initGraph();
        initPlane();
        initDraggableComponent();
        initAxes();
        initCamera();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( div_element.width(), div_element.height());

        div_element.append(renderer.domElement);

        // Point light.
        light = new THREE.PointLight(0xffffff);
        light.intensity = 1;
        scene.add(light);

        // Ambient light
        var ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    }

    function initCamera() {
        camera = new THREE.PerspectiveCamera(
            75,         // Field of view
            div_element.width() / div_element.height(),  // Aspect ratio
            1,         // Near
            10000       // Far
        );
        camera.position.set(-103, -119, 140);
        camera.up = new THREE.Vector3(0,0,1);
        camera.lookAt(scene.position);
    }

    function initGraph() {
        var xMin = 0;
        var xMax = 100;

        var yMin = 0;
        var yMax = 100;

        var xRange = xMax - xMin;
        var yRange = yMax - yMin;

        var zFuncText = "10 * (0.0828 * (x* 0.1) * (y *0.1))^ 5.1550 / (1 + (0.0828 * (x* 0.1) * (y *0.1))^ 5.1550)";
        var segments = 60;
        var zFunc = Parser.parse(zFuncText).toJSFunction( ['x','y'] );
        var meshFunction = function(x, y)
        {
            x = xRange * x + xMin;
            y = yRange * y + yMin;
            var z = zFunc(x, y);

            if ( isNaN(z) )
                return new THREE.Vector3(0,0,0);
            else
                return new THREE.Vector3(x, y, z * 10);
        };

       var graphGeometry = new THREE.ParametricGeometry( meshFunction, segments, segments, true );
        graphGeometry.computeBoundingBox();
        var zMin = graphGeometry.boundingBox.min.z;
        var zMax = graphGeometry.boundingBox.max.z;
        var zRange = zMax - zMin;
        var color, point, face, numberOfSides, vertexIndex;

        // faces are indexed using characters
        var faceIndices = [ 'a', 'b', 'c', 'd' ];
        // first, assign colors to vertices as desired
        for ( var i = 0; i < graphGeometry.vertices.length; i++ )
        {
            point = graphGeometry.vertices[ i ];
            color = new THREE.Color( 0x0000ff );
            color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
            graphGeometry.colors[i] = color; // use this array for convenience
        }

        // copy the colors as necessary to the face's vertexColors array.
        for ( var i = 0; i < graphGeometry.faces.length; i++ )
        {
            face = graphGeometry.faces[ i ];
            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
            for( var j = 0; j < numberOfSides; j++ )
            {
                vertexIndex = face[ faceIndices[ j ] ];
                face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
            }
        }

        var wireTexture = new THREE.ImageUtils.loadTexture( 'images/square.png' );
        wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
        wireTexture.repeat.set( 40, 40 );
        wireMaterial = new THREE.MeshBasicMaterial( { map: wireTexture, vertexColors: THREE.VertexColors, side:THREE.DoubleSide } );

        mesh = new THREE.Mesh( graphGeometry, wireMaterial);
        scene.add(mesh);
    }

    function initAxes() {
        var axes = new THREE.AxisHelper(100);

        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        // Y Axis
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-2, -2, 0));
        geometry.vertices.push(new THREE.Vector3(-2, 110, 0));
        var yLine = new THREE.Line(geometry, material);
        scene.add(yLine);

       for(var y =0; y < 110; y = y + 10) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(-1, y, 0));
            geometry.vertices.push(new THREE.Vector3(-3, y, 0));
            var line = new THREE.Line(geometry, material);
            scene.add(line);
       }

        // X Axis
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-2, -2, 0));
        geometry.vertices.push(new THREE.Vector3(110, -2, 0));
        var xLine = new THREE.Line(geometry, material);
        scene.add(xLine);

       for(var x =0; x < 110; x = x + 10) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(x, -1, 0));
            geometry.vertices.push(new THREE.Vector3(x, -3, 0));
            var line = new THREE.Line(geometry, material);
            scene.add(line);
       }

        // Z Axis
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-2, 110, 0));
        geometry.vertices.push(new THREE.Vector3(-2, 110, 110));
        var zLine = new THREE.Line(geometry, material);
        scene.add(zLine);

       for(var z =0; z < 110; z = z + 10) {
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(-1, 110, z));
            geometry.vertices.push(new THREE.Vector3(-3, 110, z));
            var line = new THREE.Line(geometry, material);
            scene.add(line);
       }
    }

    /* Generates the planes xz, xy, yz. */
    function initPlane(){
        //grid xz
         var gridXZ = new THREE.GridHelper(50, 5);
         gridXZ.position.set(50, 100, 50);
         scene.add(gridXZ);

         //grid xy
         var gridXY = new THREE.GridHelper(50, 5);
         gridXY.rotation.x = Math.PI/2;
         gridXY.position.set(50, 50, -0.5);
         gridXY.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
         scene.add(gridXY);

         //grid yz
         var gridYZ = new THREE.GridHelper(50, 5);
         gridYZ.position.set(100, 50, 50);
         gridYZ.rotation.z = Math.PI/2;
         gridXY.setColors(new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
         scene.add(gridYZ);
    }

    /* Creates the draggable component. */
    function initDraggableComponent(){
        var radius = 4, segments = 16, rings = 16;
        var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
        sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

        scene.add(sphere);
        objects.push(sphere);
        $scope.sphere = sphere;
    }

   function animate() {
       requestAnimationFrame(animate);
       light.position.copy(camera.position);
       renderer.setClearColor(0xffffff, 1);
       renderer.render(scene, camera);
   }
});