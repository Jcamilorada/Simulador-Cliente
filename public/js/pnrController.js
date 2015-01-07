var pnrController = function($scope, $sf_pnr, $sf_x, $sf_y, $sf_xy, $cookieStore, $cookies)
{
    $scope.onLoad = function() {
        var ind_time = $cookies["ind_time"];
        if (angular.isDefined(ind_time)) {
            $scope.ind_time = Number(ind_time);
        }

        var proc_time = $cookies["proc_time"];
        if (angular.isDefined(proc_time)) {
            $scope.proc_time = Number(proc_time);
        }

        var proc_inter_time = $cookies["proc_inter_time"];
        if (angular.isDefined(proc_inter_time)) {
            $scope.proc_inter_time = Number(proc_inter_time);
        }

        // Induction PNR
        var ind_pnr = $cookies["ind_pnr"];
        if (angular.isDefined(ind_pnr)) {
            $scope.ind_pnr = $cookieStore.get("ind_pnr");
        }
        else {
            $scope.ind_pnr = $cookieStore.get("induction_method").pnr / 100;
        }
        // Get PNR value
         $sf_xy.get({pnr: $scope.ind_pnr}, function(data) {
                $scope.ind_x = data.x;
                $scope.ind_y = data.y;
         });

        // Procedure PNR
        var proc_pnr = $cookies["proc_pnr"];
        if (angular.isDefined(proc_pnr)) {
            $scope.proc_pnr = $cookieStore.get("proc_pnr");
        }
        else {
            $scope.proc_pnr = $cookieStore.get("procedureType").pnr / 100;
        }
        $sf_xy.get({pnr: $scope.proc_pnr}, function(data) {
            $scope.proc_x = data.x;
            $scope.proc_y = data.y;
        });



    }

    // Infusion methods
     $scope.onUpdateInductionX = function() {
        $sf_y.get({ x:  $scope.ind_x,  pnr: $scope.ind_pnr}, function (data) {
            $scope.ind_y = data.value;
        });
     }

     $scope.onUpdateInductionY = function() {
         $sf_x.get({ y:  $scope.ind_y,  pnr: $scope.ind_pnr}, function (data) {
             $scope.ind_y = data.value;
         });
     }

    $scope.onUpdateInductionPNR = function() {
        $sf_xy.get({pnr: $scope.ind_pnr}, function (data) {
            $scope.ind_x = data.x;
             $scope.ind_y = data.y;
         });
     }

    // Procedures methods
     $scope.onUpdateProcedureX = function() {
        $sf_y.get({ x:  $scope.proc_x,  pnr: $scope.proc_pnr}, function (data) {
            $scope.proc_y = data.value;
        });
     }

     $scope.onUpdateProcedureY = function() {
         $sf_x.get({ y:  $scope.proc_y,  pnr: $scope.proc_pnr}, function (data) {
             $scope.proc_y = data.value;
         });
     }

    $scope.onUpdateProcedurePNR = function() {
        $sf_xy.get({pnr: $scope.proc_pnr}, function (data) {
            $scope.proc_x = data.x;
            $scope.proc_y = data.y;
         });
     }

    $scope.onUpdate = function() {
        $cookieStore.put("ind_pnr", $scope.ind_pnr);
        $cookieStore.put("proc_pnr", $scope.proc_pnr);

        $cookieStore.put("ind_time", $scope.ind_time);
        $cookieStore.put("proc_time", $scope.proc_time);
        $cookieStore.put("proc_inter_time", $scope.proc_inter_time);
    }

    $scope.onLoad();
}