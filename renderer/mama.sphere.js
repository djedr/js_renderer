(function (mod) {
    //
    // constructor
    //
    function sphere(center, radius, color, material, emission, reflection) {
        this.position = center;
        this.radius = radius;
        this.color = color;
        this.material = material || new mod.material('default');
        this.emission = emission || mod.color4.black();
        this.reflection = reflection;
    }

    //
    // class attributes
    //
    sphere.epsilon = 0.0001;

    //
    // class methods
    //
    ////

    //
    // instance methods
    //
    sphere.prototype.intersect = function (ray)
    {
        // returns distance, 0 if no hit
        // by solving t^2*d.d + 2*t*(o-p).d + (o-p).(o-p)-R^2 = 0
        var op  = this.position.subtract(ray.origin);
        var b   = op.dot(ray.direction);
        var det = b * b - op.dot(op) + this.radius * this.radius; // could cache squared radius
        if (det < 0) {
            return 0;
        }

        // sphere/ray-intersection gives two solutions
        var t;
        det = Math.sqrt(det);
        t = b - det;
        if (t > sphere.epsilon) {
            return t;
        }
        t = b + det;
        if (t > sphere.epsilon) {
            return t;
        }

        // no hit
        return 0;
    };
    
    sphere.prototype.get_texture = function (intersection_point) {
        return intersection_point.subtract(this.position).normalize();
    };
    
    sphere.prototype.get_normal = function (intersection_point) {
        return intersection_point.subtract(this.position).normalize();
    };

    sphere.prototype.to_string = function () {
        return "sphere {\n\tcenter: " + this.position
                    + ",\n\tradius: " + this.radius 
                    + ",\n\tcolor: " + this.color 
                    + ",\n\temission: " + this.emission
                    + ",\n\treflection: " + this.reflection
                    + "\n}";
    }

    sphere.prototype.toString = sphere.prototype.to_string;

    // copy
    // transform
    // transformed
    // trace
    // trace_for_color
    //

    mod.sphere = sphere;
}(mod || (mod = {})));