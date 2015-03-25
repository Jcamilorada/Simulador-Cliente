var pnrIndController = function($scope, $drawMesh, round_2d, serverUrl, $sf_y, $sf_x, $sf_xy, $cookieStore, $cookies)
{
    // factor value for concentrations.
    var factor = 10;
    var graphOperations;

    var ind_time = $cookies["ind_time"];
    if (angular.isDefined(ind_time)) {
        $scope.Tiempo = Number(ind_time);
    }
    else
    {
        $scope.Tiempo = Number(120);
    }

    var ind_pnr = $cookies["ind_pnr"];
    if (angular.isDefined(ind_pnr))
    {
        $scope.ind_pnr = $cookieStore.get("ind_pnr");
    }
    else
    {
        $scope.PNR = $cookieStore.get("procedureType").pnr;
        $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
            if (angular.isDefined(data.x) && !angular.isUndefined(data.y)) {
                graphOperations.changeObjectX(round_2d(data.x) * factor);
                graphOperations.changeObjectZ(round_2d($scope.PNR));
                graphOperations.changeObjectY(round_2d(data.y) * factor);

                $scope.Propofol = round_2d(data.y)
                $scope.Remifentanilo = round_2d(data.x)

                createControls();
            }
        });

    }

    createControls = function()
    {
        var gui = new dat.GUI({ width: 400 });
        var zController = gui.add($scope, 'PNR', 0, 100).name('PNR %').listen();
        var xController = gui.add($scope, 'Remifentanilo', 1, 10).name('Remifentanilo ng/ml').listen();
        var yController = gui.add($scope, 'Propofol', 1, 10).name('Propofol mcg/ml').listen();
        var timeController = gui.add($scope, 'Tiempo').name('Tiempo (minutos) ');

        // Update Propofol value if user update remi
        xController.onChange(function(value) {
            $sf_y.get({ x: round_2d(value),  pnr: round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(round_2d(value) * factor);
                    graphOperations.changeObjectY(round_2d(data.value) * factor);

                    $scope.Propofol = round_2d(data.value)
                }
            });
        });

        // Update remi value if user update propofol
        yController.onChange(function(value) {
            $sf_x.get({ y: round_2d(value),  pnr: round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    graphOperations.changeObjectX(round_2d(data.value) * factor);
                    graphOperations.changeObjectY(round_2d(value) * factor);

                    $scope.Remifentanilo = round_2d(data.value)
                }
            });
        });

        // Update remi and propofol if user update PNR
        zController.onChange(function(value) {
           $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && !angular.isUndefined(data.y)) {
                    graphOperations.changeObjectX(round_2d(data.x) * factor);
                    graphOperations.changeObjectY(round_2d(data.y) * factor);
                    graphOperations.changeObjectZ(round_2d(value));

                    $scope.Remifentanilo = round_2d(data.x)
                    $scope.Propofol = round_2d(data.y)
                }
            });
        });
    }

    graphOperations = $drawMesh($scope, serverUrl, 'induction_mesh');

}