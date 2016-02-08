(function (mod) {
    //
    // constructor
    //
    function util() {
    }

    //
    // class attributes
    //

    //
    // class methods
    //
    util.clamp = function (value, min, max) {
        if (min === undefined) { min = 0; }
        if (max === undefined) { max = 1; }

        return Math.max(min, Math.min(value, max));
    };

    util.interpolate = function (min, max, gradient) {
        return min + (max - min) * util.clamp(gradient);   
    };
    
    util.compute_N_dot_L = function (vertex, normal, light_position) {
        var light_direction = light_position.subtract(vertex);

        return Math.max(0, mama.vector3.dot(normal.normalize(), light_direction.normalize()));
    };

    //
    // instance methods
    //
    
    util.prototype.to_string = function () {
        return "util {}";
    }; 

    util.prototype.toString = util.prototype.to_string;

    mod.util = util;
}(mod || (mod = {})));