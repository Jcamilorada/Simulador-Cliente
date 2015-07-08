var runningController = function($scope, $http, $q, $drawMesh, webstore, pump, utils, serverUrl) {

    /* time information */
    var ind_time = webstore.get('time_ind');
    var proc_time = webstore.get('time_proc');

    /* infusion remi */
    var r_ind_inf = webstore.get('remi_ind');
    var r_proc_inf = webstore.get('remi_proc');

    /* infusion propofol */
    var p_ind_inf = webstore.get('prop_ind');
    var p_proc_inf = webstore.get('prop_proc');

    var patient = webstore.get('patient');

    /* request information */
    var remi_request_py = pump.remi_request(patient, ind_time, proc_time, r_ind_inf, r_proc_inf);
    var prop_request_py = pump.prop_request(patient, ind_time, proc_time, p_ind_inf, p_proc_inf);

    var remi_request = $http.put(serverUrl + "/infusion/solve", remi_request_py);
    remi_request.success(function (data) {
        $scope.remi_simulation_data = data;
    });

    var prop_request = $http.put(serverUrl + "/infusion/solve", prop_request_py).success(function (data) {
        $scope.prop_simulation_data = data;
    });

    $q.all([remi_request, prop_request]).then(function() {
        var remi_cocentrations = utils.extractArray($scope.remi_simulation_data.siteConcentrationsData, 'total');
        var prop_cocentrations = utils.extractArray($scope.prop_simulation_data.siteConcentrationsData, 'total');

        var pnrPayload = {
            xvalues : remi_cocentrations,
            yvalues : prop_cocentrations
        }

        var prop_request = $http.put(serverUrl + "/sf/pnr_list", pnrPayload).success(function (data) {
            $scope.pnr_simulation_data = data;
        });
    });

    createControls = function()
    {
        // Readonly Information
        $scope.velocidad_infunsion = 0;
        $scope.dosis = 0;
        $scope.volumen_infundir = 0;
        $scope.tiempo_alcanzar = 0;
        $scope.pnr_actual = 0;
        $scope.remi_actual = 0;
        $scope.prop_actual = 0;
        $scope.tiempo_actual = 0;

        // Dynamic Information
        $scope.PNR = 50;
        $scope.remi= 7;
        $scope.prop = 7;
        $scope.tiempo = 120;
        $scope.velocidad_sim = 1;

        $scope.actualizar = function()
        {
            console.log("clicked")
        }

        $scope.stop_start = function()
        {
            console.log("clicked")
        }

        // Dynamic Controls
        var updateGui = new dat.GUI({ width: 500 });

        var pnrFolder = updateGui.addFolder('Actualizar Pnr');
        var pnrController = pnrFolder.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        var remiController = pnrFolder.add($scope, 'remi', 1, 10).name('Remifentanilo ng/ml').listen();
        var propController = pnrFolder.add($scope, 'prop', 1, 10).name('Propofol mcg/ml').listen();
        var tiempoController = pnrFolder.add($scope, 'tiempo').name('Tiempo (minutos)');
        pnrFolder.add($scope, 'actualizar').name('Actualizar');

        var confFolder = updateGui.addFolder('Configuracion');
        var velController = confFolder.add($scope, 'velocidad_sim', [ '1x', '2x', '3x' ] ).name('Velocidad de simulacion');
        var stop_start = confFolder.add($scope, 'stop_start').name('Iniciar/Detener Simulacion');

        // Readonly Controls
        var dataGui = new dat.GUI({ autoPlace: false, width: 500});
        var velInfusionController = dataGui.add($scope, 'velocidad_infunsion').name('Velocidad Infusion');
        var dosisController = dataGui.add($scope, 'dosis').name('Dosis');
        var volInfundirController = dataGui.add($scope, 'volumen_infundir').name('Volumen a infundir');
        var tiempoAlcaController = dataGui.add($scope, 'tiempo_alcanzar').name('Tiempo alcanzar');
        var pnrActualController = dataGui.add($scope, 'pnr_actual').name('PNR actual');
        var remiActualController = dataGui.add($scope, 'remi_actual').name('Remifentanilo ng/ml');
        var popActualController = dataGui.add($scope, 'prop_actual').name('Propofol mcg/ml');
        var tiempoActController = dataGui.add($scope, 'tiempo_actual').name('Tiempo actual');
        $(dataGui.domElement).find("input").prop('disabled', true);

        var container = document.getElementById('induction_mesh');
        dataGui.domElement.style.position = 'absolute';
        dataGui.domElement.style.left = '10px';
        dataGui.domElement.style.top = '0px';
        container.appendChild(dataGui.domElement);
    }

    graphOperations = $drawMesh($scope, 'induction_mesh', true);
    createControls();
}
