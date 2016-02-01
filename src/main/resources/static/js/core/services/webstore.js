/**
 *  Web store service. Enable to save and load variables.
 */
App.service('webstore', function ($cookieStore, $cookies) {

    /**
     *	Retrieves the stores value for the given variable name. default_val if
     *	not value was stores.
     *
     * @param  {String} name variable name.
     * @param  {Object} default_val default value.
     *
     * @return stored variable value default if value was not stored before.
     */
    this.get = function(name, default_val) {
        var cookie_value = default_val;

        if (angular.isDefined($cookies[name]) && $cookies[name] !== "undefined")
        {
            cookie_value = $cookieStore.get(name);
        }

        return cookie_value;
    }

    /**
     * Update the given variable name value.
     *
     * @param  {String} name variable name.
     * @param  {Object} value new value.
     */
    this.update = function(name, value) {
        $cookieStore.put(name, value);
    }

    /**
     * Remove the given cookie value.
     *
     * @param  {String} name variable name.
     */
    this.remove = function(name) {
         $cookieStore.remove(name);
    }
});
