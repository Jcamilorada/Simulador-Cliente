var pnrController = function($scope, $sf_pnr, $sf_x, $sf_y, $sf_xy)
{
    $scope.ind_pnr = 0.18;
    $scope.proc_pnr = 0.75;

    // Infusion methods
     $sf_xy.get({pnr: $scope.ind_pnr}, function(data) {
        $scope.ind_x = data.x;
        $scope.ind_y = data.y;
     });

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
     $sf_xy.get({pnr: $scope.proc_pnr}, function(data) {
        $scope.proc_x = data.x;
        $scope.proc_y = data.y;
     });

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

}