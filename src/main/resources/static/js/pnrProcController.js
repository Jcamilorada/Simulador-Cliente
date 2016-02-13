var pnrProcController = function($scope, $sf_y, $sf_x, $sf_xy, $sf_xy_pnr, graph, webstore, utils, pump, $interval)
{
    // factor value for concentrations.
    var factor = 10;
    var pnr_factor = 100;
    var default_time = 30;

    var graphOperations;

    // cookies names
    var prc_c = "procedureType";
    var pnr_c = "pnr_proc"
    var prop_c = "prop_proc";
    var remi_c = "remi_proc";
    var time_c = "time_proc";

    var zController, xController, yController, timeController, gui;
    createControls = function()
    {
        // Readonly Information
        $scope.velocidad_infunsion_r = "-";
        $scope.velocidad_infunsion_p = "-";

        $scope.volumen_a_infu_r = "";
        $scope.volumen_a_infu_p = "";

        gui = new dat.GUI({ autoPlace: false, width: 500 });
        zController = gui.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        xController = gui.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        yController = gui.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        timeController = gui.add($scope, 'Tiempo', 0, 240).name('Tiempo (minutos) ').listen();

        dataGui = new dat.GUI({ autoPlace: false, width: 500});
        var remiFolder = dataGui.addFolder('Remifentanilo');
        var velInfusionRemiController = remiFolder.add($scope, 'velocidad_infunsion_r').name('Velocidad Infusion').listen();
        var volumenInfundirR = remiFolder.add($scope, 'volumen_a_infu_r').name('V. a Infundir ml').listen();

        var propFolder = dataGui.addFolder('Propofol');
        var velInfusionPropController = propFolder.add($scope, 'velocidad_infunsion_p').name('Velocidad Infusion').listen();
        var volumenInfundirP = propFolder.add($scope, 'volumen_a_infu_p').name('V. a Infundir ml').listen();
        $(dataGui.domElement).find("input").prop('disabled', true);

        var container = document.getElementById('proc_mesh');
        dataGui.domElement.style.position = 'absolute';
        dataGui.domElement.style.left = '10px';
        dataGui.domElement.style.top = '0px';
        container.appendChild(dataGui.domElement);

        gui.domElement.style.position = 'absolute';
        gui.domElement.style.right = '10px';
        gui.domElement.style.top = '0px';
        container.appendChild(gui.domElement);

        updateInfusionInfo();
        // Update Propofol value if user update remi
        xController.onChange(function(value) {
            webstore.update(remi_c, value);

            $sf_y.get({ x: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.value) * factor);

                    $scope.Propofol = utils.round_2d(data.value)
                    webstore.update(prop_c, $scope.Propofol);
                    updateInfusionInfo();
                }
            });
        });

        // Update remi value if user update propofol
        yController.onChange(function(value) {
            webstore.update(prop_c, value);

            $sf_x.get({ y: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(data.value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(value) * factor);

                    $scope.Remifentanilo = utils.round_2d(data.value)
                    webstore.update(remi_c, $scope.Remifentanilo);
                    updateInfusionInfo();
                }
            });
        });

        // Update remi and propofol if user update PNR
        zController.onChange(function(value) {
            webstore.update(pnr_c, value);

            $sf_xy.get({pnr: utils.round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {
                    graphOperations.changeObjectX(utils.round_2d(data.x) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.y) * factor);
                    graphOperations.changeObjectZ(utils.round_2d(value));

                    $scope.Remifentanilo = utils.round_2d(data.x)
                    $scope.Propofol = utils.round_2d(data.y)

                    webstore.update(prop_c, $scope.Propofol);
                    webstore.update(remi_c, $scope.Remifentanilo);
                    updateInfusionInfo();
                }
            });
        });

        // Update time stored value
        timeController.onChange(function(value) {
            webstore.update('time_proc', value);
            updateInfusionInfo();
        });
    }

    // set init values based on configuration
    initValues = function(remi, prop, time)
    {
        $scope.Tiempo = time;
        $scope.Remifentanilo = remi;
        $scope.Propofol = prop;

        // Get pnr value
        $sf_xy_pnr.get({ x: utils.round_2d(remi),  y: utils.round_2d(prop)}, function (data) {
            if (angular.isDefined(data.value)) {

                $scope.PNR = utils.round_2d(data.value) * pnr_factor;
                initGraph($scope.PNR, $scope.Remifentanilo, $scope.Propofol);
                createControls();
            }
        });
    }

    /* updates plan method each 3 seconds if values are changed */
    var intervalPromise;
    $scope.$watch('[Propofol,Tiempo,Remifentanilo,PNR]', function () {
        webstore.update(prop_c, utils.round_2d($scope.Propofol));
        webstore.update(remi_c, utils.round_2d($scope.Remifentanilo));
        webstore.update(pnr_c, utils.round_2d($scope.PNR));
        webstore.update(time_c, $scope.Tiempo);

        if (angular.isDefined(intervalPromise)) {
            $interval.cancel(intervalPromise);
            intervalPromise = undefined;
        }

        intervalPromise = $interval(updateInfusionInfo, 2000, 1);
    }, true);

    /* Update the infusion values based on the patient information and current inductions. */
    updateInfusionInfo = function()
    {
        var patient = webstore.get('patient');
       /* time information */
        var ind_time = webstore.get('time_ind');
        var proc_time = webstore.get('time_proc');

        /* infusion remi */
        var r_ind_inf = webstore.get('remi_ind');
        var r_proc_inf = webstore.get('remi_proc');

        /* infusion propofol */
        var p_ind_inf = webstore.get('prop_ind');
        var p_proc_inf = webstore.get('prop_proc');

        /* drugs concentration */
        var concentrationR = (webstore.get("induction_drug1").value) / webstore.get('drug1_solution');
        var concentrationP = webstore.get("induction_drug2").value / webstore.get('drug2_solution');

        /* request information */
        var remi_request_py = pump.remi_request(patient, ind_time, proc_time, r_ind_inf, r_proc_inf, concentrationR);
        var prop_request_py = pump.prop_request(patient, ind_time, proc_time, p_ind_inf, p_proc_inf, concentrationP);
        update_simulation_data(remi_request_py, prop_request_py);
    }

    /* Perform a server request and update values with retrieved data */
    update_simulation_data = function(remi_request_py, prop_request_py, resume_simulation)
    {
        pump.get_simulation_information(remi_request_py, prop_request_py).then(function(data)
            {
                var proc_time = webstore.get(time_c);

                $scope.prop_simulation_data = data.prop;
                $scope.remi_simulation_data = data.remi;
                $scope.pnr_simulation_data = data.pnr;
                $scope.last_infusion_remi = data.last_infusion_remi;
                $scope.last_infusion_prop = data.last_infusion_prop;
                $scope.remi_cocentrations = utils.extractArray(data.remi.siteConcentrationsData, 'total');
                $scope.prop_cocentrations = utils.extractArray(data.prop.siteConcentrationsData, 'total');
                currentDataIndex = 0;

                var currenPropInfusion = $scope.prop_simulation_data.infusionList[1];
                var currenRemiInfusion = $scope.remi_simulation_data.infusionList[1];

                $scope.velocidad_infunsion_r =
                    currenRemiInfusion.infusionValue + "ml/h -" + currenRemiInfusion.alternativeInfusionValue + " ug/kg/h";
                $scope.velocidad_infunsion_p =
                    currenPropInfusion.infusionValue + "ml/h -" + currenPropInfusion.alternativeInfusionValue + " mg/kg/h";

                $scope.volumen_a_infu_r = utils.round_2d(currenRemiInfusion.infusionValue * (proc_time) / 60).toString()  + " ml";
                $scope.volumen_a_infu_p = utils.round_2d(currenPropInfusion.infusionValue * (proc_time) / 60 ).toString() + " ml";
            });
    }

    // init graph position
    initGraph = function(PNR, remi, prop)
    {
        graphOperations.changeObjectX(remi * factor);
        graphOperations.changeObjectZ(PNR);
        graphOperations.changeObjectY(prop * factor);
    }

    // Al cambiar de pagina se cancela cualquier promesa de actualización y se almacenan los valores al dia.
    $scope.$on('$locationChangeStart', function(event, next, current) {
        $interval.cancel(intervalPromise);
        webstore.update(prop_c, utils.round_2d($scope.Propofol));
        webstore.update(remi_c, utils.round_2d($scope.Remifentanilo));
        webstore.update(pnr_c, utils.round_2d($scope.PNR))
        gui.destroy();
    });

    var time_proc =  webstore.get(time_c);
    var remi_proc = webstore.get(remi_c);
    var prop_proc = webstore.get(prop_c);

    var procMethod =  webstore.get(prc_c);
    var time = angular.isDefined(time_proc) ? time_proc : default_time;
    var remi = angular.isDefined(remi_proc) ? remi_proc: procMethod.remi
    var prop = angular.isDefined(prop_proc) ? prop_proc: procMethod.prop;

    webstore.update(time_c, time);
    webstore.update(remi_c, remi);
    webstore.update(prop_c, prop);

    graphOperations = graph.draw_simple_mesh($scope, 'proc_mesh');
    initValues(remi, prop, time);
}
