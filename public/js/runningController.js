var runningController = function($scope, $http, $q, serverUrl, $interval, $sf_xy, $cookieStore, $modal) {

    // Init variables
    $scope.current_time = 0;


    // Simulation information
    var induction_time = $cookieStore.get('ind_time') * 60;
    var induction_pnr = $cookieStore.get('ind_pnr');

    var procedure_time = $cookieStore.get('proc_time') * 60;
    var procedure_pnr = $cookieStore.get('proc_pnr');

    var patient = $cookieStore.get('patient');

    // First we calculate the necessary infusions based on pnr value.
    // Induction PNR
    var remi_ind_inf, prop_ind_inf;
    var ind_request = $sf_xy.get({pnr: induction_pnr}, function (data) {
        remi_ind_inf = data.x;
        prop_ind_inf = data.y;
     });

    // Procedure PNR
    var remi_proc_inf, prop_proc_inf;
    var proc_request = $sf_xy.get({pnr: procedure_pnr}, function (data) {
        remi_proc_inf = data.x;
        prop_proc_inf = data.y;
     });

    $q.all([ind_request.$promise, proc_request.$promise]).then(function() {
        var remi_pump_infusion = [
                { startTime: 0,                     endTime:induction_time,         infusion: remi_ind_inf },
                { startTime: induction_time,        endTime: procedure_time + induction_time,    infusion: remi_proc_inf }
            ];

        var prop_pump_infusion = [
                { startTime: 0,                     endTime:induction_time,         infusion: prop_ind_inf },
                { startTime: induction_time,        endTime: procedure_time + induction_time,    infusion: prop_proc_inf },
            ];


        var deltaTime = 15;

        var remi_request = {
            model: 0,
            deltaTime : deltaTime,
            patient: patient,
            pumpInfusion : remi_pump_infusion,
            componentValuesDTO : {c1: 0, c2: 0, c3: 0, c4: 0},
            plasmaComponentValuesDTO: {p1: 0, p2: 0, p3: 0},
            drugConcentration: 10
            };

        var prop_request = {
            model: 1,
            deltaTime : deltaTime,
            patient: patient,
            pumpInfusion : prop_pump_infusion,
            drugConcentration: 10,
            componentValuesDTO : {c1: 0, c2: 0, c3: 0, c4: 0},
            plasmaComponentValuesDTO: {p1: 0, p2: 0, p3: 0},
            };

        $http.put(serverUrl + "/infusion/solve", remi_request).success(function (data) {
            $scope.remi_simulation_data = data;
        });

        $http.put(serverUrl + "/infusion/solve", prop_request).success(function (data) {
            $scope.prop_simulation_data = data;
        });

    });


    var remiSiteData = [];
    var propSiteData = [];
    var simultationStarted = false;
    var intervalPromise;
    $scope.start_simulation = function(start_simulation) {

        $scope.remi_simulation_data.siteConcentrationsData.forEach(function(data){
            remiSiteData.push(data.c1 + data.c2 + data.c3 + data.c4);
        });

        $scope.prop_simulation_data.siteConcentrationsData.forEach(function(data){
            propSiteData.push(data.c1 + data.c2 + data.c3 + data.c4);
        });


        var pnr_request =
        {
            'xvalues' : remiSiteData,
            'yvalues' : propSiteData
        };

        $http.put(serverUrl + "/sf/pnr_list", pnr_request).success(function (data) {
            $scope.pnr_data = data;
            if (start_simulation) {
                simultationStarted = true;
                intervalPromise = $interval(simulate, 1000, data.length);
            }
        });
    }

    $scope.updateInfusionList = function(sourceArray, newArray) {
        var maxTime = sourceArray[sourceArray.length - 1].endTime;
        var infusion = newArray[0];
        infusion.time = infusion.time + maxTime;
        infusion.endTime = infusion.endTime + maxTime;

        sourceArray.push(infusion);

        return sourceArray;
    }


    $scope.showDialog = function() {
        //stopSimulation = true;
        if (simultationStarted)
        {
            intervalPromise.cancel(0);
        }

        var modalInstance = $modal.open({
            templateUrl: 'templates/updateDialog.html',
            controller: 'updateSimulationDialogController',
            size: 'lg',
            resolve: {
                selection: function () {
                    $scope.selection = {procedure: $scope.procedure, procedureType: $scope.procedureType}
                    return $scope.selection;
                }
            }
        });

        modalInstance.result.then(function(update_info) {
            // TODO change to be dinamic!
            var curent_time = $scope.remi_simulation_data.siteConcentrationsData.length -1;

            var remi_site_concentration_data = $scope.remi_simulation_data.siteConcentrationsData[curent_time];
            var prop_site_concentration_data = $scope.prop_simulation_data.siteConcentrationsData[curent_time];

            var remi_plasma_concentration_data = $scope.remi_simulation_data.plasmaConcentrationsData[curent_time];
            var prop_plasma_concentration_data = $scope.prop_simulation_data.plasmaConcentrationsData[curent_time];

            var remi_pump_infusion = [
                { startTime: 0,                     endTime: update_info.time * 60,         infusion: update_info.x }
            ];

            var prop_pump_infusion = [
                { startTime: 0,                     endTime: update_info.time * 60,         infusion: update_info.y }
            ];

            var remi_request = {
                model: 0,
                deltaTime : 15,
                patient: patient,
                pumpInfusion : remi_pump_infusion,
                componentValuesDTO : {
                    c1: remi_site_concentration_data.c1,
                    c2: remi_site_concentration_data.c2,
                    c3: remi_site_concentration_data.c3,
                    c4: remi_site_concentration_data.c4
                },
                plasmaComponentValuesDTO: {
                    p1: remi_plasma_concentration_data.p1,
                    p2: remi_plasma_concentration_data.p2,
                    p3: remi_plasma_concentration_data.p3
                },
                drugConcentration: 10
            };

            var prop_request = {
                model: 1,
                deltaTime : 15,
                patient: patient,
                pumpInfusion : prop_pump_infusion,
                drugConcentration: 10,
                componentValuesDTO : {
                    c1: prop_site_concentration_data.c1,
                    c2: prop_site_concentration_data.c2,
                    c3: prop_site_concentration_data.c3,
                    c4: prop_site_concentration_data.c4
                },
                plasmaComponentValuesDTO: {
                    p1: prop_plasma_concentration_data.p1,
                    p2: prop_plasma_concentration_data.p2,
                    p3: prop_plasma_concentration_data.p3
                },
            };

            $http.put(serverUrl + "/infusion/solve", remi_request).success(function (data) {
                $scope.remi_simulation_data.infusionList =
                    $scope.updateInfusionList($scope.remi_simulation_data.infusionList, data.infusionList)
                $scope.remi_simulation_data.plasmaConcentrationsData =
                    $scope.remi_simulation_data.plasmaConcentrationsData.concat(data.plasmaConcentrationsData);
                $scope.remi_simulation_data.siteConcentrationsData =
                    $scope.remi_simulation_data.siteConcentrationsData.concat(data.siteConcentrationsData);
            });

            $http.put(serverUrl + "/infusion/solve", prop_request).success(function (data) {
                $scope.prop_simulation_data.infusionList =
                    $scope.updateInfusionList($scope.prop_simulation_data.infusionList, data.infusionList)
                $scope.prop_simulation_data.plasmaConcentrationsData =
                    $scope.prop_simulation_data.plasmaConcentrationsData.concat(data.plasmaConcentrationsData);
                $scope.prop_simulation_data.siteConcentrationsData =
                    $scope.prop_simulation_data.siteConcentrationsData.concat(data.siteConcentrationsData);
            });

            $scope.start_simulation(simultationStarted);

        });
    }

    function simulate() {
       // if (!stopSimulation) {
            $scope.current_time = $scope.current_time + 1;
            $scope.current_prop = propSiteData[$scope.current_time];
            $scope.current_remi = remiSiteData[$scope.current_time];
            $scope.current_pnr = $scope.pnr_data[$scope.current_time];
        //}
    }
}