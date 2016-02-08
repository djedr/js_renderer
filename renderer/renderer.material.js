(function (mod) {
    //
    // constructor
    //
    function material(initial_name, initial_ambient, initial_diffuse, initial_specular, initial_shininess, initial_texture) {
        this.name = initial_name || 'default';
        this.ambient = initial_ambient || new mama.color4(0.5, 0.5, 0.5, 0.5);
        this.diffuse = initial_diffuse || new mama.color4(0.5, 0.5, 0.5, 0.5);
        this.specular = initial_specular || new mama.color4(0.5, 0.5, 0.5, 0.5);
        this.shininess = initial_shininess || 0.25;
        this.texture = initial_texture || null;
        
        //this.transmission = null;
        //this.smoothness = null;
        //this.emission = null; 
    }

    //
    // class methods
    //
        
    //
    // instance methods
    //

    // todo?: toString

    mod.material = material;
}(mod || (mod = {})));