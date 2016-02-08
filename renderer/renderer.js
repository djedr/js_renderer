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
            this.workingWidth = canvas.width; // possibly not necessary
            this.workingHeight = canvas.height; // -||-
            this.workingContext = this.workingCanvas.getContext('2d');
            this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
        }
        
        // this should go to math
        Device.prototype.clamp = function (value, min, max) {
            if (min === undefined) { min = 0; }
            if (max === undefined) { max = 1; }
            
            return Math.max(min, Math.min(value, max));
        };
        
        Device.prototype.interpolate = function (min, max, gradient) {
            return min + (max - min) * this.clamp(gradient);   
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
                x = point2d.x * this.workingWidth + this.workingWidth / 2.0;
                y = -point2d.y * this.workingHeight + this.workingHeight / 2.0;

            return (new mod.vertex(
                new mama.vector3(x, y, point2d.z),
                normal3dWorld,
                vertex.texture,
                point3dWorld
            ));
        };

        // clipping
        Device.prototype.drawPoint = function (point, color) {
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
                this.putPixel(point.x, point.y, point.z, color);
            }
        };
      
        Device.prototype.drawLine = function (point0, point1) {
            var distance = point1.subtract(point0);
            var distanceLength = distance.length();
            
            if (distanceLength < 2) {
                return;   
            }
            
            var middlePoint = point0.add(distance.scale(0.5));
            this.drawPoint(middlePoint);
            
            this.drawLine(point0, middlePoint);
            this.drawLine(middlePoint, point1);
        };
        
        Device.prototype.drawBline = function (point0, point1) {
            var x0 = point0.x >> 0, y0 = point0.y >> 0,
                x1 = point1.x >> 0, y1 = point1.y >> 0,
                dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0),
                sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1,
                err = dx - dy;
            
            while (true) {
                this.drawPoint(new mama.vector2(x0, y0));
                
                if ((x0 == x1) && (y0 == y1)) break;
                
                var err2 = 2 * err;
                
                if (err2 > -dy) { err -= dy; x0 += sx; }
                if (err2 < dx) { err += dx; y0 += sy; }
            }
        };
        
        Device.prototype.processScanLine = function (data, va, vb, vc, vd, color, texture) {
            var pa = va.coordinates,
                pb = vb.coordinates,
                pc = vc.coordinates,
                pd = vd.coordinates,
                gradient1 = pa.y != pb.y ? (data.currentY - pa.y) / (pb.y - pa.y) : 1,
                gradient2 = pc.y != pd.y ? (data.currentY - pc.y) / (pd.y - pc.y) : 1,
                sx = this.interpolate(pa.x, pb.x, gradient1) >> 0,
                ex = this.interpolate(pc.x, pd.x, gradient2) >> 0,
                z1 = this.interpolate(pa.z, pb.z, gradient1),
                z2 = this.interpolate(pc.z, pd.z, gradient2),
                snl = this.interpolate(data.ndotla, data.ndotlb, gradient1),
                enl = this.interpolate(data.ndotlc, data.ndotld, gradient2),
                su = this.interpolate(data.ua, data.ub, gradient1),
                eu = this.interpolate(data.uc, data.ud, gradient2),
                sv = this.interpolate(data.va, data.vb, gradient1),
                ev = this.interpolate(data.vc, data.vd, gradient2),
                gradient, z, ndotl,
                u, v,
                texture_color;
            
            for (var x = sx; x < ex; ++x) {
                gradient = (x - sx) / (ex - sx);
                z = this.interpolate(z1, z2, gradient);
                ndotl = this.interpolate(snl, enl, gradient);
                u = this.interpolate(su, eu, gradient);
                v = this.interpolate(sv, ev, gradient);
                
                if (texture) {
                    texture_color = texture.map(new mama.vector2(u, v)); // todo don't create a million of these every frame
                    // todo: also refactor drawTriangle/processScanLine; rename to shade_vertices/shade_pixels
                } else {
                    texture_color = new mama.color4(1, 1, 1, 1);
                }
                
                this.drawPoint(new mama.vector3(x, data.currentY, z),
                               new mama.color4(color.r * ndotl * texture_color.r,
                                               color.g * ndotl * texture_color.g,
                                               color.b * ndotl * texture_color.b,
                                               1));   
            }
        };
        
        Device.prototype.computeNDotL = function (vertex, normal, lightPosition) {
            var lightDirection = lightPosition.subtract(vertex);
            
            normal.normalize();
            lightDirection.normalize();
            
            return Math.max(0, mama.vector3.dot(normal, lightDirection));
        };
        
        Device.prototype.drawTriangle = function (v1, v2, v3, color, texture) {
            var temp, dp1p2, dp1p3,
                p1, p2, p3,
                vnFace, lightPosition,
                data, // todo: better name for data
                nl1, nl2, nl3;
            // it contains currentY and ndotl
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
                
            vnFace = (v1.normal.add(v2.normal.add(v3.normal))).scale(1 / 3);
            lightPosition = new mama.vector3(0, 10, 10);
            nl1 = this.computeNDotL(v1.world_coordinates, v1.normal, lightPosition);
            nl2 = this.computeNDotL(v2.world_coordinates, v2.normal, lightPosition);
            nl3 = this.computeNDotL(v3.world_coordinates, v3.normal, lightPosition);
            data = {};
            
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
            
            function fill_texture_data(ve1, ve2, ve3, ve4) {
                data.ua = ve1.texture.x;
                data.ub = ve2.texture.x;
                data.uc = ve3.texture.x;
                data.ud = ve4.texture.x;
                
                data.va = ve1.texture.y;
                data.vb = ve2.texture.y;
                data.vc = ve3.texture.y;
                data.vd = ve4.texture.y;
            }
            
            if (dp1p2 > dp1p3) {
                for (var y = p1.y >> 0; y <= p3.y >> 0; ++y) {
                    data.currentY = y;
                    if (y < p2.y) {
                        data.ndotla = nl1;
                        data.ndotlb = nl3;
                        data.ndotlc = nl1;
                        data.ndotld = nl2;
                        fill_texture_data(v1, v3, v1, v2);
                        this.processScanLine(data, v1, v3, v1, v2, color, texture);
                    } else {
                        data.ndotla = nl1;
                        data.ndotlb = nl3;
                        data.ndotlc = nl2;
                        data.ndotld = nl3;
                        fill_texture_data(v1, v3, v2, v3);
                        this.processScanLine(data, v1, v3, v2, v3, color, texture);   
                    }
                }
            } else {
                for (var y = p1.y >> 0; y <= p3.y >> 0; ++y) {
                    data.currentY = y;
                    if (y < p2.y) {
                        data.ndotla = nl1;
                        data.ndotlb = nl2;
                        data.ndotlc = nl1;
                        data.ndotld = nl3;
                        fill_texture_data(v1, v2, v1, v3);
                        this.processScanLine(data, v1, v2, v1, v3, color, texture);   
                    } else {
                        data.ndotla = nl2;
                        data.ndotlb = nl3;
                        data.ndotlc = nl1;
                        data.ndotld = nl3;
                        fill_texture_data(v2, v3, v1, v3); // perhaps process_scan_line shoud fill this
                        this.processScanLine(data, v2, v3, v1, v3, color, texture);   
                    }
                }
            }
            
        };

        Device.prototype.render = function (camera, meshes) {
            var viewMatrix = mama.matrix4x4.look_at_lh(camera.Position, camera.Target, mama.vector3.up()),
                projectionMatrix = mama.matrix4x4.perspective_fov_lh(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
            
            for (var index = 0; index < meshes.length; ++index) {
                var cMesh = meshes[index];

                var worldMatrix =
                    mama.matrix4x4.rotation_yaw_pitch_roll(cMesh.rotation.y, cMesh.rotation.x, cMesh.rotation.z)
                    .multiply(mama.matrix4x4.translation(cMesh.position.x, cMesh.position.y, cMesh.position.z));

                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

                for (var indexFaces = 0; indexFaces < cMesh.faces.length; ++indexFaces) {
                    var currentFace = cMesh.faces[indexFaces];
                    var vertexA = cMesh.vertices[currentFace.a];
                    var vertexB = cMesh.vertices[currentFace.b];
                    var vertexC = cMesh.vertices[currentFace.c];
                    
                    var pixelA = this.project(vertexA, transformMatrix, worldMatrix);
                    var pixelB = this.project(vertexB, transformMatrix, worldMatrix);
                    var pixelC = this.project(vertexC, transformMatrix, worldMatrix);
                    
                    //var color = 0.25 + ((indexFaces % cMesh.Faces.length) / cMesh.Faces.length) * 0.75;
                    var color = 0.9;
                    this.drawTriangle(pixelA, pixelB, pixelC, new mama.color4(color, color, color, 1), cMesh.material.texture);
                    
                    // wireframe:
                    //this.drawBline(pixelA, pixelB);
                    //this.drawBline(pixelB, pixelC);
                    //this.drawBline(pixelC, pixelA);
                }
            }
        };
        
        return Device;
    })();
    Renderer.Device = Device;
})(Renderer || (Renderer = {}));
