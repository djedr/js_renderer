function initialize() {
    var canvas = document.getElementById('front_buffer');
    var raytracer = new mod.raytracer(new mod.canvas(canvas));
    
    var fileInputElement = document.getElementById("model_file");
    var sampleModeInputElement = document.getElementById("sample_mode");
    var cameraModeInputElement = document.getElementById("camera_mode");
    var renderButtonElement = document.getElementById("render");
    var loader_obj = new mod.loader_obj();
    
    fileInputElement.onchange = function () {
        loader_obj.from_file(fileInputElement.files[0], raytracer.render.bind(raytracer));
    };  
    
    sampleModeInputElement.onchange = function () {
        raytracer.sample_mode = sampleModeInputElement.value;
    };
    
    cameraModeInputElement.onchange = function () {
        raytracer.camera.mode = cameraModeInputElement.value;
    };
    
    cameraModeInputElement.onclick = function (event) {
        event.preventDefault();
        raytracer.render();
    };
}

document.addEventListener('DOMContentLoaded', initialize, false);