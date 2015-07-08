App.service('utils', function () {

    /**
     * Retrieves the 2 decimal aporximation of the given number.
     *
     * @param  {number} num input number.
     *
     * @return {number} number using 2 decimal points approximation.
     */
    this.round_2d = function(num) {
        return Math.round(num * 100) / 100;
    }

    /**
     * Retrieves an array contructed extracting given property name from given
     * array of objects.
     *
     * @param  {Array} array input array.
     * @param  {String} property_name property name of objects contained in the array.
     *
     * @return {Array} array constructer extracting given property name from
     * given array of objects.
     */
    this.extractArray = function(array, property_name) {
        var dataArray = new Array;

        var arrayLength = array.length;
        for (var i = 0; i < arrayLength; i++) {
            dataArray.push(array[i][property_name]);
        }

        return dataArray;
    }
});
