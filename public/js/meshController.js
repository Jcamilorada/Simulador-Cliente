var meshController = function($scope, $http, serverUrl){
    var scene, camera, renderer, controls, airplane;
    var geometry, material, mesh, light, SELECTED;
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
         mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
         mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        if (SELECTED){
            var intersects = raycaster.intersectObject(mesh);

            if (intersects.length > 0)
            {
                SELECTED.position.x = intersects[0].point.x;
                SELECTED.position.y = intersects[0].point.y;
                SELECTED.position.z = intersects[0].point.z + 2;
            }
        }
    }

    function onDocumentMouseUp(event){
        event.preventDefault();
        controls.enabled = true;
        SELECTED = null;
    }

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 90;
        controls = new THREE.TrackballControls(camera);

        initGraph();
        initPlane();
        initAirPlane();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

         $("#graphic").append(renderer.domElement);

       // Create a light.
        light = new THREE.PointLight(0xffffff);
        light.intensity = 1;
        scene.add(light);

        var light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light2 );

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

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
        loader.load('http://localhost:9041/js-resources/avion.js',
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
}