(function (mod) {
    //
    // constructor
    //
    function ray(initial_origin, initial_direction) {
        this.origin = initial_origin;
        this.direction = initial_direction.normalize();
        this.distance = 0;
    }

    //
    // class attributes
    //
    // ray.accuracy

    //
    // class methods
    //

    //
    // instance methods
    //
    ray.prototype.hit_point = function () {
        return this.origin.add(this.direction.scale(this.distance));
    };
    
    ray.prototype.to_string = function () {
        return "ray {\n\torigin: " + this.origin
                    + ",\n\tdirection: " + this.direction
                    + "\n}";
    }; 

    ray.prototype.toString = ray.prototype.to_string;

    // copy
    // transform
    // transformed
    // trace
    // trace_for_color
    //
    mod.ray = ray;
}(mod || (mod = {})));