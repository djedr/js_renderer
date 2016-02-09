(function (mod) {
    //
    // constructor
    //
    function texture(file_name, width, height, type) {
        this.file_name = file_name;
        this.width = width;
        this.height = height;
        this.type = type || 'rectangular';
        this.loaded = false;
        
        this.load(file_name);
    }
    
    //
    // class attributes
    //
    texture.two_pi = Math.PI * 2;
    texture.two_pi_inverse = 1 / texture.two_pi;
    texture.pi_inverse = 1 / Math.PI;
    
    //
    // class methods
    //
        
    //
    // instance methods
    //
    texture.prototype.load = function (file_name) {
        var this_ = this;
        
        var texture_image = new Image();
        
        texture_image.width = this.width;
        texture_image.height = this.height;
        
        texture_image.onload = function () {
            var internal_canvas = document.createElement("canvas"),
                internal_context = internal_canvas.getContext("2d");
            
            internal_canvas.width = this_.width;
            internal_canvas.height = this_.height;
            
            internal_context.drawImage(texture_image, 0, 0);
            this_.internal_buffer = internal_context.getImageData(0, 0, this_.width, this_.height);
            this_.loaded = true;
            console.log('image', file_name, 'loaded');
        };
        
        console.log('loading image:', file_name);
        
        //texture_image.crossOrigin = "*";
        texture_image.crossOrigin = 'anonymous';
        texture_image.src = file_name;
    };
    
    texture.prototype.is_loaded = function () {
        return this.loaded;
    };
    
    texture.prototype.map = function (local_hit_point) {
        if (this.type === 'spherical') {
            //texture.prototype.map = texture.prototype.spherical_map;
            return this.spherical_map(local_hit_point)
        }
        //texture.prototype.map = texture.prototype.rectangular_map;
        return this.rectangular_map(local_hit_point);
    };
    
    texture.prototype.get_color_at = function (u, v) {        
        var pos = (u + v * this.width) * 4,
            r = this.internal_buffer.data[pos],
            g = this.internal_buffer.data[pos + 1],
            b = this.internal_buffer.data[pos + 2],
            a = this.internal_buffer.data[pos + 3];
            
        return new mama.color4(r / 255, g / 255, b / 255, a / 255);
    }
    
    texture.prototype.null_map = function () {
        // image not loaded yet
        return new mama.color4(1, 0, 1, 1); // magenta
    };
    
    texture.prototype.rectangular_map = function (rectangle_point) {
        if (this.internal_buffer) {
            return this.rectangular_map_(rectangle_point);
        } else {
            return this.null_map();
        }
    };
    
    texture.prototype.spherical_map = function (sphere_point) {
        if (this.internal_buffer) {
            return this.spherical_map_(sphere_point);
        } else {
            return this.null_map();
        }
    };
    
    texture.prototype.rectangular_map_ = function (rectangle_point) {
        var u = Math.abs(((rectangle_point.x * this.width) % this.width)) >> 0,
            v = Math.abs(((rectangle_point.y * this.height) % this.height)) >> 0;
        
        return this.get_color_at(u, v);
    };
    
    texture.prototype.spherical_map_ = function (sphere_point) {
        var theta = Math.acos(sphere_point.y),
            phi = Math.atan2(sphere_point.x, sphere_point.z);
        
        if (phi < 0) {
            phi += texture.two_pi;
        }
        
        var ux = phi * texture.two_pi_inverse, // 0..1
            vx = 1 - theta * texture.pi_inverse, // 0..1
            u = ((this.width - 1) * ux) >> 0,
            v = ((this.height - 1) * vx) >> 0;
        
        return this.get_color_at(u, v);
    };
    
    // toString?
    mod.texture = texture;
}(mod || (mod = {})));
