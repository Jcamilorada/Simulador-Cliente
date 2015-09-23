App.service('utils', function () {

    this.getDateString = function(total_seconds) {
        var duration = moment.duration(total_seconds, 'seconds');
        var hours = ("0"+ duration.hours()).slice(-2);
        var minutes = ("0"+ duration.minutes()).slice(-2);
        var seconds = ("0"+ duration.seconds()).slice(-2);

        return hours + ":" + minutes + ":"  + seconds;
    }

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
     * Retrieves the integer part of the given number.
     *
     * @param num numeric integer value.
     *
     * @return integer aproximation of the given number.
     */
    this.round = function(num) {
        return Math.round(num);
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

    /**
     * Get the last element of the given array.
     *
     * @param  {Array} array input array to get the last element.
     *
     * @return {Object} the last element of the given array.
     */
    this.lastArrayElement = function(array) {
        var length = array.length;

        return array[length -1];
    }
});
