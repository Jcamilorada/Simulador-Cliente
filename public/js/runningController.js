var runningController = function($scope, $interval, graph, webstore, pump, utils) {

    /* Global global variables */
    var factor = 10; var pnr_factor = 100;
    var currentTime = currentPNR = currentRemi = currentProp = 0;
    var currentDataIndex = 0;
    var simulation_running = false;
    var intervalPromise;
    var patient = webstore.get('patient');

    $scope.$watch('tiempo_actual', function() {
        $scope.tiempo_actual_2 = utils.getDateString($scope.tiempo_actual);
     });

    play_simulation = function()
    {
        var simulation_speed = 100 / $scope.velocidad_sim;
        intervalPromise = $interval(simulate, simulation_speed);
        simulation_running = true;
    }

    stop_simulation = function()
    {
        $interval.cancel(intervalPromise);
        simulation_running = false;
    }

    updateControls = function(currentTime, currentPNR, currentRemi, currentProp)
    {
        $scope.tiempo_actual = currentTime;
        $scope.remi_actual = currentRemi.toFixed(2).toString();
        $scope.prop_actual = currentProp.toFixed(2).toString();
        $scope.pnr_actual = (currentPNR * pnr_factor).toString() + "%";
    }

    update_simulation_data = function(remi_request_py, prop_request_py, resume_simulation)
    {
        pump.get_simulation_information(remi_request_py, prop_request_py).then(function(data)
            {
                $scope.prop_simulation_data = data.prop;
                $scope.remi_simulation_data = data.remi;
                $scope.pnr_simulation_data = data.pnr;
                $scope.last_infusion_remi = data.last_infusion_remi;
                $scope.last_infusion_prop = data.last_infusion_prop;
                $scope.remi_cocentrations = utils.extractArray(data.remi.siteConcentrationsData, 'total');
                $scope.prop_cocentrations = utils.extractArray(data.prop.siteConcentrationsData, 'total');
                currentDataIndex = 0;

                if (resume_simulation)
                {
                    play_simulation();
                }

            });
    }

    init = function() {
        /* time information */
        var ind_time = webstore.get('time_ind');
        var proc_time = webstore.get('time_proc');

        /* infusion remi */
        var r_ind_inf = webstore.get('remi_ind');
        var r_proc_inf = webstore.get('remi_proc');

        /* infusion propofol */
        var p_ind_inf = webstore.get('prop_ind');
        var p_proc_inf = webstore.get('prop_proc');

        /* request information */
        var remi_request_py = pump.remi_request(patient, ind_time, proc_time, r_ind_inf, r_proc_inf);
        var prop_request_py = pump.prop_request(patient, ind_time, proc_time, p_ind_inf, p_proc_inf);

        update_simulation_data(remi_request_py, prop_request_py, false);
    }

    simulate = function()
    {
        if (currentTime > $scope.pnr_simulation_data.length)
        {
            refreshSimulationData();
        }

        else
        {
            currentPNR = $scope.pnr_simulation_data[currentDataIndex];
            currentRemi = $scope.remi_cocentrations[currentDataIndex];
            currentProp = $scope.prop_cocentrations[currentDataIndex];

            graphOperations.changeObjectSX(utils.round_2d(currentProp) * factor);
            graphOperations.changeObjectSY(utils.round_2d(currentRemi) * factor);
            graphOperations.changeObjectSZ(utils.round_2d(currentPNR) * pnr_factor);

            updateControls(currentTime, currentPNR, currentRemi, currentProp);
            currentTime = currentTime +1;
            currentDataIndex = currentDataIndex + 1;
        }
    }

    refreshSimulationData = function()
    {
        stop_simulation();

        var remi_refresh_request = pump.remi_refresh_request(
            patient, $scope.last_infusion_remi, $scope.remi_simulation_data);
        var prop_refresh_request = pump.remi_refresh_request(
            patient, $scope.last_infusion_prop, $scope.prop_simulation_data);

        update_simulation_data(remi_refresh_request, prop_refresh_request, true);
    }

    $scope.actualizar = function()
    {
        simulation_running = false;
        $interval.cancel(intervalPromise);

        var remi_update_py = pump.remi_update_request(
            patient,
            $scope.tiempo,
            currentTime,
            $scope.remi,
            $scope.remi_simulation_data);

        var remi_update_py = pump.remi_update_request(
                patient,
                $scope.tiempo,
                currentTime,
                $scope.remi,
                $scope.remi_simulation_data);

        update_simulation_data(remi_update_py, remi_update_py, true);
    }

    $scope.stop_start = function()
    {
        if (simulation_running)
        {
            stop_simulation();
        }
        else
        {
            play_simulation();
        }
    }

    createControls = function()
    {
        // Readonly Information
        $scope.velocidad_infunsion = 0;
        $scope.dosis = 0;
        $scope.volumen_infundir = 0;
        $scope.tiempo_alcanzar = 0;
        $scope.pnr_actual = "0%";
        $scope.remi_actual = "0.0";
        $scope.prop_actual = "0.0";
        $scope.tiempo_actual = 0;
        $scope.tiempo_actual_2 = "00:00:00";

        // Dynamic Information
        $scope.PNR = 50;
        $scope.Remifentanilo= 7;
        $scope.Propofol = 7;
        $scope.tiempo = 120;
        $scope.velocidad_sim = 1;

        // Dynamic Controls
        var updateGui = new dat.GUI({ width: 500 });

        var pnrFolder = updateGui.addFolder('Actualizar Pnr');
        var pnrController = pnrFolder.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        var remiController = pnrFolder.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        var propController = pnrFolder.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        var tiempoController = pnrFolder.add($scope, 'tiempo', 0, 240).name('Tiempo (minutos)');
        pnrFolder.add($scope, 'actualizar').name('Actualizar');

        var confFolder = updateGui.addFolder('Configuracion');
        var velController = confFolder.add($scope, 'velocidad_sim', [1, 2, 3, 5, 10 ] ).name('Velocidad de simulacion');
        var stop_start = confFolder.add($scope, 'stop_start').name('Iniciar/Detener Simulacion');

        // Readonly Controls
        var dataGui = new dat.GUI({ autoPlace: false, width: 500});
        var velInfusionController = dataGui.add($scope, 'velocidad_infunsion').name('Velocidad Infusion').listen();
        var dosisController = dataGui.add($scope, 'dosis').name('Dosis').listen();
        var volInfundirController = dataGui.add($scope, 'volumen_infundir').name('Volumen a infundir').listen();
        var tiempoAlcaController = dataGui.add($scope, 'tiempo_alcanzar').name('Tiempo alcanzar').listen();
        var pnrActualController = dataGui.add($scope, 'pnr_actual').name('PNR actual').listen();
        var remiActualController = dataGui.add($scope, 'remi_actual').name('Remifentanilo ng/ml').listen();
        var popActualController = dataGui.add($scope, 'prop_actual').name('Propofol mcg/ml').listen();
        var tiempoActController = dataGui.add($scope, 'tiempo_actual').name('Tiempo actual (seg)').listen();
        var tiempoAct2Controller = dataGui.add($scope, 'tiempo_actual_2').name('Tiempo actual').listen();

        $(dataGui.domElement).find("input").prop('disabled', true);

        var container = document.getElementById('induction_mesh');
        dataGui.domElement.style.position = 'absolute';
        dataGui.domElement.style.left = '10px';
        dataGui.domElement.style.top = '0px';
        container.appendChild(dataGui.domElement);

        // Update Propofol value if user update remi
        remiController.onChange(function(value) {
            $sf_y.get({ x: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.value) * factor);
                }
            });
        });

        // Update remi value if user update propofol
        propController.onChange(function(value) {
            $sf_x.get({ y: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(data.value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(value) * factor);
                }
            });
        });

        // Update remi and propofol if user update PNR
        pnrController.onChange(function(value) {
           $sf_xy.get({pnr: utils.round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {
                    graphOperations.changeObjectX(utils.round_2d(data.x) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.y) * factor);
                    graphOperations.changeObjectZ(utils.round_2d(value));
                }
            });
        });
    }

    graphOperations = graph.draw_mesh($scope, 'induction_mesh');
    createControls();
    init();
}
