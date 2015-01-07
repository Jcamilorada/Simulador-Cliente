var runningController = function($scope, $http, $q, serverUrl, $interval, $sf_xy, $cookieStore) {

    // Init variables
    $scope.current_time = 0;

    // Simulation information
    var induction_time = $cookieStore.get('ind_time') * 60;
    var induction_pnr = $cookieStore.get('ind_pnr');

    var procedure_interval = $cookieStore.get('proc_inter_time') * 60;
    var procedure_raise_time = $cookieStore.get('proc_time') * 60;
    var procedure_pnr = $cookieStore.get('proc_pnr');

    var wake_time = $cookieStore.get('wakeup_time') * 60;
    var wake_pnr = $cookieStore.get('wakeup_pnr');

    var deltaTime = $cookieStore.get('delta') * 60;
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

    // Wakeup PNR
    var remi_wake_inf, prop_wake_inf;
    var wake_request = $sf_xy.get({pnr: wake_pnr}, function (data) {
        remi_wake_inf = data.x;
        prop_wake_inf = data.y;
     });

    $q.all([ind_request.$promise, proc_request.$promise, wake_request.$promise]).then(function() {
        var procedure_end_time = induction_time + procedure_interval + procedure_raise_time;
        var wakeup_end_time = procedure_end_time + wake_time;

        var remi_pump_infusion = [
            { startTime: 0,                     endTime:induction_time,         infusion: remi_ind_inf },
            { startTime: induction_time,        endTime: procedure_raise_time + induction_time,    infusion: remi_proc_inf },
            { startTime: procedure_end_time,    endTime: wakeup_end_time,      infusion: remi_wake_inf}
            ];

        var prop_pump_infusion = [
            { startTime: 0,                     endTime:induction_time,         infusion: prop_ind_inf },
            { startTime: induction_time,        endTime: procedure_raise_time + induction_time,    infusion: prop_proc_inf },
            { startTime: procedure_end_time,    endTime: wakeup_end_time,      infusion: prop_wake_inf}
            ];

        var remi_request = { model: 0, deltaTime : deltaTime, patient: patient , pumpInfusion : remi_pump_infusion, drugConcentration: 10 };
        var prop_request = { model: 1, deltaTime : deltaTime, patient: patient , pumpInfusion : prop_pump_infusion, drugConcentration: 10 };

        $http.put(serverUrl + "/infusion/solve", remi_request).success(function (data) {
            $scope.remi_simulation_data = data;
        });

        $http.put(serverUrl + "/infusion/solve", prop_request).success(function (data) {
            $scope.prop_simulation_data = data;
        });

    });


    $scope.start_simulation = function() {
        var pnr_request =
        {
            'xvalues' : $scope.remi_simulation_data.siteConcentrationsData,
            'yvalues' : $scope.prop_simulation_data.siteConcentrationsData
        };

        $http.put(serverUrl + "/sf/pnr_list", pnr_request).success(function (data) {
            $scope.pnr_data = data;
            $interval(simulate, 1000, data.length);
        });


    }

    function simulate() {
        $scope.current_time = $scope.current_time + 1;
        $scope.current_prop = $scope.prop_simulation_data.siteConcentrationsData[$scope.current_time];
        $scope.current_remi = $scope.remi_simulation_data.siteConcentrationsData[$scope.current_time];
        $scope.current_pnr = $scope.pnr_data[$scope.current_time];
    }
}