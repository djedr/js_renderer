// require mama.vector3
(function (mod) {
    var vector3 = mama.vector3;
    
    //
    // constructor
    //
    function canvas(initial_canvas) {
        this.canvas = initial_canvas;
        this.width = initial_canvas.width; // possibly not necessary
        this.height = initial_canvas.height; // -||-
        this.pixel_width = 1 / this.width;
        this.pixel_height = 1 / this.height;
        this.context = this.canvas.getContext('2d');
        this.depth_buffer = new Array(this.width * this.height);
        this.clear();
    }

    //
    // class attributes
    //

    //
    // class methods
    //

    //
    // instance methods
    //
    canvas.prototype.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
        this.back_buffer = this.context.getImageData(0, 0, this.width, this.height);

        for (var i = 0; i < this.depth_buffer.length; ++i) {
            this.depth_buffer[i] = 10000000;   
        }
    };

    canvas.prototype.present = function () {
        this.context.putImageData(this.back_buffer, 0, 0);
    };

    // RGBA
    canvas.prototype.put_pixel = function (x, y, z, color) {
        var back_buffer_data = this.back_buffer.data;
        var index = ((x >> 0) + (y >> 0) * this.width);
        var index4 = index * 4;

        if (this.depth_buffer[index] < z) {
            return;   
        }

        this.depth_buffer[index] = z;

        back_buffer_data[index4] = color.r * 255;
        back_buffer_data[index4 + 1] = color.g * 255;
        back_buffer_data[index4 + 2] = color.b * 255;
        back_buffer_data[index4 + 3] = color.a * 255;
    };
    
    canvas.prototype.to_string = function () {
        return "canvas {...}";
    }; 

    canvas.prototype.toString = canvas.prototype.to_string;

    mod.canvas = canvas;
}(mod || (mod = {})));