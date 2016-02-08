(function (mod) {
    //
    // constructor
    //
    function mesh(initial_name, initial_vertices, initial_faces, initial_material) {
        this.name = initial_name;
        this.vertices = initial_vertices;
        this.faces = initial_faces;
        
        this.position = mama.vector3.zero();
        this.rotation = mama.vector3.zero();
        this.update_transformation_matrix();
        
        this.color = new mama.color4(0, 1, 0, 1);
        this.material = initial_material || new mod.material('default');
        this.transformation_matrix = new mama.matrix4x4.identity();
    }

    //
    // class methods
    //
        
    //
    // instance methods
    //
    mesh.prototype.update_transformation_matrix = function () {
        this.transformation_matrix = mama.matrix4x4
            .rotation_yaw_pitch_roll(this.rotation.y, this.rotation.x, this.rotation.z)
            .multiply(mama.matrix4x4.translation(this.position.x, this.position.y, this.position.z));
        
        // this is for transforming normals:
        // inverse-transpose of a matrix leaves the rotation unchanged, while inverting the scale
        this.transformation_matrix_it = mama.matrix4x4.transpose(this.transformation_matrix.invert());
    }
    
    mesh.prototype.rotate = function(x, y, z) {
        this.rotation.x = x || 0;
        this.rotation.y = y || 0;
        this.rotation.z = z || 0;
        
        this.update_transformation_matrix();        
    }
    
    mesh.prototype.translate = function(x, y, z) {
        this.position.x = x || 0;
        this.position.y = y || 0;
        this.position.z = z || 0;
        
        this.update_transformation_matrix();        
    }
    
    mesh.prototype.scale = function(x, y, z) {        
        this.transformation_matrix = this.transformation_matrix.multiply(mama.matrix4x4.scaling(x, y, z));    
        this.transformation_matrix_it = mama.matrix4x4.transpose(this.transformation_matrix.invert());    
    }
    
    mesh.prototype.intersect = function (ray, is_culling) {
        is_culling = true; // NOTE: culling always on
        this.i = -1;
        this.t = 1000000000;
        
        for (var i = 0; i < this.faces.length; ++i) {
            var edge1, edge2, p, q, t,
                det, inv_det, u, v, t,
                epsilon = 0.00000001,
                a = mama.vector3.transform_coordinates(this.vertices[this.faces[i].a].coordinates, this.transformation_matrix),
                b = mama.vector3.transform_coordinates(this.vertices[this.faces[i].b].coordinates, this.transformation_matrix),
                c = mama.vector3.transform_coordinates(this.vertices[this.faces[i].c].coordinates, this.transformation_matrix);

            edge1 = b.subtract(a);
            edge2 = c.subtract(a);

            p = ray.direction.cross(edge2);
            det = edge1.dot(p);

            //if determinant is near zero, ray lies in plane of triangle
            if (is_culling && det < epsilon) continue;//return 0;
            else if (det > -epsilon && det < epsilon) continue;//return 0;
            inv_det = 1.0 / det;

            t = ray.origin.subtract(a);

            u = t.dot(p) * inv_det;

            if (u < 0 || u > 1) continue;//return 0;

            q = t.cross(edge1);

            v = ray.direction.dot(q) * inv_det;

            if (v < 0 || u + v > 1) continue;//return 0;

            t = edge2.dot(q) * inv_det;

            if (t > epsilon && t < this.t) {
                this.i = i;
                this.u = u;
                this.v = v;
                
                this.t = t;  
            }
        }
        //console.log('nope');
        return this.i > -1 ? this.t : 0;
    };
    
    mesh.prototype.get_texture = function (intersection_point) {
        //console.log(this.u, this.v);
        
        var i = this.i, u = this.u, v = this.v, texture;
        
//        texture = mama.vector3.transform_coordinates(this.vertices[this.faces[i].a].texture, this.transformation_matrix_it)
//                .normalize().scale(1.0 - (u + v))
//            .add(mama.vector3.transform_coordinates(this.vertices[this.faces[i].b].texture, this.transformation_matrix_it)
//                .normalize().scale(u))
//            .add(mama.vector3.transform_coordinates(this.vertices[this.faces[i].c].texture, this.transformation_matrix_it)
//                .normalize().scale(v))
//            .normalize();
        var a = this.vertices[this.faces[i].a],
            b = this.vertices[this.faces[i].b],
            c = this.vertices[this.faces[i].c];
        
        if (a.texture) {
            texture = a.texture
                .add(b.texture.subtract(a.texture).scale(u))
                .add(c.texture.subtract(a.texture).scale(v));
        
            return texture;
        }
        
        return mama.vector3.zero();
    };
    
    mesh.prototype.get_normal = function (intersection_point) {
        var i = this.i, u = this.u, v = this.v, normal;
        // given the face (triangle) that was intersected, get normal by interpolating 3 vertices normals
        if (this.i === -1) {
            return mama.vector3.zero();
        }
        
        normal = mama.vector3.transform_coordinates(this.vertices[this.faces[i].a].normal, this.transformation_matrix_it)
                .normalize().scale(1.0 - (u + v))
            .add(mama.vector3.transform_coordinates(this.vertices[this.faces[i].b].normal, this.transformation_matrix_it)
                .normalize().scale(u))
            .add(mama.vector3.transform_coordinates(this.vertices[this.faces[i].c].normal, this.transformation_matrix_it)
                .normalize().scale(v))
            .normalize();
        //console.log(normal);
        
        return normal;
    };
    
    mesh.prototype.to_string = function () {
        return "mesh { name: " + this.name
                    + ", vertices: " + this.vertices
                    + ", ... "
                    + " }";
    };

    mesh.prototype.toString = mesh.prototype.to_string;

    //module.exports = color4;
    mod.mesh = mesh;
}(mod || (mod = {})));