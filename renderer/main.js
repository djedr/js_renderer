var canvas, context, device,
    mesh, meshes, selectedMesh,
    lights, selectedLight,
    camera,
    loader_obj,
    modelNameInputElement, textureNameInputElement,
    modelFileInputElement, textureFileInputElement, loadDefaultsInputElement,
    selectedMeshInputElement, meshPositionInputElement,
    selectedLightInputElement, lightPositionInputElement,
    fps60, frame_counter, fps;

document.addEventListener('DOMContentLoaded', init, false);

var getFileBlob = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
};

var blobToFile = function (blob, name) {
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
};

var getFileObject = function(filePathOrUrl, cb) {
       getFileBlob(filePathOrUrl, function (blob) {
          var file_name = filePathOrUrl.split("/");
           file_name = file_name[file_name.length-1];
          cb(blobToFile(blob, file_name));
       });
};

function init() {
    canvas = document.getElementById('front_buffer');
    context = canvas.getContext('2d');
    context.fillStyle = 'red';
    
    device = new Renderer.Device(canvas);
    
    // scene camera
    camera = new Renderer.Camera();
    
    // scene camera parameters
    camera.Position = new mama.vector3(0, 0, 10);
    camera.Target = new mama.vector3.zero();
    
    // initialize scene objects
    meshes = [];
    selectedMesh = 0;
    
    lights = [//{ position: new mama.vector3(0, 10, 10), type: 0 },
              { position: new mama.vector3(30, 30, 0), type: 1, constant_attenuation: 0, linear_attenuation: 0, quadratic_attenuation: 0.002 },
              { position: new mama.vector3(0, 0, 1.5), type: 2, spot_direction: new mama.vector3(0, 0, 1), spot_cos_cutoff: 1 }
             ];
    selectedLight = 0;
    
    // scene object loader
    loader_obj = new mod.loader_obj('files/wt_teapot.obj');
    
    // user controls
    modelFileInputElement = document.getElementById("model_file");
    textureFileInputElement = document.getElementById("texture_file");
    modelNameInputElement = document.getElementById("model_name");
    textureNameInputElement = document.getElementById("texture_name");
    loadDefaultsInputElement = document.getElementById("load_defaults_button");
    selectedMeshInputElement = document.getElementById("selected_mesh");
    meshPositionInputElement = document.getElementById("mesh_position");
    selectedLightInputElement = document.getElementById("selected_light");
    lightPositionInputElement = document.getElementById("light_position");
    
    // loading a scene object
    modelFileInputElement.onchange = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
    };
    modelNameInputElement.onchange = function () {
        getFileObject('files/' + modelNameInputElement.value, function (fileObject) {
            loader_obj.from_file(fileObject, objLoaded);
        });
    };
    // loading a texture
    textureFileInputElement.onchange = function () {
        textureLoaded(textureFileInputElement.files[0]);
    };
    textureNameInputElement.onchange = function () {
        getFileObject('files/' + textureNameInputElement.value, function (fileObject) {
            textureLoaded(fileObject);
        });
    };
    // todo: change this
    loadDefaultsInputElement.onclick = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
    };
    // selecting a mesh
    selectedMeshInputElement.onchange = function () {
        if (selectedMeshInputElement.value >= 0 && selectedMeshInputElement.value < meshes.length) {
            selectedMesh = selectedMeshInputElement.value;
            meshPositionInputElement.value = meshes[selectedMesh].position.to_simple_string();
        }
    };
    meshPositionInputElement.onchange = function () {
        meshes[selectedMesh].position.from_simple_string(meshPositionInputElement.value);
    };
    // selecting a light
    selectedLightInputElement.onchange = function () {
        if (selectedLightInputElement.value >= 0 && selectedLightInputElement.value < lights.length) {
            selectedLight = selectedLightInputElement.value;
            lightPositionInputElement.value = lights[selectedLight].position.to_simple_string();
        }
    };
    lightPositionInputElement.onchange = function () {
        lights[selectedLight].position.from_simple_string(lightPositionInputElement.value);
    };
    
    
    // initialize fps counters
    fps60 = 0;
    frame_counter = 0;
    fps = 0;
    
    // initiate the main loop
    requestAnimationFrame(mainLoop);
}

// loading an object into the scene
function objLoaded(loadedMesh) {    
    meshes.push(loadedMesh);
}

// loading an object's texture into the scene
function textureLoaded(texture) {
    if (meshes.length > 0) {
        meshes[selectedMesh].material = new mod.material('texture', mama.color4.black(), mama.color4.black(), mama.color4.black(), 1,
                                             new mod.texture('files/' + texture.name, 0, 0, 'rectangular'));  
    }  
}

function mainLoop() {
    var startTime = performance.now();
    device.clear();
    
    // scene objects & transformations
    for (var i = 0; i < meshes.length; ++i) {
        //meshes[i].rotation.x += 0.01;
        meshes[i].rotation.y += 0.01;
    }

    device.render(camera, meshes, lights);
    device.present();

    requestAnimationFrame(mainLoop);
    
    // calculate average fps
    fps60 += 1 / ((performance.now() - startTime) / 1000);
    frame_counter += 1;
    if (frame_counter >= 60) {
        fps = ((fps60)) / 60;
        frame_counter = 0;
        fps60 = 0;
    }
    context.fillText('fps: ' + (fps | 0), 2, 10); 
}
