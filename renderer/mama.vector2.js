(function (mod) {
    //
    // constructor
    //
    function vector2(initial_x, initial_y) {
        this.x = initial_x;
        this.y = initial_y;
    }

    //
    // class methods
    //
    vector2.zero = function zero() {
        return new vector2(0, 0);
    };

    vector2.copy = function copy(source_vector) {
        return new vector2(
            source_vector.x,
            source_vector.y
        );
    };

    vector2.normalize = function normalize(vector) {
        var new_vector = vector2.copy(vector);
        new_vector.normalize();
        return new_vector;
    };

    vector2.minimize = function minimize(left, right) {
        var x = (left.x < right.x) ? left.x : right.x,
            y = (left.y < right.y) ? left.y : right.y;

        return new vector2(x, y);
    };

    vector2.maximize = function maximize(left, right) {
        var x = (left.x > right.x) ? left.x : right.x,
            y = (left.y > right.y) ? left.y : right.y;

        return new vector2(x, y);
    };

    vector2.transform = function transform(vector, transformation) {
        var x = (vector.x * transformation.m[0])
                    + (vector.y * transformation.m[4]),
            y = (vector.x * transformation.m[1])
                    + (vector.y * transformation.m[5]);

        return new vector2(x, y);
    };

    vector2.distance_squared = function distance_squared(vector_a, vector_b) {
        var x = vector_a.x - vector_b.x,
            y = vector_a.y - vector_b.y;

        return (x * x) + (y * y);
    };

    vector2.distance = function distance(vector_a, vector_b) {
        return Math.sqrt(vector2.distance_squared(vector_a, vector_b));
    };

    //
    // instance methods
    //
    vector2.prototype.negate = function () {
        return new vector2(-this.x, -this.y);
    };

    vector2.prototype.add = function (other_vector) {
        return new vector2(
            this.x + other_vector.x,
            this.y + other_vector.y
        );
    };

    vector2.prototype.subtract = function (other_vector) {
        return new vector2(
            this.x - other_vector.x,
            this.y - other_vector.y
        );
    };

    vector2.prototype.scale = function (scale) {
        return new vector2(
            this.x * scale,
            this.y * scale
        );
    };

    vector2.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    vector2.prototype.length_squared = function () {
        return (this.x * this.x + this.y * this.y); 
    };

    vector2.prototype.normalize = function () {
        var current_length = this.length,
            inverse_length;

        // or current_length <~ epsilon
        // but see here: http://www.ogre3d.org/forums/viewtopic.php?f=4&t=61259
        if (current_length === 0) {
            return this;   
        }

        inverse_length = 1.0 / current_length;
        this.x *= inverse_length;
        this.y *= inverse_length;

        return this;
    };

    vector2.prototype.equals = function (other_vector) {
        return this.x === other_vector.x
            && this.y === other_vector.y;
    };

    vector2.prototype.key = function () {
        return this.x + "," + this.y;
    };
    
    vector2.prototype.to_string = function () {
        return "vector2 { x: " + x + ", y: " + y + " }";
    };

    vector2.prototype.toString = vector2.prototype.to_string;

    //module.exports = vector2;
    mod.vector2 = vector2;
}(mod || (mod = {})));