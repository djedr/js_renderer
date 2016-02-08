(function (mod) {
    //
    // constructor
    //
    function raytracer(initial_image) {
        this.image = initial_image;
        this.pixel_width = 2.0 / initial_image.width; // height?
        console.log(this.pixel_width);
        this.pixel_height = 2.0 / initial_image.height; // width?
        console.log(this.pixel_height);
        this.samples_per_pixel = 5;
    }

    //
    // class attributes
    //

    //
    // class methods
    //
    
    function sample_adaptive(object) {
        var background_color = new mama.color4(0.1, 0.2, 0.2, 1);
        var minimum_samples_per_pixel = 5;
        var maximum_samples_per_pixel = 25;
        var spatial_contrast = new color4(0.05, 0.05, 0.05, 0.05);        
        
        var positions = [
            new mama.vector2(0.5, 0.5),
            new mama.vector2(0, 0),
            new mama.vector2(1, 0),
            new mama.vector2(0, 1),
            new mama.vector2(1, 1)
        ];
        
        var samples = Object.create(null);
        var sample_count = 0;
        
        function recur(positions) {
            positions.forEach(function (position) {
                var color = object.intersect(
                       new mama.ray(
                        new mama.vector3(
                            -1.0 + (i + position.x) * this.pixel_width,
                            1.0 - (j + position.y) * this.pixel_height,
                            0),
                        new mama.vector3(0, 0, 1))
                   ) ? object.color : background_color;

                samples[position.key()] = {
                   position: position,
                   color: color
                };
                sample_count += 1;
                
                if (color.subtract(samples[positions[0].key()]).anyGreaterThan(spatial_contrast)) {
                    var scale = 0.5;
                    var new_position = positions[i].scale(scale).translate(positions[i].scale(scale * 0.5)),
                        key = new_position.key;
                    if (!samples[key]) {
                        samples[key] = {
                            position: new_position,
                            color: mama.color4.black()
                        };
                        sample_count += 1;
                    }

                    if (sample_count <= maximum_samples_per_pixel) {
                        recur(positions.scale(0.5).add(position.scale(0.5)));
                    }
                } 
            });
        }
        recur(positions);
        
        var result = mama.color4.black();
        
        for (var sample in samples) {
            result = result.add(sample);   
        }
        
        return result.scale(1 / sample_count);
    }

    //
    // instance methods
    //
    raytracer.prototype.render = function () {
        var sphere = new mama.sphere(new mama.vector3(0, 0, 0), 0.5, new mama.color4(1, 0, 0, 1));
        var sphere2 = new mama.sphere(new mama.vector3(0.66, 0, 2), 0.25, new mama.color4(1, 1, 0, 1));
        var background_color = new mama.color4(0.1, 0.2, 0.2, 1);
        var sample_positions = [[0, 0], [1, 0], [0.5, 0.5], [1, 0], [1, 1]];
        
        for (var i = 0; i < this.image.width; ++i) {
            for (var j = 0; j < this.image.height; ++j) {
                var pixel_color = mama.color4.black();
                for (var k = 0; k < this.samples_per_pixel; ++k) {
                    var center_x = -1.0 + (i + sample_positions[k][0]) * this.pixel_width;
                    var center_y = 1.0 - (j + sample_positions[k][1]) * this.pixel_height;
                    var ray = new mama.ray(new mama.vector3(center_x, center_y, 0), new mama.vector3(0, 0, 1));
                    var distance = sphere.intersect(ray);
                    var distance2 = sphere2.intersect(ray);
                    var ispp = 1 / this.samples_per_pixel;
                    
                    if (distance > 0) {   
                        pixel_color = pixel_color.add(sphere.color.scale(ispp));
                    } else if (distance2 > 0) {
                        pixel_color = pixel_color.add(sphere2.color.scale(ispp));
                    } else {
                        pixel_color = pixel_color.add(background_color.scale(ispp));
                    }
                }
                
                this.image.put_pixel(i, j, 0, pixel_color);
            }
        }
        this.image.present();
    };
    
    raytracer.prototype.to_string = function () {
        return "raytracer {}";
    }; 

    raytracer.prototype.toString = raytracer.prototype.to_string;

    mod.raytracer = raytracer;
}(mod || (mod = {})));