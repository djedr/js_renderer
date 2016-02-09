var canvas, context, device, mesh, meshes = [], camera, loader_obj, modelFileInputElement, textureFileInputElement, loadDefaultsInputElement;

document.addEventListener('DOMContentLoaded', init, false);

function init() {
    canvas = document.getElementById('front_buffer');
    context = canvas.getContext('2d');
    context.fillStyle = 'red';
    camera = new Renderer.Camera();
    device = new Renderer.Device(canvas);
    loader_obj = new mod.loader_obj('files/wt_teapot.obj');
    
    modelFileInputElement = document.getElementById("model_file");
    textureFileInputElement = document.getElementById("texture_file");
    loadDefaultsInputElement = document.getElementById("load_defaults_button");
    
    modelFileInputElement.onchange = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
    };
    textureFileInputElement.onchange = function () {
        textureLoaded(textureFileInputElement.files[0]);
    };
    loadDefaultsInputElement.onclick = function () {
        loader_obj.from_file(modelFileInputElement.files[0], objLoaded);
    };
    
    
    camera.Position = new mama.vector3(0, 0, 10);
    camera.Target = new mama.vector3.zero();
}

function objLoaded(meshesLoaded) {
    meshesLoaded.material = new mod.material('texture', mama.color4.black(), mama.color4.black(), mama.color4.black(), 1,
                                             new mod.texture("files/suzanne.png", 480, 480, 'rectangular'));  
    
    meshes = [meshesLoaded];

    requestAnimationFrame(mainLoop);
}

function textureLoaded(texture) {
    meshes[0].material = new mod.material('texture', mama.color4.black(), mama.color4.black(), mama.color4.black(), 1,
                                             new mod.texture(texture.name, 480, 480, 'rectangular'));   
}

var fps60 = 0, frame_counter = 0, fps = 0;

function mainLoop() {
    var startTime = performance.now();
    device.clear();
    
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
