var pnrController = function($scope, $sf_pnr, $sf_x, $sf_y)
{
    $scope.pnr = 0.18;
    //$scope.x = 3;
    $scope.y = 3;

     $scope.onUpdateX = function(){
       $sf_x.get({ y:  $scope.y,  pnr: $scope.pnr}, function (data) {
             $scope.y = data;
       });
     }

     $scope.onUpdateY = function(){

     }

     $scope.onUpdatePNR = function(){

     }

}