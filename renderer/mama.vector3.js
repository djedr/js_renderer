(function (mod) {
    //
    // constructor
    //
    function vector3(initial_x, initial_y, initial_z) {
        this.x = initial_x;
        this.y = initial_y;
        this.z = initial_z;
    }

    //
    // class methods
    //
    vector3.zero = function zero() {
        return new vector3(0, 0, 0);
    };

    vector3.up = function up() {
        return new vector3(0, 1.0, 0);  
    };

    vector3.copy = function copy(source_vector) {
        return new vector3(
            source_vector.x,
            source_vector.y,
            source_vector.z);
    };

    vector3.from_array = function from_array(array, offset) {
        if (!offset) {
            offset = 0;
        }

        return new vector3(array[offset],
                           array[offset + 1],
                           array[offset + 2]);
    };

    vector3.transform_coordinates = function (vector, transformation) {
        var x = (vector.x * transformation.entries[0])
                    + (vector.y * transformation.entries[4])
                    + (vector.z * transformation.entries[8])
                    + transformation.entries[12],
            y = (vector.x * transformation.entries[1])
                    + (vector.y * transformation.entries[5])
                    + (vector.z * transformation.entries[9])
                    + transformation.entries[13],
            z = (vector.x * transformation.entries[2])
                    + (vector.y * transformation.entries[6])
                    + (vector.z * transformation.entries[10])
                    + transformation.entries[14],
            w = (vector.x * transformation.entries[3])
                    + (vector.y * transformation.entries[7])
                    + (vector.z * transformation.entries[11])
                    + transformation.entries[15];

        return new vector3(x / w, y / w, z / w);
    };

    vector3.transform_normal = function transform_normal(vector, transformation) {
        var x = vector.x * transformation.entries[0] + vector.y * transformation.entries[4] + vector.z * transformation.entries[8],
            y = vector.x * transformation.entries[1] + vector.y * transformation.entries[5] + vector.z * transformation.entries[9],
            z = vector.x * transformation.entries[2] + vector.y * transformation.entries[6] + vector.z * transformation.entries[10];

        return new vector3(x, y, z);
    };

    vector3.dot = function dot(left, right) {
        return (left.x * right.x
                    + left.y * right.y
                    + left.z * right.z);
    };

    vector3.cross = function cross(left, right) {
        var x = left.y * right.z - left.z * right.y,
            y = left.z * right.x - left.x * right.z,
            z = left.x * right.y - left.y * right.x;

        return new vector3(x, y, z);
    };

    vector3.normalize = function normalize(vector) {
        var new_vector = vector3.copy(vector);
        new_vector.normalize();            
        return new_vector;
    };

    vector3.distance_squared = function distance_squared(vector_a, vector_b) {
        var x = vector_a.x - vector_b.x,
            y = vector_a.y - vector_b.y,
            z = vector_a.z - vector_b.z;

        return (x * x) + (y * y) + (z * z);
    };

    vector3.distance = function distance(vector_a, vector_b) {
        return Math.sqrt(vector3.distance_squared(vector_a, vector_b));
    };

    //
    // instance methods
    //
    vector3.prototype.negate = function () {
        return new vector3(-this.x, -this.y, -this.z); 
    };

    vector3.prototype.add = function (other_vector) {
        return new vector3(
            this.x + other_vector.x,
            this.y + other_vector.y,
            this.z + other_vector.z);
    };

    vector3.prototype.subtract = function (other_vector) {
        return new vector3(
            this.x - other_vector.x,
            this.y - other_vector.y,
            this.z - other_vector.z);
    };

    vector3.prototype.scale = function (scale) {
        return new vector3(
            this.x * scale,
            this.y * scale,
            this.z * scale);
    };

    vector3.prototype.multiply = function (other_vector) {
        return new vector3(
            this.x * other_vector.x,
            this.y * other_vector.y,
            this.z * other_vector.z);
    };

    vector3.prototype.divide = function (other_vector) {
        return new vector3(
            this.x / other_vector.x,
            this.y / other_vector.y,
            this.z / other_vector.z);
    };

    vector3.prototype.dot = function (other_vector) {
        return (this.x * other_vector.x
                    + this.y * other_vector.y
                    + this.z * other_vector.z);
    };
    
    vector3.prototype.cross = function cross(other) {
        return new vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x);
    };

    vector3.prototype.length = function () {
        return Math.sqrt(this.x * this.x
                            + this.y * this.y
                            + this.z * this.z);
    };

    vector3.prototype.length_squared = function () {
        return (this.x * this.x
                    + this.y * this.y
                    + this.z * this.z);
    };

    vector3.prototype.normalize = function () {
        var current_length = this.length(),
            inverse_length;

        // could use epsilon
        if (current_length === 0) {
            return this;   
        }

        inverse_length = 1.0 / current_length;

        this.x *= inverse_length;
        this.y *= inverse_length;
        this.z *= inverse_length;

        return this;
    };

    vector3.prototype.reflect = function (normal) {
        this.subtract(this.dot(normal).scale(2).multiply(normal));
    };

    vector3.prototype.equals = function (other_vector) {
        return this.x === other_vector.x
                    && this.y === other_vector.y
                    && this.z === other_vector.z;
    };

    vector3.prototype.lerp = function (v, t) {
        return new vector3(
            this.x + t * (v.x - this.x),
            this.y + t * (v.y - this.y),
            this.z + t * (v.z - this.z)
        );  
    };

    vector3.prototype.to_string = function () {
        return "vector3 { x: " + this.x
                    + ", y: " + this.y
                    + ", z: " + this.z
                    + " }";
    };
    
    vector3.prototype.to_simple_string = function () {
        return this.x + "," + this.y + "," + this.z;
    };
    
    vector3.prototype.from_simple_string = function (string) {
        var s = string.split(",");
        this.x = parseFloat(s[0]) || this.x;
        this.y = parseFloat(s[1]) || this.y;
        this.z = parseFloat(s[2]) || this.z;
    };

    vector3.prototype.toString = vector3.prototype.to_string;

    //module.exports = vector3;
    mod.vector3 = vector3;
}(mod || (mod = {})));