(function (mod) {
    //
    // constructor
    //
    function color4(initial_r, initial_g, initial_b, initial_a) {
        this.r = initial_r;
        this.g = initial_g;
        this.b = initial_b;
        this.a = initial_a;
    }

    //
    // class attributes
    //

    //
    // class methods
    //
    color4.black = function () {
        return new color4(0, 0, 0, 1);
    }
        
    //
    // instance methods
    //
    color4.prototype.add = function (other) {
        // maybe clamp it to 1.0
        return new color4(this.r + other.r, this.g + other.g, this.b + other.b, this.a + other.a);
    };
    
    color4.prototype.anyGreaterThan = function (other) {
        return this.r > other.r || this.g > other.g || this.b > other.b || this.a > other.a;
    };
    
    color4.prototype.allGreaterThan = function (other) {
        return this.r > other.r && this.g > other.g && this.b > other.b && this.a > other.a;
    };
    
    color4.prototype.subtractAbs = function (other) {
        return new color4(
            Math.abs(this.r - other.r),
            Math.abs(this.g - other.g),
            Math.abs(this.b - other.b),
            Math.abs(this.a - other.a)
        );
    };
    
    color4.prototype.multiply = function (other) {
        // maybe clamp it to 1.0
        return new color4(this.r * other.r, this.g * other.g, this.b * other.b, this.a * other.a);
    };
    
    color4.prototype.scale = function (scalar) {
        // maybe clamp it to 1.0
        return new color4(this.r * scalar, this.g * scalar, this.b * scalar, this.a * scalar);
    };
    
    color4.prototype.normalize = function () {
        return new color4(
            isNaN(this.r) || this.r < 0 ? 0 : this.r,
            isNaN(this.g) || this.g < 0 ? 0 : this.g,
            isNaN(this.b) || this.b < 0 ? 0 : this.b,
            isNaN(this.a) || this.a < 0 ? 0 : this.a);  
    };
    
    color4.prototype.to_string = function () {
        return "color4 { r: " + this.r
                    + ", g: " + this.g
                    + ", b: " + this.b
                    + ", a: " + this.a
                    + " }";
    };

    color4.prototype.toString = color4.prototype.to_string;

    //module.exports = color4;
    mod.color4 = color4;
}(mod || (mod = {})));