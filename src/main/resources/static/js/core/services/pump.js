App.service('pump', function (utils, serverUrl, $q, $http) {
    INF_URL = "/infusion/solve";

    inf_request = function(patient, ind_time, proc_time, ind_inf, proc_inf, model, concentration) {
        var infusions =[
                {
                    startTime:  0,
                    endTime:    utils.round(ind_time) * 60,
                    infusion:   ind_inf },
                {
                    startTime:  utils.round(ind_time) * 60,
                    endTime:    utils.round(proc_time + ind_time) * 60,
                    infusion:   proc_inf }
            ];

        var request = {
            model: model,
            deltaTime : 240,
            patient: patient,
            pumpInfusion : infusions,
            componentValuesDTO : {c1: 0, c2: 0, c3: 0, c4: 0},
            plasmaComponentValuesDTO: {p1: 0, p2: 0, p3: 0},
            drugConcentration: concentration
        };

        return request;
    }

    update_request = function(patient, ind_time, current_time, infusion, simulation_data, model, concentration) {
        var p = simulation_data.plasmaConcentrationsData[current_time];
        var c = simulation_data.siteConcentrationsData[current_time];

        var infusions =[
            {
                startTime : 0,
                endTime : utils.round_2d(ind_time),
                infusion : infusion
            }];

        var request = {
            model: model,
            deltaTime : 240,
            patient: patient,
            pumpInfusion : infusions,
            componentValuesDTO : {c1: c.c1, c2: c.c2, c3: c.c3, c4: c.c4},
            plasmaComponentValuesDTO: {p1: p.p1, p2: p.p2, p3: p.p3},
            drugConcentration: concentration
        };

        return request;
    }

    refresh_request = function(patient, infusion, simulation_data, model, concentration) {
        var p = utils.lastArrayElement(simulation_data.plasmaConcentrationsData);
        var c = utils.lastArrayElement(simulation_data.siteConcentrationsData);

        var new_infusion = {
            startTime: 0,
            endTime: infusion.endTime - infusion.startTime,
            infusion: infusion.infusion
        };

        var request = {
            model: model,
            deltaTime : 240,
            patient: patient,
            pumpInfusion : [new_infusion],
            componentValuesDTO : {c1: c.c1, c2: c.c2, c3: c.c3, c4: c.c4},
            plasmaComponentValuesDTO: {p1: p.p1, p2: p.p2, p3: p.p3},
            drugConcentration: concentration
        };

        return request;
    }

    this.infused_volume = function(current, current_infusion) {
        return Number(current) + Number(current_infusion)/3600;
    }

    this.current_infusion = function(current_time, infusion_list)
    {
        var arrayLength = infusion_list.length;
        for (var i = 0; i < arrayLength; i++) {
            var infusion = infusion_list[i];

            if (current_time <= infusion.endTime && current_time >= infusion.time) {

                return {
                    value:infusion.infusionValue,
                    a_value:infusion.alternativeInfusionValue
                  };
            }
        }
    }

    this.current_infusion_time = function(current_time, infusion_list)
    {
        var arrayLength = infusion_list.length;
        for (var i = 0; i < arrayLength; i++) {
            var infusion = infusion_list[i];

            if (current_time <= infusion.endTime && current_time >= infusion.time) {
                return infusion.endTime - infusion.time;
            }
        }
    }
    
    this.remi_request = function(patient, ind_time, proc_time, ind_inf, proc_inf, concentration) {
        return inf_request(patient, ind_time, proc_time, ind_inf, proc_inf, 0, concentration);
    }

    this.prop_request = function(patient, ind_time, proc_time, ind_inf, proc_inf, concentration) {
        return inf_request(patient, ind_time, proc_time, ind_inf, proc_inf, 1, concentration);
    }

    this.remi_update_request = function(patient, time, current_time, remi_inf, simulation_data, concentration) {
        return update_request(patient, time, current_time, remi_inf, simulation_data, 0, concentration);
    }

    this.prop_update_request = function(patient, time, current_time, prop_inf, simulation_data, concentration) {
        return update_request(patient, time, current_time, prop_inf, simulation_data,  1, concentration);
    }

    this.remi_refresh_request = function(patient, infusion, simulation_data, concentration) {
        return refresh_request(patient, infusion, simulation_data, 0, concentration);
    }

    this.prop_refresh_request = function(patient, infusion, simulation_data, concentration) {
        return refresh_request(patient, infusion, simulation_data, 1, concentration);
    }

    this.get_simulation_information = function(remi_request_py, prop_request_py) {
        var deferred = $q.defer();

        var remi_simulation_data, prop_simulation_data;
        var remi_request = $http.put(serverUrl + INF_URL, remi_request_py).success(function (data) {
            remi_simulation_data = data;
        });

        var prop_request = $http.put(serverUrl + INF_URL, prop_request_py).success(function (data) {
            prop_simulation_data = data;
        });

        $q.all([remi_request, prop_request]).then(function() {
            var remi_cocentrations = utils.extractArray(remi_simulation_data.siteConcentrationsData, 'total');
            var prop_cocentrations = utils.extractArray(prop_simulation_data.siteConcentrationsData, 'total');

            var pnrPayload = {
                xvalues : remi_cocentrations,
                yvalues : prop_cocentrations
            }

            var prop_request = $http.put(serverUrl + "/sf/pnr_list", pnrPayload).success(function (pnr_simulation_data) {
                deferred.resolve(
                    {
                        remi:remi_simulation_data,
                        prop:prop_simulation_data,
                        pnr:pnr_simulation_data,
                        last_infusion_remi: utils.lastArrayElement(remi_request_py.pumpInfusion),
                        last_infusion_prop: utils.lastArrayElement(prop_request_py.pumpInfusion)
                    });
            });
        });

        return deferred.promise;
    }
});
