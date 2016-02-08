(function (mod) {
    //
    // constructor
    //
    function raytracer(initial_image) {
        this.image = initial_image;
        
        this.sample_mode = 'single';
        
        this.camera = new mod.camera('perspective', new mama.vector3(0, 0, -15), new mama.vector3.zero(), this.image);
        //this.camera.direction = this.camera.direction.scale(1.2);
        
        this.objects = [];
        this.lights = [];
        this.background_color = new mama.color4.black();
    }

    //
    // class attributes
    //

    //
    // class methods
    //
    
    raytracer.prototype.illuminate = function (intersection, reflections) {
        
    };
    
    function reflect(incoming, normal) {
        return normal.scale(-2 * incoming.dot(normal)).add(incoming);
    }
    
    function refract(incoming, normal, flag) {
        var index1 = 1.01, index2 = 1.15, transmitted,
            eta, c1, cs2;
        
        if (flag) {
            normal = normal.negate();
            var tmp = index1;
            index1 = index2;
            index2 = tmp;
        }
        
        eta = index1 / index2;
        c1 = -incoming.dot(normal);
        cs2 = 1 - eta * eta * (1 - c1 * c1);
        
        if (cs2 < 0) {
            // total internal reflection
            return mama.vector3.zero(); // dummy
        }
        
        return incoming.scale(eta).add(normal.scale(eta * c1 - Math.sqrt(cs2)));
    }
    
    function refract2(I, N, flag) {
        var ndoti, two_ndoti, ndoti2, a, b, b2, D2, T = mama.vector3.zero(),
            ki = 1.0, kr = 1.333, // for air and water
            r = ki / kr, r2 = r * r,
            invr = kr / ki, invr2 = invr * invr;
        
        if (flag) {
            N = N.negate();
            var tmp = ki;
            ki = kr;
            kr = tmp;
            r = ki / kr; r2 = r * r;
            invr = kr / ki; invr2 = invr * invr;
        }
        
        ndoti = N.x * I.x + N.y * I.y + N.z * I.z;     // 3 mul, 2 add
        ndoti2 = ndoti * ndoti;                    // 1 mul
        if (ndoti >= 0.0) { b = r; b2 = r2; } else { b = invr; b2 = invr2; }
        D2 = 1.0 - b2 * (1.0 - ndoti2);

        if (D2 >= 0.0) {
            if (ndoti >= 0.0)
                a = b * ndoti - Math.sqrt(D2); // 2 mul, 3 add, 1 sqrt
            else
                a = b * ndoti + Math.sqrt(D2);
            T.x = a*N.x - b*I.x;     // 6 mul, 3 add
            T.y = a*N.y - b*I.y;     // ----totals---------
            T.z = a*N.z - b*I.z;     // 12 mul, 8 add, 1 sqrt!
        } else {
            // total internal reflection
            // this usually doesn't happen, so I don't count it.
            two_ndoti = ndoti + ndoti;         // +1 add
            T.x = two_ndoti * N.x - I.x;      // +3 adds, +3 muls
            T.y = two_ndoti * N.y - I.y;
            T.z = two_ndoti * N.z - I.z;
        }
        return T;
    }
    
    function refract3(I, N, flag) {
        var ndoti, k, eta = 1 / 1.5;//333;
        //N = N.normalize();
        //I = I.normalize();
        
        if (flag) {
            N = N.negate();
            eta = 1 / eta;
        }
        
        ndoti = N.dot(I);
        k = 1 - eta * eta * (1 - ndoti * ndoti);
        if (k < 0) {
            return mama.vector3.zero();
        }
        return I.scale(eta).subtract(N.scale(eta * ndoti + Math.sqrt(k))).normalize();
    }
    
    raytracer.prototype.get_sample_at = function(x, y, reflections, secondary_ray, refract_flag) {
        var light_i, distance, nearest_distance = 100000000,
            camera_ray = secondary_ray || this.camera.get_ray_at(x, y),
            result = this.background_color.add(new mama.color4(
                x % 100 / 100,
                y % 200 / 200,
                (x + y) % 300 / 300,
                1)),
            nearest_intersection = this.test_ray_with_objects(camera_ray),
            nearest_intersection_point,
            nearest_intersection_normal,
            nearest_intersection_texture,
            light_intersection,
            ray_to_light, // todo: pass this to illuminate; decouple
            direction_to_light,
            secondary_ray,
            refracted_dir,
            secondary_intersection;
        
        //console.log('before', reflections);
        reflections = reflections === undefined ? 500 : reflections;
        //console.log('after', reflections);
        
        if (nearest_intersection.distance > 0) {
            nearest_intersection_point = nearest_intersection.point;
            nearest_intersection_normal = nearest_intersection.object.get_normal(nearest_intersection_point);
            nearest_intersection_texture = nearest_intersection.object.get_texture(nearest_intersection_point);
            result = mama.color4.black(); // new mama.color4(0.5, 0.5, 0.5, 1); // HIER ist shadow
            
            if (nearest_intersection.object.material.name.charAt(0) !== '@' || reflections <= 0) { // diffuse object
                for (light_i = 0; light_i < this.lights.length; ++light_i) {
                    ray_to_light = new mama.ray(
                        nearest_intersection_point,
                        this.lights[light_i].position.subtract(nearest_intersection_point));
                    light_intersection = this.test_ray_with_objects(ray_to_light, ray_to_light.direction.length());

                    // no intersections with objects -- means light is not obscured
                    if (light_intersection.distance === 0 || light_intersection.object === nearest_intersection.object) {
                        // light
                        //compute lighting model
                        result = result.add(this.lights[light_i]
                                            .illuminate(nearest_intersection,
                                                        this.camera.position
                                                            .subtract(nearest_intersection.point),
                                                        nearest_intersection_normal,
                                                        nearest_intersection_texture));
                    } // else // some other object -- light is obscured
                }
            } else {
                if (nearest_intersection.object.material.name.charAt(1) === 'm') { // mirror reflection
                    secondary_ray = new mama.ray(nearest_intersection.point, reflect(camera_ray.direction, nearest_intersection_normal)); 
                } else {
                    refracted_dir = refract3(camera_ray.direction.normalize(), nearest_intersection_normal.normalize(), false).normalize();
                    secondary_ray = new mama.ray(nearest_intersection.point.add(refracted_dir.scale(0.1)), refracted_dir);

                    //refract_flag = !refract_flag;

                    secondary_intersection = this.test_ray_with_objects(secondary_ray);

                    if (secondary_intersection.distance > 0 && secondary_intersection.object === nearest_intersection.object) {  
                        refracted_dir = refract3(secondary_ray.direction, secondary_intersection.object.get_normal(secondary_intersection.point), true).normalize();
                        secondary_ray = new mama.ray(secondary_intersection.point, refracted_dir);
                    }
                }

                result = result.add(this.get_sample_at(x, y, reflections - 1, secondary_ray));
            }
        } // else background -- return result;

        return result;
    };
    
    // false intersections
    // max distance is to the light
    
    raytracer.prototype.test_ray_with_objects = function(ray, nearest_dist) {
        var object_i, distance, nearest_distance = nearest_dist || 200000000, nearest_object_index = -1;
        for (object_i = 0; object_i < this.objects.length; ++object_i) {
            distance = this.objects[object_i].intersect(ray);
            if (distance > 0 && distance < nearest_distance) {
                nearest_distance = distance;
                nearest_object_index = object_i;
            }
        }
        
        if (nearest_object_index === -1) {
            // background
            return new mod.intersection(0);
        }
        
        // object
        return new mod.intersection(
            nearest_distance,
            // nearest_object
            this.objects[nearest_object_index],
            // intersection_point
            ray.origin.add(ray.direction.normalize().scale(nearest_distance)));
        
    };
    
    raytracer.prototype.sample_adaptive = function (i, j) {
        var minimum_samples_per_pixel = 5;
        var maximum_samples_per_pixel = 25;
        var spatial_contrast = new mama.color4(0.05, 0.05, 0.05, 0.05);
        
        var middle = new mama.vector2(0.5, 0.5);
        
        var samples = Object.create(null);
        var sample_count = 0;
        
        var t = this;
        
        function recur(middle, translation, scale) {
            middle = middle.scale(scale).add(translation.scale(scale));
            if (!(middle.key() in samples)) {
                var positions = [
                    middle.add(new mama.vector2(-scale, -scale).scale(0.5)),
                    middle.add(new mama.vector2(scale, -scale).scale(0.5)),
                    middle.add(new mama.vector2(-scale, scale).scale(0.5)),
                    middle.add(new mama.vector2(scale, scale).scale(0.5))
                ];

                samples[middle.key()] = t.get_sample_at(i + middle.x, j + middle.y);
                sample_count += 1;

                positions.forEach(function (position, index) {
                    if (!(position.key() in samples)) {
                        var s = t.get_sample_at(i + position.x, j + position.y);
                        
                        if (s.subtractAbs(samples[middle.key()]).anyGreaterThan(spatial_contrast)) {
                            if (sample_count <= maximum_samples_per_pixel) {
                                samples[position.key()] = s;
                                sample_count += 1;
                                recur.call(t, middle, position, scale * 0.5);
                            }
                        } 
                    }
                });   
            }
        }
        recur.call(this, middle, new mama.vector2(0, 0), 1);
        
        var result = mama.color4.black();
        
        for (var sample in samples) {
            result = result.add(samples[sample]);
        }
        
        return result.scale(1 / sample_count);
    };
    
    raytracer.prototype.sample_random = function (x, y) {
        var samples_per_pixel = 5;
        var result = mama.color4.black();
        
        for (var i = 0; i < samples_per_pixel; ++i) {
            result = result.add(this.get_sample_at(x + Math.random(), y + Math.random()));
        }
        
        return result.scale(1 / samples_per_pixel);
    };
    
    raytracer.prototype.sample = function (x, y) {
        switch (this.sample_mode) {
            case 'adaptive': return this.sample_adaptive(x, y);
            case 'random': return this.sample_random(x, y);
            default: 
                // single is the default mode
                return this.get_sample_at(x + 0.5, y + 0.5);
        }
        
    }
    
    // sampling method (single, adaptive, random, etc.)
    // camera type (getting samples; orthographic, perspective, etc.)

    //
    // instance methods
    //
    
    // przecinanie z sobą samym
    // BVH / bounding volume hierarchies -- ubieramy trójkąty w hierarchie sfer
    // głębokość obiektów
    // filmik o świetle:
    // disney's practical guide to path tracing
    // ray sorting, batching
    // 3 methods: surface, something, organizing rays
    raytracer.prototype.render = function (mesh) {
        var sphere_texture1 = this.sphere_texture1,
            sphere_texture2 = this.sphere_texture2,
            cube_texture1 = this.cube_texture1,
            this_ = this;
        
        this.sphere_texture1 = this.sphere_texture1 || new mod.texture('files/earth.jpg', 2048, 1025, 'spherical');
        this.sphere_texture2 = this.sphere_texture2 || new mod.texture('files/sphere_texture2.png', 403, 201, 'spherical');
        this.cube_texture1 = this.cube_texture1 || new mod.texture('files/cube_texture5.jpg', 274, 300);
        
        if (!this.cube_texture1.is_loaded() || !this.sphere_texture1.is_loaded() || !this.sphere_texture2.is_loaded()) {
            window.requestAnimationFrame(function () { raytracer.prototype.render.call(this_, mesh); });
            return;
        }
        
        var sphere = new mama.sphere(new mama.vector3(-2.1, -6, 8), 2, new mama.color4(1, 0, 0, 1)),
            sphere2 = new mama.sphere(new mama.vector3(3.1, -6, 6), 2, new mama.color4(1, 1, 0, 1)),
            sphere3 = new mama.sphere(new mama.vector3(-2, 0, 0), 0.5, new mama.color4(1, 1, 0, 1)),
            sphere4 = new mama.sphere(new mama.vector3(0.5, 0, 2), 0.14, new mama.color4(1, 0, 1, 1)),
            color;
        
        var ambient_color = new mama.color4(0.0, 0.0, 0.0, 1);
        var green_color = new mama.color4(0.5, 0.5, 0.5, 1);
        var white_color = new mama.color4(1, 1, 1, 1);
        
        if (this.camera.mode === 'perspective') {
            this.objects.push(new mama.plane(new mama.vector3(0, -8, 0), new mama.vector3(0, 1, 0)));
            this.objects.push(new mama.plane(new mama.vector3(0, 8, 0), new mama.vector3(0, -1, 0),
                              new mod.material('black',
                                               ambient_color,
                                               new mama.color4(0.0, 0.0, 0.0, 0.5),
                                               new mama.color4(0.0, 0.0, 0.0, 0.5),
                                               1)));
            this.objects.push(new mama.plane(new mama.vector3(0, 0, 16), new mama.vector3(0, 0, -1)));
            this.objects.push(new mama.plane(new mama.vector3(8, 0, 0), new mama.vector3(-1, 0, 0),
                              new mod.material('blue',
                                               ambient_color,
                                              new mama.color4(0, 0, 0.5, 0.5),
                                              new mama.color4(0, 0, 0.5, 0.5),
                                              1.0)));
            this.objects.push(new mama.plane(new mama.vector3(-8, 0, 0), new mama.vector3(1, 0, 0),
                              new mod.material('red',
                                               ambient_color,
                                              new mama.color4(0.5, 0, 0, 0.5),
                                              new mama.color4(0.5, 0, 0, 0.5),
                                              1.0)));
            
            sphere.material = new mod.material('@m',
                                               ambient_color,
                                               green_color,
                                               green_color,
                                               0.2,
                                               sphere_texture1);
            this.objects.push(sphere); 
            
            sphere2.material = new mod.material('@r',
                                               ambient_color,
                                               green_color,
                                               green_color,
                                               0.2,
                                               sphere_texture2);
            this.objects.push(sphere2);
            
            
//            sphere.material = new mod.material('x', 0.5, 0.9, 0.01, 0.1);
//            this.objects.push(sphere);
//            sphere2.material = new mod.material('x', 0.9, 0.7, 0.0025, 5.3);
//            this.objects.push(sphere2);
//            sphere3.material = new mod.material('x', 0.9, 0.9, 0.1, 1);
//            this.objects.push(sphere3);
        } else {
            this.objects.push(sphere3);
            this.objects.push(sphere4);
        }
        
//        this.lights.push(new mod.light('point', new mama.vector3(10, 10, -10)));
//        this.lights[0].specular = new mama.color4(0.1, 0.9, 0.9, 1);
//        this.lights.push(new mod.light('point', new mama.vector3(-5, 10, -5),
//                                       new mama.color4(0.2, 0, 0, 0.5),
//                                      new mama.color4(0.35, 0.2, 0.2, 0.5),
//                                      mama.color4.black()));
        this.lights.push(new mod.light('point', new mama.vector3(0, 8, 8),
                                      ambient_color,
                                      new mama.color4(0.5, 0.5, 0.5, 1),
                                      new mama.color4(0.5, 0.5, 0.5, 1)));
//                                      new mama.color4(0.5, 0.0, 0.0, 1),
//                                      new mama.color4(0.5, 0, 0, 1)));
        this.lights.push(new mod.light('point', new mama.vector3(0, 0, -12),
                                      ambient_color,
                                      new mama.color4(0.0, 0.0, 0.5, 1),
                                      new mama.color4(0.0, 0.0, 0.5, 1)));
        this.lights.pop();
        
        if (mesh) {
            console.log('mesh material name:', mesh.material.name);
            mesh.material.texture = cube_texture1;
            mesh.rotate(0, 0);
            mesh.translate(-5, -8, 5);
            //mesh.scale(1.1, 1.1, 1.1);
            this.objects.push(mesh);   
        }
        
        for (var i = 0; i < this.image.width; ++i) {
            for (var j = 0; j < this.image.height; ++j) {
                color = this.sample(i, j);
                this.image.put_pixel(i, j, 0, color);
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