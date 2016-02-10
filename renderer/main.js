var canvas, context, device,
    mesh, meshes, camera,
    loader_obj,
    modelFileInputElement, textureFileInputElement, loadDefaultsInputElement,
    fps60, frame_counter, fps;

document.addEventListener('DOMContentLoaded', init, false);

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
    
    // scene object loader
    loader_obj = new mod.loader_obj('files/wt_teapot.obj');
    
    // user controls
    modelFileInputElement = document.getElementById("model_file");
    textureFileInputElement = document.getElementById("texture_file");
    loadDefaultsInputElement = document.getElementById("load_defaults_button");
    
    // loading a scene object
    modelFileInputElement.onchange = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
    };
    // loading a texture
    textureFileInputElement.onchange = function () {
        textureLoaded(textureFileInputElement.files[0]);
    };
    // todo: change this
    loadDefaultsInputElement.onclick = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
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
    loadedMesh.material = new mod.material('texture', mama.color4.black(), mama.color4.black(), mama.color4.black(), 1,
                                             new mod.texture("files/suzanne.png", 480, 480, 'rectangular'));  
    
    meshes.push(loadedMesh)
}

// loading an object's texture into the scene
function textureLoaded(texture) {
    meshes[0].material = new mod.material('texture', mama.color4.black(), mama.color4.black(), mama.color4.black(), 1,
                                             new mod.texture(texture.name, 480, 480, 'rectangular'));   
}

function mainLoop() {
    var startTime = performance.now();
    device.clear();
    
    // scene objects & transformations
    for (var i = 0; i < meshes.length; ++i) {
        //meshes[i].rotation.x += 0.01;
        meshes[i].rotation.y += 0.01;
    }

    device.render(camera, meshes);
    device.present();

    requestAnimationFrame(function () {
        mainLoop();
        fps60 += 1 / ((performance.now() - startTime) / 1000);
        frame_counter += 1;
        if (frame_counter >= 60) {
            fps = ((fps60)) / 60;
            frame_counter = 0;
            fps60 = 0;
        }
        context.fillText('fps: ' + (fps | 0), 2, 10);
    }); 
}
