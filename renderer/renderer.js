var Renderer;

(function (Renderer) {
    var Camera = (function () {
        function Camera() {
            this.Position = mama.vector3.zero();
            this.Target = mama.vector3.zero();
        }
        return Camera;
    })();

    Renderer.Camera = Camera;

    //renderer.mesh = mod.mesh;

    var Device = (function () {
        function Device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            this.halfWorkingWidth = canvas.width * 0.5;
            this.halfWorkingHeight = canvas.height * 0.5;
            this.workingContext = this.workingCanvas.getContext('2d');
            this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
            this.projection_matrix = mama.matrix4x4.perspective_fov_lh(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
        }
        
        Device.prototype.interpolate = function (min, max, gradient) {
            return min + (max - min) * Math.max(0, Math.min(gradient, 1));   
        };

        Device.prototype.clear = function () {
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
            
            for (var i = 0; i < this.depthbuffer.length; ++i) {
                this.depthbuffer[i] = 10000000;
            }
        };

        Device.prototype.present = function () {
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        };

        // RGBA
        Device.prototype.putPixel = function (x, y, z, color) {
            var backbufferdata = this.backbuffer.data;
            var index = ((x >> 0) + (y >> 0) * this.workingWidth);
            var index4 = index * 4;
            
            if (this.depthbuffer[index] < z) {
                return;   
            }
            
            this.depthbuffer[index] = z;

            backbufferdata[index4] = color.r * 255;
            backbufferdata[index4 + 1] = color.g * 255;
            backbufferdata[index4 + 2] = color.b * 255;
            backbufferdata[index4 + 3] = color.a * 255;
        };

        Device.prototype.project = function (vertex, transformation_matrix, world) {
            var point2d = mama.vector3.transform_coordinates(vertex.coordinates, transformation_matrix),
                point3dWorld = mama.vector3.transform_coordinates(vertex.coordinates, world),
                normal3dWorld = mama.vector3.transform_coordinates(vertex.normal, world),
                x = point2d.x * this.workingWidth + this.halfWorkingWidth,
                y = -point2d.y * this.workingHeight + this.halfWorkingHeight;

            return (new mod.vertex(
                new mama.vector3(x, y, point2d.z),
                normal3dWorld,
                vertex.texture,
                point3dWorld
            ));
        };
        
        var color_white = new mama.color4(1, 1, 1, 1);
        Device.prototype.shade_pixels_in_line = function (y, va, vb, vc, vd, color, texture, light) {
            var pa = va.coordinates,
                pb = vb.coordinates,
                pc = vc.coordinates,
                pd = vd.coordinates,
                // where along the edge of the triangle are we?
                gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1,
                gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1,
                gradient1rem = 1 - gradient1,
                gradient2rem = 1 - gradient2,
                // scanline extreme points sx|-----|ex (start, end)
                sx = this.interpolate(pa.x, pb.x, gradient1) >> 0,
                ex = this.interpolate(pc.x, pd.x, gradient2) >> 0,
                // depth extreme points z1|-----|z2
                z1 = this.interpolate(pa.z, pb.z, gradient1),
                z2 = this.interpolate(pc.z, pd.z, gradient2),
                // interpolated normals at extreme points
                s_norm = va.normal.scale(gradient1rem).add(vb.normal.scale(gradient1)),
                e_norm = vc.normal.scale(gradient2rem).add(vd.normal.scale(gradient2)),
                // interpolated world_coordinates
                s_vc = va.world_coordinates.scale(gradient1rem).add(vb.world_coordinates.scale(gradient1)),
                e_vc = vc.world_coordinates.scale(gradient2rem).add(vd.world_coordinates.scale(gradient2)),
                // texture coordinate extremes
                su, eu, sv, ev,
                gradient, gradientrem,
                z, u, v,
                texture_color,
                point;   
            
            if (texture) {
                su = this.interpolate(va.texture.x, vb.texture.x, gradient1);
                eu = this.interpolate(vc.texture.x, vd.texture.x, gradient2);
                sv = this.interpolate(va.texture.y, vb.texture.y, gradient1);
                ev = this.interpolate(vc.texture.y, vd.texture.y, gradient2);
            }
            
            for (var x = sx; x < ex; ++x) {
                gradient = (x - sx) / (ex - sx);
                gradientrem = 1 - gradient;
                z = this.interpolate(z1, z2, gradient);
                // shade from interpolated normal (phong shading)
                shade = this.shade(s_vc.scale(gradientrem).add(e_vc.scale(gradient)), s_norm.scale(gradientrem).add(e_norm.scale(gradient)), lights);
                u = this.interpolate(su, eu, gradient);
                v = this.interpolate(sv, ev, gradient);
                
                if (texture) {
                    texture_color = texture.rectangular_map(new mama.vector2(u, v));
                } else {
                    texture_color = color_white;
                }
                
                // clipping
                if (x >= 0 && y >= 0 && x < this.workingWidth && y < this.workingHeight) {
                    this.putPixel(x, y, z,
                                  new mama.color4(color.r * shade * texture_color.r,
                                       color.g * shade * texture_color.g,
                                       color.b * shade * texture_color.b,
                                       1));
                }
            }
        };
        
        var cos_outer_cone_angle = 0.8; // 36 deg
        // diffuse phong
        Device.prototype.shade = function (vertex, normal, lights) {
            var light_direction, light_direction_normalized, light_index, total_shade = 0, spot_direction, current_light, cos_cur_angle, cos_inner_cone_angle, cos_inner_minus_outer_angle, spot, normal_normalized = mama.vector3.normalize(normal), lambert_term, attenuation_factor, distance;
            
            for (light_index = 0; light_index < lights.length; ++light_index) {
                current_light = lights[light_index];
                light_direction = current_light.position.subtract(vertex);
                light_direction_normalized = mama.vector3.normalize(light_direction);
                
                if (current_light.type === 2) {
                    spot_direction = current_light.spot_direction.normalize();
                    cos_cur_angle = light_direction_normalized.dot(spot_direction);
                    cos_inner_cone_angle = current_light.spot_cos_cutoff;
                    cos_inner_minus_outer_angle = cos_inner_cone_angle - cos_outer_cone_angle;
                    
                    spot = Math.max(0, Math.min((cos_cur_angle - cos_outer_cone_angle) / cos_inner_minus_outer_angle, 1));
                    
                    lambert_term = normal_normalized.dot(light_direction_normalized);
                    
                    if (lambert_term > 0) {
                        total_shade += lambert_term * spot;
                    }
                } else if (current_light.type === 1) {
                    distance = light_direction.length();
                    attenuation_factor = 1 / (current_light.constant_attenuation + current_light.linear_attenuation * distance + current_light.quadratic_attenuation * distance * distance);
                    
                    lambert_term = normal_normalized.dot(light_direction_normalized);
                    if (lambert_term > 0) {
                        total_shade += lambert_term * attenuation_factor;
                    }
                } else {                
                    total_shade += Math.max(0, mama.vector3.dot(normal_normalized, light_direction_normalized));
                }
            }
            
            return total_shade;
        };
        
        Device.prototype.shade_vertices = function (v1, v2, v3, color, texture, lights) {
            var temp, dp1p2, dp1p3,
                p1, p2, p3,
                nl1, nl2, nl3;
            // could implement swap
            if (v1.coordinates.y > v2.coordinates.y) {
                temp = v2;
                v2 = v1;
                v1 = temp;
            }
            if (v2.coordinates.y > v3.coordinates.y) {
                temp = v2;
                v2 = v3;
                v3 = temp;
            }
            if (v1.coordinates.y > v2.coordinates.y) {
                temp = v2;
                v2 = v1;
                v1 = temp;
            }
                
            p1 = v1.coordinates;
            p2 = v2.coordinates;
            p3 = v3.coordinates;
            
            if (p2.y - p1.y > 0) {
                dp1p2 = (p2.x - p1.x) / (p2.y - p1.y);   
            } else {
                dp1p2 = 0;   
            }
            
            if (p3.y - p1.y > 0) {
                dp1p3 = (p3.x - p1.x) / (p3.y - p1.y);   
            } else {
                dp1p3 = 0;   
            }
            
            if (dp1p2 > dp1p3) {
                for (var y = p1.y >> 0; y <= p3.y >> 0; ++y) {
                    if (y < p2.y) {
                        this.shade_pixels_in_line(y, v1, v3, v1, v2, color, texture, lights);
                    } else {
                        this.shade_pixels_in_line(y, v1, v3, v2, v3, color, texture, lights);   
                    }
                }
            } else {
                for (var y = p1.y >> 0; y <= p3.y >> 0; ++y) {
                    if (y < p2.y) {
                        this.shade_pixels_in_line(y, v1, v2, v1, v3, color, texture, lights);   
                    } else {
                        this.shade_pixels_in_line(y, v2, v3, v1, v3, color, texture, lights);   
                    }
                }
            }     
        };

        Device.prototype.render = function (camera, meshes, lights) {
            var view_matrix = mama.matrix4x4.look_at_lh(camera.Position, camera.Target, mama.vector3.up()),
                projection_matrix = this.projection_matrix; // assume it doesn't change
            
            for (var index = 0; index < meshes.length; ++index) {
                var current_mesh = meshes[index];

                var world_matrix =
                    mama.matrix4x4.rotation_yaw_pitch_roll(current_mesh.rotation.y, current_mesh.rotation.x, current_mesh.rotation.z)
                    .multiply(mama.matrix4x4.translation(current_mesh.position.x, current_mesh.position.y, current_mesh.position.z));

                var transform_matrix = world_matrix.multiply(view_matrix).multiply(projection_matrix);

                for (var indexFaces = 0; indexFaces < current_mesh.faces.length; ++indexFaces) {
                    var currentFace = current_mesh.faces[indexFaces];
                    var vertexA = current_mesh.vertices[currentFace.a];
                    var vertexB = current_mesh.vertices[currentFace.b];
                    var vertexC = current_mesh.vertices[currentFace.c];

                    var pixelA = this.project(vertexA, transform_matrix, world_matrix);
                    var pixelB = this.project(vertexB, transform_matrix, world_matrix);
                    var pixelC = this.project(vertexC, transform_matrix, world_matrix);

                    var color = 0.9;
                    this.shade_vertices(pixelA, pixelB, pixelC, new mama.color4(color, color, color, 1), current_mesh.material.texture, lights);
                }
            }
        };
        
        return Device;
    })();
    Renderer.Device = Device;
})(Renderer || (Renderer = {}));
