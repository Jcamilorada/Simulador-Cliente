App.directive('slider', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).slider({
                value: scope[attrs.ngModel],
                min: parseInt(attrs.min),
                max: parseInt(attrs.max),
                step: parseFloat(attrs.step),
                slide: function(event, ui) {
                    scope.$apply(function() {

                        if (attrs.ngModel.indexOf('.') > -1) {
                            var values = attrs.ngModel.split('.');
                            scope[values[0]][values[1]] = ui.value;
                        }
                    });
                }
            });
        }
    };
});

