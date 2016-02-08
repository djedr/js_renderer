function initialize() {
    var canvas = document.getElementById('front_buffer');
    var raytracer = new mod.raytracer(new mod.canvas(canvas));
    raytracer.render();
}

document.addEventListener('DOMContentLoaded', initialize, false);