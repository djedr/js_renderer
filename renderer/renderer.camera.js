// require mama.vector3
(function (mod) {    
    //
    // constructor
    //
    function camera(initial_mode, initial_position, initial_target, initial_image) {
        this.position = initial_position;
        this.target = initial_target;
        this.direction = this.target.subtract(this.position).normalize();
        
        this.mode = initial_mode;
        
        this.image = initial_image;
        
        var ratio = this.image.width / this.image.height;
        
        this.up = mama.vector3.up();
        this.right = this.direction.cross(this.up).negate();
        this.up = this.right.cross(this.direction);
        
        //this.up = this.up.scale(ratio);
        this.right = this.right.scale(ratio);
        
        this.near_plane = 1;
        this.far_plane = 1000;
        this.field_of_view = 45;
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
    camera.prototype.get_ray_orthographic_at = function (x, y) {        
        //var normalized_x = -1.0 + (x * this.image.pixel_width),
        //    normalized_y = 1.0 - (y * this.image.pixel_height);
        
               
        var normalized_x = (x * this.image.pixel_width) - 0.5,
            normalized_y = (y * this.image.pixel_height) - 0.5,
            image_point = this.right.scale(normalized_x)
                            .add(this.up.scale(normalized_y));
        
        return new mama.ray(image_point, this.direction);  
        
        //return new mama.ray(new mama.vector3(normalized_x, normalized_y, this.position.z), this.direction); 
    }
    
    camera.prototype.get_ray_perspective_at = function (x, y) {        
        var normalized_x = (x * this.image.pixel_width) - 0.5,
            normalized_y = (y * this.image.pixel_height) - 0.5,
            image_point = this.right.scale(normalized_x)
                            .add(this.up.scale(normalized_y))
                            .add(this.direction);
        
        return new mama.ray(this.position, image_point);   
    }
    
    camera.prototype.get_ray_at = function (x, y) {
        if (this.mode === 'perspective') {
            return this.get_ray_perspective_at(x, y)   
        }
        
        // orthographic is the default mode
        return this.get_ray_orthographic_at(x, y);
    }
    
    camera.prototype.to_string = function () {
        return "camera {\n\tposition: " + this.position
                    + ",\n\ttarget: " + this.target
                    + ",\n\tnear_plane: " + this.near_plane
                    + ",\n\tfar_plane: " + this.far_plane
                    + ",\n\tup: " + this.up
                    + ",\n\tfield_of_view: " + this.field_of_view
                    + "\n}";
    }; 

    camera.prototype.toString = camera.prototype.to_string;
    
    mod.camera = camera;
}(mod || (mod = {})));