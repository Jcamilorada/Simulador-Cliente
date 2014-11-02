var procedureController = function($scope, $http, serverUrl){
 var canvas = document.getElementById('myCanvas');
      var context = canvas.getContext('2d');
      var imageObj = new Image();

      imageObj.onload = function() {
        context.drawImage(imageObj, 0, 0, 800, 800);
      };
      imageObj.src = '/images/human-body-woman.jpg';


      canvas.addEventListener('click',
      function(event) {
        alert("hoal");
      }, false);
}