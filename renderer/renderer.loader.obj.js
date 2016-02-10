(function (mod) {
    //
    // constructor
    //
    function loader_obj(initial_file) {
        this.file = initial_file;
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
    loader_obj.prototype.from_request = function () {
        var request = new XMLHttpRequest();
        var jsonObject = {};
        
        request.open("GET", this.path, true);
        request.overrideMimeType('text/plain');
        var that = this;
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                console.log(request.responseText);
                //jsonObject = JSON.parse(xmlhttp.responseText);
                //callback(that.CreateMeshesFromJSON(jsonObject));
            }
        };
        request.send(null);
    };
    
    loader_obj.prototype.from_file = function (file, cb) {
        var file_reader = new FileReader();
        var t = this;
        
        file_reader.onload = function () {
            cb(t.parse(file_reader.result, file.name));
        };
        
        file_reader.readAsText(file);
    };
    
    loader_obj.prototype.parse = function (contents, file_name) {
        var vertexRegex = /^v(\s+-?\d+(.\d+)?){3,4}\s*$/gm;
        var vertexNormalRegex = /^vn(\s+-?\d+(.\d+)?){3}\s*$/gm;
        var vertexTextureRegex = /^vt(\s+-?\d+(.\d+)?){1,3}\s*$/gm;
        var faceRegex = /^f(\s+-?\d+(\/(-?\d+)?)*){3,}\s*$/gm; // will match `f 1// 1/2/3 1/` but so what?
        var nameRegex = /^o\s+(.+)$/gm;
        
        var vertexMatches = contents.match(vertexRegex),
            vertexNormalMatches = contents.match(vertexNormalRegex),
            vertexTextureMatches = contents.match(vertexTextureRegex),
            faceMatches = contents.match(faceRegex),
            nameMatch = contents.match(nameRegex),
            name = nameMatch ? nameMatch[0].split(/\s+/)[1] : 'unnamed';
        
        console.log('***\n* OBJ LOADER OUTPUT FOLLOWS.\n***');
        console.log('Parsing file ' + file_name + '...');
        console.log('Assuming normals and texture coords are per vertex. First occurence defines vertex.');
        
        if (!vertexMatches) {
            console.log('error: no vertices found in the file');   
        } else if (!faceMatches) {
            console.log('error: no faces found in the file'); 
        } else {            
            var vertices = new Array(vertexMatches.length),
                normals = vertexNormalMatches ? new Array(vertexNormalMatches.length) : [],
                textureCoordinates = vertexTextureMatches ? new Array(vertexTextureMatches.length) : [], 
                // assuming faces always defined, assuming each face has 3 vertices
                faces = new Array(faceMatches.length),
                i;
            
            for (i = 0; i < vertices.length; ++i) {                
                var vertexLine = vertexMatches[i],
                    vxyzwText = vertexLine.split(/\s+/);
                
                vertices[i] = new mod.vertex(
                    new mama.vector3(
                        parseFloat(vxyzwText[1]),
                        parseFloat(vxyzwText[2]),
                        parseFloat(vxyzwText[3])
                    ),
                    null,
                    null,
                    null
                );
            }
            
            for (i = 0; i < normals.length; ++i) {
                var normalLine = vertexNormalMatches[i],
                    vnxyzText = normalLine.split(/\s+/);
                
                normals[i] = new mama.vector3(
                    parseFloat(vnxyzText[1]),
                    parseFloat(vnxyzText[2]),
                    parseFloat(vnxyzText[3])
                );
            }
            
            for (i = 0; i < textureCoordinates.length; ++i) {
                var textureLine = vertexTextureMatches[i],
                    vtxyzText = textureLine.split(/\s+/);
                
                // assume support for 2d textures only
                textureCoordinates[i] = new mama.vector2(
                    parseFloat(vtxyzText[1]),
                    vtxyzText[2] ? parseFloat(vtxyzText[2]) : 0.0 // in case texture in .obj is 1d
                );
            }
            
            
            for (i = 0; i < faces.length; ++i) {
                var faceLine = faceMatches[i],
                    fxyzText = faceLine.split(/\s+/),
                    v1Text = fxyzText[1].split('/'),
                    v2Text = fxyzText[2].split('/'),
                    v3Text = fxyzText[3].split('/'),
                    v1Index = parseInt(v1Text[0], 10) - 1,
                    v2Index = parseInt(v2Text[0], 10) - 1,
                    v3Index = parseInt(v3Text[0], 10) - 1,
                    t1Index = parseInt(v1Text[1], 10) - 1,
                    t2Index = parseInt(v2Text[1], 10) - 1,
                    t3Index = parseInt(v3Text[1], 10) - 1,
                    n1Index = parseInt(v1Text[2], 10) - 1,
                    n2Index = parseInt(v2Text[2], 10) - 1,
                    n3Index = parseInt(v3Text[2], 10) - 1,
                    face_normal;
                
                function normalize_index(index, array) {
                    if (index < 0) {
                        console.log('error: negative indices not supported');
                        return array.length + index;
                    }
                    return index;
                }
                v1Index = normalize_index(v1Index, vertices);
                v2Index = normalize_index(v2Index, vertices);
                v3Index = normalize_index(v3Index, vertices);
                t1Index = normalize_index(t1Index, textureCoordinates);
                t2Index = normalize_index(t2Index, textureCoordinates);
                t3Index = normalize_index(t3Index, textureCoordinates);
                n1Index = normalize_index(n1Index, normals);
                n2Index = normalize_index(n2Index, normals);
                n3Index = normalize_index(n3Index, normals);
                
                // assuming face is defined as f x y z and we ignore stuff after slashes
                faces[i] = new mod.face(
                    v1Index,
                    v2Index,
                    v3Index
                );
                
                if (normals.length === 0) {
                    face_normal = 
                        vertices[v2Index].coordinates.subtract(vertices[v1Index].coordinates)
                        .cross(vertices[v3Index].coordinates.subtract(vertices[v1Index].coordinates))
                        .normalize();

                    vertices[v1Index].normal = face_normal;
                    vertices[v2Index].normal = face_normal;
                    vertices[v3Index].normal = face_normal;
                } else {
                    function ff(vIndex, nIndex, tIndex, v) {
                        if (isNaN(nIndex)) {
                           console.log('error: no normal found for vertex (wrong normal index)', vIndex);
                        } else if (vertices[vIndex].normal === null) {
                            vertices[vIndex].normal = normals[nIndex];
                        } else if (!vertices[vIndex].normal.equals(normals[nIndex])) {
                            vertices.push(new mod.vertex(
                                vertices[vIndex].coordinates,
                                normals[nIndex],
                                textureCoordinates[tIndex],
                                null));
                            faces[i][v] = vertices.length - 1;
                        }
                    }
                    
                    ff(v1Index, n1Index, t1Index, 'a');
                    ff(v2Index, n2Index, t2Index, 'b');
                    ff(v3Index, n3Index, t3Index, 'c');
                    
                    /*if (vertices[v1Index].normal === null && !isNaN(n1Index)) {
                        vertices[v1Index].normal = normals[n1Index];
                    }
                    if (vertices[v2Index].normal === null && !isNaN(n2Index)) {
                        vertices[v2Index].normal = normals[n2Index];
                    }
                    if (vertices[v3Index].normal === null && !isNaN(n3Index)) {
                        vertices[v3Index].normal = normals[n3Index];
                    }*/
                }
                
                // First occurence defines normal and texture
                if (vertices[v1Index].texture === null && !isNaN(t1Index)) {
                    vertices[v1Index].texture = textureCoordinates[t1Index];
                }
                
                if (vertices[v2Index].texture === null && !isNaN(t2Index)) {
                    vertices[v2Index].texture = textureCoordinates[t2Index];
                }
                
                if (vertices[v3Index].texture === null && !isNaN(t3Index)) {
                    vertices[v3Index].texture = textureCoordinates[t3Index];
                }
            }
        }
        
        
        console.log('Done parsing file ' + file_name + '.');
        console.log('***\n* OBJ LOADER OUTPUT CONCLUDES.\n***');
        return new mod.mesh(name, vertices, faces);
    };
    
    loader_obj.prototype.to_string = function () {
        return "loader_obj {\n\path: " + this.path
                    + "\n}";
    }; 

    loader_obj.prototype.toString = loader_obj.prototype.to_string;

    mod.loader_obj = loader_obj;
}(mod || (mod = {})));
