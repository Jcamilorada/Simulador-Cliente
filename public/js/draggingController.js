var draggingController = function($scope, $http, serverUrl){
    var scene, camera, renderer, controls;
    var geometry, material, mesh, plane, SELECTED;

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
            SELECTED = intersects[0].object;
        }
    }

    function onDocumentMouseMove(event){
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        if (SELECTED){
            var intersects = raycaster.intersectObject(plane);

            if (intersects.length > 0)
            {
                SELECTED.position.copy(intersects[0].point);
            }
        }
    }

    function onDocumentMouseUp(event){
        event.preventDefault();
        controls.enabled = true;
        SELECTED = null;
    }

    function init(){
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.x = -98;
        camera.position.y = 311;
        camera.position.z = 275;
        controls = new THREE.TrackballControls(camera);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight);

         $("#graphic").append(renderer.domElement);

        initPlane();
        initCube();

       // Create a light.
        var light = new THREE.PointLight(0xffffff);
        light.position.set(-100,200,100);
        light.intensity = 5;
        scene.add(light);

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
   }

    function initCube(){
    var loader = new THREE.JSONLoader();
    loader.load('http://localhost:9041/js-resources/airplane.js',
        function(geometry, materials) {
            mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
            scene.add(mesh);
            objects.push(mesh);
        });
    }

    function initPlane(){
        var axes = new THREE.AxisHelper(50);
        scene.add(axes);

        plane = new THREE.GridHelper(50, 1);
        scene.add(plane);
    }

   function animate(){
       requestAnimationFrame(animate);
       controls.update();
       renderer.setClearColor(0xFFFFFFFF, 0);
       renderer.render(scene, camera);
   }
}
