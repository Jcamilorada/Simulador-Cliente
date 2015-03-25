App.constant('serverUrl', 'http://localhost:8092');
App.constant('round_2d', function(num) {
    return Math.round(num * 100) / 100;
});
App.constant('$drawMesh', function($scope, serverUrl, div_id, round_2d) {
    var scene, camera, sphere;
    var mesh, light, div_element;

    var mouse = new THREE.Vector2();
    var objects = [];

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

    // init graph components.
    function init() {
         div_element =  $("#" + div_id);

        scene = new THREE.Scene();
        GRAP.createGraphAxes(scene);
        GRAP.createGraphPlanes(scene);

        mesh = GRAP.getGraphMesh();
        sphere = GRAP.getSphere();

        scene.add(mesh);
        scene.add(sphere);
        objects.push(sphere);

        $scope.sphere = sphere;

        camera = GRAP.getCamera(div_element.width(), div_element.height());
        camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(div_element.width(), div_element.height());

        div_element.append(renderer.domElement);

        light = GRAP.getLight();
        var ambientLight = GRAP.getAmbientLight();

        scene.add(ambientLight);
        scene.add(light);

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    }

    // Main display function.
    function animate() {
       requestAnimationFrame(animate);
       light.position.copy(camera.position);
       renderer.setClearColor(0xffffff, 1);
       renderer.render(scene, camera);
   }

   var graphOperations =
   {
        changeObjectX: function(value){sphere.position.x = value;},
        changeObjectY: function(value){sphere.position.y = value;},
        changeObjectZ: function(value){sphere.position.z = value;},
   }

    return graphOperations;
});