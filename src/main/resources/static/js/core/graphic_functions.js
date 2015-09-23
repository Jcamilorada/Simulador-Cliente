var GRAP = GRAP || {};

GRAP.xMin = 0;
GRAP.xMax = 100;
GRAP.yMin = 0;
GRAP.yMax = 100;
GRAP.segments = 60;
GRAP.texture = 'images/square.png';
GRAP.zFuncText = "10 * (0.0828 * (x* 0.1) * (y *0.1))^ 5.1550 / (1 + (0.0828 * (x* 0.1) * (y *0.1))^ 5.1550)";

/* Generates a graphic mesh based on configuration constant and function. */
GRAP.getGraphMesh = function(){
    var xRange = GRAP.xMax - GRAP.xMin;
    var yRange = GRAP.yMax - GRAP.yMin;

    var zFunc = Parser.parse(GRAP.zFuncText).toJSFunction( ['x','y'] );
    var meshFunction = function(x, y) {
        x = xRange * x + GRAP.xMin;
        y = yRange * y + GRAP.yMin;
        var z = zFunc(x, y);

        if (isNaN(z))
            return new THREE.Vector3(0,0,0);
        else
            return new THREE.Vector3(x, y, z * 10);
    };

    var graphGeometry = new THREE.ParametricGeometry(meshFunction, GRAP.segments, GRAP.segments, true );
    graphGeometry.computeBoundingBox();

    var zMin = graphGeometry.boundingBox.min.z;
    var zMax = graphGeometry.boundingBox.max.z;
    var zRange = zMax - zMin;
    var color, point, face, numberOfSides, vertexIndex;

    // Faces are indexed using characters
    var faceIndices = [ 'a', 'b', 'c', 'd' ];
    // First, assign colors to vertices as desired
    for (var i = 0; i < graphGeometry.vertices.length; i++) {
        point = graphGeometry.vertices[ i ];
        color = new THREE.Color( 0x0000ff );
        color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
        graphGeometry.colors[i] = color; // use this array for convenience
    }

    // Copy the colors as necessary to the face's vertexColors array.
    for (var i = 0; i < graphGeometry.faces.length; i++) {
        face = graphGeometry.faces[ i ];
        numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;
        for( var j = 0; j < numberOfSides; j++ )
        {
            vertexIndex = face[ faceIndices[ j ] ];
            face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
        }
    }

    var wireTexture = new THREE.ImageUtils.loadTexture(GRAP.texture);
    wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping;
    wireTexture.repeat.set(40, 40);
    wireMaterial = new THREE.MeshBasicMaterial({map: wireTexture, vertexColors: THREE.VertexColors, side:THREE.DoubleSide});

    return new THREE.Mesh(graphGeometry, wireMaterial);
}

GRAP.getSphere = function(color) {
    var radius = 4, segments = 16, rings = 16;
    var sphereMaterial = new THREE.MeshLambertMaterial({color: color});

    return new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
}

GRAP.getCamera = function(width, height) {
    var camera = new THREE.PerspectiveCamera(
        75,             // Field of view
        width / height, // Aspect ratio
        1,              // Near
        10000           // Far
    );
    camera.position.set(-103, -119, 140);
    camera.up = new THREE.Vector3(0, 0, 1);

    return camera;
}

/* Create X,Y,Z axes. */
GRAP.createGraphAxes = function(scene) {
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

GRAP.createGraphPlanes = function(scene) {
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

GRAP.getLight = function(scene) {
    var light = new THREE.PointLight(0xffffff);
    light.intensity = 1;

    return light;
}

GRAP.getAmbientLight = function(scene) {
    return new THREE.AmbientLight(0x404040);
}