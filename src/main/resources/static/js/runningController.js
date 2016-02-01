var runningController = function($scope, $interval, $sf_y, $sf_x, $sf_xy, graph, webstore, pump, utils) {

    /* Global global variables */
    var factor = 10; var pnr_factor = 100;
    var currentTime = currentPNR = currentRemi = currentProp = 0;
    var currentInfTime;
    var currentDataIndex = 0;
    var simulation_running = false;
    var intervalPromise;
    var patient = webstore.get('patient');

    $scope.$watch('tiempo_actual', function() {
        $scope.tiempo_actual_2 = utils.getDateString($scope.tiempo_actual);
     });

    play_simulation = function()
    {
        var simulation_speed = 1000 / $scope.velocidad_sim;
        intervalPromise = $interval(simulate, simulation_speed);
        simulation_running = true;
    }

    stop_simulation = function()
    {
        $interval.cancel(intervalPromise);
        simulation_running = false;
    }

    updateControls = function(
      infusion_time,
      currentTime,
      currentPNR,
      currentRemi,
      currentProp,
      currenRemiInfusion,
      currenPropInfusion)
    {
        $scope.tiempo_actual = currentTime;
        $scope.remi_actual = currentRemi.toFixed(2).toString();
        $scope.prop_actual = currentProp.toFixed(2).toString();
        $scope.pnr_actual = (currentPNR * pnr_factor).toString() + "%";

        $scope.volumen_infu_r =
          pump.infused_volume($scope.volumen_infu_r, currenRemiInfusion.value);
        $scope.volumen_infu_p =
          pump.infused_volume($scope.volumen_infu_p, currenPropInfusion.value);

        $scope.display_volumen_infu_r = utils.round_3d($scope.volumen_infu_r);
        $scope.display_volumen_infu_p = utils.round_3d($scope.volumen_infu_p);

        $scope.velocidad_infunsion_r =
          currenRemiInfusion.value + "ml/h -" + currenRemiInfusion.a_value + " ug/kg/h";
        $scope.velocidad_infunsion_p =
            currenPropInfusion.value + "ml/h -" + currenPropInfusion.a_value + " mg/kg/h";
        
        $scope.volumen_a_infu_r = utils.round_2d(currenRemiInfusion.value * (infusion_time/60) / 60).toString()  + " ml";
        $scope.volumen_a_infu_p = utils.round_2d(currenPropInfusion.value * (infusion_time/60) / 60 ).toString() + " ml";
    }

    update_simulation_data = function(
        remi_request_py, prop_request_py, resume_simulation,
        target_remi, target_prop, target_pnr, target_time)
    {
        updateTarget(target_remi, target_prop, target_pnr, target_time);

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

        /* pnr induction*/
        var pnr_ind = webstore.get('pnr_ind');

        /* drugs concentration */
        var concentrationR = (webstore.get("induction_drug1").value) / webstore.get('drug1_solution');
        var concentrationP = webstore.get("induction_drug2").value / webstore.get('drug2_solution');

        /* request information */
        var remi_request_py = pump.remi_request(patient, ind_time, proc_time, r_ind_inf, r_proc_inf, concentrationR);
        var prop_request_py = pump.prop_request(patient, ind_time, proc_time, p_ind_inf, p_proc_inf, concentrationP);


        update_simulation_data(remi_request_py, prop_request_py, false, r_ind_inf, p_ind_inf, pnr_ind, ind_time);
    }

    /* updates the values for the target value */
    updateTarget = function(remi_conc, prop_conc, pnr, time) {

        graphOperations.changeObjectX(utils.round_2d(remi_conc) * factor);
        graphOperations.changeObjectY(utils.round_2d(prop_conc) * factor);
        graphOperations.changeObjectZ(utils.round_2d(pnr));

        $scope.Remifentanilo = utils.round_2d(remi_conc);
        $scope.Propofol = utils.round_2d(prop_conc);
        $scope.tiempo = time;
        $scope.PNR = pnr;
    }

    simulate = function()
    {
        if (currentDataIndex >= $scope.pnr_simulation_data.length)
        {
            refreshSimulationData();
        }

        else
        {
            // if induction value is ending update target to procedure
            if ($scope.prop_simulation_data.infusionList.length === 2
                    && currentTime === $scope.prop_simulation_data.infusionList[0].endTime)
            {
                var p_proc_inf = webstore.get('prop_proc');
                var r_proc_inf = webstore.get('remi_proc');

                var proc_time = webstore.get('time_proc');
                var pnr_proc = webstore.get('pnr_proc');

                updateTarget(r_proc_inf, p_proc_inf, pnr_proc, proc_time);
            }

            var currenPropInfusion = pump.current_infusion(
              currentDataIndex, $scope.prop_simulation_data.infusionList);
            var currenRemiInfusion = pump.current_infusion(
                currentDataIndex, $scope.remi_simulation_data.infusionList);
            var infusion_time = pump.current_infusion_time(
                currentDataIndex, $scope.remi_simulation_data.infusionList);

            currentPNR = $scope.pnr_simulation_data[currentDataIndex];
            currentRemi = $scope.remi_cocentrations[currentDataIndex];
            currentProp = $scope.prop_cocentrations[currentDataIndex];
            currentInfTime = infusion_time;

            graphOperations.changeObjectSY(utils.round_2d(currentProp) * factor);
            graphOperations.changeObjectSX(utils.round_2d(currentRemi) * factor);
            graphOperations.changeObjectSZ(utils.round_2d(currentPNR) * pnr_factor);


            updateControls(
              infusion_time,
              currentTime,
              currentPNR,
              currentRemi,
              currentProp,
              currenRemiInfusion,
              currenPropInfusion);

            currentTime = currentTime +1;
            currentDataIndex = currentDataIndex + 1;
        }
    }

    refreshSimulationData = function()
    {
        stop_simulation();

        /* drugs concentration */
        var concentrationR = (webstore.get("induction_drug1").value) / webstore.get('drug1_solution');
        var concentrationP = webstore.get("induction_drug2").value / webstore.get('drug2_solution');

        var remi_refresh_request = pump.remi_refresh_request(
            patient, $scope.last_infusion_remi, $scope.remi_simulation_data, concentrationR);
        var prop_refresh_request = pump.prop_refresh_request(
            patient, $scope.last_infusion_prop, $scope.prop_simulation_data, concentrationP);

        update_simulation_data(remi_refresh_request, prop_refresh_request, true,
            $scope.Remifentanilo, $scope.Propofol, $scope.PNR, $scope.tiempo);
    }

    $scope.actualizar = function()
    {
        simulation_running = false;
        $interval.cancel(intervalPromise);

        /* drugs concentration */
        var concentrationR = (webstore.get("induction_drug1").value) / webstore.get('drug1_solution');
        var concentrationP = webstore.get("induction_drug2").value / webstore.get('drug2_solution');

        var remi_update_py = pump.remi_update_request(
            patient,
            $scope.tiempo * 60,
            currentDataIndex,
            $scope.Remifentanilo,
            $scope.remi_simulation_data,
            concentrationR);

        var prop_update_py = pump.prop_update_request(
                patient,
                $scope.tiempo * 60,
                currentDataIndex,
                $scope.Propofol,
                $scope.prop_simulation_data,
                concentrationP);

        update_simulation_data(remi_update_py, prop_update_py, true,
            $scope.Remifentanilo, $scope.Propofol, $scope.PNR, $scope.tiempo);
    }

    $scope.despertar = function()
    {
        $scope.Remifentanilo = 2;
        $scope.Propofol = 1.5;
        $scope.tiempo = 10;
        $scope.PNR = 0.01;

        stop_simulation();

        graphOperations.changeObjectX(2 * factor);
        graphOperations.changeObjectY(1.5 * factor);
        graphOperations.changeObjectZ(0.01);
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

    var updateGui;
    var dataGui;
    createControls = function()
    {
        // Readonly Information
        $scope.velocidad_infunsion_r = "-";
        $scope.velocidad_infunsion_p = "-";

        $scope.volumen_infu_r  = "0";
        $scope.volumen_infu_p  = "0";
        $scope.display_volumen_infu_r  = "0";
        $scope.display_volumen_infu_p  = "0";

        $scope.volumen_a_infu_r = "";
        $scope.volumen_a_infu_p = "";

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
        updateGui = new dat.GUI({autoPlace: false, width: 500 });

        var pnrFolder = updateGui.addFolder('Actualizar Pnr');
        var pnrController = pnrFolder.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        var remiController = pnrFolder.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        var propController = pnrFolder.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        var tiempoController = pnrFolder.add($scope, 'tiempo', 0, 240).name('Tiempo (minutos)').listen();
        pnrFolder.add($scope, 'actualizar').name('Actualizar');
        pnrFolder.add($scope, 'despertar').name('Despertar');

        var confFolder = updateGui.addFolder('Configuracion');
        var velController = confFolder.add($scope, 'velocidad_sim', [1, 2, 5, 10, 30, 100 ] ).name('Velocidad de simulacion');

        velController.onChange(function(value){
            stop_simulation();
            play_simulation();
        });

        var stop_start = confFolder.add($scope, 'stop_start').name('Iniciar/Detener Simulacion');

        // Readonly Controls
        dataGui = new dat.GUI({ autoPlace: false, width: 500});
        var remiFolder = dataGui.addFolder('Remifentanilo');
        var propFolder = dataGui.addFolder('Propofol');

        var velInfusionRemiController = remiFolder.add($scope, 'velocidad_infunsion_r').name('Velocidad Infusion').listen();
        var velInfusionPropController = propFolder.add($scope, 'velocidad_infunsion_p').name('Velocidad Infusion').listen();

        var volumenInfundidoR = remiFolder.add($scope, 'display_volumen_infu_r').name('V. Infundido ml').listen();
        var volumenInfundidoP = propFolder.add($scope, 'display_volumen_infu_p').name('V. Infundido ml').listen();

        var volumenInfundirR = remiFolder.add($scope, 'volumen_a_infu_r').name('V. a Infundir ml').listen();
        var volumenInfundirP = propFolder.add($scope, 'volumen_a_infu_p').name('V. a Infundir ml').listen();

        var actualFolder = dataGui.addFolder('Simulacion');
        var pnrActualController = actualFolder.add($scope, 'pnr_actual').name('PNR actual').listen();
        var remiActualController = actualFolder.add($scope, 'remi_actual').name('Remifentanilo ng/ml').listen();
        var popActualController = actualFolder.add($scope, 'prop_actual').name('Propofol mcg/ml').listen();
        var tiempoActController = actualFolder.add($scope, 'tiempo_actual').name('Tiempo actual (seg)').listen();
        var tiempoAct2Controller = actualFolder.add($scope, 'tiempo_actual_2').name('Tiempo actual').listen();

        $(dataGui.domElement).find("input").prop('disabled', true);

        var container = document.getElementById('induction_mesh');
        dataGui.domElement.style.position = 'absolute';
        dataGui.domElement.style.left = '10px';
        dataGui.domElement.style.top = '0px';
        container.appendChild(dataGui.domElement);

        updateGui.domElement.style.position = 'absolute';
        updateGui.domElement.style.right = '10px';
        updateGui.domElement.style.top = '0px';
        container.appendChild(updateGui.domElement);

        // Update Propofol value if user update remi
        remiController.onChange(function(value) {
            stop_simulation();
            $sf_y.get({ x: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.value) * factor);

                    $scope.Propofol = utils.round_2d(data.value);
                }
            });
        });

        // Update remi value if user update propofol
        propController.onChange(function(value) {
            stop_simulation();
            $sf_x.get({ y: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(data.value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(value) * factor);

                    $scope.Remifentanilo = utils.round_2d(data.value);
                }
            });
        });

        // Update remi and propofol if user update PNR
        pnrController.onChange(function(value) {
            stop_simulation();
            $sf_xy.get({pnr: utils.round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {
                    graphOperations.changeObjectX(utils.round_2d(data.x) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.y) * factor);
                    graphOperations.changeObjectZ(utils.round_2d(value));

                    $scope.Remifentanilo = utils.round_2d(data.x);
                    $scope.Propofol = utils.round_2d(data.y);
                }
            });
        });
    }

    $scope.$on('$locationChangeStart', function(event, next, current) {
        updateGui.destroy();
        dataGui.destroy();
    });

    graphOperations = graph.draw_mesh($scope, 'induction_mesh');
    createControls();
    init();
}
