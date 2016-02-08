{
    x, y, z,
    nx, ny, nz,
    //https://github.com/mrdoob/three.js/blob/master/utils/converters/obj/convert_obj_three.py
        // nop: https://github.com/mrdoob/three.js/blob/master/utils/converters/obj/split_obj.py
    // wx, wy, wz
        Coordinates: new BABYLON.Vector3(x, y, z),
        Normal: new BABYLON.Vector3(nx, ny, nz),
        WorldCoordinates: null
}
// converter & loader