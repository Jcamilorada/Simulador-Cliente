App.service('graph', function (serverUrl){
    DIV_PADDING = 15;

    getIntersectedObjects = function(mouse, camera, objects) {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        return raycaster.intersectObjects(objects);
    }

    getXPosition = function(eventX, div_element) {
        var offset = div_element.offset();

        return 2 * ((eventX - offset.left - DIV_PADDING) / div_element.width()) - 1;
    }

    getYPosition = function(eventY, div_element) {
        var offset = div_element.offset();

        return 1 - 2 * ((eventY - offset.top) / div_element.height());
    }

    updateScopeValues = function($scope, x, y, z) {
        $scope.SELECTED.position.x = x;
        $scope.SELECTED.position.y = y;
        $scope.SELECTED.position.z = z;

        $scope.Remifentanilo = x / 10;
        $scope.Propofol = y / 10;
        $scope.PNR = z;
        $scope.$digest();
    }

    updateCursorPointer = function(raycaster, sphere, div_element) {
        var intersects = raycaster.intersectObject(sphere);

        if (intersects.length > 0) {
            div_element.css('cursor', 'pointer');
        }
        else {
            div_element.css('cursor', 'default');
        }
    }

    this.draw_simple_mesh = function($scope, div_id) {
        var scene, camera, sphere;
        var mesh, light, ambientLight, div_element;

        var mouse = new THREE.Vector2();

        // Validate if click was pressed on the ball.
        function onDocumentMouseDown(event) {
            event.preventDefault();
            var intersects = getIntersectedObjects(mouse, camera, [sphere]);

            if (intersects.length > 0) {
                $scope.SELECTED = intersects[0].object;
            }
        }

        // Release selected object.
        function onDocumentMouseUp(event){
            event.preventDefault();
            $scope.SELECTED = null;
        }

        // Drag the ball under the mesh graph.
        function onDocumentMouseMove(event) {
            event.preventDefault();

            mouse.x = getXPosition(event.clientX, div_element);
            mouse.y = getYPosition(event.clientY, div_element);

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            updateCursorPointer(raycaster, sphere, div_element);

            if ($scope.SELECTED) {
                var intersects = raycaster.intersectObject(mesh);

                if (intersects.length > 0)
                {
                    updateScopeValues(
                        $scope,
                        intersects[0].point.x,
                        intersects[0].point.y,
                        intersects[0].point.z);
                }
            }
        }

        // init graph components.
        function init() {
            div_element =  $("#" + div_id);

            scene = new THREE.Scene();
            GRAP.createGraphAxes(scene);
            GRAP.createGraphPlanes(scene);

            mesh = GRAP.getGraphMesh();
            sphere = GRAP.getSphere(0xCC0000);
            camera = GRAP.getCamera(div_element.width(), div_element.height());
            light = GRAP.getLight();
            ambientLight = GRAP.getAmbientLight();

            scene.add(ambientLight);
            scene.add(light);
            scene.add(mesh);
            scene.add(sphere);

            camera.lookAt(scene.position);

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(div_element.width(), div_element.height());
            div_element.append(renderer.domElement);

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

        // Graph operation, enable external components to move sphere object.
        var graphOperations =
        {
             changeObjectX: function(value){sphere.position.x = value;},
             changeObjectY: function(value){sphere.position.y = value;},
             changeObjectZ: function(value){sphere.position.z = value;},
        }

        init();
        animate();

        return graphOperations;
    }

    this.draw_mesh = function($scope, div_id) {
        var scene, camera, sphere, simulation_sphere;
        var mesh, light, ambientLight, div_element;

        var mouse = new THREE.Vector2();

        // Validate if click was pressed on the ball.
        function onDocumentMouseDown(event) {
            event.preventDefault();
            var intersects = getIntersectedObjects(mouse, camera, [sphere]);

            if (intersects.length > 0) {
                $scope.SELECTED = intersects[0].object;
            }
        }

        // Release selected object.
        function onDocumentMouseUp(event){
            event.preventDefault();
            $scope.SELECTED = null;
        }

        // Drag the ball under the mesh graph.
        function onDocumentMouseMove(event) {
            event.preventDefault();

            mouse.x = getXPosition(event.clientX, div_element);
            mouse.y = getYPosition(event.clientY, div_element);

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            updateCursorPointer(raycaster, sphere, div_element);

            if ($scope.SELECTED) {
                var intersects = raycaster.intersectObject(mesh);

                if (intersects.length > 0)
                {
                    updateScopeValues(
                        $scope,
                        intersects[0].point.x,
                        intersects[0].point.y,
                        intersects[0].point.z);
                }
            }
        }

        // init graph components.
        function init() {
            div_element =  $("#" + div_id);

            scene = new THREE.Scene();
            GRAP.createGraphAxes(scene);
            GRAP.createGraphPlanes(scene);

            mesh = GRAP.getGraphMesh();
            sphere = GRAP.getSphere(0xCC0000);
            simulation_sphere = GRAP.getSphere(0xB706BD);
            camera = GRAP.getCamera(div_element.width(), div_element.height());
            light = GRAP.getLight();
            ambientLight = GRAP.getAmbientLight();

            scene.add(ambientLight);
            scene.add(light);
            scene.add(mesh);
            scene.add(sphere);
            scene.add(simulation_sphere);

            camera.lookAt(scene.position);

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(div_element.width(), div_element.height());
            div_element.append(renderer.domElement);

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

        // Graph operation, enable external components to move sphere object.
        var graphOperations =
        {
             changeObjectX: function(value){sphere.position.x = value;},
             changeObjectY: function(value){sphere.position.y = value;},
             changeObjectZ: function(value){sphere.position.z = value;},
             changeObjectSX: function(value){simulation_sphere.position.x = value;},
             changeObjectSY: function(value){simulation_sphere.position.y = value;},
             changeObjectSZ: function(value){simulation_sphere.position.z = value;}
        }

        init();
        animate();

        return graphOperations;
    }
});
