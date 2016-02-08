(function (mod) {
    //
    // constructor
    //
    function face(initial_a, initial_b, initial_c) {
        this.a = initial_a;
        this.b = initial_b;
        this.c = initial_c;
    }

    //
    // class methods
    //
        
    //
    // instance methods
    //
    
    face.prototype.to_string = function () {
        return "face { a: " + this.a
                    + ", b: " + this.b
                    + ", c: " + this.c
                    + " }";
    };

    face.prototype.toString = face.prototype.to_string;

    //module.exports = color4;
    mod.face = face;
}(mod || (mod = {})));