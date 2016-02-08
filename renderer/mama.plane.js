(function (mod) {
    //
    // constructor
    //
    function plane(position, normal, material) {
        this.position = position;
        this.normal = normal;
        this.material = material || new mod.material('default');
    }

    //
    // class attributes
    //
    plane.epsilon = 0.0000001;

    //
    // class methods
    //
    ////

    //
    // instance methods
    //
    plane.prototype.get_texture = function (intersection_point) {
        return new mama.vector3.zero();// this.normal;
    };
    
    plane.prototype.get_normal = function (intersection_point) {
        return this.normal;
    };
    
    plane.prototype.intersect = function (ray)
    {
        var denominator = this.normal.dot(ray.direction),
            t = denominator > 0.00001 || denominator < -0.00001 ? this.position.subtract(ray.origin).dot(this.normal) / denominator : 0; 

        if (t > 0.0001) {
            return t;	
        }

        return 0;
    }

    plane.prototype.to_string = function () {
        return "plane {\n\tpoint: " + this.position
                    + ",\n\tnormal: " + this.normal
                    + "\n}";
    }

    plane.prototype.toString = plane.prototype.to_string;

    // copy
    // transform
    // transformed
    // trace
    // trace_for_color
    //
    mod.plane = plane;
}(mod || (mod = {})));