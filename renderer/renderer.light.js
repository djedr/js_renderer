(function (mod) {
    //
    // constructor
    //
    function light(initial_mode,
                    initial_position,
                    initial_ambient,
                    initial_diffuse,
                    initial_specular,
                    initial_direction) {
        this.mode = initial_mode;
        this.position = initial_position;
        this.ambient = initial_ambient || new mama.color4(0, 0.5, 0, 1);
        this.diffuse = initial_diffuse || new mama.color4(0, 0.5, 0.5, 1);
        this.specular = initial_specular || new mama.color4(0.25, 0.25, 0.25, 1);
        
        // point_light
        //this.range;
        this.constant_attenuation;
        this.linear_attenuation;
        //this.quadratic_attenuation;
        
        //color = color * (1 / (this.constant_attenuation + this.linear_attenuation * illuminated_point.subtract(this.position).length())0;
        
        //reflector
        this.angle_inner;
        this.angle_outer;
        this.concentration;
        // attenuation
        
        // if mode === 'directional', check direction in illuminate
        this.direction = initial_direction;
    }

    //
    // class methods
    //
        
    //
    // instance methods
    //
    light.prototype.illuminate = function (intersection, direction_to_camera, surface_normal, surface_texture) {
        var object = intersection.object,// surface_normal = object.get_normal(intersection.point),
            direction_to_light = this.position.subtract(intersection.point).normalize(),
            reflected = surface_normal.scale(2 * direction_to_light.dot(surface_normal)).subtract(direction_to_light).normalize(),
            material = object.material,
            reflected_dot_camera = reflected.dot(direction_to_camera),
            result = mama.color4.black(),
            material_diffuse = material.diffuse;
        
        // add texture component if texture defined
        if (material.texture) {
            material_diffuse = material.texture.map(surface_texture);
        }
  
        //return material.ambient * this.ambient + (material.diffuse * direction_to_light.dot(surface_normal) * this.diffuse + material.specular * Math.pow(reflected.dot(direction_to_camera), material.shininess) * this.specular);
        result = this.ambient
            .multiply(material.ambient)
            .add(this.diffuse
                 .multiply(material_diffuse)
                 .scale(direction_to_light.dot(surface_normal)));
        
        // add specular component if present
        if (reflected_dot_camera > 0) {
            result = result.add(this.specular
                .multiply(material.specular)
                .scale(Math.pow(reflected_dot_camera, material.shininess)));
        }
        
        return result;
    };

    // todo?: toString

    mod.light = light;
}(mod || (mod = {})));