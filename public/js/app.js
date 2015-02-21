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

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
		parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
		parameters["fontsize"] : 18;

	var borderThickness = parameters.hasOwnProperty("borderThickness") ?
		parameters["borderThickness"] : 4;

	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	//var spriteAlignment = parameters.hasOwnProperty("alignment") ?
	//	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

	var spriteAlignment = THREE.SpriteAlignment.topLeft;


	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;

	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.

	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();
}


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
        initAxes();
        initMainLabels();

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

        //renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        //renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        //renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

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
            var z = zFunc(x,y);
            if ( isNaN(z) )
                return new THREE.Vector3(0,0,0); // TODO: better fix
            else
                return new THREE.Vector3(x, y, z*10);
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

    function initMainLabels() {
        var xTitle = makeTextSprite( "Remifentanilo", { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
        xTitle.position.x = 110;
        xTitle.position.y = 0;
        xTitle.position.z = 0;
        scene.add( xTitle );

       for(var x =10; x < 110; x = x + 10) {
            var xTitle = makeTextSprite(x/10, { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
            xTitle.position.x = x;
            xTitle.position.y = 0;
            xTitle.position.z = 0;
            scene.add(xTitle);
       }

        var yTitle = makeTextSprite( "Propofsil", { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
        yTitle.position.x = -30;
        yTitle.position.y = 110;
        yTitle.position.z = 0;
        scene.add( yTitle );

       for(var y =10; y < 110; y = y + 10) {
            var xTitle = makeTextSprite(y/10, { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
            xTitle.position.x = -4;
            xTitle.position.y = y;
            xTitle.position.z = 0;
            scene.add(xTitle);
       }

        var zTitle = makeTextSprite( "Propofol", { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
        zTitle.position.x = -30;
        zTitle.position.y = 110;
        zTitle.position.z = 100;
        scene.add( zTitle );

       for(var z =10; z < 110; z = z + 10) {
            var xTitle = makeTextSprite((z/10) + "%" , { fontsize: 10, backgroundColor: {r:255, g:100, b:100, a:1} } );
            xTitle.position.x = -4;
            xTitle.position.y = 110;
            xTitle.position.z = z;
            scene.add(xTitle);
       }

    }

    function initPlane(){
        //grid xz
         var gridXZ = new THREE.GridHelper(50, 1);
         gridXZ.position.set(50, 100, 50);
         scene.add(gridXZ);

         //grid xy
         var gridXY = new THREE.GridHelper(50, 1);
         gridXY.rotation.x = Math.PI/2;
         gridXY.position.set(50, 50, -0.1);
         gridXY.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
         scene.add(gridXY);

         //grid yz
         var gridYZ = new THREE.GridHelper(50, 0.5);
         gridYZ.position.set(100, 50, 50);
         gridYZ.rotation.z = Math.PI/2;
         gridXY.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
         scene.add(gridYZ);
    }

    function initAirPlane(){
        var radius = 0.25, segments = 16, rings = 16;
        var sphereMaterial =
            new THREE.MeshLambertMaterial(
            {
              color: 0xCC0000
            });
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                radius,
                segments,
                rings),
          sphereMaterial);
        scene.add(sphere);
    }

   function animate() {
       requestAnimationFrame(animate);
       controls.update();
       light.position.copy( camera.position );
       renderer.setClearColor( 0xFFFFFFFF, 0 );
       renderer.render(scene, camera);
   }
});