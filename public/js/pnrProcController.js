var pnrProcController = function($scope, $drawMesh, round_2d, serverUrl, $sf_y, $sf_x, $sf_xy, $cookieStore, $cookies)
{
    // when update cookie value
    onChange = function(parameter, value) {
        $cookieStore.put(parameter, value);
    };

    // get cookie value
    getCookie = function(name)
    {
        var cookie_value;
        if (angular.isDefined($cookies[name]))
        {
            cookie_value = $cookieStore.get(name);
        }

        return cookie_value;
    }

    // factor value for concentrations.
    var factor = 10;
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
        gui = new dat.GUI({ width: 400 });
        zController = gui.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        xController = gui.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        yController = gui.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        timeController = gui.add($scope, 'Tiempo').name('Tiempo (minutos) ').listen();

        // Update Propofol value if user update remi
        xController.onChange(function(value) {
            onChange(remi_c, value);

            $sf_y.get({ x: round_2d(value),  pnr: round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(round_2d(value) * factor);
                    graphOperations.changeObjectY(round_2d(data.value) * factor);

                    $scope.Propofol = round_2d(data.value)
                    onChange(prop_c, $scope.Propofol);
                }
            });
        });

        // Update remi value if user update propofol
        yController.onChange(function(value) {
            onChange(prop_c, value);

            $sf_x.get({ y: round_2d(value),  pnr: round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(round_2d(data.value) * factor);
                    graphOperations.changeObjectY(round_2d(value) * factor);

                    $scope.Remifentanilo = round_2d(data.value)
                    onChange(remi_c, $scope.Remifentanilo);
                }
            });
        });

        // Update remi and propofol if user update PNR
        zController.onChange(function(value) {
            onChange(pnr_c, value);

           $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {
                    graphOperations.changeObjectX(round_2d(data.x) * factor);
                    graphOperations.changeObjectY(round_2d(data.y) * factor);
                    graphOperations.changeObjectZ(round_2d(value));

                    $scope.Remifentanilo = round_2d(data.x)
                    $scope.Propofol = round_2d(data.y)

                    onChange(prop_c, $scope.Propofol);
                    onChange(remi_c, $scope.Remifentanilo);
                }
            });
        });

        // Update time cookie
        timeController.onChange(function(value) {
            onChange('time', value);
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
            $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && angular.isDefined(data.y)) {

                    $scope.Propofol = round_2d(data.y)
                    $scope.Remifentanilo = round_2d(data.x)

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
        onChange(prop_c, round_2d($scope.Propofol));
        onChange(remi_c, round_2d($scope.Remifentanilo));
        gui.destroy();
    });

    var remi = getCookie(remi_c);
    var prop = getCookie(prop_c);
    var pnr_proc = getCookie(pnr_c);

    var pnr = angular.isDefined(pnr_proc) ? pnr_proc :getCookie(prc_c).pnr;
    var time = getCookie(time_c);

    graphOperations = $drawMesh($scope, serverUrl, 'induction_mesh');
    initValues(pnr, remi, prop, time);
}