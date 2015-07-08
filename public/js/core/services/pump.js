App.service('pump', function () {
    inf_request = function(patient, ind_time, proc_time, ind_inf, proc_inf, model) {
        var infusions =[
                { startTime: 0,          endTime:ind_time,              infusion: ind_inf },
                { startTime: ind_time,   endTime: proc_time + ind_time, infusion: proc_inf }
            ];

        var request = {
            model: model,
            deltaTime : 240,
            patient: patient,
            pumpInfusion : infusions,
            componentValuesDTO : {c1: 0, c2: 0, c3: 0, c4: 0},
            plasmaComponentValuesDTO: {p1: 0, p2: 0, p3: 0},
            drugConcentration: 10
            };

        return request;
    }

    this.remi_request = function(patient, ind_time, proc_time, ind_inf, proc_inf) {
        return inf_request(patient, ind_time, proc_time, ind_inf, proc_inf, 0);
    }

    this.prop_request = function(patient, ind_time, proc_time, ind_inf, proc_inf) {
        return inf_request(patient, ind_time, proc_time, ind_inf, proc_inf, 1);
    }
});
