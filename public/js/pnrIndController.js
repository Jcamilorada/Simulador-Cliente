var pnrIndController = function($scope, $drawMesh, $sf_y, $sf_x, $sf_xy, webstore, utils)
{
    // factor value for concentrations.
    var factor = 10;
    var graphOperations;

    // stores variables names
    var ind_c = "induction_method";
    var pnr_c = "pnr_ind"
    var prop_c = "prop_ind";
    var remi_c = "remi_ind";
    var time_c = "time_ind";

    var zController, xController, yController, timeController, gui;
    createControls = function()
    {
        gui = new dat.GUI({ width: 400 });
        zController = gui.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        xController = gui.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        yController = gui.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        timeController = gui.add($scope, 'Tiempo', 0, 240).name('Tiempo (minutos) ').listen();

        // Update Propofol value if user update remi
        xController.onChange(function(value) {
            webstore.update(remi_c, value);

            $sf_y.get({ x: utils.round_2d(value),  pnr: utils.round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(utils.round_2d(value) * factor);
                    graphOperations.changeObjectY(utils.round_2d(data.value) * factor);

                    $scope.Propofol = utils.round_2d(data.value)
                    onChange(prop_c, $scope.Propofol);
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
                }
            });
        });

        // Update stores value
        timeController.onChange(function(value) {
            webstore.update('time_ind', value);
        });
    }

    // set init values based on configuration
    initValues = function(PNR, remi, prop, time)
    {
        $scope.PNR = PNR;

        $scope.Tiempo = angular.isDefined(time) ? time : 120;

        if (angular.isDefined(remi) && angular.isDefined(prop))
        {
            $scope.Remifentanilo = remi;
            $scope.Propofol = prop;

            initGraph($scope.PNR, $scope.Remifentanilo, $scope.Propofol);
            createControls();
        }
        else
        {
            $sf_xy.get({pnr: utils.round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {

                    $scope.Propofol = utils.round_2d(data.y)
                    $scope.Remifentanilo = utils.round_2d(data.x)

                    initGraph($scope.PNR, $scope.Remifentanilo, $scope.Propofol);
                    createControls();
                }
            });
        }
    }

    // init graph position
    initGraph = function(PNR, remi, prop)
    {
        graphOperations.changeObjectX(remi * factor);
        graphOperations.changeObjectZ(PNR);
        graphOperations.changeObjectY(prop * factor);
    }

    $scope.$on('$locationChangeStart', function(event, next, current) {
        webstore.update(prop_c, utils.round_2d($scope.Propofol));
        webstore.update(remi_c, utils.round_2d($scope.Remifentanilo));
        webstore.update(pnr_c, utils.round_2d($scope.PNR));
        gui.destroy();
    });

    var remi = webstore.get(remi_c);
    var prop = webstore.get(prop_c);
    var pnr_ind = webstore.get(pnr_c);

    var pnr = angular.isDefined(pnr_ind) ? pnr_ind :webstore.get(ind_c).pnr;
    var time = webstore.get(time_c);

    graphOperations = $drawMesh($scope, 'induction_mesh');
    initValues(pnr, remi, prop, time);
}
