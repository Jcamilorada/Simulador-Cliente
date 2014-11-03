var meshController = function($scope, $http, serverUrl){
    var scene, camera, renderer, controls;
    var geometry, material, mesh, light;

    init();
    animate();


    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 90;
        controls = new THREE.TrackballControls(camera);

        initGraph();
        initPlane();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

         $("#graphic").append(renderer.domElement);

       // Create a light.
        light = new THREE.PointLight(0xffffff);
        //light.position.set(-100,200,100);
        //light.position = camera.position;
        light.intensity = 1;
        scene.add(light);

        var light2 = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light2 );

   }

    function initGraph() {
        var loader = new THREE.JSONLoader();
        loader.load(serverUrl + '/mesh/remi_prop',
            function(geometry, materials) {
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

   function animate() {
       requestAnimationFrame(animate);
       controls.update();
       light.position.copy( camera.position );
       renderer.setClearColor( 0xFFFFFFFF, 0 );
       renderer.render(scene, camera);
   }
}