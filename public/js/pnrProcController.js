var pnrProcController = function($scope, $drawMesh, round_2d, serverUrl, $sf_y, $sf_x, $sf_xy, $cookieStore, $cookies)
{
    // factor value for concentrations.
    var factor = 10;

    var proc_time = $cookies["proc_time"];
    if (angular.isDefined(proc_time)) {
        $scope.Tiempo = Number(proc_time);
    }
    else
    {
        $scope.Tiempo = Number(120);
    }

    var proc_pnr = $cookies["proc_pnr"];
    if (angular.isDefined(proc_pnr))
    {
        $scope.proc_pnr = $cookieStore.get("proc_pnr");
    }
    else
    {
        $scope.PNR = $cookieStore.get("procedureType").pnr;
        $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
            if (angular.isDefined(data.x) && !angular.isUndefined(data.y)) {
                $scope.sphere.position.x = round_2d(data.x) * factor;
                $scope.Remifentanilo = round_2d(data.x)

                $scope.sphere.position.y = round_2d(data.y) * factor;
                $scope.Propofol = round_2d(data.y)

                $scope.sphere.position.z = round_2d($scope.PNR);
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
                    $scope.sphere.position.x = round_2d(value) * factor;

                    $scope.sphere.position.y = round_2d(data.value) * factor;
                    $scope.Propofol = round_2d(data.value)
                }
            });
        });

        // Update remi value if user update propofol
        yController.onChange(function(value) {
            $sf_x.get({ y: round_2d(value),  pnr: round_2d($scope.PNR/100)}, function (data) {
                if (angular.isDefined(data.value)) {
                    $scope.sphere.position.x = round_2d(data.value) * factor;
                    $scope.Remifentanilo = round_2d(data.value)

                    $scope.sphere.position.y = round_2d(value) * factor;
                }
            });
        });

        // Update remi and propofol if user update PNR
        zController.onChange(function(value) {
           $sf_xy.get({pnr: round_2d($scope.PNR/100) }, function (data) {
                if (angular.isDefined(data.x) && !angular.isUndefined(data.y)) {
                    $scope.sphere.position.x = round_2d(data.x) * factor;
                    $scope.Remifentanilo = round_2d(data.x)

                    $scope.sphere.position.y = round_2d(data.y) * factor;
                    $scope.Propofol = round_2d(data.y)

                    $scope.sphere.position.z = round_2d(value);
                }
            });
        });
    }

    $drawMesh($scope, serverUrl, 'induction_mesh');

}