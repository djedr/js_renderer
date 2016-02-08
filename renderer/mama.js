var mama;
(function (mama) {
    'use strict';    
    mama.vector2 = mod.vector2;//require('./mama.vector2');
    mama.vector3 = mod.vector3;//require('./mama.vector3');;
    mama.color4 = mod.color4;//require('./mama.color4');;
    mama.matrix4x4 = mod.matrix4x4;//require('./mama.matrix4x4');;
    mama.vertex = mod.vertex;
    mama.face = mod.face;
    mama.ray = mod.ray;
    mama.sphere = mod.sphere;
    mama.plane = mod.plane;
}(mama || (mama = {})));