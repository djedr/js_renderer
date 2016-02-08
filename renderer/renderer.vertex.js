(function (mod) {
    //
    // constructor
    //
    function vertex(initial_coordinates, initial_normal, initial_texture, initial_world_coordinates) {
        this.coordinates = initial_coordinates;
        this.normal = initial_normal;
        this.texture = initial_texture;
        this.world_coordinates = initial_world_coordinates;
    }

    //
    // class methods
    //
        
    //
    // instance methods
    //
    
    vertex.prototype.to_string = function () {
        return "vertex { coordinates: " + this.coordinates
                    + ", normal: " + this.normal
                    + ", texture: " + this.texture
                    + ", world_coordinates: " + this.world_coordinates
                    + " }";
    };

    vertex.prototype.toString = vertex.prototype.to_string;

    //module.exports = color4;
    mod.vertex = vertex;
}(mod || (mod = {})));